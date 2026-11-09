import React, { useEffect, useState } from 'react';
import './ScenicBackground.css';

/**
 * Realistic Scenic Background featuring layered sky, drifting clouds,
 * sharp snow-capped mountains, atmospheric mist, and dense evergreen forest canopies
 * with scroll-driven parallax depth.
 */
export default function ScenicBackground({ timeOfDay = 'day' }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className={`scenic-wrapper scenic-mode-${timeOfDay}`} aria-hidden="true">
      {/* Dynamic Sky Gradient & Sun Glow */}
      <div
        className="scenic-layer layer-sky"
        style={{ transform: `translate3d(0, ${scrollY * 0.05}px, 0)` }}
      >
        <div className="sun-disc"></div>
        <div className="sun-corona"></div>
        <div className="sun-light-beams"></div>
      </div>

      {/* Cloud Layer 1: High Cirrus Clouds */}
      <div
        className="scenic-layer layer-clouds-high"
        style={{ transform: `translate3d(0, ${scrollY * 0.1}px, 0)` }}
      >
        <div className="cloud-drift-a"></div>
      </div>

      {/* Cloud Layer 2: Mid Atmospheric Cumulus */}
      <div
        className="scenic-layer layer-clouds-mid"
        style={{ transform: `translate3d(0, ${scrollY * 0.16}px, 0)` }}
      >
        <div className="cloud-drift-b"></div>
      </div>

      {/* Far Snow-Capped Mountain Range with Jagged Peaks & Snowfields */}
      <div
        className="scenic-layer layer-mountains-far"
        style={{ transform: `translate3d(0, ${scrollY * 0.22}px, 0)` }}
      >
        <svg
          className="mountain-svg"
          viewBox="0 0 1920 620"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mtnFarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#819bb0" stopOpacity="0.85" />
              <stop offset="45%" stopColor="#4f6e87" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#1e3a4e" stopOpacity="1" />
            </linearGradient>
            <linearGradient id="snowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#dbeafe" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Far Mountain Ridges */}
          <path
            d="M 0 420 L 120 340 L 280 430 L 410 260 L 520 360 L 670 210 L 780 320 L 960 160 L 1120 310 L 1280 190 L 1440 330 L 1600 240 L 1750 350 L 1920 280 L 1920 620 L 0 620 Z"
            fill="url(#mtnFarGrad)"
          />

          {/* Snow Glaciers on Peaks */}
          {/* Peak 1: 410, 260 */}
          <polygon points="410,260 380,305 405,295 418,310 440,298" fill="url(#snowGrad)" />
          {/* Peak 2: 670, 210 */}
          <polygon points="670,210 635,265 660,250 675,270 705,255" fill="url(#snowGrad)" />
          {/* Main Summit: 960, 160 */}
          <polygon points="960,160 910,230 945,215 965,240 990,220 1020,238" fill="url(#snowGrad)" />
          {/* Peak 4: 1280, 190 */}
          <polygon points="1280,190 1235,250 1265,238 1285,258 1320,242" fill="url(#snowGrad)" />
          {/* Peak 5: 1600, 240 */}
          <polygon points="1600,240 1565,285 1590,275 1610,292 1640,280" fill="url(#snowGrad)" />
        </svg>
      </div>

      {/* Atmospheric Mist Drift between Mountain Ridges */}
      <div
        className="scenic-layer layer-mist-high"
        style={{ transform: `translate3d(0, ${scrollY * 0.28}px, 0)` }}
      >
        <div className="mist-billow mist-1"></div>
      </div>

      {/* Mid Alpine Foothills & Pine Slopes */}
      <div
        className="scenic-layer layer-mountains-mid"
        style={{ transform: `translate3d(0, ${scrollY * 0.35}px, 0)` }}
      >
        <svg
          className="mountain-svg"
          viewBox="0 0 1920 540"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mtnMidGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#28534b" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#183d34" stopOpacity="0.98" />
              <stop offset="100%" stopColor="#0c261e" stopOpacity="1" />
            </linearGradient>
          </defs>
          <path
            d="M 0 350 Q 180 250 360 310 T 720 270 T 1080 320 T 1440 260 T 1760 330 Q 1840 310 1920 340 L 1920 540 L 0 540 Z"
            fill="url(#mtnMidGrad)"
          />
        </svg>
      </div>

      {/* Forest Layer 1: Distant Pine Ridges */}
      <div
        className="scenic-layer layer-forest-distant"
        style={{ transform: `translate3d(0, ${scrollY * 0.42}px, 0)` }}
      >
        <svg
          className="forest-svg"
          viewBox="0 0 1920 360"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="forestFarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#144635" />
              <stop offset="100%" stopColor="#0a251b" />
            </linearGradient>
          </defs>
          {/* Dense serrated pine tree treeline */}
          <path
            d="M 0 180 
              L 15 150 L 30 180 L 45 145 L 60 180 L 75 140 L 90 180 L 105 155 L 120 185
              L 140 145 L 160 185 L 175 135 L 195 185 L 210 140 L 230 185 L 245 150 L 265 185
              L 285 130 L 305 185 L 320 145 L 340 185 L 360 135 L 380 185 L 400 150 L 420 185
              L 440 130 L 460 185 L 480 145 L 500 185 L 520 135 L 540 185 L 560 145 L 580 185
              L 600 125 L 620 185 L 640 140 L 660 185 L 680 135 L 700 185 L 720 145 L 740 185
              L 760 120 L 780 185 L 800 140 L 820 185 L 840 130 L 860 185 L 880 145 L 900 185
              L 920 125 L 940 185 L 960 140 L 980 185 L 1000 130 L 1020 185 L 1040 145 L 1060 185
              L 1080 125 L 1100 185 L 1120 135 L 1140 185 L 1160 140 L 1180 185 L 1200 125 L 1220 185
              L 1240 135 L 1260 185 L 1280 140 L 1300 185 L 1320 120 L 1340 185 L 1360 145 L 1380 185
              L 1400 130 L 1420 185 L 1440 140 L 1460 185 L 1480 125 L 1500 185 L 1520 140 L 1540 185
              L 1560 125 L 1580 185 L 1600 145 L 1620 185 L 1640 135 L 1660 185 L 1680 145 L 1700 185
              L 1720 125 L 1740 185 L 1760 140 L 1780 185 L 1800 130 L 1820 185 L 1840 145 L 1860 185
              L 1880 130 L 1900 185 L 1920 140 L 1920 360 L 0 360 Z"
            fill="url(#forestFarGrad)"
          />
        </svg>
      </div>

      {/* Forest Valley Mist Drift */}
      <div
        className="scenic-layer layer-mist-forest"
        style={{ transform: `translate3d(0, ${scrollY * 0.48}px, 0)` }}
      >
        <div className="mist-billow mist-2"></div>
      </div>

      {/* Forest Layer 2: Near Canopy, Pine Spire Silhouettes & Lush Foliage */}
      <div
        className="scenic-layer layer-forest-near"
        style={{ transform: `translate3d(0, ${scrollY * 0.55}px, 0)` }}
      >
        <svg
          className="forest-svg-near"
          viewBox="0 0 1920 420"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="forestNearGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#09291b" />
              <stop offset="60%" stopColor="#061c12" />
              <stop offset="100%" stopColor="#03110a" />
            </linearGradient>
            <linearGradient id="leafAccentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Near lush pine spires with varying widths & branch crowns */}
          <path
            d="M 0 120 
              L 30 70 L 60 120 L 95 50 L 130 120 L 170 80 L 210 130 L 255 40 L 300 130
              L 345 65 L 390 130 L 440 45 L 490 130 L 535 75 L 580 130 L 635 35 L 690 130
              L 740 60 L 790 130 L 850 40 L 910 130 L 965 70 L 1020 130 L 1085 30 L 1150 130
              L 1205 65 L 1260 130 L 1320 40 L 1380 130 L 1435 70 L 1490 130 L 1555 35 L 1620 130
              L 1675 60 L 1730 130 L 1795 45 L 1860 130 L 1895 70 L 1920 110
              L 1920 420 L 0 420 Z"
            fill="url(#forestNearGrad)"
          />
          {/* Subtle canopy highlight overlay */}
          <path
            d="M 245 55 L 255 40 L 265 55 L 280 90 L 230 90 Z 
               M 625 50 L 635 35 L 645 50 L 660 85 L 610 85 Z
               M 1075 45 L 1085 30 L 1095 45 L 1110 80 L 1060 80 Z
               M 1545 50 L 1555 35 L 1565 50 L 1580 85 L 1530 85 Z"
            fill="url(#leafAccentGrad)"
          />
        </svg>
      </div>

      {/* Bottom Environmental Seamless Transition Gradient */}
      <div className="scenic-bottom-fade"></div>
    </div>
  );
}

