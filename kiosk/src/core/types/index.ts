export interface KioskAd {
  adId: {
    _id: string;
    title: string;
    type: 'image' | 'video';
    fileKey: string;
    duration: number;
    displayArea: string;
  };
  order: number;
}

export interface Department {
  _id: string;
  name: string;
  prefix: string;
  description?: string;
}

export interface SessionBreak {
  from: string;
  to: string;
  label: string;
  _id: string;
}

export interface AvailabilitySession {
  label: string;
  from: string;
  to: string;
  maxTokens: number;
  breaks: SessionBreak[];
  _id: string;
}

export interface DayAvailability {
  day: string;
  sessions: AvailabilitySession[];
  _id: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization?: string;
  profilePic?: string;
  departmentId: string | Department;
  isAvailable: boolean;
  experience?: number;
  availability?: DayAvailability[];
  consultationFee?: number;
}


export interface Kiosk {
  _id: string;
  name: string;
  code: string;
  locationType: string;
  hospitalId: string;
  departmentIds: any[];
  doctorIds: any[];
  ads: KioskAd[];
  isActive: boolean;
}

export interface Token {
  _id: string;
  tokenNumber: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  patientName: string;
  doctorId: {
    _id: string;
    name: string;
    profilePic?: string;
  };
  departmentId: {
    _id: string;
    name: string;
  };
}

/** Grouped token display data from /api/kiosk/token */
export interface DoctorQueueDisplay {
  id: string;
  name: string;
  room?: string;
  display: {
    emergency: string | null;
    current: string;
    next: string;
  };
  queue: string[];
  meta: {
    totalWaiting: number;
    estimatedWaitTime: string;
  };
}

export interface DepartmentQueue {
  id: string;
  name: string;
  doctors: DoctorQueueDisplay[];
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  hospitalId: string;
  token: string;
  doctorId?: {
    _id: string;
    departmentId?: string | Department;
  } | string;
}

export interface AuthResponse {
  success: boolean;
  data: User;
}

export interface KioskListResponse {
  success: boolean;
  data: Kiosk[];
}
