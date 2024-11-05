import pandas as pd
import mindrove
from mindrove.board_shim import BoardShim, MindRoveInputParams, BoardIds, MindRoveError
from mindrove.data_filter import DataFilter, FilterTypes, DetrendOperations
import time
import os
from flask_socketio import emit

def check_folder_exist(folder_path: str):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    return folder_path

def save_data_to_csv(data, folder_name: str, file_name: str):
    folder_path = check_folder_exist(f'user/{folder_name}')
    file_path = os.path.join(folder_path, file_name)

    if os.path.exists(file_path):
        # Load existing data and merge with new data
        existing_data = pd.read_csv(file_path)
        combined_data = pd.concat([existing_data, data], ignore_index=True)
        combined_data.to_csv(file_path, index=False)
        print(f"Data merged and saved to {file_path}")
    else:
        # Save new data as a new file
        data.to_csv(file_path, index=False)
        print(f"Data saved to {file_path}")

def get_datas(times: int, nama: str, board_shim: BoardShim):
    try: 
        if not board_shim.is_prepared():
            board_shim.prepare_session()
        board_shim.start_stream()

        print("Device ready for calibration")

        board_shim.config_board(mindrove.MindroveConfigMode.EEG_MODE)
        sampling_rate = board_shim.get_sampling_rate(board_shim.board_id)
        timestamp_idx = board_shim.get_timestamp_channel(board_shim.board_id)

        data_list = []
        channel_indices = [0, 1, 2, 3]  
        end_time = time.time() + times

        if board_shim is not None:
            print("Collecting data...")
            while time.time() < end_time:
                data = board_shim.get_board_data()
                if data.shape[1] > 0:  
                    filtered_data = []
                    for channel in channel_indices:
                        channel_data = data[channel]
                        DataFilter.detrend(channel_data, DetrendOperations.CONSTANT.value)
                        # DataFilter.perform_bandpass(channel_data, sampling_rate, 3.0, sampling_rate / 2, 2, FilterTypes.BUTTERWORTH, 0)
                        # DataFilter.perform_bandstop(channel_data, sampling_rate, 48.0, 52.0, 2, FilterTypes.BUTTERWORTH, 0)
                        # DataFilter.perform_bandstop(channel_data, sampling_rate, 58.0, 62.0, 2, FilterTypes.BUTTERWORTH, 0)
                        # 50 Hz Notch filter
                        DataFilter.perform_bandstop(channel_data, sampling_rate, 50.0, 1.0, 2, FilterTypes.BUTTERWORTH, 0)

                        # 8-30 Hz Bandpass filter
                        DataFilter.perform_bandpass(channel_data, sampling_rate, 8.0, 30.0, 2, FilterTypes.BUTTERWORTH, 0)
                        filtered_data.append(channel_data)
                    
                    timestamp_data = data[timestamp_idx]
                    filtered_data.append(timestamp_data)
                    filtered_data = pd.DataFrame(filtered_data).T
                    filtered_data.columns = ['CH1', 'CH2', 'CH3', 'CH4', 'Timestamp']
                    data_list.append(filtered_data)
                
            if data_list:
                all_data = pd.concat(data_list, ignore_index=True)
                all_data_json = all_data.to_dict(orient="records") 
                save_data_to_csv(all_data, nama, f'{nama}_data.csv')
                emit('get_data', broadcast=True)
                return all_data_json

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