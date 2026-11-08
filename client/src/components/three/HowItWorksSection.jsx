import React, { useRef, useState, useEffect, Suspense, lazy } from 'react';
import useCanHandle3D from './useCanHandle3D';

// Lazy load the 3D Canvas bundle so it never blocks first paint
const Scene3D = lazy(() => import('./Scene3D'));
const HowItWorksScene = lazy(() => import('./HowItWorks3D'));

const STEPS = [
  {
    num: '01',
    title: 'Verify Identity',
    tag: 'Civic Authenticity',
    desc: 'Complete secure email verification and simulated Aadhaar eKYC. Transparent 1-citizen-1-vote guarantees every vote is genuine and democratic.'
  },
  {
    num: '02',
    title: 'Submit Petition',
    tag: 'Framing Your Demand',
    desc: 'State your goal with clarity, identify the responsible authority, attach ground evidence, and launch your campaign for administrative review.'
  },
  {
    num: '03',
    title: 'Collect Support',
    tag: 'Mobilizing Momentum',
    desc: 'Rally fellow citizens to cast verified votes in support. Watch momentum build in real time until authorities take decisive notice.'
  }
];

export default function HowItWorksSection() {
  const canHandle3D = useCanHandle3D();
  const wrapperRef = useRef(null);

  // Scroll progress from 0.0 to 1.0
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    if (!canHandle3D || !wrapperRef.current) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!wrapperRef.current) return;
          const rect = wrapperRef.current.getBoundingClientRect();
          const totalDistance = rect.height - window.innerHeight;
          const scrolled = -rect.top;
          const progress = Math.max(0, Math.min(1, scrolled / (totalDistance || 1)));
          setScrollProgress(progress);
          ticking = false;
        });
        ticking = true;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', handleScroll, { passive: true });
          handleScroll();
        } else {
          window.removeEventListener('scroll', handleScroll);
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(wrapperRef.current);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, [canHandle3D]);

  // If 3D is unsupported or on mobile screen (< 768px), render static 3-step cards
  if (!canHandle3D) {
    return (
      <section
        id="how-it-works"
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '5rem 0'
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Simple Process
            </span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              How PetitionPulse Works
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              From a single idea to city hall decisions, here is how you can mobilize community support in three easy steps.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}
          >
            {STEPS.map((step, idx) => (
              <div
                key={idx}
                style={{
                  padding: '2rem',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    background: idx === 2 ? 'var(--success)' : 'var(--primary)',
                    color: '#ffffff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.25rem',
                    marginBottom: '1.25rem'
                  }}
                >
                  {idx + 1}
                </div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>{step.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Active step index: 0, 1, or 2
  const activeIndex = scrollProgress < 0.33 ? 0 : scrollProgress < 0.66 ? 1 : 2;

  return (
    <div
      ref={wrapperRef}
      id="how-it-works"
      style={{
        height: '300vh',
        position: 'relative',
        backgroundColor: '#ffffff',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)'
      }}
    >
      {/* Sticky 100vh viewport */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden'
        }}
      >
        <div className="container" style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          {/* Left Column: Normal HTML text with opacity & translateY transitions */}
          <div style={{ flex: 1, paddingRight: '2rem', zIndex: 10 }}>
            <span
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              How It Works &bull; Step {activeIndex + 1} of 3
            </span>
            <h2 style={{ fontSize: '2.5rem', marginTop: '0.5rem', marginBottom: '2rem' }}>
              How PetitionPulse Works
            </h2>

            <div style={{ position: 'relative', minHeight: '220px' }}>
              {STEPS.map((step, idx) => {
                const isActive = activeIndex === idx;

                return (
                  <div
                    key={idx}
                    style={{
                      position: idx === 0 ? 'relative' : 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      opacity: isActive ? 1 : 0,
                      transform: isActive ? 'translateY(0px)' : 'translateY(16px)',
                      transition: 'opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1), transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
                      pointerEvents: isActive ? 'auto' : 'none'
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '0.2rem 0.6rem',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        marginBottom: '0.75rem'
                      }}
                    >
                      {step.tag}
                    </div>
                    <h3 style={{ fontSize: '1.8rem', marginBottom: '0.75rem', color: 'var(--secondary)' }}>
                      {step.title}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', lineHeight: 1.7, maxWidth: '440px' }}>
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Step navigation dots */}
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '2.5rem' }}>
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  style={{
                    width: activeIndex === idx ? '28px' : '10px',
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: activeIndex === idx ? 'var(--primary)' : 'var(--border)',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Right Column: 3D Scene */}
          <div
            style={{
              flex: 1.2,
              height: '80vh',
              position: 'relative',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <Suspense fallback={null}>
              <Scene3D camera={{ position: [0, 0, 4.5], fov: 42 }} animating={true}>
                <HowItWorksScene progress={scrollProgress} />
              </Scene3D>
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

