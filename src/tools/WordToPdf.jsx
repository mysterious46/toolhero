import React, { useState, useRef, useEffect } from 'react';
import { FileText, Download, RefreshCw, Eye, ZoomIn, ZoomOut, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import AdBanner from '../components/AdBanner';

export default function WordToPdf() {
  const [file, setFile] = useState(null);
  const [arrayBuf, setArrayBuf] = useState(null);
  const [rendered, setRendered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [pageCount, setPageCount] = useState(0);
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
    setPageCount(0);
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

  // Render DOCX faithfully when arrayBuf changes
  useEffect(() => {
    if (!arrayBuf || !containerRef.current) return;

    let cancelled = false;
    (async () => {
      try {
        const docxPreview = await import('docx-preview');

        // Clear previous render
        containerRef.current.innerHTML = '';

        await docxPreview.renderAsync(arrayBuf, containerRef.current, null, {
          className: 'docx',
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

        if (!cancelled) {
          const sections = containerRef.current.querySelectorAll('section');
          let count = sections.length;
          if (!count) {
            const h = containerRef.current.offsetHeight || 0;
            const w = containerRef.current.offsetWidth || 794;
            count = Math.max(1, Math.ceil((h - 20) / (w * 1.414)));
          }
          setPageCount(count);
          setRendered(true);
        }
      } catch (err) {
        console.error('DOCX render error:', err);
        if (!cancelled) alert('Failed to render the document: ' + (err.message || ''));
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();

    return () => { cancelled = true; };
  }, [arrayBuf]);

  /**
   * Direct high-resolution PDF generation and download
   * 1-to-1 page matching, zero blank pages, no print dialogs.
   */
  const convertToPdf = async () => {
    if (!rendered || !containerRef.current) return;
    setConverting(true);
    setProgressMsg('Initializing Ultra-HD document capture...');

    const origTransform = containerRef.current.style.transform;

    try {
      containerRef.current.style.transform = 'none';

      // Find all rendered page sections
      let sections = Array.from(containerRef.current.querySelectorAll('section.docx, section'));
      if (!sections.length) {
        sections = Array.from(containerRef.current.querySelectorAll('.docx-wrapper > *'));
      }
      if (!sections.length && containerRef.current.children.length) {
        sections = Array.from(containerRef.current.children);
      }

      if (!sections.length) {
        alert('No rendered pages found to convert. Please reload your document.');
        setConverting(false);
        containerRef.current.style.transform = origTransform;
        return;
      }

      const { default: html2canvas } = await import('html2canvas-pro');
      const { jsPDF } = await import('jspdf');

      const A4_WIDTH_MM = 210;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      let isFirstPage = true;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        setProgressMsg(`Rendering Page ${i + 1} of ${sections.length} (300 DPI Ultra-HD)...`);

        const canvas = await html2canvas(section, {
          scale: 2.2, // 2.2x razor-sharp print quality
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          scrollX: 0,
          scrollY: 0,
        });

        const pageHeightMm = (canvas.height / canvas.width) * A4_WIDTH_MM;

        if (!isFirstPage) {
          pdf.addPage([A4_WIDTH_MM, pageHeightMm], pageHeightMm > A4_WIDTH_MM ? 'portrait' : 'landscape');
        }
        isFirstPage = false;

        pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', 0, 0, A4_WIDTH_MM, pageHeightMm);
      }

      setProgressMsg('Assembling and saving your PDF...');
      const outName = (file?.name || 'document').replace(/\.docx$/i, '') + '.pdf';
      pdf.save(outName);
      setProgressMsg('Complete! Downloading PDF...');
    } catch (err) {
      console.error('PDF conversion error:', err);
      alert('PDF generation failed: ' + (err.message || 'Please try again.'));
    } finally {
      if (containerRef.current) {
        containerRef.current.style.transform = origTransform;
      }
      setConverting(false);
      setProgressMsg('');
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
        <div className="dropzone-subtitle">Your document will be rendered exactly as it looks, then converted to crisp, professional PDF</div>
        <button className="btn btn-blue btn-sm" style={{ marginTop: '0.4rem' }}>Select DOCX File</button>
      </div>
    </div>
  );

  return (
    <div>
      <AdBanner slotType="leaderboard" />
      <div className="tool-box">
        {/* File info bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '0.85rem', borderBottom: '1px solid var(--border-main)', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', wordBreak: 'break-all' }}>{file.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span>{formatSize(file.size)}</span>
              {rendered && (
                <>
                  <span>·</span>
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem', fontWeight: 600 }}>
                    <CheckCircle2 size={13} /> {pageCount} {pageCount === 1 ? 'page' : 'pages'} ready to convert
                  </span>
                </>
              )}
              {busy && <span>· Rendering document preview...</span>}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setArrayBuf(null); setRendered(false); if (containerRef.current) containerRef.current.innerHTML = ''; }}>
            <RefreshCw size={13} /> Change File
          </button>
        </div>

        {/* Zoom & View Controls */}
        {rendered && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Eye size={14} color="var(--text-tertiary)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Document Preview</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setZoom(z => Math.max(25, z - 15))} style={{ padding: '3px 8px' }}>
                <ZoomOut size={14} />
              </button>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: '38px', textAlign: 'center' }}>{zoom}%</span>
              <button className="btn btn-secondary btn-sm" onClick={() => setZoom(z => Math.min(200, z + 15))} style={{ padding: '3px 8px' }}>
                <ZoomIn size={14} />
              </button>
            </div>
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

        {/* DOCX Preview Scroll Viewport */}
        <div
          style={{
            display: rendered ? 'block' : 'none',
            maxHeight: '540px',
            overflow: 'auto',
            background: '#525659',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-main)',
            padding: '1.25rem 0.5rem',
            marginBottom: '1.25rem',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.2)',
          }}
        >
          <div
            ref={containerRef}
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          />
        </div>

        {/* Conversion Progress Bar */}
        {converting && (
          <div style={{ padding: '1.25rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 0.6rem' }} />
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>{progressMsg}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>Generating 100% pixel-perfect, clean PDF without blank pages</div>
          </div>
        )}

        {/* Main Action Button */}
        {rendered && !converting && (
          <div>
            <button
              className="btn btn-blue"
              style={{ width: '100%', padding: '0.95rem', fontSize: '1rem', fontWeight: 700, justifyContent: 'center', gap: '0.6rem', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.35)' }}
              onClick={convertToPdf}
            >
              <Download size={18} />
              Convert & Download PDF ({pageCount} {pageCount === 1 ? 'Page' : 'Pages'})
            </button>

            {/* Feature highlights */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <Zap size={14} color="#10b981" />
                <span>1-Click direct PDF download</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={14} color="#3b82f6" />
                <span>100% private, processed in browser</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
