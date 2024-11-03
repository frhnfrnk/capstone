from flask import Blueprint
from flask_socketio import emit
import time
import random

classification = Blueprint('classification', __name__, url_prefix='/api/classification')

play = False

def classification_events(socketio):
    @socketio.on('start_classification')
    def handle_start_classification():
        global play
        if play:
            return
        
        data = ["Fist", "Hook", "Open", "Thumb", "Index"]
        play = True
        accuration = random.randint(20, 99)
        time.sleep(5)  

        while play: 
            message = {
                "data": random.choice(data),
                "accuration": accuration
            }
            emit('classification_progress', message, broadcast=True)
            time.sleep(5)

    @socketio.on('stop_classification')
    def handle_stop_classification():
        global play
        play = False
        emit('classification_stopped', broadcast=True)
