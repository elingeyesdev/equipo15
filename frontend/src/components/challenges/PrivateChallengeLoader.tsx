import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NotFoundPage from '../errors/NotFoundPage';
import { useAuth } from '../../context/AuthContext';

const PrivateChallengeLoader = () => {
  const { token } = useParams();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPrivateChallenge = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/challenges/private/${token}`);
        setChallenge(response.data);
        
        if (user) {
          await axios.post(`http://localhost:3000/api/challenges/access`, {
            userId: user.uid,
            challengeId: response.data._id
          });
        }
      } catch (err) {
        setError(true);
      }
    };

    fetchPrivateChallenge();
  }, [token, user]);

  if (error) return <NotFoundPage />;
  if (!challenge) return <div>Cargando reto...</div>;

  return (
    <div>
      <h1>{challenge.title}</h1>
      <p>{challenge.problemDescription}</p>
    </div>
  );
};

export default PrivateChallengeLoader;
