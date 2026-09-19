import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AdBanner from './components/AdBanner';
import { CATEGORIES, TOOLS, getToolsByCategory, getToolById, getCategoryById } from './toolsData';
import { SEO_DATA } from './seoData';
import { ShieldCheck, Zap, Lock, ArrowLeft, FileText, Image, Sparkles, AlignLeft, Shield, Music, CheckCircle2, HelpCircle, ChevronDown, ChevronUp, Layers, ArrowRight, BookOpen, Cpu, Lightbulb } from 'lucide-react';

import { AboutPage, ContactPage, PrivacyPage, TermsPage } from './pages/TrustPages';
import { GuidesIndexPage, GuideDetailPage } from './pages/GuidesPage';
import { getGuideBySlug } from './guidesData';

/* ─────────── Clean HTML5 Path Router & Route Validator ─────────── */
function parsePath() {
  let pathname = window.location.pathname;
  
  if (window.location.hash) {
    pathname = window.location.hash.slice(1) || '/';
  }

  // Clean trailing spaces or quotes if any
  const cleanPathname = pathname.trim();
  const parts = cleanPathname.split('/').filter(Boolean);

  if (parts.length === 0) return { view: 'home', path: '/' };

  if (parts.length === 1) {
    const catId = parts[0];
    if (catId === 'guides') {
      return { view: 'guides', path: '/guides' };
    }
    const trustPages = ['about', 'contact', 'privacy', 'terms'];
    if (trustPages.includes(catId)) {
      return { view: 'trust', catId, path: `/${catId}` };
    }
    if (getCategoryById(catId)) {
      return { view: 'category', catId, path: `/${catId}` };
    }
    return { view: 'notfound', path: cleanPathname };
  }

  if (parts.length === 2) {
    const [catId, toolId] = parts;
    if (catId === 'guides') {
      const guide = getGuideBySlug(toolId);
      if (guide) {
        return { view: 'guide', slug: toolId, path: `/guides/${toolId}` };
      }
      return { view: 'notfound', path: cleanPathname };
    }
    const tool = getToolById(toolId);
    const cat = getCategoryById(catId);
    if (tool && cat && tool.cat === catId) {
      return { view: 'tool', catId, toolId, path: `/${catId}/${toolId}` };
    }
    return { view: 'notfound', path: cleanPathname };
  }

  return { view: 'notfound', path: cleanPathname };
}

