from flask import Blueprint
from flask_socketio import emit
from module.CollectData import get_datas
from module.CreateAnnotation import create_annotation
import numpy as np

from module.ProcessToRaw import SaveData

from mindrove.board_shim import BoardShim, MindRoveInputParams, BoardIds


collect_data = Blueprint('collect_data', __name__, url_prefix='/api/collect_data')

start_collect_data = False

def collect_data_events(socketio):
    @socketio.on('start_collect_data')
    def handle_start_collect_data(message):
        global start_collect_data

        BoardShim.enable_dev_board_logger()
        params = MindRoveInputParams()
        board_id = BoardIds.MINDROVE_WIFI_BOARD.value
        board_shim = BoardShim(board_id, params)

        time = message['time']
        name = message['nama']
        if not start_collect_data:
            start_collect_data = True
            data = get_datas(time, board_shim)
            if data:
                anotate = create_annotation()
                save = SaveData(mindrove_data=data, annotations=anotate, name=name)
                save.run_pipeline()
                start_collect_data = False
        emit('collect_data_success', broadcast=True)

    @socketio.on('stop_collect_data')
    def handle_stop_collect_data():
        global start_collect_data
        start_collect_data = False
        print("collect_data_stopped")

    @socketio.on('disconnect')
    def handle_disconnect():
        global start_collect_data
        start_collect_data = False  # Stop classification when client disconnects
        print("Client disconnected, collect_data stopped.")