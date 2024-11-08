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

from module.CreateAnnotation import create_annotation
from module.ModelProcessing2 import EEGModel
# Read data
data = pd.read_csv("./user/friska/friska_data.csv", delimiter=',')
anotate = create_annotation()
pipeline = EEGModel(mindrove_data=data, annotations=anotate, name="friska")
pipeline.run_pipeline()