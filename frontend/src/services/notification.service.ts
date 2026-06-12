import api from '../api/axiosConfig';

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  referenceId: string | null;
  referenceType: string | null;
  readAt: string | null;
  createdAt: string;
}

export const notificationService = {
  async getMyInbox(): Promise<Notification[]> {
    const { data } = await api.get('/notifications/my-inbox');
    return Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get('/notifications/unread-count');
    return data?.data?.count ?? data?.count ?? 0;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },
};
