import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { dbStore, initDB } from '../db';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSync = (isOnline: boolean) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const updatePendingCount = useCallback(async () => {
    const queue = await dbStore.getQueue();
    setPendingCount(queue.length);
  }, []);

  const syncQueue = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    const queue = await dbStore.getQueue();
    if (queue.length === 0) return;

    setIsSyncing(true);
    console.log(`Syncing ${queue.length} pending actions...`);

    for (const action of queue) {
      try {
        if (action.type === 'TOKEN_INCREMENT') {
          const token = localStorage.getItem('kiosk_token');
          await axios.post(`${API_URL}/api/token/next`, action.payload, {
            headers: { Authorization: `Bearer ${token}` }
          });
        }
        await dbStore.removeFromQueue(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        // If it's a 4xx error, maybe remove it. If 5xx, keep it for later.
        if (axios.isAxiosError(error) && error.response && error.response.status < 500) {
          await dbStore.removeFromQueue(action.id);
        }
      }
    }

    await updatePendingCount();
    setIsSyncing(false);
  }, [isOnline, isSyncing, updatePendingCount]);

  useEffect(() => {
    initDB().then(() => {
      updatePendingCount();
    });
  }, [updatePendingCount]);

  useEffect(() => {
    if (isOnline) {
      syncQueue();
    }
  }, [isOnline, syncQueue]);

  const addToQueue = async (type: 'TOKEN_INCREMENT', payload: any) => {
    await dbStore.addToQueue({ type, payload });
    await updatePendingCount();
  };

  return {
    isSyncing,
    pendingCount,
    addToQueue,
    syncQueue
  };
};
