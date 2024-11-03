from flask import Blueprint, jsonify
from mindrove.board_shim import BoardShim, MindRoveInputParams, BoardIds, MindRoveError
import logging

# Initialize the Blueprint and logging
mindrove = Blueprint('mindrove', __name__, url_prefix='/api/mindrove')
logging.basicConfig(level=logging.ERROR)

# Singleton pattern to manage the board instance
board_instance = None

def get_board_instance():
    global board_instance
    if board_instance is None:
        board_id = BoardIds.MINDROVE_WIFI_BOARD
        params = MindRoveInputParams()
        board_instance = BoardShim(board_id, params)
    return board_instance

@mindrove.route('/check_connection', methods=['GET'])
def check_connection():
    board = get_board_instance()
    
    try:
        # Ensure the session is not already active
        if not board.is_prepared():
            board.prepare_session()
        
        board_info = board.get_device_name(board.board_id)
        
        return jsonify({
            "success": True,
            "board": board_info
        }), 200

    except MindRoveError as e:
        logging.error("Error initializing the MindRove board: %s", e)
        
        # Attempt to release session in case of error
        if board.is_prepared():
            try:
                board.release_session()
            except MindRoveError as release_error:
                logging.error("Error releasing session: %s", release_error)
        
        return jsonify({
            "success": False,
            "error": "Error initializing the MindRove board"
        }), 500
