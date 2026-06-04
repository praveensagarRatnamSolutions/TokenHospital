import api from './api';

export interface Notification {
  _id: string;
  recipient: string;
  sender: string | null;
  hospitalId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  relatedType: 'Ad' | 'Kiosk' | null;
  relatedId: string | null;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
}

export interface NotificationResponse {
  success: boolean;
  data: Notification;
}

const ENDPOINT = '/api/notifications';

export const notificationApi = {
  getNotifications: async (limit = 20): Promise<NotificationListResponse> => {
    const response = await api.get<NotificationListResponse>(ENDPOINT, {
      params: { limit },
    });
    return response.data;
  },

  markAsRead: async (id: string): Promise<NotificationResponse> => {
    const response = await api.patch<NotificationResponse>(`${ENDPOINT}/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch<{ success: boolean; message: string }>(`${ENDPOINT}/read-all`);
    return response.data;
  },
};
