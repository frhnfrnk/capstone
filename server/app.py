from flask import Flask
from flask_socketio import SocketIO, emit
from flask_cors import CORS

from user import user
from calibration import calibration
from calibration import calibration_events
from classification import classification
from classification import classification_events
from collectdata import collect_data_events
from model import model

from mindrove.board_shim import BoardShim, MindRoveInputParams, BoardIds

app = Flask(__name__)
CORS(app)  
socketio = SocketIO(app, cors_allowed_origins="*")

app.register_blueprint(user)
app.register_blueprint(calibration) 
app.register_blueprint(classification)
app.register_blueprint(model)

BoardShim.enable_dev_board_logger()
params = MindRoveInputParams()
board_id = BoardIds.MINDROVE_WIFI_BOARD.value
board_shim = BoardShim(board_id, params)


calibration_events(socketio, board_shim)
classification_events(socketio, board_shim)
collect_data_events(socketio)


if __name__ == '__main__':
    socketio.run(app, host='127.0.0.1', port=5000, debug=True)
