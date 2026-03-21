import React, {
  forwardRef,
  HTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
  createContext,
  useContext,
} from 'react';

// Context for sharing department data across composition components
interface DepartmentCardContextValue {
  department: Department;
  disabled?: boolean;
  variant?: 'default' | 'compact' | 'large';
}

const DepartmentCardContext = createContext<DepartmentCardContextValue | null>(null);

const useDepartmentCardContext = () => {
  const context = useContext(DepartmentCardContext);
  if (!context) {
    throw new Error(
      'DepartmentCard components must be used within a DepartmentCard.Root',
    );
  }
  return context;
};

// Types
export interface Department {
  _id: string;
  name: string;
  description: string;
  icon?: string;
}

// Omit the onSelect from HTMLAttributes to avoid conflict
export interface DepartmentCardRootProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'onSelect'
> {
  department: Department;
  onSelect?: (department: Department) => void;
  variant?: 'default' | 'compact' | 'large';
  disabled?: boolean;
  testId?: string;
}

export interface DepartmentCardIconProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  iconClassName?: string;
}

export interface DepartmentCardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface DepartmentCardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

export interface DepartmentCardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

// Root Component with Ref Forwarding
const DepartmentCardRoot = forwardRef<HTMLButtonElement, DepartmentCardRootProps>(
  (
    {
      department,
      onSelect,
      variant = 'default',
      disabled = false,
      testId,
      className = '',
      children,
      ...restProps
    },
    ref,
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
      if (!disabled && onSelect) {
        onSelect(department);
      }
      restProps.onClick?.(event);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>): void => {
      if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onSelect?.(department);
      }
      restProps.onKeyDown?.(event);
    };

    const cardClasses = [
      'select-department__card',
      variant !== 'default' && `select-department__card--${variant}`,
      disabled && 'select-department__card--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const contextValue: DepartmentCardContextValue = {
      department,
      disabled,
      variant,
    };

    return (
      <DepartmentCardContext.Provider value={contextValue}>
        <button
          ref={ref}
          type="button"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cardClasses}
          disabled={disabled}
          aria-label={`Select ${department.name} department`}
          aria-disabled={disabled}
          data-testid={testId}
          data-department-id={department._id}
          {...restProps}
        >
          {children}
        </button>
      </DepartmentCardContext.Provider>
    );
  },
);

DepartmentCardRoot.displayName = 'DepartmentCard.Root';

// Icon Component
const DepartmentCardIcon = forwardRef<HTMLDivElement, DepartmentCardIconProps>(
  ({ children, className = '', iconClassName = '', ...restProps }, ref) => {
    const { department } = useDepartmentCardContext();

    const iconClasses = ['select-department__card-icon', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={iconClasses} {...restProps}>
        {children || (
          <span
            className={`material-symbols-outlined select-department__card-icon-symbol ${iconClassName}`}
          >
            {department.icon || 'stethoscope'}
          </span>
        )}
      </div>
    );
  },
);

DepartmentCardIcon.displayName = 'DepartmentCard.Icon';

// Content Component
const DepartmentCardContent = forwardRef<HTMLDivElement, DepartmentCardContentProps>(
  ({ children, className = '', ...restProps }, ref) => {
    const contentClasses = ['select-department__card-content', className]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={contentClasses} {...restProps}>
        {children}
      </div>
    );
  },
);

DepartmentCardContent.displayName = 'DepartmentCard.Content';

// Title Component
const DepartmentCardTitle = forwardRef<HTMLHeadingElement, DepartmentCardTitleProps>(
  ({ children, className = '', ...restProps }, ref) => {
    const titleClasses = ['select-department__card-title', className]
      .filter(Boolean)
      .join(' ');

    return (
      <h2 ref={ref} className={titleClasses} {...restProps}>
        {children}
      </h2>
    );
  },
);

DepartmentCardTitle.displayName = 'DepartmentCard.Title';

// Description Component
const DepartmentCardDescription = forwardRef<
  HTMLParagraphElement,
  DepartmentCardDescriptionProps
>(({ children, className = '', ...restProps }, ref) => {
  const descriptionClasses = ['select-department__card-description', className]
    .filter(Boolean)
    .join(' ');

  return (
    <p ref={ref} className={descriptionClasses} {...restProps}>
      {children}
    </p>
  );
});

DepartmentCardDescription.displayName = 'DepartmentCard.Description';

// Export Compound Component
export const DepartmentCard = {
  Root: DepartmentCardRoot,
  Icon: DepartmentCardIcon,
  Content: DepartmentCardContent,
  Title: DepartmentCardTitle,
  Description: DepartmentCardDescription,
};

export default DepartmentCard;
