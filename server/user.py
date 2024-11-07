from flask import Blueprint, jsonify, request
import os
import json

user = Blueprint('user', __name__, url_prefix='/api/user')

@user.route('/', methods=['GET'])
def get_user():
    user_folder_path = "./user"
    try:
        # Mendapatkan daftar semua folder dalam direktori
        folders = [name for name in os.listdir(user_folder_path) if os.path.isdir(os.path.join(user_folder_path, name))]
        return jsonify({"user": folders}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@user.route('/get-model/<user>', methods=['GET'])
def get_model(user):
    user_folder_path = "user"
    file_name = "results.json" 

    try:
        file_path = os.path.join(user_folder_path, user, file_name)
        print(file_path)
        if os.path.isfile(file_path):
            with open(file_path, 'r') as file:
                file_content = json.load(file)
            return jsonify({"model": file_content}), 200
        else:
            return jsonify({"model": None, "message": "result.json not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500