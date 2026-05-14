import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { socketManager } from '../api/socket';

export const useSocket = (): Socket | null => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;

    socketManager.getSocket(() => user.getIdToken()).then(s => {
      if (active) {
        setSocket(s);
      }
    });

    return () => {
      active = false;
      socketManager.release();
    };
  }, [user]);

  return socket;
};
