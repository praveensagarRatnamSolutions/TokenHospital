import React, {
  forwardRef,
  HTMLAttributes,
  ReactNode,
  createContext,
  useContext,
} from 'react';
import './DoctorCard.css';

// Context for sharing doctor data across composition components
interface DoctorCardContextValue {
  doctor: Doctor;
  disabled?: boolean;
  variant?: 'default' | 'compact' | 'large';
}

const DoctorCardContext = createContext<DoctorCardContextValue | null>(null);

const useDoctorCardContext = () => {
  const context = useContext(DoctorCardContext);
  if (!context) {
    throw new Error('DoctorCard components must be used within a DoctorCard.Root');
  }
  return context;
};

// Types
export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  available?: boolean;
  waiting?: number;
  image?: string;
}

// Omit onSelect from HTMLAttributes to avoid conflict
export interface DoctorCardRootProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'onSelect'
> {
  doctor: Doctor;
  onSelect?: (doctor: Doctor) => void;
  variant?: 'default' | 'compact' | 'large';
  disabled?: boolean;
  testId?: string;
}

export interface DoctorCardImageProps extends HTMLAttributes<HTMLDivElement> {
  imageUrl?: string;
  alt?: string;
}

export interface DoctorCardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface DoctorCardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface DoctorCardNameProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export interface DoctorCardStatusProps extends HTMLAttributes<HTMLSpanElement> {
  available?: boolean;
  children?: ReactNode;
}

export interface DoctorCardSpecialtyProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

export interface DoctorCardWaitingProps extends HTMLAttributes<HTMLDivElement> {
  waiting?: number;
  children?: ReactNode;
}

// Root Component with Ref Forwarding
const DoctorCardRoot = forwardRef<HTMLDivElement, DoctorCardRootProps>(
  (
    {
      doctor,
      onSelect,
      variant = 'default',
      disabled = false,
      testId,
      className = '',
      children,
      onClick,
      onKeyDown,
      ...restProps
    },
    ref,
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLDivElement>): void => {
      if (!disabled && onSelect) {
        onSelect(doctor);
      }
      onClick?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
      if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onSelect?.(doctor);
      }
      onKeyDown?.(event);
    };

    const cardClasses = [
      'select-doctor__card',
      variant !== 'default' && `select-doctor__card--${variant}`,
      disabled && 'select-doctor__card--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const contextValue: DoctorCardContextValue = {
      doctor,
      disabled,
      variant,
    };

    return (
      <DoctorCardContext.Provider value={contextValue}>
        <div
          ref={ref}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cardClasses}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`Select Dr. ${doctor.name}`}
          aria-disabled={disabled}
          data-testid={testId}
          data-doctor-id={doctor._id}
          {...restProps}
        >
          {children}
        </div>
      </DoctorCardContext.Provider>
    );
  },
);

DoctorCardRoot.displayName = 'DoctorCard.Root';

// Image Component
const DoctorCardImage = forwardRef<HTMLDivElement, DoctorCardImageProps>(
  ({ imageUrl, alt = 'Doctor', className = '', style = {}, ...restProps }, ref) => {
    const { doctor } = useDoctorCardContext();

    const defaultImage =
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop';
    const backgroundImage = imageUrl || doctor.image || defaultImage;

    const imageClasses = ['select-doctor__card-image', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={imageClasses}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          ...style,
        }}
        role="img"
        aria-label={alt}
        {...restProps}
      />
    );
  },
);

DoctorCardImage.displayName = 'DoctorCard.Image';

// Content Component
const DoctorCardContent = forwardRef<HTMLDivElement, DoctorCardContentProps>(
  ({ children, className = '', ...restProps }, ref) => {
    const contentClasses = ['select-doctor__card-content', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={contentClasses} {...restProps}>
        {children}
      </div>
    );
  },
);

DoctorCardContent.displayName = 'DoctorCard.Content';

// Header Component
const DoctorCardHeader = forwardRef<HTMLDivElement, DoctorCardHeaderProps>(
  ({ children, className = '', ...restProps }, ref) => {
    const headerClasses = ['select-doctor__card-header', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={headerClasses} {...restProps}>
        {children}
      </div>
    );
  },
);

