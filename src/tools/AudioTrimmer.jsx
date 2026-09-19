import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Download, RefreshCw } from 'lucide-react';

export default function AudioTrimmer() {
  const [file, setFile] = useState(null);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [duration, setDuration] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioCtxRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load Audio File and Decode Audio Buffer
  const handleFileLoad = async (f) => {
    if (!f || !f.type.startsWith('audio/')) return;

    try {
      const arrayBuffer = await f.arrayBuffer();
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;

      const decoded = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(decoded);
      setDuration(decoded.duration);
      setStartTime(0);
      setEndTime(decoded.duration);
      setFile(f);
      drawWaveform(decoded);
    } catch (e) {
      console.error(e);
      alert('Could not decode audio file format.');
    }
  };

  // Draw Audio Waveform onto Canvas
  const drawWaveform = (buffer) => {
    const canvas = canvasRef.current;
    if (!canvas || !buffer) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const data = buffer.getChannelData(0);
    const step = Math.ceil(data.length / width);
    const amp = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#faf9f7';
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(0, amp);

    for (let i = 0; i < width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.fillStyle = '#c45d3e';
      ctx.fillRect(i, (1 + min) * amp, 1, Math.max(1, (max - min) * amp));
    }
  };

  useEffect(() => {
    if (audioBuffer) drawWaveform(audioBuffer);
  }, [audioBuffer]);

  // Playback Selected Audio Clip
  const togglePlay = () => {
    if (isPlaying) {
      sourceNodeRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    if (!audioBuffer || !audioCtxRef.current) return;

    const ctx = audioCtxRef.current;
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const playDuration = Math.max(0.1, endTime - startTime);
    source.start(0, startTime, playDuration);
    sourceNodeRef.current = source;
    setIsPlaying(true);

    source.onended = () => setIsPlaying(false);
  };

  // Export Trimmed Audio Buffer to WAV File
  const exportWav = () => {
    if (!audioBuffer) return;

    const sampleRate = audioBuffer.sampleRate;
    const numChannels = audioBuffer.numberOfChannels;
    const startSample = Math.floor(startTime * sampleRate);
    const endSample = Math.floor(endTime * sampleRate);
    const frameLength = endSample - startSample;

    const offlineCtx = new OfflineAudioContext(numChannels, frameLength, sampleRate);
    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0, startTime, endTime - startTime);

    offlineCtx.startRendering().then(renderedBuffer => {
      const wavBlob = bufferToWavBlob(renderedBuffer);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(wavBlob);
      a.download = `${file.name.replace(/\.[^.]+$/, '')}-trimmed.wav`;
      a.click();
    });
  };

  // Convert AudioBuffer to WAV Blob format
  const bufferToWavBlob = (abuffer) => {
    const numOfChan = abuffer.numberOfChannels;
    const length = abuffer.length * numOfChan * 2 + 44;
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
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan);
    setUint16(numOfChan * 2);
    setUint16(16); // 16-bit
    setUint32(0x61746164); // "data" chunk
    setUint32(length - pos - 4);

    for (let i = 0; i < abuffer.numberOfChannels; i++) {
      channels.push(abuffer.getChannelData(i));
    }

    while (offset < abuffer.length) {
      for (let i = 0; i < numOfChan; i++) {
        sample = Math.max(-1, Math.min(1, channels[i][offset]));
        sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: 'audio/wav' });
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}.${Math.floor((s % 1) * 10)}`;

  if (!file) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFileLoad(e.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()}>
      <input type="file" ref={fileInputRef} onChange={e => handleFileLoad(e.target.files[0])} accept="audio/*" hidden />
      <div className="dropzone-icon"><Music size={24} /></div>
      <div className="dropzone-title">Upload Audio File to Trim</div>
      <div className="dropzone-subtitle">Trim MP3, WAV, AAC audio clips with live interactive waveform preview</div>
      <button className="btn btn-blue btn-sm" style={{ marginTop: '0.4rem' }}>Select Audio File</button>
    </div>
  );

  return (
    <div>

      {/* Header Info */}
      <div style={{ background: 'var(--bg-elevated)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{file.name}</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>Duration: {fmtTime(duration)}</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setAudioBuffer(null); }}>
          <RefreshCw size={13} /> Change File
        </button>
      </div>

      {/* Waveform Canvas */}
      <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.25rem', textAlign: 'center' }}>
        <canvas ref={canvasRef} width={700} height={120} style={{ width: '100%', height: '120px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-main)' }} />
      </div>

      {/* Time Sliders Controls */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div className="control-group" style={{ marginBottom: 0 }}>
          <div className="control-label">
            <span>Start Time</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{fmtTime(startTime)}</span>
          </div>
          <input type="range" className="custom-slider" min="0" max={duration} step="0.1" value={startTime} onChange={e => setStartTime(Math.min(+e.target.value, endTime - 0.5))} />
        </div>

        <div className="control-group" style={{ marginBottom: 0 }}>
          <div className="control-label">
            <span>End Time</span>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{fmtTime(endTime)}</span>
          </div>
          <input type="range" className="custom-slider" min="0" max={duration} step="0.1" value={endTime} onChange={e => setEndTime(Math.max(+e.target.value, startTime + 0.5))} />
        </div>
      </div>

      {/* Action Toolbar */}
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="btn btn-secondary" style={{ flex: 1 }} onClick={togglePlay}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{isPlaying ? 'Pause Preview' : 'Play Selection'}</span>
        </button>
        <button className="btn btn-green" style={{ flex: 1 }} onClick={exportWav}>
          <Download size={16} /> Download Trimmed WAV
        </button>
      </div>
    </div>
  );
}
