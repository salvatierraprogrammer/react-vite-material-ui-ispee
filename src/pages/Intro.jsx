import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import gsap from 'gsap'

export default function Intro() {
  const containerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const tl = gsap.timeline({
      onComplete: () => {
        navigate('/')
      }
    })

    tl.to(container.querySelector('.scene1'), {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: 'power3.out'
    }, 0.3)
    .from(container.querySelector('.main-title'), {
      opacity: 0,
      y: 30,
      duration: 0.8,
      ease: 'power3.out'
    }, 0.5)
    .from(container.querySelector('.subtitle'), {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out'
    }, 1)
    .to(container.querySelector('.scene1'), {
      opacity: 0,
      y: -30,
      duration: 0.6,
      ease: 'power2.in'
    }, 2.5)
    .to(container.querySelector('.scene2'), {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: 'power3.out'
    }, 3)
    .from(container.querySelector('.dashboard'), {
      opacity: 0,
      scale: 0.92,
      y: 40,
      duration: 1,
      ease: 'power3.out'
    }, 3.2)
    .from(container.querySelectorAll('.material-card'), {
      opacity: 0,
      y: 30,
      duration: 0.6,
      stagger: 0.15,
      ease: 'power2.out'
    }, 3.8)
    .to(container.querySelector('.scene2'), {
      opacity: 0,
      duration: 0.6,
      ease: 'power2.in'
    }, 5.5)
    .to(container.querySelector('.scene3'), {
      opacity: 1,
      duration: 0.5,
      ease: 'power2.out'
    }, 6)
    .from(container.querySelectorAll('.feature-card'), {
      opacity: 0,
      y: 40,
      scale: 0.9,
      duration: 0.7,
      stagger: 0.2,
      ease: 'power3.out'
    }, 6.2)
    .from(container.querySelector('.slogan'), {
      opacity: 0,
      y: 30,
      scale: 0.95,
      duration: 0.8,
      ease: 'power3.out'
    }, 7.2)
    .from(container.querySelectorAll('.slogan .word'), {
      opacity: 0,
      y: 20,
      duration: 0.5,
      stagger: 0.15,
      ease: 'power2.out'
    }, 7.5)
    .from(container.querySelector('.final-logo'), {
      opacity: 0,
      scale: 0.8,
      duration: 1,
      ease: 'back.out(1.7)'
    }, 8)
    .from(container.querySelector('.final-logo-icon'), {
      boxShadow: '0 0 0px rgba(139, 92, 246, 0)',
      duration: 1.5,
      ease: 'power2.out'
    }, 8.2)

    const particles = container.querySelectorAll('.particle')
    particles.forEach((particle, i) => {
      gsap.to(particle, {
        y: `random(-40, 40)`,
        x: `random(-20, 20)`,
        duration: 3 + Math.random() * 2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.2
      })
    })

    return () => {
      tl.kill()
      gsap.killTweensOf(particles)
    }
  }, [navigate])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #0a0a12 0%, #12101f 50%, #0d0b18 100%)',
        fontFamily: "'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div style={{
        position: 'absolute',
        width: '800px',
        height: '800px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
        top: '30%',
        left: '70%',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(167, 139, 250, 0.06) 0%, transparent 70%)',
        bottom: '20%',
        left: '20%',
        pointerEvents: 'none',
      }} />

      <div className="particles" style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              position: 'absolute',
              width: `${3 + (i % 3)}px`,
              height: `${3 + (i % 3)}px`,
              borderRadius: '50%',
              background: i % 2 === 0 ? 'rgba(139, 92, 246, 0.5)' : 'rgba(167, 139, 250, 0.4)',
              left: `${10 + (i * 6)}%`,
              top: `${15 + (i * 5)}%`,
              boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)',
            }}
          />
        ))}
      </div>

      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(180deg, rgba(10, 10, 18, 0.3) 0%, transparent 30%, transparent 70%, rgba(10, 10, 18, 0.5) 100%)',
        pointerEvents: 'none',
      }} />

      <div className="scene1" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', opacity: 0, zIndex: 10 }}>
        <div className="main-title" style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 800, color: '#fff', letterSpacing: '-1px', lineHeight: 1.1 }}>
          <span style={{ background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 50%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Apuntes</span> ISPEE
        </div>
        <div className="subtitle" style={{ fontSize: 'clamp(14px, 2vw, 22px)', fontWeight: 400, color: 'rgba(255, 255, 255, 0.7)', marginTop: '20px', letterSpacing: '1px' }}>
          Banco colaborativo de apuntes para educación especial
        </div>
      </div>

      <div className="scene2" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 'min(1600px, 95vw)', height: 'auto', aspectRatio: '16/9', background: 'rgba(15, 14, 24, 0.95)', borderRadius: '24px', border: '1px solid rgba(139, 92, 246, 0.2)', boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5)', overflow: 'hidden', backdropFilter: 'blur(20px)', opacity: 0 }}>
        <div style={{ display: 'flex', height: '100%' }}>
          <div style={{ width: '240px', background: 'rgba(10, 9, 16, 0.95)', borderRight: '1px solid rgba(139, 92, 246, 0.1)', padding: '32px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 700, color: 'white' }}>AI</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'white' }}>Apuntes ISPEE</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['Inicio', 'Materias', 'Foro', 'Mensajes'].map((item, i) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px', borderRadius: '12px', color: i === 0 ? '#a78bfa' : 'rgba(255, 255, 255, 0.6)', fontSize: '16px', fontWeight: 500, background: i === 0 ? 'rgba(139, 92, 246, 0.15)' : 'transparent' }}>
                  <div style={{ width: '22px', height: '22px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.08)' }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, padding: '40px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: 'white' }}>Materiales Recientes</div>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '200px', height: '48px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px' }} />
                <div style={{ height: '48px', padding: '0 24px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: 600 }}>Subir</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
              {['Apunte de Matemática', 'Guía de Lengua', 'Resumen de Historia'].map((title, i) => (
                <div key={title} className="material-card" style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '20px', overflow: 'hidden' }}>
                  <div style={{ height: '120px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2" opacity="0.6">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div style={{ padding: '20px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>{title}</div>
                    <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '12px' }}>Subido hace {i + 1} días</div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ padding: '6px 12px', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '8px', fontSize: '12px', color: '#a78bfa' }}>PDF</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="scene3" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px', width: 'min(1200px, 90vw)', marginBottom: '60px' }}>
          {[
            { icon: 'upload', title: 'Subí PDF', desc: 'Compartí tus apuntes de manera simple y rápida' },
            { icon: 'forum', title: 'Foro', desc: 'Participá en conversaciones colaborativas' },
            { icon: 'community', title: 'Comunidad', desc: 'Aprendé junto a otros estudiantes' }
          ].map((feature) => (
            <div key={feature.title} className="feature-card" style={{ background: 'rgba(15, 14, 24, 0.9)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '20px', padding: '40px', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(124, 58, 237, 0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
                  {feature.icon === 'upload' && <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>}
                  {feature.icon === 'forum' && <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>}
                  {feature.icon === 'community' && <><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
                </svg>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: 'white', marginBottom: '12px' }}>{feature.title}</div>
              <div style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)', lineHeight: 1.6 }}>{feature.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <div className="slogan" style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, color: '#a78bfa' }}>Compartí.</span>
            <span style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, color: '#c4b5fd' }}>Aprendé.</span>
            <span style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 700, color: '#8b5cf6' }}>Conectá.</span>
          </div>
          <div className="final-logo" style={{ marginTop: '48px', display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
            <div className="final-logo-icon" style={{ width: '80px', height: '80px', borderRadius: '20px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', fontWeight: 700, color: 'white', boxShadow: '0 0 60px rgba(139, 92, 246, 0.6)' }}>AI</div>
            <div style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: 'white', textShadow: '0 0 40px rgba(139, 92, 246, 0.4)' }}>Apuntes ISPEE</div>
          </div>
        </div>
      </div>
    </div>
  )
}
