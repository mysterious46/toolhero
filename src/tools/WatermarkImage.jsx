import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Type, RefreshCw, LayoutGrid, Check } from 'lucide-react';

const LAYOUT_OPTIONS = [
  { id: 'tile', label: 'Full Page Tiled (Line by Line)', desc: 'Repeated diagonally across entire image' },
  { id: 'center', label: 'Center Big', desc: 'Large single watermark in center' },
  { id: 'bottom-right', label: 'Bottom Right Corner', desc: 'Discreet stamp at photo corner' },
  { id: 'top-left', label: 'Top Left Corner', desc: 'Official header stamp' },
];

const COLOR_OPTIONS = [
  { id: 'white', name: 'Pure White', hex: '#ffffff' },
  { id: 'black', name: 'Solid Black', hex: '#000000' },
  { id: 'red', name: 'Ruby Red', hex: '#dc2626' },
  { id: 'blue', name: 'Royal Blue', hex: '#2563eb' },
  { id: 'amber', name: 'Amber Gold', hex: '#d97706' },
];

export default function WatermarkImage() {
  const [src, setSrc] = useState(null);
  const [name, setName] = useState('');
  const [text, setText] = useState('© Copyright ToolHero');
  const [fontSize, setFontSize] = useState(36);
  const [color, setColor] = useState('#ffffff');
  const [opacity, setOpacity] = useState(0.5);
  const [position, setPosition] = useState('tile');
  const [angle, setAngle] = useState(-30);
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
      ctx.drawImage(img, 0, 0);

      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;
      ctx.font = `700 ${fontSize}px "DM Sans", sans-serif`;

      const metrics = ctx.measureText(text);
      const textW = metrics.width;
      const textH = fontSize;

      if (position === 'tile') {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        const stepX = Math.max(120, textW + 80);
        const stepY = Math.max(90, textH + 60);

        for (let px = -canvas.width * 1.5; px < canvas.width * 1.5; px += stepX) {
          for (let py = -canvas.height * 1.5; py < canvas.height * 1.5; py += stepY) {
            ctx.fillText(text, px, py);
          }
        }
        ctx.restore();
      } else if (position === 'center') {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((angle * Math.PI) / 180);
        ctx.fillText(text, -textW / 2, textH / 4);
        ctx.restore();
      } else if (position === 'top-left') {
        ctx.fillText(text, 30, textH + 30);
      } else if (position === 'bottom-right') {
        ctx.fillText(text, canvas.width - textW - 30, canvas.height - 30);
      }

      setPreviewUrl(canvas.toDataURL('image/png'));
    };
  }, [src, text, fontSize, color, opacity, position, angle]);

  const download = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = name.replace(/\.[^.]+$/, '') + '-watermarked.png';
    a.click();
  };

  if (!src) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()}>
      <input type="file" ref={fileInputRef} onChange={e => loadFile(e.target.files[0])} accept="image/*" hidden />
      <div className="dropzone-icon"><Type size={24} /></div>
      <div className="dropzone-title">Upload image to watermark</div>
      <div className="dropzone-subtitle">Overlay custom text or copyright mark across your photo</div>
      <button className="btn btn-green btn-sm" style={{ marginTop: '0.4rem' }}>Select Image</button>
    </div>
  );

  return (
    <div className="tool-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-main)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', wordBreak: 'break-all' }}>{name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Live preview below</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setSrc(null); setPreviewUrl(null); }}>Change Image</button>
      </div>

      {/* Preview Box */}
      <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', textAlign: 'center', marginBottom: '1.25rem', overflow: 'hidden' }}>
        {previewUrl && (
          <img src={previewUrl} alt="Watermark preview" style={{ maxWidth: '100%', maxHeight: '340px', borderRadius: '8px', objectFit: 'contain' }} />
        )}
      </div>

      {/* Watermark Text Input */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
          Watermark Text Stamp
        </label>
        <input
          type="text"
          value={text}
          placeholder="e.g. © Copyright, PROOF ONLY, DO NOT COPY"
          onChange={e => setText(e.target.value)}
          style={{ width: '100%', padding: '0.65rem 0.85rem', borderRadius: '6px', border: '1px solid var(--border-main)', background: 'var(--bg-card)', fontWeight: 600, fontSize: '0.95rem' }}
        />
      </div>

      {/* Layout Option Selector */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
          Watermark Layout Position
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.6rem' }}>
          {LAYOUT_OPTIONS.map(opt => (
            <div
              key={opt.id}
              onClick={() => setPosition(opt.id)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1.5px solid ${position === opt.id ? '#16a34a' : 'var(--border-main)'}`,
                backgroundColor: position === opt.id ? 'rgba(22, 163, 74, 0.04)' : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: position === opt.id ? '#16a34a' : 'var(--text-primary)', marginBottom: '0.15rem' }}>
                {opt.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{opt.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
            Font Size ({fontSize}px)
          </label>
          <select value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-main)', background: 'var(--bg-card)' }}>
            <option value={24}>Small (24px)</option>
            <option value={36}>Medium (36px)</option>
            <option value={54}>Large (54px)</option>
            <option value={80}>Huge (80px)</option>
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
            Rotation Angle
          </label>
          <select value={angle} onChange={e => setAngle(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-main)', background: 'var(--bg-card)' }}>
            <option value={-30}>Diagonal (-30°)</option>
            <option value={0}>Horizontal (0°)</option>
            <option value={90}>Vertical (90°)</option>
          </select>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
            <span>Opacity</span>
            <span>{Math.round(opacity * 100)}%</span>
          </div>
          <input type="range" min="0.1" max="1" step="0.05" value={opacity} onChange={e => setOpacity(Number(e.target.value))} style={{ width: '100%' }} />
        </div>

        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
            Stamp Color
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {COLOR_OPTIONS.map(c => (
              <div
                key={c.id}
                onClick={() => setColor(c.hex)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: c.hex,
                  cursor: 'pointer',
                  border: `2px solid ${color === c.hex ? '#1a1a1a' : '#d4d0cb'}`,
                  boxShadow: color === c.hex ? '0 0 0 2px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn-green" style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }} disabled={!text.trim()} onClick={download}>
        <Download size={16} /> Download Watermarked Image
      </button>
    </div>
  );
}
