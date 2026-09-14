import React, { useState, useRef } from 'react';
import { FileText, Copy, Download, Check, RefreshCw } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
}

export default function ExtractPdfText() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  const loadFile = async (f) => {
    if (!f || f.type !== 'application/pdf') return;
    setFile({ name: f.name, buf: await f.arrayBuffer() });
    setExtractedText('');
  };

  const extractText = async () => {
    if (!file) return;
    setBusy(true);

    try {
      let pdfDoc;
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(file.buf),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
          cMapPacked: true
        });
        pdfDoc = await loadingTask.promise;
      } catch (wErr) {
        console.warn('Worker blocked, using inline parser:', wErr);
        const fallbackTask = pdfjsLib.getDocument({
          data: new Uint8Array(file.buf),
          disableWorker: true
        });
        pdfDoc = await fallbackTask.promise;
      }
      let fullText = '';

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `--- Page ${i} ---\n${pageText}\n\n`;
      }

      setExtractedText(fullText || 'No selectable text found in this PDF.');
    } catch (err) {
      console.error(err);
      alert('Failed to extract text from PDF file. Please try another PDF.');
    } finally {
      setBusy(false);
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(extractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([extractedText], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${file.name.replace(/\.[^.]+$/, '')}-extracted-text.txt`;
    a.click();
  };

  if (!file) return (
    <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}>
      <input type="file" ref={ref} onChange={e => loadFile(e.target.files[0])} accept=".pdf" hidden />
      <div className="dropzone-icon"><FileText size={24} /></div>
      <div className="dropzone-title">Upload PDF to extract text</div>
      <div className="dropzone-subtitle">Copy and export selectable text streams from PDF pages</div>
      <button className="btn btn-blue btn-sm" style={{ marginTop: '0.4rem' }}>Select PDF Document</button>
    </div>
  );

  return (
    <div className="tool-box">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-main)' }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', wordBreak: 'break-all' }}>{file.name}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>Ready for text extraction</div>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setExtractedText(''); }}>Change File</button>
      </div>

      {!extractedText && (
        <button className="btn btn-blue" style={{ width: '100%', padding: '0.75rem' }} disabled={busy} onClick={extractText}>
          {busy ? 'Extracting Text...' : 'Extract Text from PDF'}
        </button>
      )}

      {extractedText && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Extracted Document Text</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={copyText}>
                {copied ? <Check size={14} color="#16a34a" /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
              </button>
              <button className="btn btn-green btn-sm" onClick={downloadTxt}>
                <Download size={14} /> Download TXT
              </button>
            </div>
          </div>

          <textarea
            readOnly
            value={extractedText}
            rows={12}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '8px',
              border: '1px solid var(--border-main)',
              background: 'var(--bg-elevated)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.82rem',
              color: 'var(--text-primary)',
              lineHeight: 1.5,
              resize: 'vertical'
            }}
          />
        </div>
      )}
    </div>
  );
}
