'use client';

import React, { useState, useRef } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Sparkles, Sliders, ToggleLeft, Layers, ShieldCheck, Eye } from 'lucide-react';

export function LiquidGlassShowcase() {
  const { language } = useI18n();

  // Controls state
  const [scaleMode, setScaleMode] = useState<'macro' | 'native'>('macro');
  const [accentColor, setAccentColor] = useState<string>('#007aff');
  const [macroToggleChecked, setMacroToggleChecked] = useState<boolean>(true);
  const [macroSliderVal, setMacroSliderVal] = useState<number>(56.3);
  const [isUltraClear, setIsUltraClear] = useState(true);
  const [glassAmount, setGlassAmount] = useState(0); // 0 = ultra clear, 100 = tinted
  const [activeSegment, setActiveSegment] = useState<'all' | 'national' | 'regional'>('all');
  const [isLiveCount, setIsLiveCount] = useState(true);

  const sliderTrackRef = useRef<HTMLDivElement>(null);

  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setMacroSliderVal(Math.round(pos * 1000) / 10);
  };

  const handleSliderMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 || !sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setMacroSliderVal(Math.round(pos * 1000) / 10);
  };

  const handleContinuousSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setGlassAmount(val);
    document.documentElement.style.setProperty('--lg-glass-amount', String(val / 100));
  };

  const toggleUltraClear = () => {
    const next = !isUltraClear;
    setIsUltraClear(next);
    const newAmount = next ? 0 : 80;
    setGlassAmount(newAmount);
    document.documentElement.style.setProperty('--lg-glass-amount', String(newAmount / 100));
  };

  const accentColors = [
    { name: 'Apple Blue', hex: '#007aff' },
    { name: 'Forest Green', hex: '#34c759' },
    { name: 'Royal Purple', hex: '#af52de' },
    { name: 'Sunset Orange', hex: '#ff9500' },
    { name: 'Coral Red', hex: '#ff3b30' },
  ];

  return (
    <section className="relative my-10 sm:my-16 overflow-hidden rounded-3xl p-6 sm:p-10 border border-white/25 shadow-2xl">
      {/* Media Rich Vivid Backdrop (Apple WWDC Condition for Crystal Clear Glass) */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background: `
            radial-gradient(45% 45% at 15% 15%, rgba(245, 158, 11, 0.40) 0%, transparent 65%),
            radial-gradient(50% 50% at 85% 15%, rgba(59, 130, 246, 0.45) 0%, transparent 65%),
            radial-gradient(45% 45% at 50% 85%, rgba(236, 72, 153, 0.32) 0%, transparent 65%),
            radial-gradient(45% 45% at 15% 80%, rgba(16, 185, 129, 0.35) 0%, transparent 65%),
            linear-gradient(145deg, rgba(20, 26, 40, 0.90) 0%, rgba(10, 14, 24, 0.98) 100%)
          `,
        }}
      />

      <div className="max-w-4xl mx-auto space-y-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/15">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'hi' ? '3D लिक्विड ग्लास भौतिकी इंजन' : '3D Liquid Glass Physics Engine'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {language === 'hi' ? '100% क्रिस्टल-क्लियर लिक्विड ग्लास' : '100% Crystal-Clear Liquid Glass Optics'}
            </h2>
            <p className="text-xs sm:text-sm text-white/80 max-w-xl">
              {language === 'hi'
                ? 'स्नेल के अपवर्तन नियम, स्पेक्युलर रिम हाइलाइट्स और शून्य दूधियापन के साथ शुद्ध ऑप्टिकल स्पष्टता।'
                : "Powered by Snell's Law downward refraction, procedural SDF displacement maps, and ultra-clear optical transparency."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-white/80 font-semibold hidden sm:inline">
              {isUltraClear ? (language === 'hi' ? 'अल्ट्रा-क्लियर' : 'Ultra-Clear') : (language === 'hi' ? 'टिन्टेड' : 'Tinted')}
            </span>
            <button
              onClick={toggleUltraClear}
              className="lg-toggle"
              role="switch"
              aria-checked={isUltraClear}
              aria-label="Toggle Ultra Clear Glass"
              title="Toggle Ultra Clear Glass"
            >
              <span className="lg-toggle-track">
                <span
                  className="lg-toggle-track-accent"
                  style={{ opacity: isUltraClear ? 1 : 0 }}
                />
              </span>
              <span
                className="lg-toggle-thumb lg-surface"
                data-lg-variant="clear"
                style={{
                  transform: isUltraClear
                    ? 'translateX(30px) translateY(-50%)'
                    : 'translateX(0px) translateY(-50%)',
                  transition: 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </button>
          </div>
        </div>

        {/* Apple WWDC 1:1 Reference Stage */}
        <div className="apple-keynote-stage">
          <div className="apple-stage-header">
            <span className="apple-badge">
              <Sparkles className="w-3 h-3 inline mr-1" />
              WWDC Reference Parity
            </span>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              {language === 'hi' ? 'एप्पल लिक्विड ग्लास: टॉगल और स्लाइडर' : 'Apple Liquid Glass: Toggle & Slider'}
            </h3>
            <p className="apple-stage-desc">
              {language === 'hi'
                ? '100% क्रिस्टल-क्लियर ऑप्टिकल ग्लास, स्नेल डाउनवर्ड रिफ्रैक्शन, 3D स्टेडियम बेवेल और स्पेक्ट्रल फैलाव।'
                : '100% crystal-clear optical glass, Snell downward refraction streams, continuous 3D stadium bevels, and multi-spectral dispersion caustics.'}
            </p>

            {/* Stage Controls Toolbar */}
            <div className="apple-controls-row">
              <div className="apple-mode-pills">
                <button
                  type="button"
                  onClick={() => setScaleMode('macro')}
                  className={`apple-mode-btn ${scaleMode === 'macro' ? 'active' : ''}`}
                >
                  2.5x Keynote Macro Scale
                </button>
                <button
                  type="button"
                  onClick={() => setScaleMode('native')}
                  className={`apple-mode-btn ${scaleMode === 'native' ? 'active' : ''}`}
                >
                  1x iOS Native Scale
                </button>
              </div>

              {/* Accent Color Swatches */}
              <div className="apple-color-pills" role="radiogroup" aria-label="Track Accent Color">
                {accentColors.map((col) => (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => setAccentColor(col.hex)}
                    className={`apple-color-swatch ${accentColor === col.hex ? 'active' : ''}`}
                    style={{ ['--swatch-color' as string]: col.hex }}
                    title={col.name}
                    aria-label={col.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Stage View */}
          {scaleMode === 'macro' ? (
            /* 2.5x Keynote Macro Scale */
            <div className="apple-showcase-grid">
              {/* Macro Keynote Toggle */}
              <div className="apple-card">
                <div className="apple-card-label">
                  Macro Keynote Toggle (256×136px)
                </div>
                <div className="apple-card-stage">
                  <div
                    className={`macro-toggle ${macroToggleChecked ? 'checked hero-flared' : ''}`}
                    role="switch"
                    aria-checked={macroToggleChecked}
                    tabIndex={0}
                    onClick={() => setMacroToggleChecked(!macroToggleChecked)}
                    onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && setMacroToggleChecked(!macroToggleChecked)}
                  >
                    {/* Unified 1:1 Apple Keynote Photorealistic Liquid Glass Toggle Assembly */}
                    <svg className="macro-toggle-flared-svg" viewBox="0 0 534 284" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <filter id="trackFloorShadow_macro_showcase" x="-30%" y="-30%" width="160%" height="170%">
                          <feDropShadow dx="0" dy="12" stdDeviation="15" floodColor="rgba(20, 80, 20, 0.20)"/>
                          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="rgba(0, 0, 0, 0.04)"/>
                        </filter>
                        <filter id="crescentBlur_macro_showcase" x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="6.5"/>
                        </filter>
                        <filter id="causticGlow_macro_showcase" x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="8.0"/>
                        </filter>
                        <filter id="cyanGlow_macro_showcase" x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="3.5" result="blur"/>
                          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                        </filter>
                        <linearGradient id="greenTrackGrad_macro_showcase" x1="100" y1="52" x2="100" y2="232" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#67cb5b"/>
                          <stop offset="55%" stopColor="#5dc250"/>
                          <stop offset="100%" stopColor="#52b844"/>
                        </linearGradient>
                        <clipPath id="glassCapsuleClip_macro_showcase">
                          <rect x="100" y="17" width="420" height="250" rx="125"/>
                        </clipPath>
                        <linearGradient id="topArmMaskGrad_macro_showcase" x1="145" y1="0" x2="235" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#000000"/>
                          <stop offset="30%" stopColor="#444444"/>
                          <stop offset="70%" stopColor="#aaaaaa"/>
                          <stop offset="100%" stopColor="#ffffff"/>
                        </linearGradient>
                        <linearGradient id="botArmMaskGrad_macro_showcase" x1="150" y1="0" x2="230" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#000000"/>
                          <stop offset="30%" stopColor="#444444"/>
                          <stop offset="70%" stopColor="#aaaaaa"/>
                          <stop offset="100%" stopColor="#ffffff"/>
                        </linearGradient>
                        <mask id="uBevelMask_macro_showcase" maskUnits="userSpaceOnUse">
                          <rect x="230" y="0" width="310" height="284" fill="#ffffff"/>
                          <rect x="100" y="0" width="135" height="142" fill="url(#topArmMaskGrad_macro_showcase)"/>
                          <rect x="100" y="142" width="135" height="142" fill="url(#botArmMaskGrad_macro_showcase)"/>
                        </mask>
                        <linearGradient id="topLimeFlare_macro_showcase" x1="140" y1="0" x2="380" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#5a8215" stopOpacity="0.9"/>
                          <stop offset="16%" stopColor="#8ab222" stopOpacity="0.95"/>
                          <stop offset="36%" stopColor="#cee640" stopOpacity="0.98"/>
                          <stop offset="62%" stopColor="#eff6b0" stopOpacity="1.0"/>
                          <stop offset="88%" stopColor="#ffffff" stopOpacity="1.0"/>
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="1.0"/>
                        </linearGradient>
                        <linearGradient id="topArmVert_macro_showcase" x1="0" y1="17" x2="0" y2="72" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#244812" stopOpacity="0.98"/>
                          <stop offset="14%" stopColor="#406e1c" stopOpacity="0.98"/>
                          <stop offset="32%" stopColor="#7ea82c" stopOpacity="0.98"/>
                          <stop offset="55%" stopColor="#bcd260" stopOpacity="0.98"/>
                          <stop offset="80%" stopColor="#ecf4ca" stopOpacity="1.0"/>
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="1.0"/>
                        </linearGradient>
                        <linearGradient id="botCyanFlareGrad_macro_showcase" x1="160" y1="0" x2="480" y2="0" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.0"/>
                          <stop offset="12%" stopColor="#ffffff" stopOpacity="0.7"/>
                          <stop offset="30%" stopColor="#a6eefc" stopOpacity="1.0"/>
                          <stop offset="58%" stopColor="#18c6ea" stopOpacity="1.0"/>
                          <stop offset="82%" stopColor="#5ed4ee" stopOpacity="0.8"/>
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0"/>
                        </linearGradient>
                        <linearGradient id="rightCyanHalo_macro_showcase" x1="430" y1="50" x2="520" y2="142" gradientUnits="userSpaceOnUse">
                          <stop offset="0%" stopColor="rgba(140, 230, 250, 0.35)"/>
                          <stop offset="55%" stopColor="rgba(175, 244, 255, 0.95)"/>
                          <stop offset="100%" stopColor="rgba(140, 230, 250, 0.45)"/>
                        </linearGradient>
                        <clipPath id="uBevelShape_macro_showcase">
                          <path d="M 120 72 L 120 17 L 395 17 A 125 125 0 0 1 395 267 L 120 267 L 120 212 L 350 212 A 70 70 0 0 0 350 72 Z"/>
                        </clipPath>
                      </defs>

                      {/* Green Base Track Capsule */}
                      <rect x="16" y="52" width="424" height="180" rx="90" fill="url(#greenTrackGrad_macro_showcase)" filter="url(#trackFloorShadow_macro_showcase)"/>

                      {/* Specular bevel */}
                      <path d="M 106 52 L 350 52 A 88 88 0 0 1 436 136 A 86 86 0 0 0 350 56 L 106 56 A 86 86 0 0 0 20 142 A 90 90 0 0 1 106 52 Z" fill="rgba(255, 255, 255, 0.18)"/>

                      {/* Liquid Glass Thumb */}
                      <g clipPath="url(#glassCapsuleClip_macro_showcase)">
                        <rect x="100" y="17" width="420" height="250" rx="125" fill="rgba(255, 255, 255, 0.05)"/>
                        <path d="M 185 22 A 125 125 0 0 0 100 142 A 125 125 0 0 0 185 262" stroke="rgba(8, 42, 12, 0.46)" strokeWidth="20" strokeLinecap="round" fill="none" filter="url(#crescentBlur_macro_showcase)"/>
                        <ellipse cx="205" cy="48" rx="65" ry="32" fill="#cee63a" opacity="0.85" filter="url(#causticGlow_macro_showcase)"/>
                        <g clipPath="url(#uBevelShape_macro_showcase)" mask="url(#uBevelMask_macro_showcase)">
                          <rect x="100" y="0" width="440" height="284" fill="#ffffff"/>
                          <rect x="100" y="17" width="430" height="57" fill="url(#topArmVert_macro_showcase)"/>
                          <rect x="100" y="17" width="430" height="57" fill="url(#topLimeFlare_macro_showcase)" style={{ mixBlendMode: 'multiply' }}/>
                          <rect x="100" y="212" width="430" height="55" fill="linear-gradient(180deg, #ffffff 0%, #ffffff 70%, #dff4e0 100%)"/>
                        </g>
                        <path d="M 165 264.5 L 395 264.5 A 122.5 122.5 0 0 0 495 215" stroke="url(#botCyanFlareGrad_macro_showcase)" strokeWidth="7.5" strokeLinecap="round" fill="none"/>
                        <path d="M 195 18.2 L 395 18.2 A 123.8 123.8 0 0 1 518.8 142" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" fill="none"/>
                        <path d="M 175 265.8 L 395 265.8 A 123.8 123.8 0 0 0 514 185" stroke="#ffffff" strokeWidth="2.0" strokeLinecap="round" fill="none"/>
                        <path d="M 435 44 A 123 123 0 0 1 435 240" stroke="url(#rightCyanHalo_macro_showcase)" strokeWidth="7.5" strokeLinecap="round" fill="none" filter="url(#cyanGlow_macro_showcase)"/>
                        <path d="M 435 44 A 123 123 0 0 1 435 240" stroke="#a4f0fd" strokeWidth="2.6" strokeLinecap="round" fill="none"/>
                      </g>
                    </svg>

                    <div className="macro-toggle-thumb" />
                  </div>
                </div>
                <div className="apple-card-caption">
                  <span>1:1 Keynote Scale (256×136px) • Tap to switch states</span>
                </div>
              </div>

              {/* Macro Keynote Slider */}
              <div className="apple-card">
                <div className="apple-card-label">
                  Macro Keynote Slider (132.5×77.5px)
                </div>
                <div className="apple-card-stage">
                  <div
                    ref={sliderTrackRef}
                    className="macro-slider"
                    tabIndex={0}
                    onClick={handleSliderClick}
                    onMouseMove={handleSliderMouseMove}
                  >
                    <span className="macro-slider-track" />
                    <span
                      className="macro-slider-fill"
                      style={{ width: `${macroSliderVal}%`, background: accentColor }}
                    />
                    <span
                      className="macro-slider-thumb glass"
                      style={{ left: `calc(${macroSliderVal}% - 66.25px)` }}
                    >
                      <svg className="lens-overlay" viewBox="0 0 132.5 77.5" fill="none">
                        <defs>
                          <linearGradient id="prismMacro_showcase" x1="40" y1="76.25" x2="90" y2="76.25" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#ff5533" stopOpacity="0.95"/>
                            <stop offset="18%" stopColor="#ffa015" stopOpacity="0.98"/>
                            <stop offset="38%" stopColor="#ffd020" stopOpacity="0.98"/>
                            <stop offset="58%" stopColor="#90f535" stopOpacity="0.95"/>
                            <stop offset="78%" stopColor="#30e5ff" stopOpacity="0.90"/>
                            <stop offset="92%" stopColor="#0088ff" stopOpacity="0.75"/>
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0"/>
                          </linearGradient>
                          <linearGradient id="streamMacro_showcase" x1="0" y1="47.5" x2="67.5" y2="76.25" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor={accentColor} stopOpacity="0.98"/>
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.9"/>
                          </linearGradient>
                          <linearGradient id="rimSliderMacro_showcase" x1="66.25" y1="0" x2="66.25" y2="77.5" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95"/>
                            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.15"/>
                            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.92"/>
                          </linearGradient>
                        </defs>
                        <path d="M 1.1 47.5 C 3.0 57.5 10.5 67.5 23.75 73.7 C 36.25 76.5 47.5 76.5 67.5 76.5 C 67.5 73.25 55 73.25 43.75 73.25 C 30 73.25 18.75 68 11.25 60 C 6 54 3.0 49.5 1.1 47.5 Z" fill="url(#streamMacro_showcase)"/>
                        <path d="M 40 76.5 L 90 76.5 C 90 73.25 80 73.25 65 73.25 L 40 73.25 Z" fill="url(#prismMacro_showcase)"/>
                        <path d="M 35 5.5 Q 66.25 10.0 97.5 5.5" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="2.0" strokeLinecap="round"/>
                        <rect x="0.93" y="0.93" width="130.64" height="75.64" rx="37.82" stroke="url(#rimSliderMacro_showcase)" strokeWidth="1.87"/>
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="apple-card-caption">
                  <span>Drag or click along the track ({macroSliderVal}%)</span>
                </div>
              </div>
            </div>
          ) : (
            /* 1x iOS Native Scale */
            <div className="apple-showcase-grid">
              <div className="apple-card">
                <div className="apple-card-label">Native Liquid Glass Toggle (72×30px)</div>
                <div className="apple-card-stage">
                  <button
                    className="lg-toggle"
                    role="switch"
                    aria-checked={isUltraClear}
                    onClick={toggleUltraClear}
                  >
                    <span className="lg-toggle-track" style={{ background: isUltraClear ? accentColor : undefined }}>
                      <span className="lg-toggle-track-accent" style={{ opacity: isUltraClear ? 1 : 0 }} />
                    </span>
                    <span
                      className="lg-toggle-thumb lg-surface"
                      data-lg-variant="clear"
                      style={{
                        transform: isUltraClear ? 'translateX(30px) translateY(-50%)' : 'translateX(0px) translateY(-50%)',
                        transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    />
                  </button>
                </div>
                <div className="apple-card-caption">1x Native iOS Scale • Spring Lateral Translation</div>
              </div>

              <div className="apple-card">
                <div className="apple-card-label">Native Liquid Glass Slider</div>
                <div className="apple-card-stage">
                  <div className="lg-slider" role="slider" aria-valuenow={glassAmount} style={{ width: '100%', maxWidth: '320px' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={glassAmount}
                      onChange={handleContinuousSliderChange}
                      className="w-full accent-[var(--accent)] cursor-pointer"
                    />
                  </div>
                </div>
                <div className="apple-card-caption">Continuous Glass Amount Slider: {glassAmount}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Live Multi-Component Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Interactive Segmented View Controller */}
          <div
            className="lg-card lg-surface p-5 space-y-4 rounded-2xl"
            data-lg-variant="clear"
          >
            <div className="flex items-center gap-2 text-white">
              <Layers className="w-4 h-4 text-cyan-300" />
              <h3 className="text-sm font-bold tracking-tight">
                {language === 'hi' ? 'लिक्विड सेगमेंटेड कंट्रोल' : 'Liquid Segmented Control'}
              </h3>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {language === 'hi'
                ? 'स्प्रिंग फिजिक्स के साथ दृश्य बदलें:'
                : 'Spring-driven lateral pill with elastic bridge:'}
            </p>
            <div className="flex p-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20 gap-1">
              {(['all', 'national', 'regional'] as const).map((seg) => (
                <button
                  key={seg}
                  onClick={() => setActiveSegment(seg)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-full transition-all duration-200 select-none ${
                    activeSegment === seg
                      ? 'bg-white/30 text-white shadow-md border border-white/40 backdrop-blur-lg scale-100'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {seg === 'all'
                    ? language === 'hi' ? 'सभी' : 'All'
                    : seg === 'national'
                    ? language === 'hi' ? 'राष्ट्रीय' : 'National'
                    : language === 'hi' ? 'क्षेत्रीय' : 'Regional'}
                </button>
              ))}
            </div>
          </div>

          {/* Card 2: Interactive Glass Opacity / Amount Slider */}
          <div
            className="lg-card lg-surface p-5 space-y-4 rounded-2xl"
            data-lg-variant="clear"
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-300" />
                <h3 className="text-sm font-bold tracking-tight">
                  {language === 'hi' ? 'ग्लास स्लाइडर (iOS 27)' : 'Liquid Glass Slider'}
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-300">
                {glassAmount}%
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {language === 'hi'
                ? 'अल्ट्रा-क्लियर (0%) से टिन्टेड (100%) तक नियंत्रण:'
                : 'Adjust between Ultra-Clear (0%) and Tinted Glass (100%):'}
            </p>
            <div className="space-y-2 pt-1">
              <input
                type="range"
                min="0"
                max="100"
                value={glassAmount}
                onChange={handleContinuousSliderChange}
                className="w-full accent-[var(--accent)] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/60 font-semibold">
                <span>0% {language === 'hi' ? 'क्रिस्टल क्लियर' : 'Crystal Clear'}</span>
                <span>100% {language === 'hi' ? 'टिन्टेड' : 'Tinted'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Live Count Auto-Refresh Switch */}
          <div
            className="lg-card lg-surface p-5 space-y-4 rounded-2xl"
            data-lg-variant="clear"
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <ToggleLeft className="w-4 h-4 text-emerald-300" />
                <h3 className="text-sm font-bold tracking-tight">
                  {language === 'hi' ? 'लाइव स्ट्रीम टॉगल' : 'Live Stream Toggle'}
                </h3>
              </div>
              <span
                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  isLiveCount
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                    : 'bg-white/10 text-white/60'
                }`}
              >
                {isLiveCount ? 'LIVE' : 'PAUSED'}
              </span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {language === 'hi'
                ? 'स्वचालित वास्तविक समय मतगणना स्ट्रीम:'
                : 'Real-time voting tally broadcast synchronization:'}
            </p>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-white/90 font-medium">
                {isLiveCount
                  ? language === 'hi' ? 'लाइव मतगणना सक्रिय' : 'Counting Active (4s)'
                  : language === 'hi' ? 'गणना रोकी गई' : 'Polling Suspended'}
              </span>
              <button
                onClick={() => setIsLiveCount(!isLiveCount)}
                className="lg-toggle"
                role="switch"
                aria-checked={isLiveCount}
                aria-label="Toggle Live Counting"
              >
                <span className="lg-toggle-track">
                  <span
                    className="lg-toggle-track-accent"
                    style={{
                      background: '#10b981',
                      opacity: isLiveCount ? 1 : 0,
                    }}
                  />
                </span>
                <span
                  className="lg-toggle-thumb lg-surface"
                  data-lg-variant="clear"
                  style={{
                    transform: isLiveCount
                      ? 'translateX(30px) translateY(-50%)'
                      : 'translateX(0px) translateY(-50%)',
                    transition: 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Optical Clearness Guarantee Banner */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0 shadow-sm">
              <Eye className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <span className="font-bold block text-sm">
                {language === 'hi' ? 'शून्य धुंधलापन आश्वासन' : 'Zero Haze, Genuine Optical Clearness'}
              </span>
              <span className="text-white/75">
                {language === 'hi'
                  ? 'यह 2020 का पुराना फ्रॉस्टेड ग्लास नहीं है — यह वास्तविक प्रकाश अपवर्तन और 100% पारदर्शी लिक्विड ग्लास है।'
                  : 'Reads as clear first, frosted second. Light bends through the edges while background colors radiate through.'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-emerald-300">
              {language === 'hi' ? 'सत्यापित पारदर्शी' : 'Verified Clearness'}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
