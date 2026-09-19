import React, { useState } from 'react';
import { BookOpen, Clock, Calendar, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, Share2, Sparkles, Layers } from 'lucide-react';
import { GUIDES, getGuideBySlug } from '../guidesData';
import AdBanner from '../components/AdBanner';

export function GuidesIndexPage({ navigate }) {
  const [selectedCat, setSelectedCat] = useState('all');
  const [search, setSearch] = useState('');

  const categories = ['all', ...new Set(GUIDES.map(g => g.category))];

  const filtered = GUIDES.filter(g => {
    const matchCat = selectedCat === 'all' || g.category === selectedCat;
    const matchSearch = search.trim() === '' || 
      g.title.toLowerCase().includes(search.toLowerCase()) || 
      g.summary.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Hero Header */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.35rem 0.9rem',
          borderRadius: '999px',
          backgroundColor: 'rgba(196, 93, 62, 0.08)',
          color: 'var(--accent)',
          fontSize: '0.82rem',
          fontWeight: 700,
          marginBottom: '1rem'
        }}>
          <BookOpen size={15} /> Educational Engineering Hub
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.85rem', lineHeight: 1.2 }}>
          Guides, Tutorials & Technical Analyses
        </h1>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '720px', margin: '0 auto', lineHeight: 1.7 }}>
          Deep-dive technical guides on document architecture, client-side cryptographic security, image compression algorithms, and web performance optimization.
        </p>
      </div>

      {/* Category Pills & Search */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-pill ${selectedCat === cat ? 'active' : ''}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
              onClick={() => setSelectedCat(cat)}
            >
              {cat === 'all' ? 'All Guides' : cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search guides..."
          className="form-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: '240px', fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
        />
      </div>

      {/* Guides Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {filtered.map((guide) => (
          <article
            key={guide.slug}
            className="tool-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              padding: '1.5rem',
              borderRadius: '12px',
              textDecoration: 'none',
              color: 'inherit'
            }}
            onClick={() => navigate(`/guides/${guide.slug}`)}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: 'var(--accent)',
                  backgroundColor: 'rgba(196, 93, 62, 0.08)',
                  padding: '2px 8px',
                  borderRadius: '4px'
                }}>
                  {guide.category}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> {guide.readTime}
                </span>
              </div>

              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.4, marginBottom: '0.65rem' }}>
                {guide.title}
              </h2>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                {guide.summary}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-main)', paddingTop: '0.85rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Calendar size={12} /> {guide.date}
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                Read Guide <ArrowRight size={14} />
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Compliant In-Article Bottom Ad Slot */}
      <div style={{ marginTop: '2rem' }}>
        <AdBanner slotType="leaderboard" />
      </div>
    </div>
  );
}

