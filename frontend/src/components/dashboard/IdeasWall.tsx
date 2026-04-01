import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Pista8Theme } from '../../config/theme';
import { ideaService } from '../../services/idea.service';
import { authService } from '../../services/auth.service';

const IdeasWall = () => {
  const [ideas, setIdeas] = useState([]);

  useEffect(() => {
    ideaService.getAllIdeas().then(setIdeas).catch(console.error);
  }, []);

  return (
    <WallWrapper>
      <header className="header">
        <div className="logo-text">PISTA<span>8</span></div>
        <button onClick={() => authService.logout()} className="btn-logout">Salir</button>
      </header>

      <main className="content">
        <h1 className="title">Muro de Ideas</h1>
        <div className="grid">
          {ideas.length > 0 ? ideas.map((idea: any) => (
            <div key={idea._id} className="idea-card">
              <span className="category">{idea.challenge || 'General'}</span>
              <h3>{idea.title}</h3>
              <p>{idea.description}</p>
              <div className="author">Por: {idea.author?.displayName || 'Anónimo'}</div>
            </div>
          )) : (
            <p className="empty">No hay ideas publicadas todavía. ¡Sé el primero!</p>
          )}
        </div>
      </main>
    </WallWrapper>
  );
};

const WallWrapper = styled.div`
  min-height: 100vh;
  background: ${Pista8Theme.background};

  .header {
    background: ${Pista8Theme.white};
    padding: 1rem 5%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(72, 80, 84, 0.1);
  }

  .logo-text {
    font-weight: 900;
    font-size: 24px;
    color: ${Pista8Theme.secondary};
    span { color: ${Pista8Theme.primary}; }
  }

  .btn-logout {
    background: none;
    border: 1px solid ${Pista8Theme.primary};
    color: ${Pista8Theme.primary};
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    &:hover { background: ${Pista8Theme.primary}; color: white; }
  }

  .content { padding: 40px 5%; }
  .title { color: ${Pista8Theme.secondary}; margin-bottom: 30px; }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 20px;
  }

  .idea-card {
    background: white;
    padding: 24px;
    border-radius: 20px;
    border: 1px solid rgba(72, 80, 84, 0.08);
    transition: transform 0.2s;
    &:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
    h3 { color: ${Pista8Theme.secondary}; margin: 10px 0; }
    p { color: #666; font-size: 14px; line-height: 1.5; }
  }

  .category {
    font-size: 10px;
    text-transform: uppercase;
    background: rgba(254, 65, 10, 0.1);
    color: ${Pista8Theme.primary};
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: 700;
  }

  .author { margin-top: 15px; font-size: 12px; font-weight: 600; color: ${Pista8Theme.secondary}; }
  .empty { text-align: center; grid-column: 1 / -1; color: #999; margin-top: 50px; }
`;

export default IdeasWall;
