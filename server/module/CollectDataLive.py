import pandas as pd
import mindrove
from mindrove.board_shim import BoardShim, MindRoveInputParams, BoardIds, MindRoveError
from mindrove.data_filter import DataFilter, FilterTypes, DetrendOperations
import time
import os
from flask_socketio import emit

def get_datas_live(isStart: bool,  board_shim: BoardShim, name: str):
    try: 
        if not board_shim.is_prepared():
            board_shim.prepare_session()
        board_shim.start_stream()

        print("Device ready for live classification")

        board_shim.config_board(mindrove.MindroveConfigMode.EEG_MODE)
        sampling_rate = board_shim.get_sampling_rate(board_shim.board_id)
        timestamp_idx = board_shim.get_timestamp_channel(board_shim.board_id)

        data_list = []
        channel_indices = [0, 1, 2, 3]  

        if board_shim is not None:
            print("Collecting data...")
            while isStart:
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

                    # classfication

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

    return None