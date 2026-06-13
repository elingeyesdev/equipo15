import React from 'react';

export const StudentDashboardView: React.FC = () => {
  return (
    <div style={{ width: '100%', fontFamily: 'Inter, sans-serif' }}>
      <section style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '32px 0 40px 0',
        gap: '40px',
        flexWrap: 'wrap',
      }}>

        {/* ── Columna izquierda: Guía rápida ── */}
        <div style={{ flex: '1 1 340px', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Encabezado */}
          <div style={{ paddingLeft: '18px', marginBottom: '6px' }}>
            <p style={{
              margin: 0,
              fontSize: '11px',
              fontWeight: 900,
              letterSpacing: '1.6px',
              textTransform: 'uppercase',
              color: '#FE410A',
            }}>
              Guía rápida
            </p>
            <h2 style={{
              margin: '4px 0 0',
              fontSize: '22px',
              fontWeight: 900,
              letterSpacing: '-0.3px',
              lineHeight: 1.25,
              color: '#3a3a3a',
            }}>
              Seguí estos pasos para participar
            </h2>
          </div>

          {/* Paso 1 */}
          <div style={{
            background: '#fff',
            borderRadius: '18px',
            border: '1px solid rgba(72,80,84,0.08)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 20px',
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#FE410A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#fff',
              fontSize: '20px',
              fontWeight: 800,
            }}>
              1
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#3a3a3a', letterSpacing: '-0.1px' }}>
                Encontrá tu reto ideal
              </p>
              <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#6b7280', lineHeight: 1.45 }}>
                Explorá la vista lateral "Explorar retos" y descubrí el reto que más suene con vos
              </p>
            </div>
          </div>

          {/* Paso 2 */}
          <div style={{
            background: '#fff',
            borderRadius: '18px',
            border: '1px solid rgba(72,80,84,0.08)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 20px',
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#FE410A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#fff',
              fontSize: '20px',
              fontWeight: 800,
            }}>
              2
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#3a3a3a', letterSpacing: '-0.1px' }}>
                Revisa las reglas del reto
              </p>
              <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#6b7280', lineHeight: 1.45 }}>
                Revisa los criterios de evaluación que se tomarán en cuenta
              </p>
            </div>
          </div>

          {/* Paso 3 */}
          <div style={{
            background: '#fff',
            borderRadius: '18px',
            border: '1px solid rgba(72,80,84,0.08)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 20px',
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: '#FE410A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#fff',
              fontSize: '20px',
              fontWeight: 800,
            }}>
              3
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#3a3a3a', letterSpacing: '-0.1px' }}>
                ¡Subí tu idea!
              </p>
              <p style={{ margin: '5px 0 0', fontSize: '13px', color: '#6b7280', lineHeight: 1.45 }}>
                Completa tu idea paso a paso y da el salto para ganar el desafío
              </p>
            </div>
          </div>

        </div>

        {/* ── Columna derecha: Explorá los retos ── */}
        <div style={{
          flex: '1.5 1 360px',
          maxWidth: '520px',
          background: '#fff',
          borderRadius: '24px',
          border: '1px solid rgba(72,80,84,0.08)',
          boxShadow: '0 2px 16px rgba(72,80,84,0.10)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}>
          {/* Header de la tarjeta */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '22px 24px 18px',
          }}>
            <span style={{ fontSize: '16px', fontWeight: 800, color: '#3a3a3a', letterSpacing: '-0.2px' }}>
              Explorá los retos
            </span>
            <button style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: '1px solid rgba(72,80,84,0.12)',
              background: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#485054',
            }}>
              {/* Ícono de filtros — 3 líneas horizontales con longitudes distintas */}
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <line x1="0" y1="2" x2="18" y2="2" stroke="#485054" strokeWidth="2" strokeLinecap="round"/>
                <line x1="3" y1="7" x2="15" y2="7" stroke="#485054" strokeWidth="2" strokeLinecap="round"/>
                <line x1="6" y1="12" x2="12" y2="12" stroke="#485054" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Estado vacío */}
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px 32px 48px',
            gap: '16px',
          }}>
            {/* Círculo suave rosado con ícono */}
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(254,65,10,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#FE410A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>

            <p style={{ margin: 0, fontSize: '16px', fontWeight: 900, color: '#3a3a3a', letterSpacing: '-0.2px' }}>
              ¡La pista se está preparando!
            </p>
            <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af', lineHeight: 1.65, maxWidth: '280px' }}>
              Por el momento no hay retos abiertos, pero las empresas ya están diseñando nuevos desafíos para vos. ¡Volvé pronto para demostrar tu talento!
            </p>
          </div>
        </div>

      </section>
    </div>
  );
};
