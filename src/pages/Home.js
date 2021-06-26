import {
  IonContent,
  IonPage,
  IonButton,
  IonAlert,
  IonIcon,
  IonHeader,
  IonToolbar,
  IonTitle,
} from "@ionic/react";
import "./Home.css";
import { useState } from "react";
import { startRecording } from "../service/recording";
import { logoTwitter } from "ionicons/icons";
import img from "../images/person.png";

function Home() {
  const [recorder, setRecorder] = useState(null);
  const [audioSrc, setAudioSrc] = useState();
  const [data, setData] = useState(null);
  const [timeId, setTimeId] = useState();

  const twitteTxt = `http://twitter.com/share?url=https://strange-voice-checker.netlify.app&text=【あなたの奇声は${
    data?.dBscore + data?.word_score
  }点!!】%0a あなた：「${data?.word}」 %0aうるささ：${
    data?.dBscore
  }点 %0a奇抜さ：${
    data?.word_score
  }点  %0a▼みんなも奇声JUDGEしてみよう! &hashtags=奇声JUDGE&count=horizontal&lang=ja`;

  const specalTwitteTxt = `http://twitter.com/share?url=https://strange-voice-checker.netlify.app&text=【奇声JUDGE】%0a ${data?.word} %0aうるささ：${data?.dBscore}点 %0a奇抜さ：${data?.word_score}点  %0a▼みんなも奇声JUDGEしてみよう! &hashtags=奇声JUDGE&count=horizontal&lang=ja`;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle style={{ textAlign: "center" }} color="warning">
            奇声JUDGE
          </IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {data ? (
          <div style={{ textAlign: "center" }} className="login_logo">
            <h3>あなたの奇声は</h3>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <svg width="200" height="200">
                  <g>
                    <circle cx="100" cy="100" r={95} fill="#ffc309" />
                    <text
                      x="90"
                      y="100"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="80"
                      style={{ userSelect: "none" }}
                    >
                      {data.dBscore + data.word_score}
                    </text>
                    <text
                      x="168"
                      y="120"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="40"
                      style={{ userSelect: "none" }}
                    >
                      点
                    </text>
                  </g>
                </svg>
              </div>
            </div>

            {data.status === 1 ? (
              <h2> 「{data.word}」</h2>
            ) : (
              <h2 style={{ color: "#737373" }}> {data.word}</h2>
            )}
            <p>うるささ：{data.dBscore} 点</p>
            <p>奇抜さ：{data.word_score}点</p>

            <div style={{ margin: "10px" }}>
              <audio controls>
                {audioSrc && <source src={audioSrc} type="audio/wav" />}
              </audio>
            </div>
            <div>
              <IonButton
                color="warning"
                onClick={() => {
                  setData(null);
                }}
              >
                リトライ
              </IonButton>
              <IonButton
                color="secondary"
                href={data?.status === 1 ? twitteTxt : specalTwitteTxt}
              >
                <IonIcon icon={logoTwitter}></IonIcon>
                &ensp;シェア
              </IonButton>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: "1.25rem", padding: "10vh" }}></div>
            <div className="login_logo">
              <img
                src={img}
                style={{ height: "40vh", padding: "10px" }}
                alt="奇声をあげる人"
              />

              <IonButton
                size="large"
                color="warning"
                style={{ marginTop: "20px" }}
                onClick={async () => {
                  if (recorder != null) {
                    return;
                  }
                  setAudioSrc(null);
                  setRecorder(await startRecording());
                  setTimeId(
                    setTimeout(function () {
                      setRecorder(null);
                      console.log("time out");
                    }, 30000)
                  );
                }}
              >
                奇声を録音
              </IonButton>
            </div>
          </div>
        )}
      </IonContent>

      <IonAlert
        isOpen={recorder != null}
        header="録音中"
        message={`30秒過ぎると録音が強制終了します`}
        buttons={[
          {
            text: "キャンセル",
            role: "cancel",
          },
          { text: "完了" },
        ]}
        onDidDismiss={async (event) => {
          if (event.detail.role === "cancel") {
            await recorder.cancel();
          } else {
            if (recorder) {
              const wav = await recorder.stop();
              setAudioSrc(URL.createObjectURL(wav));
              const response = await fetch(
                `${process.env.REACT_APP_API_ENDPOINT}/api/test`,
                {
                  method: "POST",
                  body: wav,
                }
              );
              const result = await response.json();
              setData(result);
            }
          }
          setRecorder(null);
          clearTimeout(timeId);
        }}
      />
    </IonPage>
  );
}

export default Home;
