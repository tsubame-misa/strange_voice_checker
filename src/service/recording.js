function writeWaveFile(buffer, sampleRate) {
  const resultBuffer = new ArrayBuffer(44 + 2 * buffer.length);
  const view = new DataView(resultBuffer);
  view.setUint8(0, 0x52); // R
  view.setUint8(1, 0x49); // I
  view.setUint8(2, 0x46); // F
  view.setUint8(3, 0x46); // F
  view.setUint32(4, 32 + 2 * buffer.length, true);
  view.setUint8(8, 0x57); // W
  view.setUint8(9, 0x41); // A
  view.setUint8(10, 0x56); // V
  view.setUint8(11, 0x45); // E
  view.setUint8(12, 0x66); // f
  view.setUint8(13, 0x6d); // m
  view.setUint8(14, 0x74); // t
  view.setUint8(15, 0x20); //
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint16(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  view.setUint8(36, 0x64); // d
  view.setUint8(37, 0x61); // a
  view.setUint8(38, 0x74); // t
  view.setUint8(39, 0x61); // a
  view.setUint32(40, buffer.length * 2, true);
  for (let i = 0; i < buffer.length; ++i) {
    view.setInt16(44 + 2 * i, buffer[i], true);
  }
  return resultBuffer;
}

class RecordingContext {
  constructor(stream) {
    this.stream = stream;
    this.buffer = [];
    this.context = new AudioContext({
      sampleRate: 16000,
    });
    const scriptProcessor = this.context.createScriptProcessor(2048, 1, 1);
    scriptProcessor.addEventListener("audioprocess", (event) => {
      for (const v of event.inputBuffer.getChannelData(0)) {
        this.buffer.push(Math.floor(((v + 1) / 2) * 0xffff - 0x8000));
      }
    });
    scriptProcessor.connect(this.context.destination);
    const mediaStreamSource = this.context.createMediaStreamSource(stream);
    mediaStreamSource.connect(scriptProcessor);
  }

  async stop() {
    const { sampleRate } = this.context;
    await this.cancel();
    const buffer = writeWaveFile(this.buffer, sampleRate);
    const blob = new Blob([buffer], { type: "audio/wav" });
    return blob;
  }

  async cancel() {
    for (const track of this.stream.getTracks()) {
      track.stop();
    }
    await this.context.close();
  }
}

export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return new RecordingContext(stream);
}
