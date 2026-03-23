/**
 * Ad Validation Schemas
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validate ad title
 */
export const validateAdTitle = (title: string): ValidationError | null => {
  if (!title || title.trim().length === 0) {
    return { field: 'title', message: 'Ad title is required' };
  }
  if (title.trim().length > 100) {
    return { field: 'title', message: 'Ad title must not exceed 100 characters' };
  }
  return null;
};

/**
 * Validate display duration (Kiosk Rotation)
 */
export const validateDuration = (duration: any): ValidationError | null => {
  const num = Number(duration);
  if (!duration || isNaN(num)) {
    return { field: 'duration', message: 'Duration is required' };
  }
  if (num < 1 || num > 3600) {
    return { field: 'duration', message: 'Duration must be between 1 and 3600 seconds' };
  }
  return null;
};

/**
 * Validate display area
 */
export const validateDisplayArea = (displayArea: string): ValidationError | null => {
  if (!['carousel', 'fullscreen'].includes(displayArea)) {
    return {
      field: 'displayArea',
      message: 'Select a valid display area',
    };
  }
  return null;
};

/**
 * Validate priority
 */
export const validatePriority = (priority: any): ValidationError | null => {
  if (priority !== undefined && priority !== null && priority !== '') {
    const num = Number(priority);
    if (isNaN(num) || num < 0 || num > 100) {
      return { field: 'priority', message: 'Priority must be between 0 and 100' };
    }
  }
  return null;
};

/**
 * Updated: Validate ad form data (Matches new Schema)
 */
export interface AdFormData {
  title: string;
  displayArea: string;
  duration: any;
  priority?: any;
  fileName: string;
  departmentId?: string;
}

export const validateAdForm = (data: AdFormData): ValidationResult => {
  const errors: ValidationError[] = [];

  const titleErr = validateAdTitle(data.title);
  if (titleErr) errors.push(titleErr);

  const durationErr = validateDuration(data.duration);
  if (durationErr) errors.push(durationErr);

  const displayAreaErr = validateDisplayArea(data.displayArea);
  if (displayAreaErr) errors.push(displayAreaErr);

  const priorityErr = validatePriority(data.priority);
  if (priorityErr) errors.push(priorityErr);

  if (!data.fileName) {
    errors.push({ field: 'file', message: 'A media file is required' });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (errors: ValidationError[], field: string): string | null => {
  return errors.find((err) => err.field === field)?.message || null;
};

/**
 * Validate file type and size (Includes WebP)
 */
export const validateFile = (
  file: File,
  maxSizeMB: number = 100
): ValidationError | null => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp', // Added WebP
    'image/gif',
    'video/mp4',
    'video/webm',
    'video/quicktime', // .mov
  ];

  if (!file) return { field: 'file', message: 'File is required' };

  if (!allowedTypes.includes(file.type)) {
    return {
      field: 'file',
      message: 'Unsupported format. Use JPG, PNG, WebP, or MP4/WebM.',
    };
  }

  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      field: 'file',
      message: `File is too large (Max ${maxSizeMB}MB)`,
    };
  }

  return null;
};