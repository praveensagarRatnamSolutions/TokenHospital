/**
 * Ad Type Definitions
 * Updated for Duration-based rotation and S3 Metadata
 */

export interface Ad {
  _id: string;
  title: string;
  type: 'image' | 'video';
  fileName: string;
  contentType: string;
  fileKey: string;
  displayArea: 'carousel' | 'fullscreen';
  hospitalId: string;
  departmentId: string | null;
  duration: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateAdInput extends Partial<Ad> {
  file?: File;
}

export interface CreateAdPayload {
  title: string;
  type: 'image' | 'video';
  fileName: string;
  duration: number;
  displayArea: 'carousel' | 'fullscreen';
  priority?: number;
  hospitalId: string;   // Required for the new backend index
  departmentId?: string;
}

/**
 * Updated to match the service logic return { ad, uploadUrl }
 */
export interface CreateAdResponse {
  success: boolean;
  ad: Ad;               // The backend returns the object inside 'ad'
  uploadUrl: string;    // Presigned S3 PUT URL
  message?: string;
}

export interface UpdateAdPayload {
  title?: string;
  displayArea?: 'carousel' | 'fullscreen';
  duration?: number;
  priority?: number;
  isActive?: boolean;
  departmentId?: string | null;
}

export interface AdResponse {
  success: boolean;
  message: string;
  data?: Ad;            // Single ad response
  error?: string;
}

export interface AdListResponse {
  success: boolean;
  data: Ad[];           // Array of ads for dashboard/kiosk
  message?: string;
}

/**
 * Helper type for Form State
 */
export type AdFormData = {
  title: string;
  displayArea: 'carousel' | 'fullscreen';
  duration: string;     // Kept as string for input handling, parsed on submit
  priority: string;
  departmentId: string;
  fileName: string;
  file?: File;          // The actual binary for S3 upload
};