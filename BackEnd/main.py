from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

import os, random

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADER'] = 'Content-Type'

@app.route('/tabledata', methods=['GET'])
@cross_origin()
def getTabularData():
    tabularData = request.args.get('tabularData')
    return {"processed_tabledata": "table"}

if __name__ == "__main__":
    print('run 0.0.0.0:14449')
    # app.run(threaded=True, host='0.0.0.0', port=14453)
    app.run(host='0.0.0.0', port=14449)

