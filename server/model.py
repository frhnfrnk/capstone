from flask import Blueprint, jsonify
import os

model = Blueprint('model', __name__, url_prefix='/api/model')

@model.route('/check', methods=['GET'])
def check_model():
    model_folder_path = "./model"
    csp_path = os.path.join(model_folder_path, "csp")
    svm_path = os.path.join(model_folder_path, "svm")
    print(csp_path)

    
    # Check if both 'csp' and 'svm' folders exist
    if os.path.isdir(csp_path) and os.path.isdir(svm_path):
        message = {
            "status": True,
            "message": "Model available"
        }
        return jsonify(message), 200
    else:
        message = {
            "status": False,
            "message": "Model not available"
        }
        return jsonify(message), 404
