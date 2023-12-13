from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from dataset.tabular_data_collection import load_tabular_dataset, get_tabular_dataset, parse_upload_data
from processing.tabular_data_parse import parse_sheet
from werkzeug.utils import secure_filename

import os, random
import json

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADER'] = 'Content-Type'

@app.route('/tabulardata', methods=['GET'])
@cross_origin()
def getTabularData():
    tabular_dataset = get_tabular_dataset()
    # print(tabular_dataset)
    # tabular_name_list = request.args.get('tabularData[]')
    return tabular_dataset

# @app.route('/uploadtabulardata', methods=['GET'])
# @cross_origin()
# def getUploadTabularData():
#     file_name = request.args.get("name")
#     file_name = secure_filename(file_name)
#     data = parse_upload_data(file_name)
#     print("parse_data", data)
#     path = "public/upload_" + file_name
#     os.remove(path)  # 删除本地的文件
#     return data

@app.route('/getupload', methods=['POST'])
@cross_origin()
def file_upload():
    # requ_data = {
    #     'file': request.files.get('file'),
    #     # 'file_info': dict(request.form)
    # }
    # resp_data = resp_file_upload(requ_data)
    
    requ_data = request.files.get('file')
    # suffix = requ_data.filename.split(".")[-1]
    # file_path = 'public/upload_temp.' + suffix
    file_name = secure_filename(requ_data.filename)
    file_path = "public/upload_" + file_name
    requ_data.save(file_path)
    
    data = parse_upload_data(file_name)
    print("parse_data", data)

    os.remove(file_path)  # 删除本地的文件
    return data

    # return "upload ok"

# def resp_file_upload(requ_data):
#     # 保存文件
#     file_content = requ_data['file']
#     file_name = requ_data['file'].filename
#     file_path = 'public/' + file_name
#     if os.path.exists(file_path):
#         return { 'msg': '该文件已存在'}
#     else:
#     	file_content.save(file_path)
#     	return { 'msg': '保存文件成功' }

if __name__ == "__main__":
    print('run 0.0.0.0:14450')
    load_tabular_dataset()
    app.run(host='0.0.0.0', port=14450, debug=True)