/* ─────────── Dynamic SEO Metadata & Head Manager ─────────── */
function updateSeoMeta(route) {
  const setMetaTag = (selector, attr, attrValue, content) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attr, attrValue);
      document.head.appendChild(element);
    }
    element.setAttribute('content', content);
  };

  // If page is non-existent/invalid route (404), force noindex, nofollow so search engines drop it
  if (route.view === 'notfound') {
    document.title = '404 Page Not Found – ToolHero';
    setMetaTag('meta[name="robots"]', 'name', 'robots', 'noindex, nofollow');
    setMetaTag('meta[name="description"]', 'name', 'description', 'The requested page could not be found on ToolHero. Return to our homepage to access 36+ free online tools.');
    
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (canonicalEl) {
      canonicalEl.parentNode.removeChild(canonicalEl);
    }

    let scriptEl = document.querySelector('script[type="application/ld+json"]#seo-schema');
    if (scriptEl) {
      scriptEl.textContent = '';
    }
    return;
  }

  // Ensure indexable routes explicitly have index, follow
  setMetaTag('meta[name="robots"]', 'name', 'robots', 'index, follow');

  if (route.view === 'guides') {
    document.title = 'Guides, Tutorials & Technical Analyses – ToolHero';
    setMetaTag('meta[name="description"]', 'name', 'description', 'In-depth technical guides and tutorials on document conversion, PDF compression, image formats, and client-side web security.');
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', 'ToolHero Guides – Technical Documentation & Tutorials');
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', 'Deep-dive technical articles on web performance, cryptography, and document management.');
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', 'https://toolhero.xyz/guides');

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', 'https://toolhero.xyz/guides');
    return;
  }

  if (route.view === 'guide') {
    const guide = getGuideBySlug(route.slug);
    if (guide) {
      document.title = `${guide.title} – ToolHero`;
      setMetaTag('meta[name="description"]', 'name', 'description', guide.summary);
      setMetaTag('meta[name="keywords"]', 'name', 'keywords', guide.keywords);
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', guide.title);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', guide.summary);
      setMetaTag('meta[property="og:url"]', 'property', 'og:url', `https://toolhero.xyz/guides/${guide.slug}`);

      let canonicalEl = document.querySelector('link[rel="canonical"]');
      if (!canonicalEl) {
        canonicalEl = document.createElement('link');
        canonicalEl.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalEl);
      }
      canonicalEl.setAttribute('href', `https://toolhero.xyz/guides/${guide.slug}`);

      let jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        'headline': guide.title,
        'description': guide.summary,
        'author': {
          '@type': 'Organization',
          'name': 'ToolHero Engineering Team'
        },
        'publisher': {
          '@type': 'Organization',
          'name': 'ToolHero',
          'logo': {
            '@type': 'ImageObject',
            'url': 'https://toolhero.xyz/favicon.svg'
          }
        },
        'mainEntityOfPage': {
          '@type': 'WebPage',
          '@id': `https://toolhero.xyz/guides/${guide.slug}`
        }
      };

      let scriptEl = document.querySelector('script[type="application/ld+json"]#seo-schema');
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.setAttribute('type', 'application/ld+json');
        scriptEl.setAttribute('id', 'seo-schema');
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
      return;
    }
  }

  let path = route.path || window.location.pathname || '/';
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  const seo = SEO_DATA[path] || SEO_DATA['/'];
  const canonicalUrl = `https://toolhero.xyz${path === '/' ? '' : path}`;

  let jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    'name': seo.h1 || 'ToolHero',
    'url': canonicalUrl,
    'description': seo.description,
    'applicationCategory': 'UtilitiesApplication',
    'operatingSystem': 'All',
    'browserRequirements': 'Requires JavaScript. Requires HTML5.',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    }
  };

  if (seo.faqs && seo.faqs.length > 0) {
    jsonLd.mainEntity = seo.faqs.map(f => ({
      '@type': 'Question',
      'name': f.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.a
      }
    }));
  }

  document.title = seo.seoTitle || seo.title || 'ToolHero – Free Online PDF, Image, Video & Security Tools';
  setMetaTag('meta[name="description"]', 'name', 'description', seo.description);
  if (seo.keywords) {
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', seo.keywords);
  }

  setMetaTag('meta[property="og:title"]', 'property', 'og:title', seo.title);
  setMetaTag('meta[property="og:description"]', 'property', 'og:description', seo.description);
  setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);

  let canonicalEl = document.querySelector('link[rel="canonical"]');
  if (!canonicalEl) {
    canonicalEl = document.createElement('link');
    canonicalEl.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalEl);
  }
  canonicalEl.setAttribute('href', canonicalUrl);

  let scriptEl = document.querySelector('script[type="application/ld+json"]#seo-schema');
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.setAttribute('type', 'application/ld+json');
    scriptEl.setAttribute('id', 'seo-schema');
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(jsonLd);
}

