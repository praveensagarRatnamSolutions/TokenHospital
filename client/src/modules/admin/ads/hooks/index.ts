'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Ad, CreateAdPayload, UpdateAdPayload } from '../types';
import * as adApi from '../api/adApi';

/**
 * Generic API Response Type
 */
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  ad?: T;
  message?: string;
  uploadUrl?: string;
};

/**
 * Hook to fetch ads
 */
interface UseAdsReturn {
  ads: Ad[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useAds = (): UseAdsReturn => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: ApiResponse<Ad[]> = await adApi.getActiveAds();

      if (response.success && Array.isArray(response.data)) {
        setAds(response.data);
      } else {
        setAds([]);
        setError(response.message || 'Failed to fetch ads');
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err
          ? (err as any).message
          : 'Failed to fetch ads';
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

/**
 * Hook to create an ad with file upload
 */
interface UseCreateAdReturn {
  createAd: (
    payload: CreateAdPayload,
    file: File,
    onProgress?: (progress: number) => void // 0–100
  ) => Promise<Ad | null>;
  loading: boolean;
  error: string | null;
}

export const useCreateAd = (): UseCreateAdReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (
      payload: CreateAdPayload,
      file: File,
      onProgress?: (progress: number) => void
    ): Promise<Ad | null> => {
      try {
        setLoading(true);
        setError(null);

        const createResponse: ApiResponse<Ad> =
          await adApi.createAd(payload);

        const adData = createResponse.data || createResponse.ad;

        if (
          !createResponse.success ||
          !createResponse.uploadUrl ||
          !adData
        ) {
          setError(createResponse.message || 'Failed to get upload URL');
          return null;
        }

        // Upload file to S3
        try {
          await adApi.uploadFileToS3(
            createResponse.uploadUrl,
            file,
            adData.contentType,
            onProgress
          );
        } catch (uploadErr: unknown) {
          const errorMessage =
            uploadErr instanceof Error
              ? uploadErr.message
              : uploadErr && typeof uploadErr === 'object' && 'message' in uploadErr
              ? (uploadErr as any).message
              : 'File upload failed';
          setError(`File upload failed: ${errorMessage}`);
          return null;
        }

        return adData;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : err && typeof err === 'object' && 'message' in err
            ? (err as any).message
            : 'Failed to create ad';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    createAd: create,
    loading,
    error,
  };
};

/**
 * Hook to update an ad
 */
interface UseUpdateAdReturn {
  updateAd: (id: string, payload: UpdateAdPayload) => Promise<Ad | null>;
  loading: boolean;
  error: string | null;
}

export const useUpdateAd = (): UseUpdateAdReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (id: string, payload: UpdateAdPayload): Promise<Ad | null> => {
      try {
        setLoading(true);
        setError(null);

        const response: ApiResponse<Ad> = await adApi.updateAd(
          id,
          payload
        );

        if (response.success && response.data) {
          return response.data;
        }

        setError(response.message || 'Failed to update ad');
        return null;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : err && typeof err === 'object' && 'message' in err
            ? (err as any).message
            : 'Failed to update ad';
        setError(errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    updateAd: update,
    loading,
    error,
  };
};

/**
 * Hook to delete an ad
 */
interface UseDeleteAdReturn {
  deleteAd: (id: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const useDeleteAd = (): UseDeleteAdReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await adApi.deleteAd(id);
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : err && typeof err === 'object' && 'message' in err
          ? (err as any).message
          : 'Failed to delete ad';
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