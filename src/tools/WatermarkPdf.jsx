import React, { useState, useRef } from 'react';
import { Download, Type, Grid, AlignCenter, AlertCircle, Check } from 'lucide-react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

const LAYOUT_OPTIONS = [
  { id: 'tiled', label: 'Full Page Tiled (Line by Line)', desc: 'Repeated diagonally across entire page' },
  { id: 'center', label: 'Center Big', desc: 'Large single watermark in center' },
  { id: 'bottom-right', label: 'Bottom Right Corner', desc: 'Discreet stamp at page footer' },
  { id: 'top-left', label: 'Top Left Corner', desc: 'Official header stamp' },
];

const COLOR_OPTIONS = [
  { id: 'red', name: 'Ruby Red', color: rgb(0.85, 0.15, 0.15), hex: '#dc2626' },
  { id: 'gray', name: 'Neutral Gray', color: rgb(0.45, 0.45, 0.45), hex: '#6b7280' },
  { id: 'blue', name: 'Royal Blue', color: rgb(0.15, 0.38, 0.85), hex: '#2563eb' },
  { id: 'black', name: 'Solid Black', color: rgb(0.05, 0.05, 0.05), hex: '#000000' },
];

export default function WatermarkPdf() {
  const [file, setFile] = useState(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [layout, setLayout] = useState('tiled');
  const [fontSize, setFontSize] = useState(36);
  const [angle, setAngle] = useState(45);
  const [opacity, setOpacity] = useState(0.25);
  const [selectedColor, setSelectedColor] = useState('gray');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  const loadFile = async (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setError('');
    try {
      setFile({ name: f.name, buf: await f.arrayBuffer() });
    } catch (err) {
      console.error(err);
      setError('Could not load PDF document. Please verify the file is valid.');
    }
  };

  const applyWatermark = async () => {
    if (!file || !text.trim()) return;
    setBusy(true);
    setError('');

    try {
      const doc = await PDFDocument.load(file.buf);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const colorConfig = COLOR_OPTIONS.find(c => c.id === selectedColor) || COLOR_OPTIONS[1];

      doc.getPages().forEach(page => {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSize);
        const textHeight = font.heightAtSize(fontSize);

        if (layout === 'tiled') {
          // Line-by-line diagonal repeated grid across full page
          const stepX = Math.max(120, textWidth + 60);
          const stepY = Math.max(90, textHeight + 50);

          for (let y = -height * 0.5; y < height * 1.5; y += stepY) {
            for (let x = -width * 0.5; x < width * 1.5; x += stepX) {
              page.drawText(text, {
                x,
                y,
                size: fontSize,
                font,
                color: colorConfig.color,
                opacity,
                rotate: degrees(angle)
              });
            }
          }
        } else if (layout === 'center') {
          page.drawText(text, {
            x: (width - textWidth) / 2,
            y: (height - textHeight) / 2,
            size: fontSize * 1.4,
            font,
            color: colorConfig.color,
            opacity,
            rotate: degrees(angle)
          });
        } else if (layout === 'bottom-right') {
          page.drawText(text, {
            x: width - textWidth - 30,
            y: 30,
            size: Math.min(fontSize, 20),
            font,
            color: colorConfig.color,
            opacity: Math.max(opacity, 0.4),
            rotate: degrees(0)
          });
        } else if (layout === 'top-left') {
          page.drawText(text, {
            x: 30,
            y: height - 45,
            size: Math.min(fontSize, 20),
            font,
            color: colorConfig.color,
            opacity: Math.max(opacity, 0.4),
            rotate: degrees(0)
          });
        }
      });

      const bytes = await doc.save();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
      a.download = file.name.replace(/\.[^.]+$/, '') + '-watermarked.pdf';
      a.click();
    } catch (e) {
      console.error(e);
      setError('Could not apply watermark to PDF. Please try another PDF document.');
    } finally {
      setBusy(false);
    }
  };

  if (!file) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => loadFile(e.target.files[0])} accept=".pdf" hidden />
      <div className="dropzone-icon"><Type size={24} /></div>
      <div className="dropzone-title">Upload a PDF to watermark</div>
      <div className="dropzone-subtitle">Stamp customizable text across all pages in full grid or single layout</div>
      <button className="btn btn-blue btn-sm" style={{ marginTop: '0.4rem' }}>Select PDF File</button>
    </div>
  );

  return (
    <div className="tool-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-main)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', wordBreak: 'break-all' }}>{file.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Ready for custom watermarking</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setError(''); }}>Change File</button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Watermark Text Input */}
      <div style={{ marginBottom: '1.25rem' }}>
        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
          Watermark Text Stamp
        </label>
        <input
          type="text"
          value={text}
          placeholder="e.g. CONFIDENTIAL, DO NOT COPY, SAMPLE"
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
              onClick={() => setLayout(opt.id)}
              style={{
                padding: '0.75rem',
                borderRadius: '8px',
                border: `1.5px solid ${layout === opt.id ? '#2563eb' : 'var(--border-main)'}`,
                backgroundColor: layout === opt.id ? 'rgba(37, 99, 235, 0.04)' : 'var(--bg-card)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: layout === opt.id ? '#2563eb' : 'var(--text-primary)', marginBottom: '0.15rem' }}>
                {opt.label}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{opt.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Customization Sliders & Color Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Font Size */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
            Font Size ({fontSize}pt)
          </label>
          <select value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-main)', background: 'var(--bg-card)' }}>
            <option value={20}>Small (20pt)</option>
            <option value={36}>Medium (36pt)</option>
            <option value={54}>Large (54pt)</option>
            <option value={80}>Huge (80pt)</option>
          </select>
        </div>

        {/* Rotation Angle */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
            Rotation Angle
          </label>
          <select value={angle} onChange={e => setAngle(Number(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-main)', background: 'var(--bg-card)' }}>
            <option value={45}>Diagonal (-45°)</option>
            <option value={0}>Horizontal (0°)</option>
            <option value={90}>Vertical (90°)</option>
          </select>
        </div>

        {/* Opacity Slider */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
            <span>Transparency</span>
            <span>{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.08"
            max="0.85"
            step="0.05"
            value={opacity}
            onChange={e => setOpacity(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        {/* Color Palette */}
        <div>
          <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
            Stamp Color
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {COLOR_OPTIONS.map(c => (
              <div
                key={c.id}
                onClick={() => setSelectedColor(c.id)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: c.hex,
                  cursor: 'pointer',
                  border: `2px solid ${selectedColor === c.id ? '#1a1a1a' : 'transparent'}`,
                  boxShadow: selectedColor === c.id ? '0 0 0 2px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.15s ease'
                }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>

      <button className="btn btn-blue" style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }} disabled={busy || !text.trim()} onClick={applyWatermark}>
        <Download size={16} /> {busy ? 'Applying Watermark...' : 'Apply Watermark & Download PDF'}
      </button>
    </div>
  );
}
