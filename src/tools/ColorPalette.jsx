import React, { useState, useRef, useEffect } from 'react';
import { Upload, Palette, Copy, Check, RefreshCw } from 'lucide-react';

export default function ColorPalette() {
  const [src, setSrc] = useState(null);
  const [colors, setColors] = useState([]);
  const [copiedColor, setCopiedColor] = useState(null);
  const fileInputRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setSrc(e.target.result);
    reader.readAsDataURL(f);
  };

  useEffect(() => {
    if (!src) {
      setColors([]);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 100;
      canvas.height = 100;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 100, 100);

      const imgData = ctx.getImageData(0, 0, 100, 100);
      const data = imgData.data;
      const colorCounts = {};

      for (let i = 0; i < data.length; i += 16) {
        const r = Math.round(data[i] / 15) * 15;
        const g = Math.round(data[i + 1] / 15) * 15;
        const b = Math.round(data[i + 2] / 15) * 15;
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        colorCounts[hex] = (colorCounts[hex] || 0) + 1;
      }

      const sorted = Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([hex]) => hex);

      setColors(sorted);
    };
  }, [src]);

  const copyHex = (hex) => {
    navigator.clipboard.writeText(hex);
    setCopiedColor(hex);
    setTimeout(() => setCopiedColor(null), 2000);
  };

  if (!src) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()}>
      <input type="file" ref={fileInputRef} onChange={e => loadFile(e.target.files[0])} accept="image/*" hidden />
      <div className="dropzone-icon"><Palette size={24} /></div>
      <div className="dropzone-title">Upload image to extract color palette</div>
      <div className="dropzone-subtitle">Automatically extract dominant hex colors from any photo</div>
      <button className="btn btn-green btn-sm" style={{ marginTop: '0.4rem' }}>Select Image</button>
    </div>
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
        <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', textAlign: 'center' }}>
          <img src={src} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '8px', objectFit: 'contain' }} />
        </div>

        <div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>Extracted Dominant Colors</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
            {colors.map((hex, idx) => (
              <div
                key={idx}
                onClick={() => copyHex(hex)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.6rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: hex, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{hex}</div>
                </div>
                {copiedColor === hex ? <Check size={14} color="var(--green)" /> : <Copy size={14} color="var(--text-tertiary)" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn-secondary btn-sm" onClick={() => { setSrc(null); setColors([]); }}>
        <RefreshCw size={13} /> Extract Colors from Another Image
      </button>
    </div>
  );
}
