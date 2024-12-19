#Library
import pandas as pd
import numpy as np
import mne
import os
import pywt
import joblib
from mne.decoding import CSP
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

# Read data
df = pd.read_csv("../DataTesting/naren_test_open_1mnt.csv", delimiter=';', skiprows=1)

# Pilih kolom yang relevan
column = ["CH1","CH2", 	"CH3",	"CH4"]
df = df[column]

# Ganti koma dengan titik jika ada, lalu konversi ke float
for col in df.columns:
    if df[col].dtype == 'object':
        df[col] = df[col].str.replace(',', '.', regex=False).astype(float)
df = df.dropna()

#Normalisasi data
scaler = [StandardScaler() for _ in df.columns]
for i, col in enumerate(df.columns):
    df[col] = scaler[i].fit_transform(df[col].to_numpy().reshape(-1, 1))

# Definisi info EEG RAW (frekuensi sampling, tipe channel, dll.
sfreq = 500
ch_types = ["eeg", "eeg", "eeg", "eeg"]
ch_names = ["C1","C2","C3","C4"]

# Buat RawArray untuk data EEG
info = mne.create_info(ch_names=ch_names, sfreq=sfreq, ch_types=ch_types)
raw = mne.io.RawArray(df.T, info)

# Buat event untuk data EEG


# Filter data
raw.filter(0.5, 30., fir_design='firwin')
events = mne.make_fixed_length_events(raw, duration=5.0)
epochs = mne.Epochs(raw, events, tmin=-0.2, tmax=0.5, proj=True, baseline=None, preload=True)
data = epochs.get_data(copy = True)
#print(data.shape)

# WPD
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


wpd_data = feature_bands(data)
#print(wpd_data.shape)  

path = os.path.abspath('classification/Model_baru')

Csp_list = [joblib.load(os.path.join(path, f'csp_{i}.pkl')) for i in range(8)]
ss = joblib.load(os.path.join(path, 'scaler.pkl'))
svms = [joblib.load(os.path.join(path, f'svm_{i}.pkl')) for i in range(8)]

def inference(new_data, Csp_list, ss, svms):
    transformed_data = np.concatenate(
        tuple(Csp_list[i].transform(new_data[i, :, :]) for i in range(8)), axis=-1
    )

    scaled_data = ss.transform(transformed_data)
    prob_sum = np.zeros(len(svms[0].classes_))
    for svm in svms:
        prob_sum += np.mean(svm.predict_proba(scaled_data), axis=0)

    predicted_class_idx = np.argmax(prob_sum)
    classes = ['Fist', 'Hook', 'Index', 'Open', 'Thumb']
    
    return classes[predicted_class_idx]

result = inference(wpd_data, Csp_list, ss, svms)

print("Prediksi:", result)
