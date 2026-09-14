import React, { useState, useRef } from 'react';
import { FileText, Download, RefreshCw, FileCheck, Loader } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, ImageRun, PageBreak, convertInchesToTwip } from 'docx';
import AdBanner from '../components/AdBanner';

if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
}

/**
 * Renders a single PDF page to a high-resolution canvas and returns image data.
 */
async function renderPageToImage(pdfDoc, pageNum, scale = 2.5) {
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d');

  // White background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvasContext: ctx, viewport }).promise;

  return {
    dataUrl: canvas.toDataURL('image/png'),
    blob: await new Promise(resolve => canvas.toBlob(resolve, 'image/png')),
    width: viewport.width,
    height: viewport.height,
    origWidth: page.getViewport({ scale: 1 }).width,
    origHeight: page.getViewport({ scale: 1 }).height,
  };
}

export default function PdfToWord() {
  const [file, setFile] = useState(null);
  const [pdfInfo, setPdfInfo] = useState(null);
  const [previews, setPreviews] = useState([]);
  const [busy, setBusy] = useState(false);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quality, setQuality] = useState('high');
  const ref = useRef(null);
  const pdfDocRef = useRef(null);

  const QUALITY_SCALES = { standard: 1.5, high: 2.5, ultra: 3.5 };

  const loadFile = async (f) => {
    if (!f || f.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    setBusy(true);
    setPreviews([]);
    try {
      const arrayBuffer = await f.arrayBuffer();
      let pdfDoc;
      try {
        const loadingTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',
          cMapPacked: true,
        });
        pdfDoc = await loadingTask.promise;
      } catch {
        const fallbackTask = pdfjsLib.getDocument({
          data: new Uint8Array(arrayBuffer),
          disableWorker: true,
        });
        pdfDoc = await fallbackTask.promise;
      }

      pdfDocRef.current = pdfDoc;
      setPdfInfo({ name: f.name, size: f.size, numPages: pdfDoc.numPages });
      setFile(f);

      // Generate small previews for first few pages
      const previewCount = Math.min(pdfDoc.numPages, 4);
      const thumbs = [];
      for (let i = 1; i <= previewCount; i++) {
        const img = await renderPageToImage(pdfDoc, i, 0.5); // Small scale for preview
        thumbs.push(img.dataUrl);
      }
      setPreviews(thumbs);
    } catch (err) {
      console.error(err);
      alert('Failed to parse the PDF. Please try another file.');
    } finally {
      setBusy(false);
    }
  };

  const convertToDocx = async () => {
    if (!pdfDocRef.current || !pdfInfo) return;
    setConverting(true);
    setProgress(0);

    try {
      const pdfDoc = pdfDocRef.current;
      const scale = QUALITY_SCALES[quality];
      const docChildren = [];

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        setProgress(Math.round((i / pdfDoc.numPages) * 100));

        const imgData = await renderPageToImage(pdfDoc, i, scale);
        const imgArrayBuffer = await imgData.blob.arrayBuffer();

        // Calculate dimensions to fit in DOCX page (A4: 8.27 x 11.69 inches)
        // With 0.5in margins on each side: 7.27 x 10.69 inches usable
        const maxWidthInches = 7.27;
        const maxHeightInches = 10.69;

        const aspectRatio = imgData.origHeight / imgData.origWidth;
        let widthInches = maxWidthInches;
        let heightInches = widthInches * aspectRatio;

        if (heightInches > maxHeightInches) {
          heightInches = maxHeightInches;
          widthInches = heightInches / aspectRatio;
        }

        const paragraph = new Paragraph({
          children: [
            new ImageRun({
              data: imgArrayBuffer,
              transformation: {
                width: Math.round(widthInches * 72), // points
                height: Math.round(heightInches * 72),
              },
              type: 'png',
            }),
          ],
          spacing: { after: 0, before: 0 },
          ...(i > 1 ? { pageBreakBefore: true } : {}),
        });

        docChildren.push(paragraph);
      }

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              size: {
                width: convertInchesToTwip(8.27),
                height: convertInchesToTwip(11.69),
              },
              margin: {
                top: convertInchesToTwip(0.5),
                bottom: convertInchesToTwip(0.5),
                left: convertInchesToTwip(0.5),
                right: convertInchesToTwip(0.5),
              },
            },
          },
          children: docChildren,
        }],
      });

      const blob = await Packer.toBlob(doc);
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = pdfInfo.name.replace(/\.pdf$/i, '') + '.docx';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (err) {
      console.error('Conversion error:', err);
      alert('Conversion failed. Please try again.');
    } finally {
      setConverting(false);
      setProgress(0);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  if (!pdfInfo) return (
    <div>
      <AdBanner slotType="leaderboard" />
      <div className="dropzone" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) loadFile(e.dataTransfer.files[0]); }} onClick={() => ref.current?.click()}>
        <input type="file" ref={ref} onChange={e => loadFile(e.target.files[0])} accept=".pdf" hidden />
        <div className="dropzone-icon"><FileText size={24} /></div>
        <div className="dropzone-title">{busy ? 'Loading PDF...' : 'Upload PDF to Convert to Word'}</div>
        <div className="dropzone-subtitle">Each page is rendered as a high-quality image inside the Word document, preserving the exact layout</div>
        <button className="btn btn-blue btn-sm" style={{ marginTop: '0.4rem' }}>Select PDF File</button>
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
            <div style={{ fontWeight: 700, fontSize: '0.95rem', wordBreak: 'break-all' }}>{pdfInfo.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              {formatSize(pdfInfo.size)} · {pdfInfo.numPages} page{pdfInfo.numPages !== 1 ? 's' : ''}
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => { setFile(null); setPdfInfo(null); setPreviews([]); pdfDocRef.current = null; }}>
            <RefreshCw size={13} /> Change File
          </button>
        </div>

        {/* Page previews */}
        {previews.length > 0 && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <FileCheck size={14} color="var(--text-tertiary)" />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                Page Preview {pdfInfo.numPages > 4 ? `(showing 4 of ${pdfInfo.numPages})` : ''}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
              {previews.map((src, i) => (
                <div key={i} style={{
                  border: '1px solid var(--border-main)',
                  borderRadius: 'var(--radius-sm)',
                  overflow: 'hidden',
                  background: '#fff',
                  position: 'relative',
                }}>
                  <img src={src} alt={`Page ${i + 1}`} style={{ width: '100%', display: 'block' }} />
                  <span style={{
                    position: 'absolute', bottom: 4, right: 4,
                    fontSize: '0.6rem', background: 'rgba(0,0,0,0.6)',
                    color: '#fff', padding: '1px 5px', borderRadius: '3px',
                  }}>Page {i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>Image Quality</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[
              { key: 'standard', label: 'Standard', desc: 'Smaller file' },
              { key: 'high', label: 'High', desc: 'Recommended' },
              { key: 'ultra', label: 'Ultra', desc: 'Best quality' },
            ].map(q => (
              <button
                key={q.key}
                className={`btn btn-sm ${quality === q.key ? 'btn-blue' : 'btn-secondary'}`}
                onClick={() => setQuality(q.key)}
                style={{ flex: 1, flexDirection: 'column', padding: '0.5rem 0.4rem', gap: '2px' }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.8rem' }}>{q.label}</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>{q.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        {converting && (
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
              <span>Rendering pages...</span>
              <span>{progress}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '3px', background: 'var(--border-main)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                background: 'var(--accent)',
                width: `${progress}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        )}

        {/* Convert button */}
        <button
          className="btn btn-blue"
          style={{ width: '100%', padding: '0.85rem', fontSize: '0.95rem' }}
          disabled={converting}
          onClick={convertToDocx}
        >
          {converting ? <Loader size={16} className="spin" /> : <Download size={16} />}
          {converting ? `Converting... ${progress}%` : 'Convert to Word (.docx)'}
        </button>

        <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '0.6rem' }}>
          Each PDF page is rendered as a high-quality image and placed in the Word document, preserving the exact original layout.
        </p>
      </div>
    </div>
  );
}
