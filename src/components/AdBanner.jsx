import React, { useEffect, useRef } from 'react';

// SET YOUR GOOGLE ADSENSE PUBLISHER ID HERE
const ADSENSE_PUB_ID = 'ca-pub-2691426644583765';

export default function AdBanner({ slotId, slotType = 'leaderboard', label = 'ADVERTISEMENT' }) {
  const containerRef = useRef(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!ADSENSE_PUB_ID || pushedRef.current) return;

    let frameId;
    const tryPushAd = () => {
      if (pushedRef.current) return;
      const el = containerRef.current;
      if (el && el.offsetWidth > 0) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          pushedRef.current = true;
        } catch (e) {
          // Silently handle AdSense runtime initialization in headless or bot test environments
        }
      }
    };

    frameId = requestAnimationFrame(tryPushAd);

    return () => cancelAnimationFrame(frameId);
  }, [slotType, slotId]);

  // If real AdSense Publisher ID is set, render real Google AdSense unit
  if (ADSENSE_PUB_ID) {
    const insProps = {
      className: 'adsbygoogle',
      style: { display: 'block' },
      'data-ad-client': ADSENSE_PUB_ID,
      'data-ad-format': 'auto',
      'data-full-width-responsive': 'true'
    };

    if (slotId) {
      insProps['data-ad-slot'] = slotId;
    }

    return (
      <div className="ad-banner-slot" ref={containerRef} style={{ overflow: 'hidden', minHeight: '90px' }}>
        <span className="ad-label">{label}</span>
        <ins {...insProps} />
      </div>
    );
  }

  // Development Placeholder Mode
  return (
    <div className="ad-banner-slot" data-ad-slot={slotType}>
      <span className="ad-label">{label}</span>
      <div className="ad-content-placeholder">
        {slotType === 'leaderboard' && (
          <span style={{ opacity: 0.6 }}>AdSense Responsive Leaderboard Unit (728x90 / Auto)</span>
        )}
        {slotType === 'rectangle' && (
          <span style={{ opacity: 0.6 }}>AdSense Medium Rectangle Unit (300x250)</span>
        )}
        {slotType === 'banner' && (
          <span style={{ opacity: 0.6 }}>Sponsored Content Partner Slot</span>
        )}
      </div>
    </div>
  );
}
