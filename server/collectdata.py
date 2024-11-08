from flask import Blueprint
from flask_socketio import emit
from module.CollectData import get_datas
from module.CreateAnnotation import create_annotation
import numpy as np

from module.ProcessToRaw import SaveData


collect_data = Blueprint('collect_data', __name__, url_prefix='/api/collect_data')

start_collect_data = False

def collect_data_events(socketio, board_shim):
    @socketio.on('start_collect_data')
    def handle_start_collect_data(message):
        global start_collect_data
        time = message['time']
        name = message['nama']
        data = get_datas(time, board_shim)
        if data:
            anotate = create_annotation()
            save = SaveData(mindrove_data=data, annotations=anotate, name=name)
            save.run_pipeline()
            # pipeline = EEGModel(mindrove_data=data, annotations=anotate, name=name)
            # pipeline.run_pipeline()
        emit('collect_data_success', broadcast=True)

    @socketio.on('stop_collect_data')
    def handle_stop_collect_data():
        global start_collect_data
        start_collect_data = False
        print("collect_data_stopped")