import pandas as pd
import mne
import os


class SaveData:
    def __init__(self, mindrove_data=None, annotations=None, sfreq=500, name=None):
        self.mindrove_data = mindrove_data
        self.annotations = annotations
        self.sfreq = sfreq
        self.raw = None
        self.file_path = f"./data/{name}_raw.fif"
        self.new_fif = None
        self.temp_file = "./temp_raw.fif"

    def load_data_from_mindrove(self):
        """Load data from MindRove into MNE Raw format."""
        if not self.mindrove_data:
            print("No MindRove data provided.")
            return

        mindrove_df = pd.DataFrame(self.mindrove_data)
        mindrove_df.set_index("Timestamp", inplace=True)

        ch_names = ["CH1", "CH2", "CH3", "CH4"]
        info = mne.create_info(ch_names=ch_names, sfreq=self.sfreq, ch_types="eeg")
        eeg_data = mindrove_df[ch_names].values.T
        self.raw = mne.io.RawArray(eeg_data, info)
        print("MindRove data loaded into MNE format.")

    def add_annotations(self):
        """Add annotations to the raw data for segmentation."""
        if not self.raw:
            print("Data not loaded. Load data before adding annotations.")
            return
        if not self.annotations:
            print("No annotations provided.")
            return

        annot = mne.Annotations(
            onset=self.annotations['onset'],
            duration=self.annotations['duration'],
            description=self.annotations['description']
        )
        self.raw.set_annotations(annot)
        self.raw.save(self.temp_file, overwrite=True)
        print("Annotations added to raw data.")

    def merge_with_existing_data(self):
        """Merge the annotated raw data with existing data.raw file if it exists."""
        if os.path.exists(self.file_path):
            # Load existing data and concatenate with the new annotated data
            existing_raw = mne.io.read_raw_fif(self.file_path, preload=True)
            temp_raw = mne.io.read_raw_fif("./temp_raw.fif", preload=True)
            self.new_fif = mne.concatenate_raws([existing_raw, temp_raw])
            print("Existing data found and merged with new annotated data.")
        else:
            print("No existing data found. Only new data will be saved.")

    def save_data_to_raw(self):
        """Save the raw data to the specified file."""
        if not self.raw:
            print("Data not loaded. Load data before saving.")
            return

        # Ensure the directory exists
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        
        if self.new_fif:
            self.new_fif.save(self.file_path, overwrite=True)
            print(f"Data merge to {self.file_path}")
        else:
            self.raw.save(self.file_path, overwrite=True)
            print(f"Data saved to {self.file_path}")

        os.remove(self.temp_file)

    def run_pipeline(self):
        self.load_data_from_mindrove()
        self.add_annotations()
        self.merge_with_existing_data()
        self.save_data_to_raw()
