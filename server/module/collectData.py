import pandas as pd
import mindrove
from mindrove.board_shim import BoardShim, MindRoveInputParams, BoardIds, MindRoveError
from mindrove.data_filter import DataFilter, FilterTypes, DetrendOperations
import time

def get_datas(times: int, nama: str):
    board_shim = None
    data = None
    try:
        BoardShim.enable_dev_board_logger()
        params = MindRoveInputParams()
        board_id = BoardIds.MINDROVE_WIFI_BOARD.value
        board_shim = BoardShim(board_id, params)
        board_shim.prepare_session()
        board_shim.start_stream(450000)

        sampling_rate = board_shim.get_sampling_rate(board_id)
        timestamp_idx = board_shim.get_timestamp_channel(board_id)
        print("Device ready for calibration")
    except MindRoveError as e:
        print("Error initializing the MindRove board: %s", e)
        return  

    try:
        if board_shim is not None:
            board_shim.config_board(mindrove.MindroveConfigMode.EEG_MODE)
            print("Device configured in EEG mode for calibration")
            print("Collecting calibration data for %d seconds", times)

            data_list = []
            channel_indices = [0, 1, 2, 3]  
            end_time = time.time() + times

            while time.time() < end_time:
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
                all_data = pd.concat(data_list, ignore_index=True)
                data = all_data
                print(data)
                # all_data = pd.concat(data_list, ignore_index=True)
                # file_name = f'{nama}.csv'
                # all_data.to_csv(file_name, sep=';', index=False)
                # print("Calibration data saved to calibration_data.csv")
    except Exception as e:
        print("An error occurred during data collection: %s", e)
    finally:
        if board_shim is not None:
            board_shim.stop_stream()
            board_shim.release_session()
            print("Board session released")

    return data
