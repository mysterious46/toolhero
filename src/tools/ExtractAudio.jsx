import React, { useState, useRef } from 'react';
import { Music, Download, Zap, RefreshCw } from 'lucide-react';

export default function ExtractAudio() {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = async (f) => {
    if (!f || !f.type.startsWith('video/')) return;
    setFile(f);
    setAudioUrl('');
  };

  const extractAudioTrack = async () => {
    if (!file) return;
    setBusy(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      // Convert AudioBuffer to WAV Blob
      const numOfChan = audioBuffer.numberOfChannels;
      const length = audioBuffer.length * numOfChan * 2 + 44;
      const buffer = new ArrayBuffer(length);
      const view = new DataView(buffer);
      const channels = [];
      let sample = 0;
      let offset = 0;
      let pos = 0;

      function setUint16(data) { view.setUint16(pos, data, true); pos += 2; }
      function setUint32(data) { view.setUint32(pos, data, true); pos += 4; }

      setUint32(0x46464952); // "RIFF"
      setUint32(length - 8);
      setUint32(0x45564157); // "WAVE"
      setUint32(0x20746d66); // "fmt " chunk
      setUint32(16);
      setUint16(1); // PCM
      setUint16(numOfChan);
      setUint32(audioBuffer.sampleRate);
      setUint32(audioBuffer.sampleRate * 2 * numOfChan);
      setUint16(numOfChan * 2);
      setUint16(16); // 16-bit
      setUint32(0x61746164); // "data" chunk
      setUint32(length - pos - 4);

      for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
      }

      while (offset < audioBuffer.length) {
        for (let i = 0; i < numOfChan; i++) {
          sample = Math.max(-1, Math.min(1, channels[i][offset]));
          sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
          view.setInt16(pos, sample, true);
          pos += 2;
        }
        offset++;
      }

      const blob = new Blob([buffer], { type: 'audio/wav' });
      setAudioUrl(URL.createObjectURL(blob));
    } catch (e) {
      console.error(e);
      alert('Could not extract audio track from video file.');
    } finally {
      setBusy(false);
    }
  };

  if (!file) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()}>
      <input type="file" ref={fileInputRef} onChange={e => handleFile(e.target.files[0])} accept="video/*" hidden />
      <div className="dropzone-icon"><Music size={24} /></div>
      <div className="dropzone-title">Upload Video File to Extract Audio</div>
      <div className="dropzone-subtitle">Extract MP3/WAV audio tracks from MP4, WebM, MOV videos 100% in browser</div>
      <button className="btn btn-blue btn-sm" style={{ marginTop: '0.4rem' }}>Select Video File</button>
    </div>
  );

  return (
    <div>

      <div style={{ background: 'var(--bg-elevated)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{file.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Video File ({(file.size / (1024 * 1024)).toFixed(2)} MB)</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setAudioUrl(''); }}>
          <RefreshCw size={13} /> Change Video
        </button>
      </div>

      {!audioUrl && (
        <button className="btn btn-purple" style={{ width: '100%', padding: '0.75rem' }} onClick={extractAudioTrack} disabled={busy}>
          <Music size={16} /> {busy ? 'Extracting Audio Track...' : 'Extract Audio Track from Video'}
        </button>
      )}

      {audioUrl && (
        <div style={{ background: 'var(--green-soft)', border: '1px solid var(--green-border)', padding: '1.15rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--green)' }}>Audio Track Extracted Successfully!</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Format: Uncompressed WAV Audio</div>
            </div>
            <a className="btn btn-green" href={audioUrl} download={`${file.name.replace(/\.[^.]+$/, '')}-audio.wav`}>
              <Download size={16} /> Download Extracted WAV
            </a>
          </div>

          <audio src={audioUrl} controls style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
}
