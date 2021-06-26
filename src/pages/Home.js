import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonAlert,
  IonCard,
  IonItem,
} from "@ionic/react";
import "./Home.css";
import { useState } from "react";
import { startRecording } from "../service/recording";

function Home() {
  const [recorder, setRecorder] = useState(null);
  const [audioSrc, setAudioSrc] = useState();
  const [data, setData] = useState([]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>奇声チェッカー</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Blank</IonTitle>
          </IonToolbar>
        </IonHeader>
        <audio controls>
          {audioSrc && <source src={audioSrc} type="audio/wav" />}
        </audio>
        <IonButton
          expand="block"
          onClick={async () => {
            if (recorder != null) {
              return;
            }
            setAudioSrc(null);
            setRecorder(await startRecording());
          }}
        >
          録音スタート
        </IonButton>
        <IonCard>
          <IonItem>score : &emsp; {data.dBscore}</IonItem>
          <IonItem>sentence: &ensp; {data.word}</IonItem>
        </IonCard>
      </IonContent>
      <IonAlert
        isOpen={recorder != null}
        header="録音中"
        message="録音中"
        buttons={[{ text: "キャンセル", role: "cancel" }, { text: "完了" }]}
        onDidDismiss={async (event) => {
          if (event.detail.role === "cancel") {
            await recorder.cancel();
          } else {
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
            console.log(result);
            setData(result);
          }

          setRecorder(null);
        }}
      />
    </IonPage>
  );
}

export default Home;
