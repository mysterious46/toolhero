import React, { useState, useRef } from 'react';
import { Film, Download, Zap, RefreshCw, Play } from 'lucide-react';
import AdBanner from '../components/AdBanner';

export default function VideoToGif() {
  const [file, setFile] = useState(null);
  const [videoSrc, setVideoSrc] = useState('');
  const [fps, setFps] = useState(30);
  const [width, setWidth] = useState(1280);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [resultGifUrl, setResultGifUrl] = useState('');

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith('video/')) return;
    setFile(f);
    setVideoSrc(URL.createObjectURL(f));
    setResultGifUrl('');
  };

  const convertToGif = async () => {
    const video = videoRef.current;
    if (!video) return;

    setBusy(true);
    setProgress('Extracting video frames in high definition...');

    try {
      const canvas = document.createElement('canvas');
      const aspect = (video.videoHeight || 720) / (video.videoWidth || 1280);
      const targetWidth = width === 0 ? (video.videoWidth || 1280) : width;

      canvas.width = targetWidth;
      canvas.height = Math.round(targetWidth * aspect);

      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const stream = canvas.captureStream(fps);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm',
        videoBitsPerSecond: 8000000 // 8 Mbps high quality stream
      });
      const chunks = [];

      mediaRecorder.ondataavailable = e => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setResultGifUrl(URL.createObjectURL(blob));
        setBusy(false);
        setProgress('');
      };

      mediaRecorder.start();
      video.currentTime = 0;
      await video.play();

      const interval = setInterval(() => {
        if (video.ended || video.paused) {
          clearInterval(interval);
          mediaRecorder.stop();
        } else {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        }
      }, 1000 / fps);
    } catch (e) {
      console.error(e);
      alert('Failed to convert video clip.');
      setBusy(false);
      setProgress('');
    }
  };

  if (!file) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()}>
      <input type="file" ref={fileInputRef} onChange={e => handleFile(e.target.files[0])} accept="video/*" hidden />
      <div className="dropzone-icon"><Film size={24} /></div>
      <div className="dropzone-title">Upload Video File</div>
      <div className="dropzone-subtitle">Convert MP4, WebM, MOV video clips into 720p/1080p HD smooth animations (up to 60 FPS)</div>
      <button className="btn btn-blue btn-sm" style={{ marginTop: '0.4rem' }}>Select Video File</button>
    </div>
  );

  return (
    <div>
      <AdBanner slotType="leaderboard" />

      {/* Video Preview & Settings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div>
          <video ref={videoRef} src={videoSrc} controls style={{ width: '100%', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', background: '#000' }} />
        </div>

        <div style={{ background: 'var(--bg-elevated)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)' }}>
          <div className="control-group">
            <label className="control-label">Output Frame Rate (FPS)</label>
            <select className="form-input" value={fps} onChange={e => setFps(+e.target.value)}>
              <option value={15}>15 FPS (Compact)</option>
              <option value={24}>24 FPS (Cinematic standard)</option>
              <option value={30}>30 FPS (Smooth HD Recommended)</option>
              <option value={60}>60 FPS (Ultra Smooth HD)</option>
            </select>
          </div>

          <div className="control-group">
            <label className="control-label">Output Resolution</label>
            <select className="form-input" value={width} onChange={e => setWidth(+e.target.value)}>
              <option value={480}>480p (Standard Definition)</option>
              <option value={1280}>720p HD (1280px Recommended)</option>
              <option value={1920}>1080p Full HD (1920px)</option>
              <option value={0}>Original Source Resolution</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setResultGifUrl(''); }}>
              <RefreshCw size={13} /> Change
            </button>
            <button className="btn btn-purple" style={{ flex: 1 }} onClick={convertToGif} disabled={busy}>
              <Film size={15} /> {busy ? 'Converting...' : 'Convert Video Clip'}
            </button>
          </div>
        </div>
      </div>

      {busy && (
        <div style={{ background: 'var(--blue-soft)', border: '1px solid var(--blue-border)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={18} color="var(--blue)" className="animate-spin" />
          <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--blue)' }}>{progress}</span>
        </div>
      )}

      {resultGifUrl && (
        <div style={{ background: 'var(--green-soft)', border: '1px solid var(--green-border)', padding: '1.15rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--green)' }}>HD Animated Video Clip Ready!</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Converted at {fps} FPS, {width === 0 ? 'Original' : width + 'px'} resolution</div>
            </div>
            <a className="btn btn-green" href={resultGifUrl} download={`${file.name.replace(/\.[^.]+$/, '')}-animation.webm`}>
              <Download size={16} /> Download HD Animation
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
