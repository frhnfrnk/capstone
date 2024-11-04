from flask import Blueprint, jsonify
from mindrove.board_shim import BoardShim, MindRoveInputParams, BoardIds, MindRoveError
from mindrove.exit_codes import MindroveExitCodes
import logging

# Initialize the Blueprint and logging
mindrove = Blueprint('mindrove', __name__, url_prefix='/api/mindrove')
logging.basicConfig(level=logging.ERROR)

is_connected = False
board_id = None


def get_board_instance():
    board_id = BoardIds.MINDROVE_WIFI_BOARD
    params = MindRoveInputParams()
    board_instance = BoardShim(board_id, params)
    return board_instance

@mindrove.route('/check_connection', methods=['GET'])
def check_connection():
    global is_connected, board_id
    board = None
    
    if is_connected:
        return jsonify({
            "success": True,
            "board": board_id
        }), 200
    
    try:
        board = get_board_instance()
        if not board.is_prepared:
            board.prepare_session()
            board.start_stream()

    except MindRoveError as e:
        return jsonify({
            "success": False,
            "error": "Mindrove error: " + str(e)
        }), 500
    
    if board is not None:
        try:
            data = board.get_board_data()
            if data:
                print(data)
                is_connected = True
                board_id = board.get_device_name(board.board_id)
                battery = board.get_battery_level(board.board_id)
                return jsonify({
                    "success": True,
                    "board": board_id,
                    "battery": battery
                }), 200
            else:
                return jsonify({
                    "success": False,
                    "error": "Mindrove is not connected"
                }), 500
        
        except MindRoveError as e:
            return jsonify({
                "success": False,
                "error": "Mindrove error: " + str(e)
            }), 500
        


