from flask import Blueprint
from flask_socketio import emit
import time
import mindrove
from mindrove.board_shim import BoardShim, MindRoveInputParams, BoardIds,MindRoveError
from mindrove.data_filter import DataFilter, FilterTypes, DetrendOperations
import pandas as pd
import threading

calibration = Blueprint('calibration', __name__, url_prefix='/api/calibration')

start_calibration = False

def calibration_events(socketio, board_shim):
    @socketio.on('start_testing')
    def handle_start_calibration(message):
        global start_calibration
        try:
            if not board_shim.is_prepared():
                board_shim.prepare_session()
            board_shim.start_stream()

            start_calibration = True

            print("Device ready for calibration")

            board_shim.config_board(mindrove.MindroveConfigMode.EEG_MODE)
            sampling_rate = board_shim.get_sampling_rate(board_shim.board_id)
            timestamp_idx = board_shim.get_timestamp_channel(board_shim.board_id)

            data_list = []
            channel_indices = [0, 1, 2, 3]  
            end_time = time.time() + message["time"]

            if board_shim is not None:
                while time.time() < end_time:
                    print("Collecting calibration data")
                    data = board_shim.get_board_data()
                    if data.shape[1] > 0:  
                        filtered_data = []
                        for channel in channel_indices:
                            channel_data = data[channel]
                            DataFilter.detrend(channel_data, DetrendOperations.CONSTANT.value)
                            DataFilter.perform_bandpass(channel_data, sampling_rate, 3.0, sampling_rate / 2, 2, FilterTypes.BUTTERWORTH, 0)
                            DataFilter.perform_bandstop(channel_data, sampling_rate, 48.0, 52.0, 2, FilterTypes.BUTTERWORTH, 0)
                            DataFilter.perform_bandstop(channel_data, sampling_rate, 58.0, 62.0, 2, FilterTypes.BUTTERWORTH, 0)
                            filtered_data.append(channel_data)
                        
                        timestamp_data = data[timestamp_idx]
                        filtered_data.append(timestamp_data)
                        filtered_data = pd.DataFrame(filtered_data).T
                        filtered_data.columns = ['CH1', 'CH2', 'CH3', 'CH4', 'Timestamp']
                        data_list.append(filtered_data)
                    
                if data_list:
                    all = pd.concat(data_list, ignore_index=True)
                    emit('testing_progress', all.to_json(orient='records'), broadcast=True)

        except MindRoveError as e:
            print("Error initializing the MindRove board:", e)
        except Exception as e:
            print("An error occurred during data collection:", e)
        finally:
            if board_shim is not None:
                try:
                    board_shim.stop_stream()
                except Exception as e:
                    print("Failed to release board session:", e)

    @socketio.on('stop_testing')
    def handle_stop_calibration():
        global start_calibration
        start_calibration = False
        print("Calibration stopped")