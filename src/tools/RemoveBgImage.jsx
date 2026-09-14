import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Sparkles, RefreshCw, Layers } from 'lucide-react';

export default function RemoveBgImage() {
  const [src, setSrc] = useState(null);
  const [name, setName] = useState('');
  const [tolerance, setTolerance] = useState(40);
  const [processedUrl, setProcessedUrl] = useState(null);
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
      setProcessedUrl(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      try {
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample top-left corner color (x:0, y:0)
        const cornerR = data[0];
        const cornerG = data[1];
        const cornerB = data[2];

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dist = Math.sqrt((r - cornerR) ** 2 + (g - cornerG) ** 2 + (b - cornerB) ** 2);
          if (dist < tolerance) {
            data[i + 3] = 0; // Transparent
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setProcessedUrl(canvas.toDataURL('image/png'));
      } catch (e) {
        setProcessedUrl(src);
      }
    };
  }, [src, tolerance]);

  const download = () => {
    if (!processedUrl) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = name.replace(/\.[^.]+$/, '') + '-nobg.png';
    a.click();
  };

  if (!src) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()}>
      <input type="file" ref={fileInputRef} onChange={e => loadFile(e.target.files[0])} accept="image/*" hidden />
      <div className="dropzone-icon"><Sparkles size={24} /></div>
      <div className="dropzone-title">Upload image to remove background</div>
      <div className="dropzone-subtitle">Automatically key out solid photo backgrounds in seconds</div>
      <button className="btn btn-green btn-sm" style={{ marginTop: '0.4rem' }}>Select Image</button>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        {/* Original */}
        <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Original Image</div>
          <img src={src} alt="Original" style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', objectFit: 'contain' }} />
        </div>

        {/* Removed BG Result */}
        <div style={{
          background: 'repeating-conic-gradient(#eee 0% 25%, #fff 0% 50%) 50% / 20px 20px',
          padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>Transparent Cutout</div>
          {processedUrl && (
            <img src={processedUrl} alt="Cutout" style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', objectFit: 'contain' }} />
          )}
        </div>
      </div>

      <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.25rem' }}>
        <div className="control-group" style={{ marginBottom: 0 }}>
          <div className="control-label">
            <span>Color Matching Sensitivity</span>
            <span style={{ color: 'var(--green)', fontWeight: 700 }}>{tolerance}</span>
          </div>
          <input type="range" className="custom-slider" min="10" max="100" value={tolerance} onChange={e => setTolerance(+e.target.value)} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => { setSrc(null); setProcessedUrl(null); }}>
          <RefreshCw size={13} /> Upload New
        </button>
        <button className="btn btn-green" style={{ flex: 1 }} onClick={download}>
          <Download size={15} /> Download Transparent PNG
        </button>
      </div>
    </div>
  );
}
