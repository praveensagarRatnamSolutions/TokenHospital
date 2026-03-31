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

export interface Doctor {
  _id: string;
  name: string;
  specialization?: string;
  profilePic?: string;
  departmentId: string | Department;
  isAvailable: boolean;
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

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  hospitalId: string;
  token: string;
}

export interface AuthResponse {
  success: boolean;
  data: User;
}

export interface KioskListResponse {
  success: boolean;
  data: Kiosk[];
}
