import React, { useState, useRef } from 'react';
import { Download, FileArchive, Image as ImageIcon, Zap, Check, AlertCircle, Sparkles } from 'lucide-react';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Pin exact PDF.js version to 4.10.38
const PDFJS_VER = '4.10.38';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VER}/build/pdf.worker.min.mjs`;
}

// Memory guard max bounding box (8192px allows 4K & 8K Ultra-HD maximum resolution rendering)
const MAX_CANVAS_DIMENSION = 8192;

export default function PdfToImages() {
  const [file, setFile] = useState(null);
  const [format, setFormat] = useState('image/png');
  const [dpi, setDpi] = useState(4.16); // 300 DPI High Definition Default
  const [pages, setPages] = useState([]);
  const [progress, setProgress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);

  const loadFile = async (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setFile({ name: f.name, buf: await f.arrayBuffer(), size: f.size });
    setPages([]);
    setProgress('');
    setError('');
  };

  const renderPdfPages = async (pdfDoc) => {
    const totalPages = pdfDoc.numPages;
    const renderedPages = [];

    for (let i = 1; i <= totalPages; i++) {
      setProgress(`Rendering page ${i} of ${totalPages} in high resolution...`);
      const page = await pdfDoc.getPage(i);
      
      // Calculate viewport scale with memory-safe upper boundary
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      let safeScale = dpi;
      if (unscaledViewport.width * safeScale > MAX_CANVAS_DIMENSION || unscaledViewport.height * safeScale > MAX_CANVAS_DIMENSION) {
        safeScale = Math.min(MAX_CANVAS_DIMENSION / unscaledViewport.width, MAX_CANVAS_DIMENSION / unscaledViewport.height);
      }
      
      const viewport = page.getViewport({ scale: safeScale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      
      const ctx = canvas.getContext('2d', { alpha: false });
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      await page.render({ canvasContext: ctx, viewport }).promise;

      const ext = format === 'image/png' ? 'png' : 'jpg';
      const dataUrl = canvas.toDataURL(format, 0.98);

      renderedPages.push({
        pageNumber: i,
        dataUrl,
        ext,
        width: canvas.width,
        height: canvas.height
      });
    }
    return renderedPages;
  };

  const convertToImages = async () => {
    if (!file || !file.buf) return;

    setBusy(true);
    setPages([]);
    setError('');

    try {
      setProgress('Reading PDF document...');

      const pdfBytes = new Uint8Array(file.buf.slice(0));

      const loadingTask = pdfjsLib.getDocument({
        data: pdfBytes,
        cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VER}/cmaps/`,
        cMapPacked: true,
        standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${PDFJS_VER}/standard_fonts/`,
        useSystemFonts: true,
        verbosity: 0
      });

      const pdfDoc = await loadingTask.promise;
      const renderedPages = await renderPdfPages(pdfDoc);
      setPages(renderedPages);

      if (pdfDoc && typeof pdfDoc.cleanup === 'function') {
        await pdfDoc.cleanup();
      }
    } catch (err) {
      console.error('PDF to Image rendering error:', err);
      const message = err?.message || err?.name || String(err) || 'Unknown PDF rendering error';
      setError(`Could not render this PDF: ${message}`);
    } finally {
      setBusy(false);
      setProgress('');
    }
  };

  const downloadOne = (p) => {
    const a = document.createElement('a');
    a.href = p.dataUrl;
    a.download = `${file.name.replace(/\.[^.]+$/, '')}-page-${p.pageNumber}.${p.ext}`;
    a.click();
  };

  const downloadAllZip = async () => {
    if (pages.length === 0) return;
    const zip = new JSZip();
    pages.forEach((p) => {
      const base64Data = p.dataUrl.split(',')[1];
      zip.file(`page-${p.pageNumber}.${p.ext}`, base64Data, { base64: true });
    });
    const content = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = `${file.name.replace(/\.[^.]+$/, '')}-all-pages.zip`;
    a.click();
  };

  if (!file) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => loadFile(e.target.files[0])} accept=".pdf" hidden />
      <div className="dropzone-icon"><ImageIcon size={24} /></div>
      <div className="dropzone-title">Upload PDF to convert to images</div>
      <div className="dropzone-subtitle">Turn PDF pages into razor-sharp PNG or JPG photo files</div>
      <button className="btn btn-blue btn-sm" style={{ marginTop: '0.4rem' }}>Select PDF Document</button>
    </div>
  );

  return (
    <div className="tool-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-main)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', wordBreak: 'break-all' }}>{file.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Ready for high-resolution conversion</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setPages([]); setError(''); }}>Change File</button>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', backgroundColor: 'rgba(220, 38, 38, 0.08)', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#dc2626', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {pages.length === 0 && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Output Format</label>
              <select value={format} onChange={e => setFormat(e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-main)', background: 'var(--bg-card)' }}>
                <option value="image/png">PNG (Lossless - Highest Quality)</option>
                <option value="image/jpeg">JPG (Standard Photo)</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Image Resolution</label>
              <select value={dpi} onChange={e => setDpi(parseFloat(e.target.value))} style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-main)', background: 'var(--bg-card)' }}>
                <option value={1.5}>Standard Resolution (Fast)</option>
                <option value={2.77}>High Resolution (Crisp Text)</option>
                <option value={4.16}>Ultra High Resolution (Maximum Quality)</option>
              </select>
            </div>
          </div>

          {busy && (
            <div style={{ padding: '1rem', backgroundColor: 'rgba(37, 99, 235, 0.06)', borderRadius: '8px', marginBottom: '1rem', color: '#2563eb', fontWeight: 600, fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Zap size={16} className="animate-spin" /> {progress}
            </div>
          )}

          <button className="btn btn-blue" style={{ width: '100%', padding: '0.75rem', fontSize: '0.95rem' }} disabled={busy} onClick={convertToImages}>
            <Sparkles size={16} /> {busy ? progress || 'Converting PDF...' : 'Convert PDF to High-Res Images'}
          </button>
        </>
      )}

      {pages.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>Converted {pages.length} Pages (High-Res)</div>
            <button className="btn btn-green btn-sm" onClick={downloadAllZip}>
              <FileArchive size={14} /> Download All (ZIP)
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {pages.map(p => (
              <div key={p.pageNumber} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-main)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', textAlign: 'center' }}>
                <img src={p.dataUrl} alt="" style={{ width: '100%', height: '140px', objectFit: 'contain', borderRadius: '4px', marginBottom: '0.4rem', border: '1px solid var(--border-main)' }} />
                <div style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.2rem' }}>Page {p.pageNumber}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginBottom: '0.4rem' }}>{p.width} × {p.height} px</div>
                <button className="btn btn-secondary btn-sm" style={{ width: '100%', padding: '0.25rem' }} onClick={() => downloadOne(p)}>
                  <Download size={12} /> Save
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
