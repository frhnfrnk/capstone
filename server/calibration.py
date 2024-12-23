from flask import Blueprint
from flask_socketio import emit
from module.CollectDataCalibration import get_datas
from module.Calibration import CalibrationPipeline
from module.CreateAnnotation import create_annotation
from module.ModelProcessing import EEGModel
import numpy as np


calibration = Blueprint('calibration', __name__, url_prefix='/api/calibration')

start_calibration = False

def calibration_events(socketio, board_shim):
    @socketio.on('start_calibration')
    def handle_start_calibration(message):
        global start_calibration
        time = message['time']
        name = message['nama']
        data = get_datas(time, name, board_shim)
        emit('calibration_started', broadcast=True)
        if data:
            anotate = create_annotation()
            pipeline = CalibrationPipeline(mindrove_data=data, annotations=anotate, name=name)
            check = pipeline.run_pipeline()

            if check:
                model = EEGModel(mindrove_data=data, annotations=anotate, name=name)
                model.run_pipeline()

    @socketio.on('stop_calibration')
    def handle_stop_calibration():
        global start_calibration
        start_calibration = False
        print("calibration_stopped")