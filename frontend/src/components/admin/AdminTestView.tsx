import { useState } from 'react';
import styled from 'styled-components';
import { DynamicForm } from '../Form/DynamicForm';
import { ChallengePreview } from '../Form/ChallengePreview';
import { useForm } from '../../hooks/useForm';
import { FieldFactory } from '../Form/FieldFactory';
import { Pista8Theme } from '../../config/theme';

const DashboardRoot = styled.div`
  min-height: 100vh;
  background-color: ${Pista8Theme.background};
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const Header = styled.header`
  text-align: left;
  border-bottom: 2px solid rgba(0,0,0,0.05);
  padding-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 800;
  color: ${Pista8Theme.secondary};
  margin: 0;
`;

const Sub = styled.p`
  font-size: 14px;
  color: rgba(72, 80, 84, 0.6);
  margin: 4px 0 0;
`;

const ContentGrid = styled.div`
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  justify-content: center;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: center;
  }
`;

const LeftPanel = styled.div`
  flex: 1;
  width: 100%;
  max-width: 800px;
`;

const RightPanel = styled.div`
  width: 400px;
  flex-shrink: 0;
  position: sticky;
  top: 2rem;
`;

const SuccessPanel = styled.div`
  background: white;
  border-left: 4px solid #28a745;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  margin-bottom: 1.5rem;
  
  h3 { margin-top: 0; color: #28a745; }
  p { margin: 0 0 1rem 0; color: #333; }
`;

const CopyBox = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;

  input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    background: #f5f5f5;
    font-family: monospace;
    font-size: 0.9rem;
    color: #555;
  }

  button {
    padding: 0 1.5rem;
    background: #0066cc;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
    &:hover { background: #0052a3; }
  }
`;

export const AdminTestView = () => {
  const [successData, setSuccessData] = useState<{ isPrivate: boolean, link?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const formConfigs = [
    FieldFactory.createTitleField(false),
    FieldFactory.createProblemDescriptionField(),
    FieldFactory.createCompanyContextField(),
    FieldFactory.createParticipationRulesField(),
    FieldFactory.createPrivacyField(),
    FieldFactory.createStartDateField(),
    FieldFactory.createEndDateField()
  ];

  const { values, errors, isSubmitting, setIsSubmitting, handleChange, validateAll } = useForm(formConfigs);

  const handleSubmit = async (action: 'publish' | 'draft') => {
    const isDraft = action === 'draft';
    if (!validateAll(isDraft)) {
      alert('Por favor arregla los errores del formulario antes de continuar.');
      return;
    }

    setIsSubmitting(true);
    setSuccessData(null);
    setCopied(false);

    try {
      const payload = {
        ...values,
        publicationDate: new Date().toISOString(),
        status: action === 'publish' ? 'ACTIVE' : 'DRAFT'
      };

      const res = await fetch('http://localhost:3000/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message || 'Error al guardar');
      }

      const backendResponse = await res.json();
      
      if (backendResponse.isPrivate && backendResponse.accessToken) {
        setSuccessData({
          isPrivate: true,
          link: `http://localhost:5173/challenges/private/${backendResponse.accessToken}`
        });
      } else {
        setSuccessData({ isPrivate: false });
      }
    } catch (error: any) {
      alert(`Error conectando al backend: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (successData?.link) {
      navigator.clipboard.writeText(successData.link);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <DashboardRoot>
      <Header>
        <Title>Laboratorio de Creación de Retos (Test)</Title>
        <Sub>Ruta oculta libre de Firebase Auth. Usa esto para validar componentes.</Sub>
      </Header>
      
      <ContentGrid>
        <LeftPanel>
          {successData && (
            <SuccessPanel>
              <h3>¡Reto Creado Exitosamente!</h3>
              {successData.isPrivate ? (
                <>
                  <p>Módulo de Invitación: Este reto es privado. Copia el siguiente enlace único para invitar a las empresas o enviarlo por correo:</p>
                  <CopyBox>
                    <input type="text" readOnly value={successData.link} />
                    <button onClick={handleCopy}>{copied ? '¡Copiado!' : 'Copiar Enlace'}</button>
                  </CopyBox>
                </>
              ) : (
                <p>El reto es público general y ya está disponible en el muro principal de estudiantes.</p>
              )}
            </SuccessPanel>
          )}

          <DynamicForm
            fields={formConfigs}
            values={values}
            errors={errors}
            isSubmitting={isSubmitting}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </LeftPanel>
        
        <RightPanel>
          <ChallengePreview 
            title={values['title']} 
          />
        </RightPanel>
      </ContentGrid>
    </DashboardRoot>
  );
};
