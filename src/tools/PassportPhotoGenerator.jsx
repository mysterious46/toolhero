import React, { useState, useRef, useEffect } from 'react';
import { Upload, Download, Grid, RefreshCw, UserCheck, Check } from 'lucide-react';
import AdBanner from '../components/AdBanner';

/* ─── Passport Standards Presets ─── */
const PASSPORT_PRESETS = [
  { id: 'us', country: '🇺🇸 US Passport / Visa', mmW: 51, mmH: 51, pxW: 600, pxH: 600, desc: '2 × 2 inches (51 × 51 mm)' },
  { id: 'india', country: '🇮🇳 India Passport / PAN', mmW: 35, mmH: 45, pxW: 413, pxH: 531, desc: '3.5 × 4.5 cm (35 × 45 mm)' },
  { id: 'eu', country: '🇪🇺 EU / Schengen Visa', mmW: 35, mmH: 45, pxW: 413, pxH: 531, desc: '3.5 × 4.5 cm (35 × 45 mm)' },
  { id: 'uk', country: '🇬🇧 UK Passport', mmW: 35, mmH: 45, pxW: 413, pxH: 531, desc: '35 × 45 mm' },
  { id: 'ca', country: '🇨🇦 Canada Passport / Visa', mmW: 50, mmH: 70, pxW: 590, pxH: 826, desc: '50 × 70 mm' },
];

/* ─── Background Options ─── */
const BG_COLORS = [
  { id: 'white', name: 'Plain White', hex: '#ffffff' },
  { id: 'light-blue', name: 'Light Blue', hex: '#e8f2fc' },
  { id: 'off-white', name: 'Light Grey', hex: '#f0f0f0' },
];

