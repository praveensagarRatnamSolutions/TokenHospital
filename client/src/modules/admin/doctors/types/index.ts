export interface BreakSlot {
  label: string;
  from: string;
  to: string;
}

export interface SessionSlot {
  label?: string;
  from: string;
  to: string;
  maxTokens?: number;
  avgTimePerPatient?: number;
  breaks: BreakSlot[];
}

export interface AvailabilitySlot {
  day: string;
  sessions: SessionSlot[];
}

export interface Doctor {
  _id?: string;
  name: string;
  email?: string;
  password?: string;
  profilePic?: string; // S3 Key or URL

  departmentId: any; // Can be string ID or populated object

  hospitalId?: string;
  userId?: {
    _id: string;
    email: string;
    profilePic: string;
  };
  isAvailable: boolean;
  experience: number;
  education?: string;
  consultationFee: number;
  availability: AvailabilitySlot[];

  currentToken?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface DoctorListResponse {
  success: boolean;
  doctors: Doctor[];
  pagination?: {
    total: number;
    page: number;
    pages: number;
  };
  message?: string;
}

export interface DoctorResponse {
  success: boolean;
  data: Doctor;
  message?: string;
}
