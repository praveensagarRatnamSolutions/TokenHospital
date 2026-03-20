// Footer.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import './Footer.css';

// ===== Context for sharing footer state =====
interface FooterContextValue {
  variant?: 'default' | 'sticky' | 'floating';
  breakpoint?: 'mobile' | 'tablet' | 'desktop';
}

const FooterContext = createContext<FooterContextValue | null>(null);

const useFooter = () => {
  const context = useContext(FooterContext);
  if (!context) {
    throw new Error('Footer components must be used within a Footer.Root');
  }
  return context;
};

// ===== Hook for responsive breakpoints =====
const useBreakpoint = () => {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>(
    'desktop',
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setBreakpoint('mobile');
      } else if (width >= 640 && width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
};

// ===== Root Component =====
interface FooterRootProps {
  children: React.ReactNode;
  variant?: 'default' | 'sticky' | 'floating';
  className?: string;
  as?: React.ElementType;
  responsive?: boolean;
}

const FooterRoot: React.FC<FooterRootProps> = ({
  children,
  variant = 'default',
  className = '',
  as: Component = 'footer',
  responsive = true,
}) => {
  const breakpoint = useBreakpoint();

  return (
    <FooterContext.Provider
      value={{ variant, breakpoint: responsive ? breakpoint : 'desktop' }}
    >
      <Component
        className={`
        custom-footer__footer
        custom-footer__footer--${variant}
        custom-footer__footer--${responsive ? breakpoint : 'desktop'}
        ${className}
      `}
      >
        {children}
      </Component>
    </FooterContext.Provider>
  );
};

// ===== Actions Container Component =====
interface FooterActionsProps {
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'center' | 'right' | 'space-between';
  wrap?: boolean;
  stacked?: boolean;
}

const FooterActions: React.FC<FooterActionsProps> = ({
  children,
  className = '',
  align = 'left',
  wrap = true,
  stacked,
}) => {
  const { breakpoint } = useFooter();
  const isStacked = stacked || breakpoint === 'mobile';

  return (
    <div
      className={`
      custom-footer__footer-actions
      custom-footer__footer-actions--${align}
      ${wrap ? 'custom-footer__footer-actions--wrap' : ''}
      ${isStacked ? 'custom-footer__footer-actions--stacked' : ''}
      custom-footer__footer-actions--${breakpoint}
      ${className}
    `}
    >
      {children}
    </div>
  );
};

// ===== Left Section Component =====
interface FooterLeftProps {
  children: React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

const FooterLeft: React.FC<FooterLeftProps> = ({
  children,
  className = '',
  hideOnMobile = false,
  hideOnTablet = false,
}) => {
  const { breakpoint } = useFooter();

  if (
    (hideOnMobile && breakpoint === 'mobile') ||
    (hideOnTablet && breakpoint === 'tablet')
  ) {
    return null;
  }

  return (
    <div
      className={`
      custom-footer__footer-left
      custom-footer__footer-left--${breakpoint}
      ${className}
    `}
    >
      {children}
    </div>
  );
};

// ===== Right Section Component =====
interface FooterRightProps {
  children: React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

const FooterRight: React.FC<FooterRightProps> = ({
  children,
  className = '',
  hideOnMobile = false,
  hideOnTablet = false,
}) => {
  const { breakpoint } = useFooter();

  if (
    (hideOnMobile && breakpoint === 'mobile') ||
    (hideOnTablet && breakpoint === 'tablet')
  ) {
    return null;
  }

  return (
    <div
      className={`
      custom-footer__footer-right
      custom-footer__footer-right--${breakpoint}
      ${className}
    `}
    >
      {children}
    </div>
  );
};

// ===== Center Section Component =====
interface FooterCenterProps {
  children: React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

const FooterCenter: React.FC<FooterCenterProps> = ({
  children,
  className = '',
  hideOnMobile = false,
  hideOnTablet = false,
}) => {
  const { breakpoint } = useFooter();

  if (
    (hideOnMobile && breakpoint === 'mobile') ||
    (hideOnTablet && breakpoint === 'tablet')
  ) {
    return null;
  }

  return (
    <div
      className={`
      custom-footer__footer-center
      custom-footer__footer-center--${breakpoint}
      ${className}
    `}
    >
      {children}
    </div>
  );
};

// ===== Divider Component =====
interface FooterDividerProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

const FooterDivider: React.FC<FooterDividerProps> = ({
  className = '',
  orientation = 'vertical',
  hideOnMobile = false,
  hideOnTablet = false,
}) => {
  const { breakpoint } = useFooter();

  if (
    (hideOnMobile && breakpoint === 'mobile') ||
    (hideOnTablet && breakpoint === 'tablet')
  ) {
    return null;
  }

  return (
    <div
      className={`
      custom-footer__footer-divider
      custom-footer__footer-divider--${orientation}
      custom-footer__footer-divider--${breakpoint}
      ${className}
    `}
    />
  );
};

// ===== Info Text Component =====
interface FooterInfoProps {
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
}

const FooterInfo: React.FC<FooterInfoProps> = ({
  children,
  className = '',
  size = 'medium',
  hideOnMobile = false,
  hideOnTablet = false,
}) => {
  const { breakpoint } = useFooter();

  if (
    (hideOnMobile && breakpoint === 'mobile') ||
    (hideOnTablet && breakpoint === 'tablet')
  ) {
    return null;
  }

  return (
    <div
      className={`
      custom-footer__footer-info
      custom-footer__footer-info--${size}
      custom-footer__footer-info--${breakpoint}
      ${className}
    `}
    >
      {children}
    </div>
  );
};

// ===== Button Group Component (for grouping buttons together) =====
interface FooterButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'column';
  gap?: 'small' | 'medium' | 'large';
}

const FooterButtonGroup: React.FC<FooterButtonGroupProps> = ({
  children,
  className = '',
  direction = 'row',
  gap = 'medium',
}) => {
  const { breakpoint } = useFooter();
  const responsiveDirection = breakpoint === 'mobile' ? 'column' : direction;

  return (
    <div
      className={`
      custom-footer__footer-button-group
      custom-footer__footer-button-group--${responsiveDirection}
      custom-footer__footer-button-group--gap-${gap}
      custom-footer__footer-button-group--${breakpoint}
      ${className}
    `}
    >
      {children}
    </div>
  );
};

// ===== Progress Indicator Component =====
interface FooterProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const FooterProgress: React.FC<FooterProgressProps> = ({
  currentStep,
  totalSteps,
  className = '',
  showLabel = true,
  size = 'medium',
}) => {
  const { breakpoint } = useFooter();
  const percentage = (currentStep / totalSteps) * 100;

  return (
    <div
      className={`
      custom-footer__footer-progress
      custom-footer__footer-progress--${size}
      custom-footer__footer-progress--${breakpoint}
      ${className}
    `}
    >
      {showLabel && (
        <span className="custom-footer__footer-progress-label">
          Step {currentStep} of {totalSteps}
        </span>
      )}
      <div className="custom-footer__footer-progress-bar">
        <div
          className="custom-footer__footer-progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ===== Compose and export =====
const Footer = {
  Root: FooterRoot,
  Actions: FooterActions,
  Left: FooterLeft,
  Right: FooterRight,
  Center: FooterCenter,
  Divider: FooterDivider,
  Info: FooterInfo,
  ButtonGroup: FooterButtonGroup,
  Progress: FooterProgress,
};

export default Footer;
