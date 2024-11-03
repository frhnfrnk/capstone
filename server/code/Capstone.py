import numpy as np
import pandas as pd
import mne
from mne import Epochs, find_events
import pywt
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, cohen_kappa_score, precision_score, recall_score
from sklearn.model_selection import StratifiedKFold, GridSearchCV, train_test_split
from mne.decoding import CSP
from sklearn.multiclass import OneVsOneClassifier
from sklearn.calibration import CalibratedClassifierCV
import joblib
import time

class Calibraion:
    @staticmethod
    def ConvertToRaw(name):
        # Load CSV
        df = pd.read_csv(f'{name}.csv', delimiter=';', skiprows=1)
        channels = ['CH1', 'CH2', 'CH3', 'CH4']
        for ch in channels:
            df[ch] = df[ch].str.replace(',', '').astype(float)
        df = df.dropna()[channels]
        scaler = StandardScaler()
        df = scaler.fit_transform(df)

        # Set Channel Information
        sfreq = 500
        ch_types = ["eeg", "eeg", "eeg", "eeg"]
        ch_names = ["C1", "C2", "C3", "C4"]
        montage = mne.channels.make_standard_montage("standard_1020")
        info = mne.create_info(ch_names=ch_names, sfreq=sfreq, ch_types=ch_types)
        info.set_montage(montage)

        # Create Raw Object
        data = df.T
        raw = mne.io.RawArray(data, info)

        # Add Annotations
        total_duration = raw.times[-1]
        onset = np.arange(5, total_duration, 5)
        duration = [5] * len(onset)
        description = ['Fist'] * len(onset)
        annotations = mne.Annotations(onset=onset, duration=duration, description=description)
        raw.set_annotations(annotations)

        # Save to .fif File
        raw.save(f"{name}.fif", overwrite=True)
        return raw

    @staticmethod
    def FeatureExtraction(raw):
        raw.filter(0.5, 30., fir_design='firwin')
        events = mne.make_fixed_length_events(raw, duration=1.0)
        epochs = Epochs(raw, events, tmin=0, tmax=1, proj=True, baseline=None, preload=True)
        data = epochs.get_data(copy=True)

        def wpd(X): 
            coeffs = pywt.WaveletPacket(X, 'db4', mode='symmetric', maxlevel=5)
            return coeffs

        def feature_bands(x):
            C = wpd(x[0, 0, :])
            coeffs_sample = [node.data for node in C.get_level(5, 'natural')]
            jumlah_koefisien = len(coeffs_sample[0])  
            Bands = np.empty((8, x.shape[0], x.shape[1], jumlah_koefisien)) 

            for i in range(x.shape[0]):
                for ii in range(x.shape[1]):
                    pos = []
                    C = wpd(x[i, ii, :])
                    pos = np.append(pos, [node.path for node in C.get_level(5, 'natural')])
                    for b in range(1, 9):
                        Bands[b-1, i, ii, :] = C[pos[b]].data

            return Bands

        return feature_bands(data)

    @staticmethod
    def TrainModel(wpd_data, labels):
        # Split data
        indices = np.arange(wpd_data[0].shape[0])
        indices_train, indices_test = train_test_split(indices, test_size=0.2, stratify=labels, random_state=42)
        data_comb_train = [wpd_data[i][indices_train] for i in range(len(wpd_data))]
        data_comb_test = [wpd_data[i][indices_test] for i in range(len(wpd_data))]
        labels_train = labels[indices_train]
        labels_test = labels[indices_test]

        # Initialize and fit CSP
        Csp = [CSP(n_components=4, reg=None, log=True, norm_trace=False) for _ in range(len(data_comb_train))]
        for x in range(len(data_comb_train)):
            Csp[x].fit(data_comb_train[x, ...], labels_train)

        # Extract and scale CSP features
        X_full_train = np.concatenate([Csp[x].transform(data_comb_train[x]) for x in range(len(data_comb_train))], axis=1)
        ss = StandardScaler().fit(X_full_train)
        X_full_train = ss.transform(X_full_train)

        # GridSearch for best SVM model
        param_grid = {'base_estimator__estimator__C': [0.1, 1, 1.5, 0.9], 'base_estimator__estimator__gamma': [1, 0.1, 0.01, 0.001]}
        svms = []
        metrics = {'Accuracy': [], 'Kappa': [], 'Precision': [], 'Recall': []}
        cv = StratifiedKFold(n_splits=10, shuffle=True, random_state=42)

        for train_idx, val_idx in cv.split(X_full_train, labels_train):
            X_train, X_val = X_full_train[train_idx], X_full_train[val_idx]
            y_train, y_val = labels_train[train_idx], labels_train[val_idx]
            svm = SVC(kernel='rbf')
            calibrated_clf = CalibratedClassifierCV(OneVsOneClassifier(svm), cv=5, method='sigmoid')
            grid_search = GridSearchCV(calibrated_clf, param_grid, cv=5, refit=True, verbose=0)
            grid_search.fit(X_train, y_train)
            best_svm = grid_search.best_estimator_
            svms.append(best_svm)
            y_pred_val = best_svm.predict(X_val)
            metrics['Accuracy'].append(accuracy_score(y_val, y_pred_val))
            metrics['Kappa'].append(cohen_kappa_score(y_val, y_pred_val))
            metrics['Precision'].append(precision_score(y_val, y_pred_val, average='weighted'))
            metrics['Recall'].append(recall_score(y_val, y_pred_val, average='weighted'))

        # Save the best model and scaler
        best_idx = np.argmax(metrics['Accuracy'])
        final_model = svms[best_idx]
        joblib.dump(final_model, 'final_model.pkl')
        joblib.dump(Csp, 'csp_list.pkl')
        joblib.dump(ss, 'scaler.pkl')
        return metrics, final_model

    @staticmethod
    def Inference(new_data, Csp_list, ss, model):
        transformed_data = np.concatenate([Csp_list[i].transform(new_data[i]) for i in range(len(Csp_list))], axis=-1)
        scaled_data = ss.transform(transformed_data)
        prob_sum = model.predict_proba(scaled_data)
        predicted_class_idx = np.argmax(prob_sum, axis=1)
        classes = ['Fist', 'Hook', 'Index', 'Open', 'Thumb']
        return [classes[class_idx] for class_idx in predicted_class_idx]
