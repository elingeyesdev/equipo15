import styled from 'styled-components';
import { Pista8Theme } from '../../config/theme';

const NotFoundPage = () => (
  <ErrorWrapper>
    <div className="card">
      <div className="icon"></div>
      <h1 className="code">404</h1>
      <p className="msg">El reto solicitado no existe o el enlace es inválido.</p>
      <button onClick={() => window.location.href = '/'} className="btn-home">
        VOLVER AL INICIO
      </button>
    </div>
  </ErrorWrapper>
);

const ErrorWrapper = styled.div`
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: ${Pista8Theme.background};

  .card {
    text-align: center;
    background: white;
    padding: 60px 40px;
    border-radius: 32px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.04);
    max-width: 400px;
    width: 90%;
  }

  .icon { font-size: 50px; }
  .code { font-size: 72px; color: ${Pista8Theme.primary}; margin: 0; font-weight: 900; }
  .msg { color: ${Pista8Theme.secondary}; margin: 20px 0 32px; font-weight: 500; }
  
  .btn-home {
    background: ${Pista8Theme.secondary};
    color: white;
    border: none;
    padding: 16px 32px;
    border-radius: 14px;
    cursor: pointer;
    font-weight: 700;
    width: 100%;
  }
`;

export default NotFoundPage;