export function GuideDetailPage({ slug, navigate }) {
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Guide Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>The requested article could not be found.</p>
        <button className="btn btn-primary" onClick={() => navigate('/guides')}>
          <ArrowLeft size={15} /> Return to Guides Hub
        </button>
      </div>
    );
  }

  // Simple clean markdown parser for headings, code blocks, lists, bold, tables
  const renderMarkdown = (text) => {
    const lines = text.trim().split('\n');
    const elements = [];
    let inCodeBlock = false;
    let codeBuffer = [];
    let inTable = false;
    let tableRows = [];

    lines.forEach((line, idx) => {
      // Code block toggle
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          elements.push(
            <pre key={`code-${idx}`} style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-main)',
              borderRadius: '8px',
              padding: '1rem',
              overflowX: 'auto',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.5,
              margin: '1.25rem 0'
            }}>
              <code>{codeBuffer.join('\n')}</code>
            </pre>
          );
          codeBuffer = [];
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        return;
      }

      if (inCodeBlock) {
        codeBuffer.push(line);
        return;
      }

      // Tables
      if (line.trim().startsWith('|')) {
        inTable = true;
        tableRows.push(line);
        return;
      } else if (inTable) {
        // flush table
        elements.push(renderTable(tableRows, `table-${idx}`));
        tableRows = [];
        inTable = false;
      }

      // Headings
      if (line.startsWith('### ')) {
        elements.push(
          <h2 key={`h2-${idx}`} style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginTop: '2.5rem', marginBottom: '0.85rem' }}>
            {line.replace('### ', '')}
          </h2>
        );
        return;
      }
      if (line.startsWith('#### ')) {
        elements.push(
          <h3 key={`h3-${idx}`} style={{ fontSize: '1.15rem', fontWeight: 700, marginTop: '1.75rem', marginBottom: '0.65rem' }}>
            {line.replace('#### ', '')}
          </h3>
        );
        return;
      }

      // Horizontal rule
      if (line.trim() === '---') {
        elements.push(<hr key={`hr-${idx}`} style={{ border: 'none', borderTop: '1px solid var(--border-main)', margin: '2.25rem 0' }} />);
        return;
      }

      // Bullet points
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        const content = line.trim().replace(/^[\*\-]\s+/, '');
        elements.push(
          <li key={`li-${idx}`} style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '0.4rem', marginLeft: '1.25rem' }}>
            <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
          </li>
        );
        return;
      }

      // Numbered lists
      if (/^\d+\.\s+/.test(line.trim())) {
        const content = line.trim().replace(/^\d+\.\s+/, '');
        elements.push(
          <li key={`ol-${idx}`} style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '0.4rem', marginLeft: '1.25rem' }}>
            <span dangerouslySetInnerHTML={{ __html: formatInline(content) }} />
          </li>
        );
        return;
      }

      // Regular Paragraphs
      if (line.trim().length > 0) {
        elements.push(
          <p key={`p-${idx}`} style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '1.15rem' }}>
            <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
          </p>
        );
      }
    });

    if (inTable && tableRows.length > 0) {
      elements.push(renderTable(tableRows, 'table-final'));
    }

    return elements;
  };

  const renderTable = (rows, key) => {
    const parsedRows = rows
      .filter(r => !r.includes(':---') && !r.includes('---:'))
      .map(r => r.split('|').filter(c => c.trim() !== '').map(c => c.trim()));

    if (parsedRows.length === 0) return null;

    const headers = parsedRows[0];
    const dataRows = parsedRows.slice(1);

    return (
      <div key={key} style={{ overflowX: 'auto', margin: '1.75rem 0' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: 'var(--bg-elevated)', borderBottom: '2px solid var(--border-main)' }}>
              {headers.map((h, i) => (
                <th key={i} style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 700 }} dangerouslySetInnerHTML={{ __html: formatInline(h) }} />
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rIdx) => (
              <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-main)' }}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} style={{ padding: '0.75rem', verticalAlign: 'top' }} dangerouslySetInnerHTML={{ __html: formatInline(cell) }} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const formatInline = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--text-primary); font-weight: 700;">$1</strong>')
      .replace(/`([^`]+)`/g, '<code style="background: var(--bg-elevated); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.85em; border: 1px solid var(--border-main);">$1</code>');
  };

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto', padding: '1rem 0' }}>
      {/* Navigation Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '1.5rem' }}>
        <a href="/" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }} onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
        <span>/</span>
        <a href="/guides" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }} onClick={(e) => { e.preventDefault(); navigate('/guides'); }}>Guides</a>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{guide.title}</span>
      </div>

      <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => navigate('/guides')}>
        <ArrowLeft size={13} /> Back to All Guides
      </button>

      {/* Guide Header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.85rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            color: 'var(--accent)',
            backgroundColor: 'rgba(196, 93, 62, 0.08)',
            padding: '3px 9px',
            borderRadius: '4px'
          }}>
            {guide.category}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Calendar size={13} /> {guide.date}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={13} /> {guide.readTime}
          </span>
        </div>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: '1rem' }}>
          {guide.title}
        </h1>

        <p style={{ fontSize: '1.08rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          {guide.subtitle}
        </p>

        {/* Lead Callout Summary Box */}
        <div style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: 'var(--bg-elevated)',
          borderLeft: '4px solid var(--accent)',
          borderRadius: '4px',
          fontSize: '0.92rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.7
        }}>
          <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.35rem' }}>Executive Summary:</strong>
          {guide.summary}
        </div>
      </header>

      {/* Article Content Body */}
      <div className="guide-content-body" style={{ marginBottom: '3.5rem' }}>
        {renderMarkdown(guide.content)}
      </div>

      {/* Compliant In-Article Bottom Ad Slot */}
      <div style={{ margin: '2.5rem 0' }}>
        <AdBanner slotType="leaderboard" />
      </div>

      {/* Related Interactive Tools Callout */}
      {guide.relatedTools && guide.relatedTools.length > 0 && (
        <section style={{
          padding: '1.75rem',
          backgroundColor: 'var(--bg-elevated)',
          borderRadius: '12px',
          border: '1px solid var(--border-main)',
          marginBottom: '3rem'
        }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="var(--accent)" /> Try Related Free Tools on ToolHero
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
            All tools run 100% locally in your web browser with zero server uploads.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
            {guide.relatedTools.map(rt => (
              <a
                key={rt.id}
                href={`/${rt.cat}/${rt.id}`}
                className="btn btn-secondary btn-sm"
                style={{ justifyContent: 'flex-start', padding: '0.65rem 0.9rem', fontSize: '0.82rem', textDecoration: 'none' }}
                onClick={(e) => { e.preventDefault(); navigate(`/${rt.cat}/${rt.id}`); }}
              >
                <span style={{ color: 'var(--accent)' }}>→</span> {rt.title}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* E-E-A-T Publisher & Author Info Box */}
      <footer style={{
        padding: '1.5rem',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '10px',
        border: '1px solid var(--border-main)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', backgroundColor: 'rgba(196, 93, 62, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
          <ShieldCheck size={26} />
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
            Written by the {guide.author}
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-tertiary)', lineHeight: 1.5, margin: 0 }}>
            ToolHero provides secure, client-side developer, document, and media utilities. Our technical documentation is authored and verified by software engineers specializing in web standards, cryptography, and systems architecture.
          </p>
        </div>
      </footer>
    </div>
  );
}
