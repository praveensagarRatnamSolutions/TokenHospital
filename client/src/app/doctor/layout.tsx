import DoctorLayoutClient from './DoctorLayoutClient';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <DoctorLayoutClient>{children}</DoctorLayoutClient>;
}