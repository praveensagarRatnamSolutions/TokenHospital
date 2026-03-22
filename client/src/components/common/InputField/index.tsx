'use client';
import { cn } from '@/lib/utils';

// InputField.tsx - Composition Model with Refs and Close Icon
import React, {
  useState,
  InputHTMLAttributes,
  createContext,
  useContext,
  forwardRef,
  ForwardedRef,
  ReactElement,
} from 'react';
import './InputField.css';

// ===== Context for sharing state between components =====
interface InputFieldContextValue {
  id: string;
  isFocused: boolean;
  hasValue: boolean;
  error?: string | boolean;
  disabled?: boolean;
  setIsFocused: (focused: boolean) => void;
  setHasValue: (hasValue: boolean) => void;
}

const InputFieldContext = createContext<InputFieldContextValue | null>(null);

const useInputField = () => {
  const context = useContext(InputFieldContext);
  if (!context) {
    throw new Error('InputField components must be used within an InputField.Root');
  }
  return context;
};

// ===== Root Component =====
interface InputFieldRootProps {
  children: React.ReactNode;
  error?: string | boolean;
  disabled?: boolean;
  className?: string;
}

const InputFieldRoot: React.FC<InputFieldRootProps> = ({
  children,
  error,
  disabled,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const [id] = useState(() => `input-${Math.random().toString(36).substr(2, 9)}`);

  return (
    <InputFieldContext.Provider
      value={{
        id,
        isFocused,
        hasValue,
        error,
        disabled,
        setIsFocused,
        setHasValue,
      }}
    >
      <div className={cn('input-field__field', className)}>{children}</div>
    </InputFieldContext.Provider>
  );
};

// ===== Label Component =====
interface InputFieldLabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
  as?: React.ElementType;
}

const InputFieldLabel: React.FC<InputFieldLabelProps> = ({
  children,
  required,
  className = '',
  as: Component = 'label',
}) => {
  const { id } = useInputField();

  return (
    <Component
      htmlFor={Component === 'label' ? id : undefined}
      className={cn('input-field__label', className)}
    >
      {children}
      {required && <span className="required-asterisk">*</span>}
    </Component>
  );
};

// ===== Input Wrapper Component =====
interface InputFieldWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const InputFieldWrapper: React.FC<InputFieldWrapperProps> = ({
  children,
  className = '',
}) => {
  const { error } = useInputField();

  return (
    <div
      className={cn(
        'input-field__input-wrapper',
        error ? 'input-field__input-wrapper--error' : '',
        className,
      )}
    >
      {children}
    </div>
  );
};

// ===== Leading Icon Component (Left side) =====
interface InputFieldLeadingIconProps {
  children: ReactElement;
  className?: string;
  activeClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

const InputFieldLeadingIcon: React.FC<InputFieldLeadingIconProps> = ({
  children,
  className = '',
  activeClassName = 'input-field__input-icon--active',
  onClick,
}) => {
  const { isFocused, hasValue } = useInputField();

  return (
    <span
      className={cn(
        'material-symbols-outlined',
        'input-field__input-icon',
        'input-field__input-icon--leading',
        hasValue || isFocused ? activeClassName : '',
        onClick ? 'input-field__input-icon--clickable' : '',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </span>
  );
};

// ===== Trailing/Close Icon Component (Right side) =====
interface InputFieldTrailingIconProps {
  children: ReactElement;
  className?: string;
  activeClassName?: string;
  showWhen?: 'always' | 'hasValue' | 'focused' | 'hasValueOrFocused';
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void;
}

const InputFieldTrailingIcon: React.FC<InputFieldTrailingIconProps> = ({
  className = '',
  activeClassName = 'input-field__input-icon--active',
  showWhen = 'hasValueOrFocused',
  children,
  onClick,
}) => {
  const { isFocused, hasValue } = useInputField();

  const shouldShow = () => {
    switch (showWhen) {
      case 'always':
        return true;
      case 'hasValue':
        return hasValue;
      case 'focused':
        return isFocused;
      case 'hasValueOrFocused':
        return hasValue || isFocused;
      default:
        return hasValue || isFocused;
    }
  };

  if (!shouldShow()) return null;

  return (
    <span
      className={cn(
        'material-symbols-outlined',
        'input-field__clear-button',
        'input-field__clear-icon',
        hasValue || isFocused ? activeClassName : '',
        onClick ? 'input-field__input-icon--clickable' : '',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </span>
  );
};

// ===== Input Component with Ref Forwarding =====
interface InputFieldInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void;
  className?: string;
}

const InputFieldInput = forwardRef<HTMLInputElement, InputFieldInputProps>(
  (
    { onValueChange, className = '', onChange, onFocus, onBlur, value, ...props },
    ref: ForwardedRef<HTMLInputElement>,
  ) => {
    const { id, disabled: contextDisabled, setIsFocused, setHasValue } = useInputField();

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0);
      onValueChange?.(e.target.value);
      onChange?.(e);
    };

    return (
      <input
        ref={ref}
        id={id}
        className={cn('input-field__input', className)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        value={value}
        disabled={contextDisabled}
        {...props}
      />
    );
  },
);

InputFieldInput.displayName = 'InputFieldInput';

// ===== Error Message Component =====
interface InputFieldErrorProps {
  className?: string;
  children?: React.ReactNode;
}

const InputFieldError: React.FC<InputFieldErrorProps> = ({
  className = '',
  children,
}) => {
  const { error } = useInputField();

  if (!error || typeof error !== 'string') return null;

  return (
    <span className={cn('input-field__error-message', className)}>
      {children || error}
    </span>
  );
};

// ===== Helper Text Component =====
interface InputFieldHelperProps {
  children: React.ReactNode;
  className?: string;
}

const InputFieldHelper: React.FC<InputFieldHelperProps> = ({
  children,
  className = '',
}) => {
  return <span className={cn(`input-field__helper-text`, className)}>{children}</span>;
};

// ===== Compose and export =====
const InputField = {
  Root: InputFieldRoot,
  Label: InputFieldLabel,
  Wrapper: InputFieldWrapper,
  LeadingIcon: InputFieldLeadingIcon,
  TrailingIcon: InputFieldTrailingIcon,
  Input: InputFieldInput,
  Error: InputFieldError,
  Helper: InputFieldHelper,
};

export default InputField;
