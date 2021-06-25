import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonAlert,
} from "@ionic/react";
import "./Home.css";
import { useState } from "react";
import { startRecording } from "../service/recording";

function Home() {
  const [recorder, setRecorder] = useState(null);
  const [audioSrc, setAudioSrc] = useState();
  const [sentenceData, setSentenceData] = useState([]);
  const [freqData, setFreqData] = useState([]);

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
            //setLoading(true);
            const response = await fetch(
              `${process.env.REACT_APP_API_ENDPOINT}/api/test`,
              {
                method: "POST",
                body: wav,
              }
            );
          }
          setRecorder(null);
        }}
      />
    </IonPage>
  );
}

export default Home;
