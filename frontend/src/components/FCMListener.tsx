import { useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from '@/config/firebase';
import { toast } from 'sonner';

export const FCMListener = () => {
  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        if (payload.notification) {
          toast(payload.notification.title || 'Nueva notificación', {
            description: payload.notification.body,
          });
        }
      });
      return () => unsubscribe();
    }
  }, []);

  return null;
};
