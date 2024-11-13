import pandas as pd
import numpy as np
import os
import pywt
import joblib
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from mne.decoding import CSP
import mindrove
from mindrove.board_shim import BoardShim, MindRoveInputParams, BoardIds, MindRoveError
from mindrove.data_filter import DataFilter, FilterTypes, DetrendOperations
import time
import mne
from flask_socketio import emit

class LiveClassifier:
    def __init__(self, name: str):
        model_path = f'./model'
        self.Csp_list = [joblib.load(os.path.join(model_path,"csp", f'csp_{i}.pkl')) for i in range(8)]
        self.scaler = joblib.load(os.path.join(model_path, 'scaler.pkl'))
        self.svms = [joblib.load(os.path.join(model_path, "svm", f'svm_{i}.pkl')) for i in range(5)]
        self.classes = ['Fist ', 'Index', "Thumb"]
        self.data = []
        self.message = {
            "result": "",
            "accuracy": 0
        }
        print("Model loaded successfully")

    def wpd(self, X):
        coeffs = pywt.WaveletPacket(X,'db4',mode='symmetric',maxlevel=4)
        return coeffs
                
    def feature_bands(self, x):
        C = self.wpd(x[0, 0, :])
        coeffs_sample = [node.data for node in C.get_level(4, 'natural')]
        jumlah_koefisien = len(coeffs_sample[0])  
        
        Bands = np.empty((8,x.shape[0],x.shape[1],jumlah_koefisien)) 
        
        for i in range(x.shape[0]):
            for ii in range(x.shape[1]):
                pos = []
                C = self.wpd(x[i,ii,:]) 
                pos = np.append(pos,[node.path for node in C.get_level(4, 'natural')])
                for b in range(1,9):
                    Bands[b-1,i,ii,:] = C[pos[b]].data
            
        return Bands
    
    def preprocess(self, raw_data):
        # Select relevant columns
        df = raw_data
        # Convert object data types to float (handle comma as decimal separator)

        # # Normalize data
        # scaler = StandardScaler()
        # df[df.columns] = scaler.fit_transform(df)

        # Set up EEG info (sampling frequency, channel types, etc.)
        sfreq = 500
        ch_types = ["eeg", "eeg", "eeg", "eeg"]
        ch_names = ["C1", "C2", "C3", "C4"]
        info = mne.create_info(ch_names=ch_names, sfreq=sfreq, ch_types=ch_types)
        # Create RawArray for EEG data
        raw = mne.io.RawArray(df.T, info)

        # Apply bandpass filter
        raw.notch_filter(freqs=50)
        raw.filter(8, 30., fir_design='firwin')

        # Create fixed-length events and epochs
        events = mne.make_fixed_length_events(raw, duration=4.0)
        epochs = mne.Epochs(raw, events, tmin=1, tmax=3, proj=True, baseline=None, preload=True)
        
        # Extract data from epochs
        return epochs.get_data()

    def classify(self, data):
        # Extract WPD features
        new_data = self.preprocess(data)
        wpd_data = self.feature_bands(new_data)

        # Transform data using CSP and scale
        transformed_data = np.concatenate(
            [self.Csp_list[i].transform(wpd_data[i, :, :]) for i in range(len(self.Csp_list))], axis=-1
        )
        scaled_data = self.scaler.transform(transformed_data)
        prob_sum = np.zeros(len(self.svms[0].classes_))
    
        # Calculate and accumulate probabilities from each SVM model
        for svm in self.svms:
            prob_sum += svm.predict_proba(scaled_data)[0]
            print(prob_sum) 

        predicted_class_idx = np.argmax(prob_sum)
        result = self.classes[predicted_class_idx]  
        message = {
            "result": result,
            "accuracy": prob_sum[predicted_class_idx]
        }
        return message


    def live_classification(self, board_shim: BoardShim):
        channel_indices = [0, 1, 2, 3]
        
        if not board_shim.is_prepared():
            board_shim.prepare_session()
        board_shim.start_stream()
        print("Device ready for live classification")
        
        end_time = time.time() + 4
        sampling_rate = board_shim.get_sampling_rate(board_shim.board_id)

        try:
            while time.time() < end_time:
                data = board_shim.get_board_data()
                if data.shape[1] > 0:
                    filtered_data = []
                    for channel in channel_indices:
                        channel_data = data[channel]
                        DataFilter.detrend(channel_data, DetrendOperations.CONSTANT.value)
                        DataFilter.perform_bandpass(channel_data, sampling_rate, 8.0, 30.0, 4, FilterTypes.BUTTERWORTH, 0)
                        filtered_data.append(channel_data)
                    
                    # Transpose and create DataFrame
                    filtered_data = pd.DataFrame(filtered_data).T
                    filtered_data.columns = ['CH1', 'CH2', 'CH3', 'CH4']
                    self.data.append(filtered_data)
                    
            # Perform classification
            df = pd.concat(self.data)   
            prediction = self.classify(df)
            print("Predicted Gesture:", prediction["result"])
            self.message = prediction
            self.data = []

        except MindRoveError as e:
            print("MindRove board error:", e)
        finally:
            board_shim.stop_stream()

