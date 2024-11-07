from flask import Blueprint
from flask_socketio import emit
import time
import random
import module.LiveClassifier as LiveClassifier

classification = Blueprint('classification', __name__, url_prefix='/api/classification')

play = False

def classification_events(socketio, board_shim):
    @socketio.on('start_classification')
    def handle_start_classification(message):
        global play
        if play:
            return
        
        play = True
        name = message['nama']
        while play:
            live_classifier = LiveClassifier.LiveClassifier(name=name)
            live_classifier.live_classification(board_shim)


    @socketio.on('stop_classification')
    def handle_stop_classification():
        global play
        play = False
        emit('classification_stopped', broadcast=True)

    @socketio.on('disconnect')
    def handle_disconnect():
        global play
        play = False  # Stop classification when client disconnects
        print("Client disconnected, classification stopped.")

    @socketio.on('testing_classification')
    def handle_testing_classification():
        global play
        if play:
            return
        
        data = ["Fist", "Thumb", "Index"]
        play = True
        accuration = random.randint(20, 99)
        time.sleep(5)  

        while play: 
            message = {
                "data": random.choice(data),
                "accuration": accuration
            }
            emit('testinggsaew', message, broadcast=True)
            time.sleep(5)