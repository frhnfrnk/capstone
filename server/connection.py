from flask import Blueprint, jsonify
from mindrove.board_shim import BoardShim, MindRoveInputParams, BoardIds, MindRoveError
from mindrove.exit_codes import MindroveExitCodes
import logging
import mindrove

from flask_socketio import emit
from app import socketio


def get_board_instance():
    board_id = BoardIds.MINDROVE_WIFI_BOARD
    params = MindRoveInputParams()
    board_instance = BoardShim(board_id, params)
    return board_instance


def mindrove_events(socketio):
    @socketio.on('check_mindrove')
    def handle_connect():
        try:
            board = get_board_instance()
            if not board.is_prepared:
                board.prepare_session()
            board.start_stream()
            board.config_board(mindrove.MindroveConfigMode.EEG_MODE)

            # Sending initial connection message
            emit('status', {'message': 'Connected to MindRove device and streaming started.'})

            # Optionally, start sending data periodically
            while True:
                data = board.get_board_data()
                if data is not None:
                    emit('board_data', {'data': data})
        except MindRoveError as e:
            emit('error', {'message': f'Mindrove error: {str(e)}'})



