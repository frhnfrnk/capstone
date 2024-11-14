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

from sklearn.model_selection import LeaveOneOut

class CalibrationPipeline:
    def __init__(self, mindrove_data=None, annotations=None, sfreq=500, name=None):
        self.mindrove_data = mindrove_data
        self.annotations = annotations
        self.sfreq = sfreq
        self.raw = None
        self.raw_reference = None
        self.epochs = None
        self.name = name
        self.fist_mean = []
        self.thumb_mean = []
        self.index_mean = []

        self.fist_ref_mean = []
        self.thumb_ref_mean = []
        self.index_ref_mean = []

        self.isCheck = False

    def load_reference_data(self):
        self.raw_reference = mne.io.read_raw_fif("./reference/reference_raw.fif", preload=True)
        self.raw_reference.notch_filter(freqs=50)
        self.raw_reference.filter(8, 30., fir_design='firwin')

        events_reference, event_id_reference = mne.events_from_annotations(self.raw_reference)
        epochs_reference = mne.Epochs(self.raw_reference, events_reference, event_id_reference, tmin=0, tmax=2, baseline=None, preload=True)

        fist_ref_data = epochs_reference['fist'].get_data()
        thumb_ref_data = epochs_reference['thumb'].get_data()
        index_ref_data = epochs_reference['index'].get_data()

        self.fist_ref_mean = np.mean(fist_ref_data, axis=2)
        self.thumb_ref_mean = np.mean(thumb_ref_data, axis=2)
        self.index_ref_mean = np.mean(index_ref_data, axis=2)


 
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

        emit('reference_loaded', broadcast=True)


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
        picks_raw = mne.pick_types(self.raw.info, meg=False, eeg=True, eog=False, stim=False, exclude='bads')  
        events, event_id = mne.events_from_annotations(self.raw)
        tmin, tmax = 0, 2
        self.epochs = mne.Epochs(self.raw, events, event_id, tmin, tmax, baseline=None, preload=True, picks=picks_raw)
        emit('preprocess_data', broadcast=True)
        print("Data preprocessed and epochs created.")

    def get_movement_data(self):
        """Extracts features using Wavelet Packet Decomposition."""

        fist_data = self.epochs['fist'].get_data()
        thumb_data = self.epochs['thumb'].get_data()
        index_data = self.epochs['index'].get_data()

        self.fist_mean = np.mean(fist_data, axis=2)
        self.thumb_mean = np.mean(thumb_data, axis=2)
        self.index_mean = np.mean(index_data, axis=2)
    
    def check_distance(self):
        fist_distance = np.linalg.norm(self.fist_mean - self.fist_ref_mean)
        thumb_distance = np.linalg.norm(self.thumb_mean - self.thumb_ref_mean)
        index_distance = np.linalg.norm(self.index_mean - self.index_ref_mean)

        fist_treshold = 2.5
        thumb_treshold = 7.5
        index_treshold = 7.7

        message = {
            "fist_distance": fist_distance,
            "thumb_distance": thumb_distance,
            "index_distance": index_distance
        }
        if fist_distance < fist_treshold and thumb_distance < thumb_treshold and index_distance < index_treshold:
            self.isCheck = True
            emit('check_success', message, broadcast=True)
        else:
            emit('calibration_failed', message, broadcast=True)
            self.isCheck = False

    def run_pipeline(self):
        self.load_reference_data()
        self.load_data_from_mindrove()
        self.add_annotations()
        self.preprocess_data()
        self.get_movement_data()
        self.check_distance()

        return self.isCheck
