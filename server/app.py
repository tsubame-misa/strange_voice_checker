import os
from types import BuiltinMethodType
from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import json
import scipy.io.wavfile
import io
import numpy as np
import librosa

app = Flask(__name__)
cors = CORS(app)
# CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/user_message",  methods=['PUT'])
def user_message():
    text = json.loads(request.data.decode())
    res = module.make_response(text)
    return jsonify(res)


@app.route("/change_panda")
def change_pand():
    return jsonify("OK")


@app.route('/api/test', methods=['POST'])
def post_test():
    body = request.get_data()
    rate, data = scipy.io.wavfile.read(io.BytesIO(body))
    data = data.astype(np.float)
    S = np.abs(librosa.stft(data))
    db = librosa.amplitude_to_db(S, ref=np.max)
    dbLine = []
    cnt = 0
    for i in range(len(db[0])):
        _max = -20
        for j in range(len(db)):
            if _max <= db[j][i]:
                _max = db[j][i]
        if _max == -20:
            _max = 0
        else:
            cnt += 1

        dbLine.append(_max)

    print(dbLine)
    print(sum(dbLine)/cnt)

    return jsonify("fin")


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0',
            port=int(os.environ.get('PORT', 8080)))
