// Generates a short placeholder WAV tone so the "Play Recording" button in the
// expanded log view has something real to play. Real audio would come from the
// Toph mobile app's hands-free recordings; we don't have samples of that, so
// this stands in for it.
import { writeFileSync, mkdirSync } from "node:fs";

const sampleRate = 44100;
const durationSeconds = 3;
const numSamples = sampleRate * durationSeconds;
const numChannels = 1;
const bitsPerSample = 16;
const blockAlign = (numChannels * bitsPerSample) / 8;
const byteRate = sampleRate * blockAlign;
const dataSize = numSamples * blockAlign;

const buffer = Buffer.alloc(44 + dataSize);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(bitsPerSample, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);

// A couple of soft tones with a fade in/out, roughly like a two-beep voice-memo chime.
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  const envelope = Math.min(1, t * 8) * Math.min(1, (durationSeconds - t) * 8);
  const freq = t < 1.4 ? 440 : t < 1.6 ? 0 : 660;
  const sample = freq === 0 ? 0 : Math.sin(2 * Math.PI * freq * t) * 0.2 * envelope;
  buffer.writeInt16LE(Math.round(sample * 32767), 44 + i * blockAlign);
}

mkdirSync("public/audio", { recursive: true });
writeFileSync("public/audio/sample-log.wav", buffer);
console.log("Wrote public/audio/sample-log.wav");
