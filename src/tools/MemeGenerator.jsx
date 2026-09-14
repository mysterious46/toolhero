import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Smile, RefreshCw } from 'lucide-react';

export default function MemeGenerator() {
  const [src, setSrc] = useState(null);
  const [name, setName] = useState('');
  const [topText, setTopText] = useState('WHEN YOU WRITE CODE');
  const [bottomText, setBottomText] = useState('AND IT WORKS ON FIRST TRY');
  const [fontSize, setFontSize] = useState(42);
  const [textColor, setTextColor] = useState('#ffffff');
  const [strokeColor, setStrokeColor] = useState('#000000');
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

      ctx.fillStyle = textColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = Math.max(3, fontSize / 10);
      ctx.textAlign = 'center';
      ctx.font = `900 ${fontSize}px Impact, sans-serif`;

      // Draw Top Text
      if (topText) {
        ctx.textBaseline = 'top';
        ctx.strokeText(topText.toUpperCase(), canvas.width / 2, 20);
        ctx.fillText(topText.toUpperCase(), canvas.width / 2, 20);
      }

      // Draw Bottom Text
      if (bottomText) {
        ctx.textBaseline = 'bottom';
        ctx.strokeText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
        ctx.fillText(bottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
      }

      setPreviewUrl(canvas.toDataURL('image/png'));
    };
  }, [src, topText, bottomText, fontSize, textColor, strokeColor]);

  const download = () => {
    if (!previewUrl) return;
    const a = document.createElement('a');
    a.href = previewUrl;
    a.download = name.replace(/\.[^.]+$/, '') + '-meme.png';
    a.click();
  };

  if (!src) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()}>
      <input type="file" ref={fileInputRef} onChange={e => loadFile(e.target.files[0])} accept="image/*" hidden />
      <div className="dropzone-icon"><Smile size={24} /></div>
      <div className="dropzone-title">Upload image to create a meme</div>
      <div className="dropzone-subtitle">Add impact top & bottom text captions instantly</div>
      <button className="btn btn-green btn-sm" style={{ marginTop: '0.4rem' }}>Select Image</button>
    </div>
  );

  return (
    <div>
      <div style={{ background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', textAlign: 'center', marginBottom: '1.25rem', overflow: 'hidden' }}>
        {previewUrl && (
          <img src={previewUrl} alt="Meme preview" style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: '8px', objectFit: 'contain' }} />
        )}
      </div>

      <div style={{ background: 'var(--bg-card)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div className="control-group" style={{ marginBottom: 0 }}>
          <label className="control-label">Top Text</label>
          <input className="form-input" value={topText} onChange={e => setTopText(e.target.value)} placeholder="TOP TEXT" />
        </div>

        <div className="control-group" style={{ marginBottom: 0 }}>
          <label className="control-label">Bottom Text</label>
          <input className="form-input" value={bottomText} onChange={e => setBottomText(e.target.value)} placeholder="BOTTOM TEXT" />
        </div>

        <div className="control-group" style={{ marginBottom: 0 }}>
          <div className="control-label"><span>Font Size</span><span>{fontSize}px</span></div>
          <input type="range" className="custom-slider" min="20" max="90" value={fontSize} onChange={e => setFontSize(+e.target.value)} />
        </div>

        <div className="control-group" style={{ marginBottom: 0 }}>
          <label className="control-label">Text Color</label>
          <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={{ width: '34px', height: '34px', borderRadius: '6px', border: '1px solid var(--border-main)', cursor: 'pointer', background: 'none', padding: 0 }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button className="btn btn-secondary btn-sm" onClick={() => { setSrc(null); setPreviewUrl(null); }}>
          <RefreshCw size={13} /> Change Image
        </button>
        <button className="btn btn-green" style={{ flex: 1 }} onClick={download}>
          <Download size={15} /> Download Meme
        </button>
      </div>
    </div>
  );
}
