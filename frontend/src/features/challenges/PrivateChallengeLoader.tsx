import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../api/axiosConfig';
import NotFoundPage from '../../components/errors/NotFoundPage';
import { useAuth } from '../../context/AuthContext';

const PrivateChallengeLoader = () => {
  const { token } = useParams();
  const { user } = useAuth();
  const [challenge, setChallenge] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPrivateChallenge = async () => {
      try {
        const response = await axiosInstance.get(`/challenges/private/${token}`);
        setChallenge(response.data);
        
        if (user) {
          await axiosInstance.post(`/challenges/access`, {
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
