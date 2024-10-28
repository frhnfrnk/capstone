from flask import Blueprint
from flask_socketio import emit, send
import time
# Create a blueprint for calibration
calibration = Blueprint('calibration', __name__, url_prefix='/api/calibration')

start_time = 0

def calibration_events(socketio):
    @socketio.on('start_calibration')
    def handle_start_calibration():
        global start_time
        start_time = time.time()
        emit('calibration_started', broadcast=True)

    @socketio.on('end_calibration')
    def handle_end_calibration():
        global start_time
        end_time = time.time()
        calibration_time = end_time - start_time
        emit('calibration_ended', calibration_time, broadcast=True)