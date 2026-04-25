import React from 'react';
import { useNavigate } from 'react-router-dom';

export const JudgeInboxView = () => {
  const navigate = useNavigate();
  const [pendingChallenges, setPendingChallenges] = React.useState<any[]>([]);

  return (
    <div>
      <h2>Retos Asignados</h2>
      {pendingChallenges.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '8px', border: '1px dashed #e2e8f0', color: '#718096' }}>
          <p style={{ margin: 0, fontSize: '16px' }}>¡Todo al día! Por ahora no tienes retos asignados para calificar.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          {pendingChallenges.map(challenge => (
            <div key={challenge.id} style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: '500' }}>{challenge.title}</span>
              <button
                onClick={() => navigate(`/dashboard/judge/evaluation/${challenge.id}`)}
                style={{ padding: '8px 16px', backgroundColor: '#3182ce', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Evaluar Ideas
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const JudgeEvaluationView = () => (
  <div>
    <h2>Evaluar Ideas</h2>
    <p>Formulario con sliders/notas para las ideas seleccionadas.</p>
  </div>
);

export const JudgeHistoryView = () => (
  <div>
    <h2>Mis Evaluaciones</h2>
    <p>Registro de notas enviadas (Read-only).</p>
  </div>
);