DoctorCardHeader.displayName = 'DoctorCard.Header';

// Name Component
const DoctorCardName = forwardRef<HTMLHeadingElement, DoctorCardNameProps>(
  ({ children, className = '', ...restProps }, ref) => {
    const nameClasses = ['select-doctor__card-name', className].filter(Boolean).join(' ');

    return (
      <h3 ref={ref} className={nameClasses} {...restProps}>
        {children}
      </h3>
    );
  },
);

DoctorCardName.displayName = 'DoctorCard.Name';

// Status Component
const DoctorCardStatus = forwardRef<HTMLSpanElement, DoctorCardStatusProps>(
  ({ available, children, className = '', ...restProps }, ref) => {
    const { doctor } = useDoctorCardContext();
    const isAvailable = available !== undefined ? available : doctor.available;
    const statusText = children || (isAvailable ? 'Available' : 'Busy');

    const statusClasses = [
      'select-doctor__card-status',
      isAvailable
        ? 'select-doctor__card-status--available'
        : 'select-doctor__card-status--busy',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span ref={ref} className={statusClasses} {...restProps}>
        {statusText}
      </span>
    );
  },
);

DoctorCardStatus.displayName = 'DoctorCard.Status';

// Specialty Component
const DoctorCardSpecialty = forwardRef<HTMLParagraphElement, DoctorCardSpecialtyProps>(
  ({ children, className = '', ...restProps }, ref) => {
    const { doctor } = useDoctorCardContext();

    const specialtyClasses = ['select-doctor__card-specialty', className]
      .filter(Boolean)
      .join(' ');

    return (
      <p ref={ref} className={specialtyClasses} {...restProps}>
        {children || doctor.specialty}
      </p>
    );
  },
);

DoctorCardSpecialty.displayName = 'DoctorCard.Specialty';

// Waiting Component
const DoctorCardWaiting = forwardRef<HTMLDivElement, DoctorCardWaitingProps>(
  ({ waiting, children, className = '', ...restProps }, ref) => {
    const { doctor } = useDoctorCardContext();
    const waitingCount = waiting !== undefined ? waiting : doctor.waiting;

    const waitingClasses = ['select-doctor__card-waiting', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={waitingClasses} {...restProps}>
        <span className="material-symbols-outlined select-doctor__card-waiting-icon">
          group
        </span>
        <span className="select-doctor__card-waiting-text">
          {children || (
            <>
              Waiting: <strong>{waitingCount || 0} Patients</strong>
            </>
          )}
        </span>
      </div>
    );
  },
);

DoctorCardWaiting.displayName = 'DoctorCard.Waiting';

// Export Compound Component
export const DoctorCard = {
  Root: DoctorCardRoot,
  Image: DoctorCardImage,
  Content: DoctorCardContent,
  Header: DoctorCardHeader,
  Name: DoctorCardName,
  Status: DoctorCardStatus,
  Specialty: DoctorCardSpecialty,
  Waiting: DoctorCardWaiting,
};

export default DoctorCard;

/**
 * ------------------------------------------
 *              EXAMPLE
 * ------------------------------------------
 * 
 * import DoctorCard from './DoctorCard';

const BasicExample = () => {
  const doctor = {
    _id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    available: true,
    waiting: 3,
    image: 'https://example.com/doctor-image.jpg'
  };

  const handleSelect = (doctor: Doctor) => {
    console.log('Selected doctor:', doctor);
  };

  return (
    <DoctorCard.Root doctor={doctor} onSelect={handleSelect}>
      <DoctorCard.Image />
      <DoctorCard.Content>
        <DoctorCard.Header>
          <DoctorCard.Name>{doctor.name}</DoctorCard.Name>
          <DoctorCard.Status />
        </DoctorCard.Header>
        <DoctorCard.Specialty />
        <DoctorCard.Waiting />
      </DoctorCard.Content>
    </DoctorCard.Root>
  );
};
 */
