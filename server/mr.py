from flask import Blueprint, jsonify
from mindrove.board_shim import BoardShim, MindRoveInputParams, BoardIds, MindRoveError

mindrove = Blueprint('mindrove', __name__, url_prefix='/api/mindrove')

@mindrove.route('/check_connection', methods=['GET'])
def check_connection():
    board_id = BoardIds.MINDROVE_WIFI_BOARD
    params = MindRoveInputParams()
    board = BoardShim(board_id, params)
    session_prepared = False  # Variabel untuk melacak status sesi

    try:
        board.prepare_session()
        session_prepared = True  # Tandai bahwa sesi berhasil disiapkan
        board_info = board.get_device_name(board_id)

        return jsonify({
            "success": True,
            "board": board_info
        })
    except MindRoveError:
        if session_prepared:
            board.release_session()  # Lepaskan sesi hanya jika telah disiapkan
        return jsonify({
            "success": False,
            "error": "Failed to connect to MindRove board"
        }), 500
