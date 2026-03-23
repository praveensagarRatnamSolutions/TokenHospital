/**
 * Department Validation Schemas
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
 * Validate department name
 */
export const validateDepartmentName = (name: string): ValidationError | null => {
  if (!name || name.trim().length === 0) {
    return { field: 'name', message: 'Department name is required' };
  }
  if (name.trim().length < 2) {
    return { field: 'name', message: 'Department name must be at least 2 characters' };
  }
  if (name.trim().length > 100) {
    return { field: 'name', message: 'Department name must not exceed 100 characters' };
  }
  return null;
};

/**
 * Validate department prefix
 */
export const validateDepartmentPrefix = (prefix: string): ValidationError | null => {
  if (!prefix || prefix.trim().length === 0) {
    return { field: 'prefix', message: 'Token prefix is required' };
  }
  const trimmedPrefix = prefix.trim().toUpperCase();
  if (trimmedPrefix.length > 3) {
    return { field: 'prefix', message: 'Token prefix must not exceed 3 characters' };
  }
  if (!/^[A-Z0-9]+$/.test(trimmedPrefix)) {
    return {
      field: 'prefix',
      message: 'Token prefix must contain only letters and numbers',
    };
  }
  return null;
};

/**
 * Validate department form data
 */
export const validateDepartmentForm = (data: {
  name: string;
  prefix: string;
}): ValidationResult => {
  const errors: ValidationError[] = [];

  const nameError = validateDepartmentName(data.name);
  if (nameError) errors.push(nameError);

  const prefixError = validateDepartmentPrefix(data.prefix);
  if (prefixError) errors.push(prefixError);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Get error message for a specific field
 */
export const getFieldError = (
  errors: ValidationError[],
  field: string,
): string | null => {
  const error = errors.find((err) => err.field === field);
  return error ? error.message : null;
};
