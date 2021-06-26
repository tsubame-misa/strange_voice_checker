import {
  IonContent,
  IonPage,
  IonButton,
  IonAlert,
  IonIcon,
} from "@ionic/react";
import "./Home.css";
import { useState, useCallback } from "react";
import { startRecording } from "../service/recording";
import { logoTwitter } from "ionicons/icons";
import { useCountdownTimer } from "use-countdown-timer";
import useCountDown from "react-countdown-hook";

function Home() {
  const [recorder, setRecorder] = useState(null);
  const [audioSrc, setAudioSrc] = useState();
  const [data, setData] = useState(null);
  const [timeId, setTimeId] = useState();
  /*const { countdown, start, reset, pause, isRunning } = useCountdownTimer({
    timer: 1000 * 5,
  });*/
  /*const initialTime = 5 * 1000; // initial time in milliseconds, defaults to 60000
  const interval = 1000; // interval to change remaining time amount, defaults to 1000
  const [timeLeft, { start, pause, resume, reset }] = useCountDown(
    initialTime,
    interval
  );

  const restart = useCallback(() => {
    const newTime = 30 * 1000;
    start(newTime);
  }, []);  
*/

  console.log(timeId);

  return (
    <IonPage>
      <IonContent fullscreen>
        {data ? (
          <div style={{ textAlign: "center" }} className="login_logo">
            <h2 style={{ textAlign: "center" }}>奇声JUDGE!</h2>
            <h3>あなたの奇声は</h3>
            <h1>{data.word_score + data.dBscore}</h1>

            <h2> 「{data.word}」</h2>
            <h5>うるささ：{data.dBscore} 点</h5>
            <h5>奇抜さ：{data.word_score}点</h5>
            <br />
            <div>
              <IonButton
                onClick={() => {
                  setData(null);
                }}
              >
                リトライ
              </IonButton>
              <audio controls>
                {audioSrc && <source src={audioSrc} type="audio/wav" />}
              </audio>
            </div>
            <IonButton
              size="small"
              href={`http://twitter.com/share?url=https://strange-voice-checker.netlify.app&text=【あなたの奇声は${
                data.dBscore + data.word_score
              }点!!】%0a あなた：「${data.word}」 %0aうるささ：${
                data.dBscore
              }点 %0a奇抜さ：${
                data.word_score
              }点  %0a▼みんな奇声JUDGEしてみよう! &hashtags=奇声JUDGE&count=horizontal&lang=ja`}
            >
              <IonIcon icon={logoTwitter}></IonIcon>
              &ensp;シェアする
            </IonButton>
          </div>
        ) : (
          <div className="login_logo">
            <h2 style={{ textAlign: "center" }}>奇声JUDGE</h2>
            <h4>あなたの奇声はどれくらい凄い？</h4>
            <IonButton
              onClick={async () => {
                if (recorder != null) {
                  return;
                }
                setAudioSrc(null);
                setRecorder(await startRecording());
                setTimeId(
                  setTimeout(function () {
                    setRecorder(null);
                    console.log("30 seconds");
                  }, 10000)
                );
              }}
            >
              録音スタート
            </IonButton>
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
          console.log("Confirm Cancel");
        }}
      />
    </IonPage>
  );
}

export default Home;
