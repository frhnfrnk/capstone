import numpy as np

def create_anotation():
    annotations = {
        "onset": [],
        "duration": [],
        "description": []
    }

     # Create annotations for the events
    # 1. Fist event
    fist_onset = 5  # starts at 5 seconds
    fist_duration = 15  # lasts for 15 seconds
    for i in range(fist_duration):
        annotations["onset"].append(fist_onset + i)
        annotations["duration"].append(1)  # each duration is 1 second
        annotations["description"].append("fist")

    # 2. Index event
    index_onset = fist_onset + fist_duration + 5  # starts after fist event and first 5 seconds of pause
    index_duration = 15
    for i in range(index_duration):
        annotations["onset"].append(index_onset + i)
        annotations["duration"].append(1)
        annotations["description"].append("index")

    # 3. Thumb event
    thumb_onset = index_onset + index_duration + 5  # starts after index event and second 5 seconds of pause
    thumb_duration = 15
    for i in range(thumb_duration):
        annotations["onset"].append(thumb_onset + i)
        annotations["duration"].append(1)
        annotations["description"].append("thumb")

    # Convert to numpy arrays for better handling
    annotations["onset"] = np.array(annotations["onset"])
    annotations["duration"] = np.array(annotations["duration"])
    annotations["description"] = np.array(annotations["description"])

    return annotations