import { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { Pista8Theme } from '../../config/theme';

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${Pista8Theme.background};
`;

const Card = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
  max-width: 450px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h2`
  color: ${Pista8Theme.secondary};
  margin-top: 0;
`;

const Subtitle = styled.p`
  color: #666;
  font-size: 0.95rem;
  margin-bottom: 2rem;
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 14px;
  background: ${Pista8Theme.primary};
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
  
  &:disabled {
    background: #ccc;
    cursor: default;
  }
`;

// Simulación de valores mientras conectamos con backend
const FACULTIES = [
  { id: 1, name: 'Facultad de Ciencia y Tecnología' },
  { id: 2, name: 'Facultad de Medicina' },
  { id: 3, name: 'Facultad de Ciencias Económicas' },
  { id: 4, name: 'Facultad de Ciencias Jurídicas' },
  { id: 5, name: 'Facultad de Arquitectura' },
  { id: 6, name: 'Facultad de Ingeniería' },
];

export const CompleteProfileView = ({ onComplete }: { onComplete: () => void }) => {
  const { user } = useAuth();
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selectedFaculty || !user) return;
    setLoading(true);
    
    try {
      const token = await user.getIdToken();
      
      const res = await fetch('http://localhost:3000/api/users/faculty', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ facultyId: Number(selectedFaculty) })
      });

      if (!res.ok) throw new Error('Error al guardar');
      
      // Llamar al callback para quitar esta vista
      onComplete();
      
    } catch (err) {
      alert('Error sincronizando la facultad. Intente de nuevo.');
      setLoading(false);
    }
  };

  return (
    <Wrapper>
      <Card>
        <Title>¡Último Paso!</Title>
        <Subtitle>
          Tu correo no especifica una rama clara. Para mostrarte retos acordes y puntuar correctamente tus ideas, por favor selecciona a qué facultad perteneces.
        </Subtitle>
        
        <Select 
          value={selectedFaculty} 
          onChange={(e) => setSelectedFaculty(e.target.value)}
        >
          <option value="" disabled>Selecciona tu Facultad...</option>
          {FACULTIES.map(fac => (
             <option key={fac.id} value={fac.id}>{fac.name}</option>
          ))}
        </Select>

        <Button onClick={handleSubmit} disabled={!selectedFaculty || loading}>
          {loading ? 'Guardando...' : 'Comenzar a Idear'}
        </Button>
      </Card>
    </Wrapper>
  );
};
