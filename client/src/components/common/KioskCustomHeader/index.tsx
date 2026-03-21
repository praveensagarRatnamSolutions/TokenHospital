import { cn } from '@/lib/utils';
import './KioskCustomHeader.css';
import { ReactNode, FC } from 'react';

interface HeaderRootProps {
  children: ReactNode;
  className?: string;
}
const HeaderRoot: FC<HeaderRootProps> = ({ children, className }) => {
  return (
    <header className={cn('select-department__header', className)}>{children}</header>
  );
};

interface HearderContentProps {
  children: ReactNode;
  className?: string;
}

const HearderContent: FC<HearderContentProps> = ({ children, className }) => {
  return (
    <div className={cn('select-department__header-content', className)}>{children}</div>
  );
};

interface HeaderIconWrapperProps {
  children: ReactNode;
  className?: string;
}

const HeaderIconWrapper: FC<HeaderIconWrapperProps> = ({ children, className }) => {
  return (
    <div className={cn('select-department__icon-wrapper', className)}>{children}</div>
  );
};

interface HeaderIconProps {
  children: ReactNode;
  className?: string;
}
const HeaderIcon: FC<HeaderIconProps> = ({ children, className }) => {
  return (
    <div className={cn('material-symbols-outlined select-department__icon', className)}>
      {children}
    </div>
  );
};

interface HeaderTitleProps {
  children: ReactNode;
  className?: string;
}

const HeaderTitle: FC<HeaderTitleProps> = ({ children, className }) => {
  return <h1 className={cn('select-department__title', className)}>{children}</h1>;
};

interface HeaderSubTitleProps {
  children: ReactNode;
  className?: string;
}

const HeaderSubTitle: FC<HeaderTitleProps> = ({ children, className }) => {
  return <p className={cn('select-department__subtitle', className)}>{children}</p>;
};

const KioskCustomHeader = {
  Root: HeaderRoot,
  Content: HearderContent,
  IconWrapper: HeaderIconWrapper,
  Icon: HeaderIcon,
  Title: HeaderTitle,
  SubTitle: HeaderSubTitle,
};

export default KioskCustomHeader;
