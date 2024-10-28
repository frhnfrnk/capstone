from flask import Blueprint, jsonify, request
from mindrove.board_shim import BoardShim, MindRoveInputParams, BoardIds, MindRoveError

mindrove = Blueprint('mindrove', __name__, url_prefix='/api/mindrove')

@mindrove.route('/check_connection', methods=['GET'])
def check_connection():
    board_id = BoardIds.MINDROVE_WIFI_BOARD
    params = MindRoveInputParams()
    board = BoardShim(board_id, params)
    try:
        board.prepare_session()
        board.start_stream()
        board_info = board.get_device_name(board_id)

        board.stop_stream()
        board.release_session()

        return jsonify({
            "success": True,
            "board": board_info
            })
    except MindRoveError:
        board.stop_stream()
        board.release_session()
        return jsonify({
            "success": False,
            "error": "Failed to connect to MindRove board"
            }), 500
