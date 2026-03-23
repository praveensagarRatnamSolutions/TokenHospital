/**
 * Custom Hooks for Ad Management
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Ad, CreateAdPayload, UpdateAdPayload } from '../types';
import * as adApi from '../api/adApi';

interface UseAdsReturn {
  ads: Ad[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch ads
 */
export const useAds = (): UseAdsReturn => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adApi.getActiveAds();
      if (response.success) {
        setAds(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.message || 'Failed to fetch ads');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch ads';
      setError(errorMessage);
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  return {
    ads,
    loading,
    error,
    refetch: fetchAds,
  };
};

interface UseCreateAdReturn {
  createAd: (
    payload: CreateAdPayload,
    file: File,
    onProgress?: (progress: number) => void,
  ) => Promise<Ad | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to create an ad with file upload
 */
export const useCreateAd = (): UseCreateAdReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (
      payload: CreateAdPayload,
      file: File,
      onProgress?: (progress: number) => void,
    ): Promise<Ad | null> => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Create ad and get presigned URL
        const createResponse = await adApi.createAd(payload);
        if (
          !createResponse.success ||
          !createResponse.uploadUrl ||
          !createResponse.data
        ) {
          setError('Failed to get upload URL');
          return null;
        }

        // Step 2: Upload file to S3
        try {
          await adApi.uploadFileToS3(createResponse.uploadUrl, file, onProgress);
        } catch (uploadError: any) {
          setError('File upload failed: ' + uploadError.message);
          return null;
        }

        return createResponse.data as Ad;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to create ad';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    createAd: create,
    loading,
    error,
  };
};

interface UseUpdateAdReturn {
  updateAd: (id: string, payload: UpdateAdPayload) => Promise<Ad | null>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to update an ad
 */
export const useUpdateAd = (): UseUpdateAdReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (id: string, payload: UpdateAdPayload): Promise<Ad | null> => {
      try {
        setLoading(true);
        setError(null);
        const response = await adApi.updateAd(id, payload);
        if (response.success && response.data) {
          return response.data as Ad;
        } else {
          setError(response.message || 'Failed to update ad');
          return null;
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to update ad';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    updateAd: update,
    loading,
    error,
  };
};

interface UseDeleteAdReturn {
  deleteAd: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to delete an ad
 */
export const useDeleteAd = (): UseDeleteAdReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const response = await adApi.deleteAd(id);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to delete ad');
        return false;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to delete ad';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    deleteAd: remove,
    loading,
    error,
  };
};
