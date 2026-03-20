'use client';
// Button.tsx
import React, {
  ButtonHTMLAttributes,
  createContext,
  useContext,
  forwardRef,
  ForwardedRef,
} from 'react';
import './Button.css';

// ===== Context for sharing button state =====
interface ButtonContextValue {
  size?: 'small' | 'medium' | 'large';
  variant?: 'back' | 'confirm' | 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
}

const ButtonContext = createContext<ButtonContextValue | null>(null);

const useButton = () => {
  const context = useContext(ButtonContext);
  if (!context) {
    throw new Error('Button components must be used within a Button.Root');
  }
  return context;
};

// ===== Root Component =====
interface ButtonRootProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'back' | 'confirm' | 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

const ButtonRoot = forwardRef<HTMLButtonElement, ButtonRootProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      loading = false,
      fullWidth = false,
      disabled = false,
      className = '',
      type = 'button',
      ...props
    },
    ref: ForwardedRef<HTMLButtonElement>,
  ) => {
    return (
      <ButtonContext.Provider value={{ size, variant, disabled, loading }}>
        <button
          ref={ref}
          type={type}
          disabled={disabled || loading}
          className={`
          patient-checkin__footer-btn
          patient-checkin__footer-btn--${variant}
          patient-checkin__footer-btn--${size}
          ${fullWidth ? 'patient-checkin__footer-btn--full-width' : ''}
          ${loading ? 'patient-checkin__footer-btn--loading' : ''}
          ${className}
        `}
          {...props}
        >
          {children}
        </button>
      </ButtonContext.Provider>
    );
  },
);

ButtonRoot.displayName = 'ButtonRoot';

// ===== Start Icon Component =====
interface ButtonStartIconProps {
  children: React.ReactNode;
  className?: string;
}

const ButtonStartIcon: React.FC<ButtonStartIconProps> = ({
  children,
  className = '',
}) => {
  const { size } = useButton();

  return (
    <span
      className={`
      material-symbols-outlined
      patient-checkin__footer-icon
      patient-checkin__footer-icon--start
      patient-checkin__footer-icon--${size}
      ${className}
    `}
    >
      {children}
    </span>
  );
};

// ===== End Icon Component =====
interface ButtonEndIconProps {
  children: React.ReactNode;
  className?: string;
}

const ButtonEndIcon: React.FC<ButtonEndIconProps> = ({ children, className = '' }) => {
  const { size } = useButton();

  return (
    <span
      className={`
      material-symbols-outlined
      patient-checkin__footer-icon
      patient-checkin__footer-icon--end
      patient-checkin__footer-icon--${size}
      ${className}
    `}
    >
      {children}
    </span>
  );
};

// ===== Text Component =====
interface ButtonTextProps {
  children: React.ReactNode;
  className?: string;
}

const ButtonText: React.FC<ButtonTextProps> = ({ children, className = '' }) => {
  const { size, variant } = useButton();

  return (
    <span
      className={`
      patient-checkin__footer-text
      patient-checkin__footer-text--${variant}
      patient-checkin__footer-text--${size}
      ${className}
    `}
    >
      {children}
    </span>
  );
};

// ===== Loading Spinner Component =====
interface ButtonLoadingProps {
  className?: string;
}

const ButtonLoading: React.FC<ButtonLoadingProps> = ({ className = '' }) => {
  const { size } = useButton();

  return (
    <span
      className={`
      patient-checkin__footer-loading
      patient-checkin__footer-loading--${size}
      ${className}
    `}
    >
      <span className="patient-checkin__footer-spinner" />
    </span>
  );
};

// ===== Compose and export =====
const KioskButton = {
  Root: ButtonRoot,
  StartIcon: ButtonStartIcon,
  EndIcon: ButtonEndIcon,
  Text: ButtonText,
  Loading: ButtonLoading,
};

export type {
  ButtonRootProps,
  ButtonStartIconProps,
  ButtonEndIconProps,
  ButtonTextProps,
};

export default KioskButton;
