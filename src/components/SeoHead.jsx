import { useEffect } from 'react';

export default function SeoHead({
  title = 'ToolHero - Free Online PDF, Image, Text & Security Utilities',
  description = '36+ free in-browser online tools to compress images, trim audio, convert video to GIF, manage PDFs, audit hashes, create QR codes, and format code. 100% private and client-side.',
  canonicalUrl = 'https://toolhero.xyz/',
  keywords = 'free online tools, pdf compressor, passport photo maker, qr code generator, toolhero',
  jsonLd = null
}) {
  useEffect(() => {
    // 1. Update Document Title
    document.title = title;

    // Helper to set or update meta tag
    const setMetaTag = (selector, attr, attrValue, content) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // 2. Update Meta Description & Keywords
    setMetaTag('meta[name="description"]', 'name', 'description', description);
    setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);

    // 3. Update Open Graph Tags
    setMetaTag('meta[property="og:title"]', 'property', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', canonicalUrl);

    // 4. Update Canonical Link
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', canonicalUrl);

    // 5. Inject / Update JSON-LD Structured Data Schema
    let scriptElement = document.querySelector('script[type="application/ld+json"]#seo-schema');
    if (jsonLd) {
      if (!scriptElement) {
        scriptElement = document.createElement('script');
        scriptElement.setAttribute('type', 'application/ld+json');
        scriptElement.setAttribute('id', 'seo-schema');
        document.head.appendChild(scriptElement);
      }
      scriptElement.textContent = JSON.stringify(jsonLd);
    } else if (scriptElement) {
      scriptElement.remove();
    }
  }, [title, description, canonicalUrl, keywords, jsonLd]);

  return null;
}
