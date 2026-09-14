import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, RefreshCw, Eye, ZoomIn, ZoomOut } from 'lucide-react';
import AdBanner from '../components/AdBanner';

export default function WordToPdf() {
  const [file, setFile] = useState(null);
  const [arrayBuf, setArrayBuf] = useState(null);
  const [rendered, setRendered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [converting, setConverting] = useState(false);
  const [zoom, setZoom] = useState(100);
  const fileRef = useRef(null);
  const containerRef = useRef(null);

  const loadFile = async (f) => {
    if (!f) return;
    const ext = f.name.split('.').pop().toLowerCase();
    if (ext !== 'docx') {
      alert('Please upload a .docx file. Older .doc format is not supported.');
      return;
    }
    setBusy(true);
    setRendered(false);
    try {
      const buf = await f.arrayBuffer();
      setFile({ name: f.name, size: f.size });
      setArrayBuf(buf);
    } catch (err) {
      console.error(err);
      alert('Failed to read the file.');
      setBusy(false);
    }
  };

  // Render DOCX when arrayBuf changes
  useEffect(() => {
    if (!arrayBuf || !containerRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        // Dynamic import to avoid bundling issues
        const docxPreview = await import('docx-preview');

        // Clear previous render
        containerRef.current.innerHTML = '';

        await docxPreview.renderAsync(arrayBuf, containerRef.current, null, {
          className: 'docx-preview-wrapper',
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          ignoreFonts: false,
          breakPages: true,
          ignoreLastRenderedPageBreak: false,
          experimental: true,
          trimXmlDeclaration: true,
          useBase64URL: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
        });

        if (!cancelled) setRendered(true);
      } catch (err) {
        console.error('DOCX render error:', err);
        if (!cancelled) alert('Failed to render the document. Make sure it\'s a valid .docx file.');
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => { cancelled = true; };
  }, [arrayBuf]);

  const convertToPdf = async () => {
    if (!rendered || !containerRef.current) return;
    setConverting(true);

    try {
      // Get all rendered page sections
      const wrapper = containerRef.current.querySelector('.docx-wrapper') || containerRef.current;
      const sections = wrapper.querySelectorAll('section.docx');

      if (!sections.length) {
        alert('No rendered pages found to convert.');
        setConverting(false);
        return;
      }

      const { default: html2canvas } = await import('html2canvas-pro');
      const { jsPDF } = await import('jspdf');

      // Capture each page section and assemble into PDF
      const pageImages = [];

      for (const section of sections) {
        // Temporarily reset zoom for capture
        const origTransform = section.style.transform;
        section.style.transform = 'none';

        const canvas = await html2canvas(section, {
          scale: 2, // High-res capture
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
        });

        section.style.transform = origTransform;

        pageImages.push({
          dataUrl: canvas.toDataURL('image/jpeg', 0.95),
          width: canvas.width,
          height: canvas.height,
        });
      }

      if (!pageImages.length) {
        alert('Failed to capture document pages.');
        setConverting(false);
        return;
      }

      // Create PDF with correct page dimensions
      const first = pageImages[0];
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (first.height / first.width) * pdfWidth;

      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: [pdfWidth, pdfHeight],
      });

      for (let i = 0; i < pageImages.length; i++) {
        if (i > 0) {
          const img = pageImages[i];
          const h = (img.height / img.width) * pdfWidth;
          pdf.addPage([pdfWidth, h]);
        }
        pdf.addImage(pageImages[i].dataUrl, 'JPEG', 0, 0, pdfWidth,
          (pageImages[i].height / pageImages[i].width) * pdfWidth);
      }

      pdf.save(file.name.replace(/\.docx$/i, '') + '.pdf');
    } catch (err) {
      console.error('PDF conversion error:', err);
      alert('PDF conversion failed. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (!file) return (
    <div>
      <AdBanner slotType="leaderboard" />
      <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }} onClick={() => fileRef.current?.click()}>
        <input type="file" ref={fileRef} onChange={e => loadFile(e.target.files[0])} accept=".docx" hidden />
        <div className="dropzone-icon"><FileText size={24} /></div>
        <div className="dropzone-title">Upload Word Document (.docx)</div>
        <div className="dropzone-subtitle">Your document will be rendered exactly as it looks, then converted to PDF</div>
        <button className="btn btn-blue btn-sm" style={{ marginTop: '0.4rem' }}>Select DOCX File</button>
      </div>
    </div>
  );

  return (
    <div>
      <AdBanner slotType="leaderboard" />
      <div className="tool-box">
        {/* File info bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-main)' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', wordBreak: 'break-all' }}>{file.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              {formatSize(file.size)} {rendered ? '· Rendered successfully' : busy ? '· Rendering...' : ''}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setArrayBuf(null); setRendered(false); if (containerRef.current) containerRef.current.innerHTML = ''; }}>
            <RefreshCw size={13} /> Change File
          </button>
        </div>

        {/* Zoom controls */}
        {rendered && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <Eye size={14} color="var(--text-tertiary)" />
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', flex: 1 }}>Document Preview</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setZoom(z => Math.max(25, z - 15))} style={{ padding: '3px 8px' }}>
              <ZoomOut size={14} />
            </button>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '36px', textAlign: 'center' }}>{zoom}%</span>
            <button className="btn btn-secondary btn-sm" onClick={() => setZoom(z => Math.min(200, z + 15))} style={{ padding: '3px 8px' }}>
              <ZoomIn size={14} />
            </button>
          </div>
        )}

        {/* Loading indicator */}
        {busy && (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rendering document...</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>Preserving original layout, fonts, and formatting</div>
          </div>
        )}

        {/* DOCX Preview container */}
        <div
          ref={containerRef}
          style={{
            border: rendered ? '1px solid var(--border-main)' : 'none',
            borderRadius: 'var(--radius-sm)',
            maxHeight: '500px',
            overflow: 'auto',
            marginBottom: rendered ? '1.25rem' : 0,
            background: rendered ? '#e8e8e8' : 'transparent',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top left',
            width: `${10000 / zoom}%`,
          }}
        />

        {/* Convert button */}
        {rendered && (
          <button
            className="btn btn-blue"
            style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
            disabled={converting}
            onClick={convertToPdf}
          >
            <Download size={16} />
            {converting ? 'Converting to PDF...' : 'Download as PDF'}
          </button>
        )}
      </div>
    </div>
  );
}
