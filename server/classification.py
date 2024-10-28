from flask import Blueprint
from flask_socketio import emit, send
import time
import random

classification = Blueprint('classification', __name__, url_prefix='/api/classification')

play = True

def classification_events(socketio):
    @socketio.on('start_classification')
    def handle_start_classification():
        global play
        data = ["Genggam", "Hook Fist", "Index Flexion", "Open", "Thumb Flexion"]
        while play:
            message = random.choice(data)
            emit('classification_progress', message, broadcast=True)
            time.sleep(5)

    @socketio.on('stop_classification')
    def handle_stop_classification():
        global play
        play = False
        emit('classification_stopped', broadcast=True)