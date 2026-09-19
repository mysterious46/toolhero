import React, { useState, useEffect } from 'react';
import { FileText, Image, Sparkles, AlignLeft, Shield, Music, Search, Menu, X, BookOpen } from 'lucide-react';
import { CATEGORIES, getToolsByCategory } from '../toolsData';
import SearchModal from './SearchModal';

export function BrandLogoIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <rect x="2" y="2" width="16" height="16" rx="4.5" fill="#2563EB" />
      <rect x="22" y="2" width="16" height="16" rx="4.5" fill="#16A34A" />
      <rect x="2" y="22" width="16" height="16" rx="4.5" fill="#7C3AED" />
      <rect x="22" y="22" width="16" height="16" rx="4.5" fill="#C45D3E" />
      <path d="M20 12L23.5 17.5L29.5 18.5L25.2 22.8L26.2 28.8L20 25.8L13.8 28.8L14.8 22.8L10.5 18.5L16.5 17.5L20 12Z" fill="#FFFFFF" />
    </svg>
  );
}

const CAT_ICONS = { pdf: FileText, image: Image, text: AlignLeft, security: Shield, media: Music, other: Sparkles };

export default function Header({ navigate, currentPath }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const catId = currentPath.split('/')[1];

  // Listen for Cmd+K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavClick = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <a href="/" className="brand-logo" onClick={(e) => { e.preventDefault(); handleNavClick('/'); }}>
            <BrandLogoIcon />
            <span style={{ fontSize: '1.2rem', letterSpacing: '-0.03em', fontWeight: 800 }}>
              Tool<span style={{ color: '#c45d3e' }}>Hero</span>
            </span>
          </a>

          {/* Search Trigger Button */}
          <div
            onClick={() => setIsSearchOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-main)',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              fontSize: '0.82rem',
              color: 'var(--text-tertiary)',
              transition: 'var(--transition)'
            }}
          >
            <Search size={15} color="var(--accent)" />
            <span className="hide-mobile">Search 36+ tools...</span>
            <kbd className="hide-mobile" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-main)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              ⌘K
            </kbd>
          </div>

          {/* Desktop Right Side Category Buttons */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <a href="/pdf" className={`cat-pill cat-pdf ${catId === 'pdf' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleNavClick('/pdf'); }}>
              <FileText size={14} /> PDF
            </a>
            <a href="/image" className={`cat-pill cat-image ${catId === 'image' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleNavClick('/image'); }}>
              <Image size={14} /> Image
            </a>
            <a href="/text" className={`cat-pill cat-text ${catId === 'text' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleNavClick('/text'); }}>
              <AlignLeft size={14} /> Text
            </a>
            <a href="/security" className={`cat-pill cat-security ${catId === 'security' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleNavClick('/security'); }}>
              <Shield size={14} /> Security
            </a>
            <a href="/media" className={`cat-pill cat-media ${catId === 'media' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleNavClick('/media'); }}>
              <Music size={14} /> Media
            </a>
            <a href="/other" className={`cat-pill cat-other ${catId === 'other' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); handleNavClick('/other'); }}>
              <Sparkles size={14} /> More
            </a>
            <a href="/guides" className={`cat-pill cat-guides ${catId === 'guides' ? 'active' : ''}`} style={{ borderColor: 'rgba(196, 93, 62, 0.4)', background: catId === 'guides' ? 'var(--accent)' : 'transparent', color: catId === 'guides' ? '#fff' : 'inherit' }} onClick={(e) => { e.preventDefault(); handleNavClick('/guides'); }}>
              <BookOpen size={14} /> Guides
            </a>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            className="show-mobile-only"
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.4rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-main)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div
            style={{
              padding: '1rem 1.25rem',
              backgroundColor: 'var(--bg-card)',
              borderBottom: '1px solid var(--border-main)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.6rem'
            }}
          >
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '0.2rem' }}>
              Tool Categories
            </div>
            {CATEGORIES.map(cat => {
              const Icon = CAT_ICONS[cat.id] || Sparkles;
              const count = getToolsByCategory(cat.id).length;
              return (
                <a
                  key={cat.id}
                  href={`/${cat.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    backgroundColor: catId === cat.id ? 'var(--bg-elevated)' : 'transparent',
                    border: '1px solid var(--border-main)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                  onClick={(e) => { e.preventDefault(); handleNavClick(`/${cat.id}`); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 600, fontSize: '0.9rem' }}>
                    <Icon size={16} color={`var(--${cat.color})`} /> {cat.name}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>{count} Tools</span>
                </a>
              );
            })}
          </div>
        )}
      </header>

      {/* Global Quick Search Modal */}
      {isSearchOpen && (
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} navigate={navigate} />
      )}
    </>
  );
}
