/**
 * Ad API Service
 * Updated to support Duration and strict Content-Type matching for S3
 */

import api from '@/services/api';
import type {
  Ad,
  CreateAdPayload,
  UpdateAdPayload,
  AdResponse,
  AdListResponse,
  CreateAdResponse,
} from '../types';

const ENDPOINT = '/api/ads';

/**
 * Get all ads (admin view) - requires hospitalId for the new backend index
 */
export const getAds = async (hospitalId: string): Promise<AdListResponse> => {
  try {
    const response = await api.get<AdListResponse>(
      `${ENDPOINT}?hospitalId=${hospitalId}`,
    );
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch ads',
    };
  }
};

/**
 * Get active ads (kiosk view)
 */
export const getActiveAds = async (
  hospitalId?: string,
  departmentId?: string,
): Promise<AdListResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (hospitalId) {
      params.append('hospitalId', hospitalId);
    }
    // Required by backend validation
    if (departmentId) {
      params.append('departmentId', departmentId);
    }

    const response = await api.get<AdListResponse>(`${ENDPOINT}?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch active ads',
    };
  }
};

/**
 * Create ad and get presigned upload URL
 */
export const createAd = async (payload: CreateAdPayload): Promise<CreateAdResponse> => {
  try {
    const response = await api.post<CreateAdResponse>(ENDPOINT, {
      title: payload.title.trim(),
      type: payload.type,
      fileName: payload.fileName,
      duration: payload.duration, // Added Duration
      displayArea: payload.displayArea,
      priority: payload.priority,
      hospitalId: payload.hospitalId,
      departmentId: payload.departmentId || null,
    });
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to create ad',
    };
  }
};

/**
 * Upload file to S3 using presigned URL
 * CRITICAL: The Content-Type header MUST match the one used during signing
 */
export const uploadFileToS3 = async (
  presignedUrl: string,
  file: File,
  contentType: string, // Passed from the CreateAdResponse
  onProgress?: (progress: number) => void,
): Promise<void> => {
  try {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress((e.loaded / e.total) * 100);
          }
        });
      }

      xhr.addEventListener('load', () => {
        // S3 returns 200 OK for successful PUT uploads
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`S3 Upload failed: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () =>
        reject(new Error('Network error during upload')),
      );

      xhr.open('PUT', presignedUrl);

      // Use the contentType the backend returned to ensure signature match
      xhr.setRequestHeader('Content-Type', contentType);

      xhr.send(file);
    });
  } catch (error: any) {
    throw new Error(error.message || 'Failed to upload to S3');
  }
};

/**
 * Update ad metadata
 */
export const updateAd = async (
  id: string,
  payload: UpdateAdPayload,
): Promise<AdResponse> => {
  try {
    const response = await api.put<AdResponse>(`${ENDPOINT}/${id}`, payload);
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to update ad',
    };
  }
};

export const deleteAd = async (id: string): Promise<void> => {
  try {
    await api.delete(`${ENDPOINT}/${id}`);
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to delete ad',
    };
  }
};
