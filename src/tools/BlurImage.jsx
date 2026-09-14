import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, EyeOff, RefreshCw } from 'lucide-react';

export default function BlurImage() {
  const [src, setSrc] = useState(null);
  const [name, setName] = useState('');
  const [blurRadius, setBlurRadius] = useState(12);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setName(f.name);
    const reader = new FileReader();
    reader.onload = (e) => setSrc(e.target.result);
    reader.readAsDataURL(f);
  };

  useEffect(() => {
    if (!src) {
      setPreviewUrl(null);
      return;
    }

    const img = new Image();
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.filter = `blur(${blurRadius}px)`;
      ctx.drawImage(img, 0, 0);

      setPreviewUrl(canvas.toDataURL('image/png'));
    };
  }, [src, blurRadius]);

  const download = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = name.replace(/\.[^.]+$/, '') + '-blurred.png';
    a.click();
  };

  if (!src) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()}>
      <input type="file" ref={fileInputRef} onChange={e => loadFile(e.target.files[0])} accept="image/*" hidden />
      <div className="dropzone-icon"><EyeOff size={24} /></div>
      <div className="dropzone-title">Upload image to blur</div>
      <div className="dropzone-subtitle">Blur photos, obscure private text, or redact sensitive details</div>
      <button className="btn btn-green btn-sm" style={{ marginTop: '0.4rem' }}>Select Image</button>
    </div>
  );

  return (
    <div>
      <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', textAlign: 'center', marginBottom: '1.25rem', overflow: 'hidden' }}>
        {previewUrl && (
          <img src={previewUrl} alt="Blurred preview" style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: '8px', objectFit: 'contain' }} />
        )}
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.25rem' }}>
        <div className="control-group" style={{ marginBottom: 0 }}>
          <div className="control-label">
            <span>Blur Intensity</span>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>{blurRadius}px</span>
          </div>
          <input type="range" className="custom-slider" min="2" max="50" value={blurRadius} onChange={e => setBlurRadius(+e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => { setSrc(null); setPreviewUrl(null); }}>
          <RefreshCw size={13} /> Change Image
        </button>
        <button className="btn btn-green" style={{ flex: 1 }} onClick={download}>
          <Download size={15} /> Download Blurred Image
        </button>
      </div>
    </div>
  );
}
