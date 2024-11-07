import numpy as np

def create_annotation():
    annotations = {
        "onset": [],
        "duration": [],
        "description": []
    }

    # 1. Fist event
    fist_onset = 5  # starts at 5 seconds
    fist_duration = 60  # lasts for 60 seconds
    for i in range(fist_duration):
        annotations["onset"].append(fist_onset + i)
        annotations["duration"].append(1)  # each duration is 1 second
        annotations["description"].append("fist")

    # 2. Index event
    thumb_onset = fist_onset + fist_duration + 10  # starts after fist event and 10 seconds of pause
    thumb_duration = 60
    for i in range(thumb_duration):
        annotations["onset"].append(thumb_onset + i)
        annotations["duration"].append(1)
        annotations["description"].append("thumb")

    # 3. Thumb event
    index_onset = thumb_onset + thumb_duration + 10  # starts after index event and another 10 seconds of pause
    index_duration = 60
    for i in range(index_duration):
        annotations["onset"].append(index_onset + i)
        annotations["duration"].append(1)
        annotations["description"].append("index")

    # Convert to numpy arrays for better handling
    annotations["onset"] = np.array(annotations["onset"])
    annotations["duration"] = np.array(annotations["duration"])
    annotations["description"] = np.array(annotations["description"])

    return annotations
