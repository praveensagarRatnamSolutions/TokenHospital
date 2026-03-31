'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { RootState } from '@/store/store';
import * as kioskApi from '../api/kioskApi';
import { Kiosk, CreateKioskPayload, UpdateKioskPayload } from '../types';

export const useKiosks = (params: any = {}) => {
  const [kiosks, setKiosks] = useState<Kiosk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user } = useAppSelector((state: RootState) => state.auth);
  const hospitalId = user?.hospitalId || '';

  const fetchKiosks = useCallback(async () => {
    if (!hospitalId) return;
    try {
      setLoading(true);
      const response = await kioskApi.getKiosks(hospitalId, params);
      if (response.success) {
        setKiosks(response.data);
      } else {
        setError(response.message || 'Failed to fetch kiosks');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch kiosks');
    } finally {
      setLoading(false);
    }
  }, [hospitalId, JSON.stringify(params)]);

  useEffect(() => {
    fetchKiosks();
  }, [fetchKiosks]);

  return { kiosks, loading, error, refetch: fetchKiosks };
};

export const useCreateKiosk = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (payload: CreateKioskPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await kioskApi.createKiosk(payload);
      if (response.success) return response.data;
      setError(response.message || 'Failed to create kiosk');
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to create kiosk');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createKiosk: create, loading, error };
};

export const useUpdateKiosk = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (id: string, payload: UpdateKioskPayload) => {
    try {
      setLoading(true);
      setError(null);
      const response = await kioskApi.updateKiosk(id, payload);
      if (response.success) return response.data;
      setError(response.message || 'Failed to update kiosk');
      return null;
    } catch (err: any) {
      setError(err.message || 'Failed to update kiosk');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { updateKiosk: update, loading, error };
};

export const useDeleteKiosk = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await kioskApi.deleteKiosk(id);
      if (response.success) return true;
      setError(response.message || 'Failed to delete kiosk');
      return false;
    } catch (err: any) {
      setError(err.message || 'Failed to delete kiosk');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteKiosk: remove, loading, error };
};
