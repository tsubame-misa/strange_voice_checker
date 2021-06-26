import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import scipy.io.wavfile
import io
import numpy as np
#import librosa
import os
import json
from google.cloud import speech

app = Flask(__name__)
cors = CORS(app)
# CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/test", methods=["GET"])
def test():
    return jsonify("OK")


@app.route('/api/test', methods=['POST'])
def post_test():
    body = request.get_data()
    """
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

    score = sum(dbLine)/cnt
    """

    client = speech.SpeechClient()

    audio = speech.RecognitionAudio(content=body)

    config = speech.RecognitionConfig(
        encoding=speech.RecognitionConfig.AudioEncoding.LINEAR16,
        sample_rate_hertz=16000,
        language_code="ja-JP",
    )

    response = client.recognize(config=config, audio=audio)

    word = []
    for result in response.results:
        print(result.alternatives[0].transcript)
        word.append(result.alternatives[0].transcript)

    return jsonify({"dBscore": 0, "word": word})


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0',
            port=int(os.environ.get('PORT', 8080)))