export default function PassportPhotoGenerator() {
  const [src, setSrc] = useState(null);
  const [name, setName] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(PASSPORT_PRESETS[0]);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [singlePhotoUrl, setSinglePhotoUrl] = useState(null);
  const [sheetPhotoUrl, setSheetPhotoUrl] = useState(null);
  const [activeTab, setActiveTab] = useState('single'); // 'single' or 'sheet'

  const fileInputRef = useRef(null);

  const loadFile = (f) => {
    if (!f || !f.type.startsWith('image/')) return;
    setName(f.name);
    const reader = new FileReader();
    reader.onload = (e) => setSrc(e.target.result);
    reader.readAsDataURL(f);
  };

  // Generate Passport Single & 4x6 Printable Grid Sheet
  useEffect(() => {
    if (!src) {
      setSinglePhotoUrl(null);
      setSheetPhotoUrl(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
      // 1. Single Passport Photo Canvas
      const w = selectedPreset.pxW;
      const h = selectedPreset.pxH;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');

      // Fill Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      // Center & Crop Image to Fit Passport Aspect Ratio
      const imgRatio = img.width / img.height;
      const targetRatio = w / h;
      let sw = img.width;
      let sh = img.height;
      let sx = 0;
      let sy = 0;

      if (imgRatio > targetRatio) {
        sw = img.height * targetRatio;
        sx = (img.width - sw) / 2;
      } else {
        sh = img.width / targetRatio;
        sy = (img.height - sh) / 2;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);

      const singleDataUrl = canvas.toDataURL('image/png', 1.0);
      setSinglePhotoUrl(singleDataUrl);

      // 2. Printable 4x6 Inch Grid Sheet (1200 x 1800 px @ 300 DPI)
      const sheetW = 1200; // 4 inches @ 300 DPI
      const sheetH = 1800; // 6 inches @ 300 DPI
      const sheetCanvas = document.createElement('canvas');
      sheetCanvas.width = sheetW;
      sheetCanvas.height = sheetH;
      const sheetCtx = sheetCanvas.getContext('2d');

      // White sheet paper background
      sheetCtx.fillStyle = '#ffffff';
      sheetCtx.fillRect(0, 0, sheetW, sheetH);

      // Calculate grid placement (e.g. 2 columns x 4 rows or 3 columns x 3 rows)
      const cols = selectedPreset.pxW === selectedPreset.pxH ? 2 : 2;
      const rows = selectedPreset.pxW === selectedPreset.pxH ? 3 : 4;
      const thumbW = selectedPreset.pxW * 0.75;
      const thumbH = selectedPreset.pxH * 0.75;
      const gapX = (sheetW - cols * thumbW) / (cols + 1);
      const gapY = (sheetH - rows * thumbH) / (rows + 1);

      const passportImg = new Image();
      passportImg.src = singleDataUrl;
      passportImg.onload = () => {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = gapX + c * (thumbW + gapX);
            const y = gapY + r * (thumbH + gapY);

            // Draw passport photo thumbnail
            sheetCtx.drawImage(passportImg, x, y, thumbW, thumbH);

            // Thin crop border lines
            sheetCtx.strokeStyle = '#cccccc';
            sheetCtx.lineWidth = 1;
            sheetCtx.strokeRect(x, y, thumbW, thumbH);
          }
        }
        setSheetPhotoUrl(sheetCanvas.toDataURL('image/png', 1.0));
      };
    };
  }, [src, selectedPreset, bgColor]);

  const downloadSingle = () => {
    if (!singlePhotoUrl) return;
    const a = document.createElement('a');
    a.href = singlePhotoUrl;
    a.download = `passport-photo-${selectedPreset.id}.png`;
    a.click();
  };

  const downloadSheet = () => {
    if (!sheetPhotoUrl) return;
    const a = document.createElement('a');
    a.href = sheetPhotoUrl;
    a.download = `passport-print-sheet-4x6.png`;
    a.click();
  };

  if (!src) return (
    <div>
      <AdBanner slotType="leaderboard" />
      <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }} onClick={() => fileInputRef.current?.click()}>
        <input type="file" ref={fileInputRef} onChange={e => loadFile(e.target.files[0])} accept="image/*" hidden />
        <div className="dropzone-icon"><UserCheck size={24} /></div>
        <div className="dropzone-title">Upload photo for Passport & Visa</div>
        <div className="dropzone-subtitle">Generates official US, India, EU, UK passport photos + 4x6 print sheets</div>
        <button className="btn btn-green btn-sm" style={{ marginTop: '0.4rem' }}>Select Photo</button>
      </div>
    </div>
  );

  return (
    <div>
      <AdBanner slotType="leaderboard" />

      {/* Preset Country & Standard Selection */}
      <div style={{ background: 'var(--bg-elevated)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
          Select Country / Official Standard
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem', marginBottom: '1.15rem' }}>
          {PASSPORT_PRESETS.map(p => (
            <button
              key={p.id}
              onClick={() => setSelectedPreset(p)}
              style={{
                background: selectedPreset.id === p.id ? 'var(--green-soft)' : 'var(--bg-card)',
                border: selectedPreset.id === p.id ? '2px solid var(--green)' : '1px solid var(--border-main)',
                color: selectedPreset.id === p.id ? 'var(--green)' : 'var(--text-primary)',
                padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)', textAlign: 'left',
                cursor: 'pointer', transition: 'var(--transition)'
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.country}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{p.desc}</div>
            </button>
          ))}
        </div>

        {/* Background Color Picker */}
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
          Background Fill
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {BG_COLORS.map(bg => (
            <button
              key={bg.id}
              onClick={() => setBgColor(bg.hex)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                border: bgColor === bg.hex ? '2px solid var(--green)' : '1px solid var(--border-main)',
                background: 'var(--bg-card)', color: 'var(--text-primary)',
              }}
            >
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: bg.hex, border: '1px solid #ccc' }} />
              {bg.name}
            </button>
          ))}
        </div>
      </div>

      {/* Output Toggle: Single vs 4x6 Printable Grid Sheet */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <button
          className={`btn ${activeTab === 'single' ? 'btn-green' : 'btn-secondary'}`}
          onClick={() => setActiveTab('single')}
        >
          Single Passport Photo
        </button>
        <button
          className={`btn ${activeTab === 'sheet' ? 'btn-green' : 'btn-secondary'}`}
          onClick={() => setActiveTab('sheet')}
        >
          <Grid size={15} /> Printable 4×6" Sheet (Multiple Photos)
        </button>
        <button className="btn btn-secondary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setSrc(null)}>
          <RefreshCw size={13} /> Change Photo
        </button>
      </div>

      {/* Preview Container */}
      <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-main)', textAlign: 'center', marginBottom: '1.25rem' }}>
        {activeTab === 'single' && singlePhotoUrl && (
          <div>
            <div style={{ display: 'inline-block', border: '1px solid var(--border-main)', borderRadius: '8px', padding: '0.5rem', background: '#fcfcfc', boxShadow: 'var(--shadow-md)', marginBottom: '1rem' }}>
              <img src={singlePhotoUrl} alt="Passport Single" style={{ maxHeight: '280px', objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <button className="btn btn-green" onClick={downloadSingle}>
                <Download size={15} /> Download Passport Photo ({selectedPreset.pxW}×{selectedPreset.pxH} px)
              </button>
            </div>
          </div>
        )}

        {activeTab === 'sheet' && sheetPhotoUrl && (
          <div>
            <div style={{ display: 'inline-block', border: '1px solid var(--border-main)', borderRadius: '8px', padding: '0.5rem', background: '#fcfcfc', boxShadow: 'var(--shadow-md)', marginBottom: '1rem' }}>
              <img src={sheetPhotoUrl} alt="Printable Sheet" style={{ maxHeight: '340px', objectFit: 'contain', display: 'block' }} />
            </div>
            <div>
              <button className="btn btn-green" onClick={downloadSheet}>
                <Download size={15} /> Download Printable 4×6" Paper Sheet (.PNG)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
