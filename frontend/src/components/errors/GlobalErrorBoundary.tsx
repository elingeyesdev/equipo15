import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';
import styled from 'styled-components';
import { Pista8Theme } from '../../config/theme';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

const FallbackContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${Pista8Theme.background};
  font-family: 'Inter', sans-serif;
  text-align: center;
  padding: 2rem;
`;

const ErrorTitle = styled.h2`
  color: ${Pista8Theme.secondary};
  font-size: 24px;
  font-weight: 800;
  margin-bottom: 12px;
`;

const ErrorText = styled.p`
  color: #485054;
  margin-bottom: 24px;
  max-width: 400px;
  line-height: 1.5;
`;

const ReloadButton = styled.button`
  background: ${Pista8Theme.primary};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 12px ${Pista8Theme.primary}4a;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px ${Pista8Theme.primary}6a;
  }
`;

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <FallbackContainer>
          <ErrorTitle>Oops, algo salió mal</ErrorTitle>
          <ErrorText>
            La aplicación encontró un problema inesperado al cargar la vista. 
            Nuestros servidores fueron notificados.
          </ErrorText>
          <ReloadButton onClick={() => window.location.reload()}>
            Volver a cargar
          </ReloadButton>
        </FallbackContainer>
      );
    }

    return this.props.children;
  }
}
