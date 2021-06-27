import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import scipy.io.wavfile
import io
import numpy as np
import librosa
import os
import json
from google.cloud import speech
import MeCab
import math


app = Flask(__name__)
cors = CORS(app)

threshold = -50


@app.route("/test", methods=["GET"])
def test():
    return jsonify("OK")


def get_loudness(body):
    rate, data = scipy.io.wavfile.read(io.BytesIO(body))
    data = data.astype(np.float)
    S = np.abs(librosa.stft(data))
    db = librosa.amplitude_to_db(S, ref=np.max)
    dbLine = []
    cnt = 0
    for i in range(len(db[0])):
        _max = threshold
        for j in range(len(db)):
            if _max <= db[j][i]:
                _max = db[j][i]
        if _max == threshold:
            _max = 0
        else:
            cnt += 1

        dbLine.append(_max)

    score = sum(dbLine)/cnt
    score = (score+(-1*threshold))/(-1*threshold) * 50

    return round(score)


def get_word(body):
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
    return word


def get_word_point(text):
    check = ["名詞", "動詞", "形容詞", "形状詞"]
    print(text)
    mecab = MeCab.Tagger("")

    print(mecab.parse(text))

    total = 0
    point = 0
    for c in mecab.parse(text).splitlines()[:-1]:
        surface = c.split("\t")
        pos = surface[4].split('-')
        total += 1
        if pos[0] in check:
            point += 1
        if pos[0] == "感動詞":
            point += 0.5
        print(pos)

    print(point, total)
    res = 0
    if total != 0:
        res = point/total

    res = (1-res)*50

    return round(res)


@app.route('/api/test', methods=['POST'])
def post_test():
    body = request.get_data()

    score = get_loudness(body)

    word = get_word(body)

    status = 1

    print(word)
    if len(word) > 0:
        word_point = get_word_point(word[0])
        print(word_point)
    else:
        word_point = 50
        if score >= 25:
            word = "奇声すぎて判定できませんでした"
            status = 2
        else:
            word = "音声が確認できませんでした"
            word_point = 0
            status = 0

    return jsonify({"dBscore": score, "word": word, "word_score": word_point, "status": status})


if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0',
            port=int(os.environ.get('PORT', 8080)))
