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
        print(message)
        play = True
        name = message['nama']
        emit("starting_classification", broadcast=True)

        # Initialize the classifier outside the loop for efficiency
        
        while play:
            # Check if play is still True before each classification step
            if not play:
                break
            live_classifier = LiveClassifier.LiveClassifier(name=name)
            live_classifier.live_classification(board_shim)
            emit("result_classification", live_classifier.message, broadcast=True)

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
            # Check if play is still True before each testing step
            if not play:
                break
            message = {
                "result": random.choice(data),
                "accuracy": accuration
            }
            emit('testinggsaew', message, broadcast=True)
            time.sleep(5)
