import pandas as pd
import mne
import numpy as np
from sklearn import preprocessing
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, cohen_kappa_score, precision_score, recall_score
from sklearn.model_selection import StratifiedKFold, GridSearchCV, train_test_split
from mne.decoding import CSP
from sklearn.multiclass import OneVsOneClassifier
from sklearn.calibration import CalibratedClassifierCV
import pywt
from mne.decoding import CSP
import joblib
import os
from flask_socketio import emit
import json

class EEGModel:
    def __init__(self, mindrove_data=None, annotations=None, sfreq=500, name=None):
        self.mindrove_data = mindrove_data
        self.annotations = annotations
        self.sfreq = sfreq
        self.raw = None
        self.epochs = None
        self.data = None
        self.labels = None
        self.model = None
        self.name = name
        self.train_result = {
            "accuracy": [],
            "precision": [],
            "recall": [],
            "ka": [],
        }
        self.test_result = {
            "accuracy": [],
            "precision": [],
            "recall": [],
            "ka": [],
        }

    def load_data_from_mindrove(self):
        """Load data from MindRove into MNE Raw format."""
        if not self.mindrove_data:
            print("No MindRove data provided.")
            return

        mindrove_df = pd.DataFrame(self.mindrove_data)
        mindrove_df.set_index("Timestamp", inplace=True)

        ch_names = ["CH1", "CH2", "CH3", "CH4"]
        info = mne.create_info(ch_names=ch_names, sfreq=self.sfreq, ch_types="eeg")
        eeg_data = mindrove_df[ch_names].values.T
        self.raw = mne.io.RawArray(eeg_data, info)
        print("MindRove data loaded into MNE format.")

    def add_annotations(self):
        """Add annotations to the raw data for segmentation."""
        if not self.raw:
            print("Data not loaded. Load data before adding annotations.")
            return
        if not self.annotations:
            print("No annotations provided.")
            return

        annot = mne.Annotations(
            onset=self.annotations['onset'],
            duration=self.annotations['duration'],
            description=self.annotations['description']
        )
        self.raw.set_annotations(annot)
        print("Annotations added to raw data.")

    def preprocess_data(self):
        """Apply filters and segment data based on annotations to create epochs."""
        if not self.raw:
            print("No data to preprocess.")
            return

        # Filter settings
        self.raw.notch_filter(freqs=50)
        self.raw.filter(8, 30., fir_design='firwin')

        # Convert annotations to events and create epochs
        events, event_id = mne.events_from_annotations(self.raw)
        tmin, tmax = -1.0, 2.0
        self.epochs = mne.Epochs(self.raw, events, event_id, tmin, tmax, baseline=None, preload=True)
        emit('preprocess_data', broadcast=True)
        print("Data preprocessed and epochs created.")

    def extract_features(self):
        """Extracts features using Wavelet Packet Decomposition."""
        self.labels = self.epochs.events[:, -1]
        self.data = self.epochs.get_data()  
        
        def wpd(X):
            """Wavelet Packet Decomposition using 'db4' wavelet."""
            coeffs = pywt.WaveletPacket(X, 'db4', mode='symmetric', maxlevel=5)
            return coeffs

        def feature_bands(x):
            """Extracts 8 frequency bands from each signal."""
            C = wpd(x[0, 0, :])
            coeffs_sample = [node.data for node in C.get_level(5, 'natural')]
            num_coeffs = len(coeffs_sample[0])
            
            # Initialize Bands array
            Bands = np.empty((8, x.shape[0], x.shape[1], num_coeffs))
            
            # Fill Bands with coefficients
            for i in range(x.shape[0]):
                for ii in range(x.shape[1]):
                    C = wpd(x[i, ii, :])
                    pos = [node.path for node in C.get_level(5, 'natural')]
                    for b in range(1, 9):
                        Bands[b - 1, i, ii, :] = C[pos[b]].data
                        
            return Bands
        
        # Generate Wavelet Packet features
        self.wpd_data = feature_bands(self.data)

    def train_model(self):
        """Trains an SVM model on the extracted features."""
        # Data preparation
        data_comb = [self.wpd_data[i] for i in range(self.wpd_data.shape[0])]
        labels_copy = self.labels.copy()

        indices = np.arange(data_comb[0].shape[0])
        
        # Split data
        indices_train, indices_test = train_test_split(
            indices, test_size=0.3, stratify=labels_copy, random_state=42
        )
        data_comb_train = [data_comb[i][indices_train] for i in range(len(data_comb))]
        data_comb_test = [data_comb[i][indices_test] for i in range(len(data_comb))]

        wpd_data_train = np.asarray(data_comb_train)
        wpd_data_test = np.asarray(data_comb_test)
        labels_train = labels_copy[indices_train]
        labels_test = labels_copy[indices_test]

        # Initialize CSP
        Csp = [
            CSP(n_components=3, reg='ledoit_wolf', log=True, norm_trace=False)
            for _ in range(wpd_data_train.shape[0])
        ]

        for x in range(wpd_data_train.shape[0]):
            Csp[x].fit(wpd_data_train[x, ...], labels_train)


        #Merge the features
        X_full_train = np.concatenate(
            [Csp[x].transform(wpd_data_train[x, :, :, :]) for x in range(wpd_data_train.shape[0])],
            axis=1,
        )

        # Standardize the data
        ss = preprocessing.StandardScaler()
        X_full_train = ss.fit_transform(X_full_train)

        # Grid search for hyperparameters
        param_grid = {
            'estimator__estimator__C': [0.1, 0.9, 1, 1.1], 
            'estimator__estimator__gamma': [0.1, 0.1, 1, 0.9],  
        }

        svms = []

        # Initialize Stratified KFold
        cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)

        for train_idx, val_idx in cv.split(X_full_train, labels_train):
            X_train, X_val = X_full_train[train_idx], X_full_train[val_idx]
            y_train, y_val = labels_train[train_idx], labels_train[val_idx]

            svm = SVC(kernel='rbf', class_weight='balanced')  
            ovo_clf = OneVsOneClassifier(svm)
            calibrated_clf = CalibratedClassifierCV(ovo_clf, cv=5, method='sigmoid')

            grid_search = GridSearchCV(
                calibrated_clf, param_grid, refit=True, verbose=1, cv=5  # Mengatur verbose untuk melihat proses pencarian grid
            )

            grid_search.fit(X_train, y_train)

            best_svm = grid_search.best_estimator_

            svms.append(best_svm)

            # Predict pada data validation
            y_pred_val = best_svm.predict(X_val)

            # Hitung dan simpan metrik evaluasi pada data validation
            self.train_result["accuracy"].append(accuracy_score(y_val, y_pred_val))
            self.train_result["precision"].append(precision_score(y_val, y_pred_val, average='weighted'))
            self.train_result["recall"].append(recall_score(y_val, y_pred_val, average='weighted'))
            self.train_result["ka"].append(cohen_kappa_score(y_val, y_pred_val))

        best_idx = np.argmax(self.accuracy)
        final_model = svms[best_idx]

        # Ekstraksi fitur CSP dan standarisasi untuk data testing
        X_test = np.concatenate(
            [Csp[x].transform(wpd_data_test[x, :, :, :]) for x in range(wpd_data_test.shape[0])],
            axis=1,
        )
        X_test = ss.transform(X_test)

        # Predict pada data testing
        y_pred_test = final_model.predict(X_test)

        test_acc = accuracy_score(labels_test, y_pred_test)
        test_ka = cohen_kappa_score(labels_test, y_pred_test)
        test_prec = precision_score(labels_test, y_pred_test, average='weighted', zero_division=0)
        test_recall = recall_score(labels_test, y_pred_test, average='weighted', zero_division=0)

        self.test_result["accuracy"].append(test_acc)
        self.test_result["precision"].append(test_prec)
        self.test_result["recall"].append(test_recall)
        self.test_result["ka"].append(test_ka)

        # save model
        self.model = final_model
        print("Model trained.")

        directory = f'./user/{self.name}/'
        os.makedirs(directory, exist_ok=True)

        file_name_svm = os.path.join(directory, 'model.pkl')
        file_name_ss = os.path.join(directory, 'scaler.pkl')

        joblib.dump(self.model, file_name_svm)
        joblib.dump(ss, file_name_ss)

        for i, csp_model in enumerate(Csp):
            csp_file_name = os.path.join(directory, f'csp_model_{i}.joblib')
            joblib.dump(csp_model, csp_file_name)
            
        print(f"Model saved to {file_name_svm}.")
        print(f"Scaler saved to {file_name_ss}.")
        print(f"CSP models saved to {directory}.")

        emit('model_saved', broadcast=True)

    def save_results(self):
        directory = f'./user/{self.name}/'
        file_name = os.path.join(directory, 'results.json')
        with open(file_name, 'w') as json_file:
            json.dump({
                "train": self.train_result,
                "test": self.test_result
            }, json_file)

    def run_pipeline(self):
        self.load_data_from_mindrove()
        self.add_annotations()
        self.preprocess_data()
        self.extract_features()
        self.train_model()
