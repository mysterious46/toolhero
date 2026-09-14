import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { TOOLS } from '../toolsData';

export default function SearchModal({ isOpen, onClose, navigate }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Filter tools based on search query
  const filteredTools = TOOLS.filter(t => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.cat.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Keyboard navigation inside modal
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredTools.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % (filteredTools.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTools[selectedIndex]) {
        const tool = filteredTools[selectedIndex];
        navigate(`/${tool.cat}/${tool.id}`);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '5vh',
        paddingLeft: '1rem',
        paddingRight: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-hover)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '0.85rem 1.15rem', borderBottom: '1px solid var(--border-main)', gap: '0.75rem' }}>
          <Search size={20} color="var(--accent)" />
          <input
            ref={inputRef}
            type="text"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-body)'
            }}
            placeholder="Search all 33+ tools... (e.g. compress, passport, jwt, pdf)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
          />
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Results List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '0.5rem' }}>
          {filteredTools.length > 0 ? (
            filteredTools.map((t, idx) => {
              const Icon = t.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={t.id}
                  onClick={() => { navigate(`/${t.cat}/${t.id}`); onClose(); }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 0.95rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    background: isSelected ? 'var(--bg-elevated)' : 'transparent',
                    border: isSelected ? '1px solid var(--border-main)' : '1px solid transparent',
                    transition: 'background 0.1s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div className={`tool-icon-wrapper ti-${t.cat}`} style={{ width: '34px', height: '34px' }}>
                      <Icon size={17} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {t.desc}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', background: `var(--${t.cat === 'pdf' ? 'blue' : t.cat === 'image' ? 'green' : 'purple'}-soft)`, color: `var(--${t.cat === 'pdf' ? 'blue' : t.cat === 'image' ? 'green' : 'purple'})` }}>
                      {t.cat}
                    </span>
                    {isSelected && <CornerDownLeft size={14} color="var(--accent)" />}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.88rem' }}>
              No tools matching "{query}"
            </div>
          )}
        </div>

        {/* Footer shortcuts info */}
        <div style={{ padding: '0.6rem 1.15rem', background: 'var(--bg-elevated)', borderTop: '1px solid var(--border-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span><strong style={{ color: 'var(--text-primary)' }}>↑↓</strong> to navigate</span>
            <span><strong style={{ color: 'var(--text-primary)' }}>↵</strong> to select</span>
            <span><strong style={{ color: 'var(--text-primary)' }}>ESC</strong> to close</span>
          </div>
          <span>33 tools available</span>
        </div>
      </div>
    </div>
  );
}
