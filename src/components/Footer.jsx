import React from 'react';
import { Lock } from 'lucide-react';
import { getToolsByCategory } from '../toolsData';
import { BrandLogoIcon } from './Header';

export default function Footer({ navigate }) {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Brand Column */}
        <div>
          <a href="/" className="brand-logo" style={{ marginBottom: '0.5rem', textDecoration: 'none', color: 'inherit', display: 'inline-flex' }} onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <BrandLogoIcon />
            <span style={{ fontSize: '1.2rem', letterSpacing: '-0.03em', fontWeight: 800 }}>
              Tool<span style={{ color: '#c45d3e' }}>Hero</span>
            </span>
          </a>
          <p className="footer-brand-desc">
            Free online tools for PDF, image, text, security, audio, video, and developer utilities. ToolHero processes everything in your browser — your files never leave your device.
          </p>
          <div style={{ marginTop: '0.85rem' }}>
            <a href="/guides" style={{ textDecoration: 'none', color: '#c45d3e', fontWeight: 700, fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }} onClick={(e) => { e.preventDefault(); navigate('/guides'); }}>
              📚 Technical Guides & Tutorials &rarr;
            </a>
          </div>
        </div>

        {/* PDF Tools Column */}
        <div>
          <h4 className="footer-heading fh-pdf">● PDF Tools</h4>
          <ul className="footer-links">
            {getToolsByCategory('pdf').map(t => (
              <li key={t.id}>
                <a href={`/pdf/${t.id}`} className="footer-link" onClick={(e) => { e.preventDefault(); navigate(`/pdf/${t.id}`); }}>{t.title}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Image Tools Column */}
        <div>
          <h4 className="footer-heading fh-image">● Image Tools</h4>
          <ul className="footer-links">
            {getToolsByCategory('image').map(t => (
              <li key={t.id}>
                <a href={`/image/${t.id}`} className="footer-link" onClick={(e) => { e.preventDefault(); navigate(`/image/${t.id}`); }}>{t.title}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Text & Dev Tools Column */}
        <div>
          <h4 className="footer-heading fh-other">● Text & Dev</h4>
          <ul className="footer-links">
            {getToolsByCategory('text').map(t => (
              <li key={t.id}>
                <a href={`/text/${t.id}`} className="footer-link" onClick={(e) => { e.preventDefault(); navigate(`/text/${t.id}`); }}>{t.title}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Security & Crypto Column */}
        <div>
          <h4 className="footer-heading fh-other">● Security & Crypto</h4>
          <ul className="footer-links">
            {getToolsByCategory('security').map(t => (
              <li key={t.id}>
                <a href={`/security/${t.id}`} className="footer-link" onClick={(e) => { e.preventDefault(); navigate(`/security/${t.id}`); }}>{t.title}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Audio & Video Column */}
        <div>
          <h4 className="footer-heading fh-other">● Audio & Video</h4>
          <ul className="footer-links">
            {getToolsByCategory('media').map(t => (
              <li key={t.id}>
                <a href={`/media/${t.id}`} className="footer-link" onClick={(e) => { e.preventDefault(); navigate(`/media/${t.id}`); }}>{t.title}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Other Tools Column */}
        <div>
          <h4 className="footer-heading fh-other">● Other Tools</h4>
          <ul className="footer-links">
            {getToolsByCategory('other').map(t => (
              <li key={t.id}>
                <a href={`/${t.cat}/${t.id}`} className="footer-link" onClick={(e) => { e.preventDefault(); navigate(`/${t.cat}/${t.id}`); }}>{t.title}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Lock size={12} /> <strong style={{ color: 'var(--text-secondary)' }}>Privacy First:</strong> Your files never leave your device. All processing is done locally.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <a href="/guides" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); navigate('/guides'); }}>Guides</a>
          <span>|</span>
          <a href="/about" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); navigate('/about'); }}>About Us</a>
          <span>|</span>
          <a href="/contact" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); navigate('/contact'); }}>Contact Us</a>
          <span>|</span>
          <a href="/privacy" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); navigate('/privacy'); }}>Privacy Policy</a>
          <span>|</span>
          <a href="/terms" style={{ textDecoration: 'none', color: 'inherit', fontWeight: 600 }} onClick={(e) => { e.preventDefault(); navigate('/terms'); }}>Terms of Service</a>
        </div>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-tertiary)', marginTop: '1rem', maxWidth: '1200px', margin: '1rem auto 0' }}>
        &copy; {new Date().getFullYear()} ToolHero. All rights reserved.
      </div>
    </footer>
  );
}