function useRouter() {
  const [route, setRoute] = useState(parsePath());

  useEffect(() => {
    if (window.location.hash) {
      const cleanPath = window.location.hash.slice(1);
      window.history.replaceState({}, '', cleanPath || '/');
    }

    const handler = () => {
      const parsed = parsePath();
      setRoute(parsed);
      updateSeoMeta(parsed);
    };

    updateSeoMeta(route);
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    const parsed = parsePath();
    setRoute(parsed);
    updateSeoMeta(parsed);
    window.scrollTo(0, 0);
  };

  return { route, navigate };
}

const CAT_ICONS = { pdf: FileText, image: Image, text: AlignLeft, security: Shield, media: Music, other: Sparkles };

export default function App() {
  const { route, navigate } = useRouter();

  return (
    <div className="app-container">
      <Header navigate={navigate} currentPath={window.location.pathname || '/'} />

      <main className="main-content">
        {route.view === 'home' && <HomePage navigate={navigate} />}
        {route.view === 'guides' && <GuidesIndexPage navigate={navigate} />}
        {route.view === 'guide' && <GuideDetailPage slug={route.slug} navigate={navigate} />}
        {route.view === 'trust' && (
          route.catId === 'about' ? <AboutPage navigate={navigate} /> :
          route.catId === 'contact' ? <ContactPage navigate={navigate} /> :
          route.catId === 'privacy' ? <PrivacyPage navigate={navigate} /> :
          <TermsPage navigate={navigate} />
        )}
        {route.view === 'category' && <CategoryPage catId={route.catId} navigate={navigate} />}
        {route.view === 'tool' && <ToolPage catId={route.catId} toolId={route.toolId} navigate={navigate} />}
        {route.view === 'notfound' && <NotFoundPage navigate={navigate} />}
      </main>

      <Footer navigate={navigate} />
    </div>
  );
}

/* ─────────── Categorized Home Page ─────────── */
function HomePage({ navigate }) {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const seo = SEO_DATA['/'];

  const filteredTools = TOOLS.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
                          t.desc.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'all' || t.cat === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <ShieldCheck size={14} /> 100% client-side — your files never leave your browser
        </div>
        <h1 className="hero-title">{seo.h1}</h1>
        <p className="hero-subtitle">{seo.subtitle}</p>

        {/* Search Bar */}
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search 36+ tools (e.g. compress pdf, passport photo, qr code)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd className="search-kbd">⌘K</kbd>
        </div>

        {/* Styled Category Filter Pills */}
        <div className="category-pills" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1.25rem' }}>
          <button
            className={`pill-btn pill-all ${selectedCat === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCat('all')}
          >
            All Tools ({TOOLS.length})
          </button>
          {CATEGORIES.map(cat => {
            const Icon = CAT_ICONS[cat.id] || Sparkles;
            const count = getToolsByCategory(cat.id).length;
            return (
              <button
                key={cat.id}
                className={`pill-btn pill-${cat.id} ${selectedCat === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCat(cat.id)}
              >
                <Icon size={14} /> {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </section>
      {search.trim() !== '' || selectedCat !== 'all' ? (
        <section style={{ marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
            {selectedCat === 'all' ? `Search Results (${filteredTools.length})` : CATEGORIES.find(c => c.id === selectedCat)?.name}
          </h2>

          {filteredTools.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
              No tools found matching "{search}".
            </div>
          ) : (
            <div className="tools-grid">
              {filteredTools.map(t => {
                const cat = getCategoryById(t.cat);
                const ToolIcon = t.icon || Sparkles;
                return (
                  <a key={t.id} href={`/${t.cat}/${t.id}`} className="tool-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} onClick={(e) => { e.preventDefault(); navigate(`/${t.cat}/${t.id}`); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                      <div className={`tool-icon-wrapper ti-${t.cat}`}>
                        <ToolIcon size={20} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <h3 className="tool-card-title">{t.title}</h3>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'capitalize' }}>{cat?.name}</span>
                      </div>
                    </div>
                    <p className="tool-card-desc">{t.desc}</p>
                  </a>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        /* Render Grouped Category Sections */
        <div style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {CATEGORIES.map(cat => {
            const catTools = getToolsByCategory(cat.id);
            const Icon = CAT_ICONS[cat.id] || Sparkles;
            return (
              <section key={cat.id}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <Icon size={22} color={`var(--${cat.color})`} /> {cat.name}
                  </h2>
                  <a
                    href={`/${cat.id}`}
                    className="btn btn-secondary btn-sm"
                    style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
                    onClick={(e) => { e.preventDefault(); navigate(`/${cat.id}`); }}
                  >
                    View All {cat.name} <ArrowRight size={13} />
                  </a>
                </div>

                <div className="tools-grid">
                  {catTools.map(t => {
                    const ToolIcon = t.icon || Sparkles;
                    return (
                      <a key={t.id} href={`/${cat.id}/${t.id}`} className="tool-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} onClick={(e) => { e.preventDefault(); navigate(`/${cat.id}/${t.id}`); }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                          <div className={`tool-icon-wrapper ti-${cat.id}`}>
                            <ToolIcon size={20} />
                          </div>
                          <div>
                            <h3 className="tool-card-title">{t.title}</h3>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{cat.name}</span>
                          </div>
                        </div>
                        <p className="tool-card-desc">{t.desc}</p>
                      </a>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* Compliant In-Article Bottom Ad Slot */}
      <div style={{ marginTop: '3rem', marginBottom: '1rem' }}>
        <AdBanner slotType="leaderboard" />
      </div>

      {/* FAQ Section */}
      <FaqSection faqs={seo.faqs} />
    </div>
  );
}

/* ─────────── Category Page ─────────── */
function CategoryPage({ catId, navigate }) {
  const cat = getCategoryById(catId);
  const catTools = getToolsByCategory(catId);
  const path = `/${catId}`;
  const seo = SEO_DATA[path] || { h1: `${cat?.name} Tools`, subtitle: cat?.description };

  if (!cat) return <div style={{ textAlign: 'center', padding: '3rem' }}>Category not found. <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button></div>;

  const Icon = CAT_ICONS[cat.id] || Sparkles;

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <a href="/" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <ArrowLeft size={13} /> All Categories
        </a>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Icon size={28} color={`var(--${cat.color})`} /> {seo.h1}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{seo.subtitle}</p>
      </div>

      <div className="tools-grid" style={{ marginTop: '1.5rem' }}>
        {catTools.map(t => {
          const ToolIcon = t.icon || Sparkles;
          return (
            <a key={t.id} href={`/${cat.id}/${t.id}`} className="tool-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }} onClick={(e) => { e.preventDefault(); navigate(`/${cat.id}/${t.id}`); }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                <div className={`tool-icon-wrapper ti-${cat.id}`}>
                  <ToolIcon size={20} />
                </div>
                <div>
                  <h3 className="tool-card-title">{t.title}</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>{cat.name}</span>
                </div>
              </div>
              <p className="tool-card-desc">{t.desc}</p>
            </a>
          );
        })}
      </div>

      {/* Compliant In-Article Bottom Ad Slot */}
      <div style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
        <AdBanner slotType="leaderboard" />
      </div>

      {seo.faqs && <FaqSection faqs={seo.faqs} />}
    </div>
  );
}

/* ─────────── Tool Page Workspace Wrapper ─────────── */
function ToolPage({ catId, toolId, navigate }) {
  const tool = getToolById(toolId);
  const cat = getCategoryById(catId);
  const path = `/${catId}/${toolId}`;
  const seo = SEO_DATA[path] || { h1: tool?.title, subtitle: tool?.desc };

  if (!tool) return <div style={{ textAlign: 'center', padding: '3rem' }}>Tool not found. <button className="btn btn-primary" onClick={() => navigate('/')}>Go Home</button></div>;

  const ToolComponent = tool.component;
  const siblingTools = getToolsByCategory(catId).filter(t => t.id !== toolId);

  return (
    <div className="tool-workspace">
      {/* Breadcrumbs */}
      <div className="tool-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem' }}>
          <a href="/" style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }} onClick={(e) => { e.preventDefault(); navigate('/'); }}>Home</a>
          <span>/</span>
          <a href={`/${catId}`} style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }} onClick={(e) => { e.preventDefault(); navigate(`/${catId}`); }}>{cat?.name}</a>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{tool.title}</span>
        </div>

        <h1 className="tool-workspace-title">{seo.h1}</h1>
        <p className="tool-workspace-desc">{seo.subtitle}</p>
      </div>

      {/* Main Interactive Tool Component (Zero Ads Above Tool) */}
      <div style={{ marginTop: '1.5rem', marginBottom: '2.5rem' }}>
        <ToolComponent />
      </div>

      {/* Structured SEO Guide & Feature Card */}
      <section className="tool-seo-section" style={{
        marginTop: '3rem',
        padding: '2rem',
        backgroundColor: 'var(--bg-elevated)',
        borderRadius: '14px',
        border: '1px solid var(--border-main)'
      }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', letterSpacing: '-0.02em' }}>
          <CheckCircle2 size={20} color="#22c55e" /> About {tool.title} & Technical Overview
        </h2>
        <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: '1.5rem' }}>
          {seo.description || tool.desc} Unlike traditional online file converters that transmit your files to remote cloud servers, ToolHero executes all calculations, compression algorithms, and transformations directly inside your web browser. Your confidential files never touch an external server, eliminating privacy risks and data transfer delays.
        </p>

        {/* 4-Step How To Guide */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem' }}>
          How to Use {tool.title}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem', marginBottom: '2rem' }}>
          <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', display: 'block', marginBottom: '0.3rem' }}>STEP 1</span>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>Select File or Input</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
              Drag and drop your document, paste text, or select your target file from your local device storage.
            </p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', display: 'block', marginBottom: '0.3rem' }}>STEP 2</span>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>Configure Parameters</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
              Customize options, target dimensions, compression ratios, quality presets, or encryption keys.
            </p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', display: 'block', marginBottom: '0.3rem' }}>STEP 3</span>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>Client-Side Execution</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
              Your device CPU processes the file in memory using native HTML5, WebAssembly, and Canvas APIs.
            </p>
          </div>
          <div style={{ padding: '1rem', borderRadius: '10px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent)', display: 'block', marginBottom: '0.3rem' }}>STEP 4</span>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', fontWeight: 700 }}>Download Result</span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', marginTop: '0.35rem', lineHeight: 1.5 }}>
              Save your converted, compressed, or generated file immediately without waiting for server queues.
            </p>
          </div>
        </div>

        {/* Technical Architecture & Specifications Section */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={18} color="var(--accent)" /> Technical Architecture & Privacy Standards
        </h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          ToolHero operates on a zero-upload security model. By taking advantage of modern browser capabilities—including the HTML5 File API, Web Workers for multi-threaded processing, and hardware-accelerated Canvas2D pipelines—files are parsed directly in your device RAM. No intermediate files are written to remote disks, preventing server data leakage and eliminating network latency.
        </p>

        {/* Technical Specs Table */}
        <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'var(--bg-card)', borderBottom: '2px solid var(--border-main)' }}>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', fontWeight: 700 }}>Specification</th>
                <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', fontWeight: 700 }}>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--border-main)' }}>
                <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Processing Engine</td>
                <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)' }}>100% Client-Side In-Memory (JavaScript / HTML5 Web APIs)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-main)' }}>
                <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Data Privacy Level</td>
                <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)' }}>Zero Server Exposure — No logs, no telemetry, no cloud storage</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-main)' }}>
                <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Supported Platforms</td>
                <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)' }}>Chrome, Safari, Firefox, Edge, Android & iOS Mobile Browsers</td>
              </tr>
              <tr style={{ borderBottom: '1px solid var(--border-main)' }}>
                <td style={{ padding: '0.65rem 0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Compliance Standards</td>
                <td style={{ padding: '0.65rem 0.85rem', color: 'var(--text-secondary)' }}>GDPR, CCPA & HIPAA friendly (data never crosses external boundaries)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pro Tips & Best Practices Box */}
        <div style={{
          padding: '1.25rem',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '10px',
          borderLeft: '4px solid #3b82f6',
          marginBottom: '2rem'
        }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Lightbulb size={16} color="#3b82f6" /> Professional Best Practices
          </h4>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
            <li><strong>Preserve Master Copies:</strong> Always keep a copy of your original high-resolution files before applying aggressive lossy compression.</li>
            <li><strong>Batch Processing Efficiency:</strong> Because computations run on your CPU, closing heavy background browser tabs will noticeably accelerate processing on large multi-megabyte files.</li>
            <li><strong>Mobile & Desktop Parity:</strong> ToolHero is fully responsive and touch-friendly, allowing you to edit and convert files directly on smartphones without installing separate third-party apps.</li>
          </ul>
        </div>

        {/* Security Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={16} color="#3b82f6" /> 100% Private & Local
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No server uploads. Data never leaves your web browser.</div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={16} color="#eab308" /> Lightning Speed
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No network transfer delays. Processed in milliseconds.</div>
          </div>

          <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-main)' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Lock size={16} color="#a855f7" /> Unlimited Free Usage
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>No accounts, sign-ups, or usage limits required.</div>
          </div>
        </div>
      </section>

      {/* FAQ Component */}
      {seo.faqs && <FaqSection faqs={seo.faqs} />}

      {/* Internal Linking Related Tools Cluster */}
      {siblingTools.length > 0 && (
        <section style={{ marginTop: '2.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--accent)" /> Related {cat?.name}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {siblingTools.slice(0, 6).map(st => (
              <a
                key={st.id}
                href={`/${catId}/${st.id}`}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-main)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
                onClick={(e) => { e.preventDefault(); navigate(`/${catId}/${st.id}`); }}
              >
                <span style={{ color: 'var(--accent)' }}>→</span> {st.title}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Compliant In-Article Bottom Ad Slot */}
      <div style={{ marginTop: '2.5rem' }}>
        <AdBanner slotType="leaderboard" />
      </div>
    </div>
  );
}

/* ─────────── Interactive FAQ Accordion Component ─────────── */
function FaqSection({ faqs }) {
  const [openIndex, setOpenIndex] = useState(0);

  if (!faqs || faqs.length === 0) return null;

  return (
    <section style={{ marginTop: '3rem' }}>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <HelpCircle size={18} color="#a855f7" /> Frequently Asked Questions
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {faqs.map((f, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={i}
              style={{
                borderRadius: '8px',
                border: '1px solid var(--border-main)',
                backgroundColor: 'var(--bg-elevated)',
                overflow: 'hidden',
                transition: 'all 0.2s ease'
              }}
            >
              <button
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.92rem',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
                onClick={() => setOpenIndex(isOpen ? -1 : i)}
              >
                <span>{f.q}</span>
                {isOpen ? <ChevronUp size={16} color="var(--text-tertiary)" /> : <ChevronDown size={16} color="var(--text-tertiary)" />}
              </button>
              {isOpen && (
                <div style={{ padding: '0 1.25rem 1rem 1.25rem', fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.6, borderTop: '1px solid var(--border-main)', paddingTop: '0.75rem' }}>
                  {f.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ─────────── 404 Page Not Found Component ─────────── */
function NotFoundPage({ navigate }) {
  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--accent)', lineHeight: 1, marginBottom: '1rem' }}>404</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem' }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.6 }}>
        The requested URL does not exist or has been moved. Explore our 36+ free online tools for PDF, images, text, and security below.
      </p>
      <button className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }} onClick={() => navigate('/')}>
        Go to Homepage
      </button>
    </div>
  );
}

