export interface TokenPatientDetails {
  _id?: string;
  name: string;
  phone: string | {
    full: string;
    countryCode?: string;
    country?: string;
    nationalNumber?: string;
  };
  age?: number;
  gender?: 'Male' | 'Female' | 'Other';
}

export interface Token {
  _id: string;
  tokenNumber: string;
  sequenceNumber: number;
  departmentId: { _id: string; name: string; prefix: string; } | string;
  doctorId: { _id: string; name: string; } | string | null;
  hospitalId: string;
  patientId: TokenPatientDetails | string;
  status: 'PROVISIONAL' | 'WAITING' | 'CALLED' | 'COMPLETED' | 'CANCELED';
  paymentId?: string;
  appointmentDate: string;
  paymentType?: 'CASH' | 'UPI' | 'CARD';
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTokenPayload {
  departmentId: string;
  doctorId?: string;
  appointmentDate: string;
  paymentType?: 'CASH' | 'UPI' | 'CARD';
  patientId?: string;
  patientDetails?: TokenPatientDetails;
  isEmergency?: boolean;
}

export interface CreatePaymentPayload {
  amount: number;
  method: 'CASH' | 'UPI' | 'CARD';
  tokenId: string;
  doctorId: string;
  departmentId: string;
  patientDetails: any;
  patientId?: string;
  metadata?: any;
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface TokenListResponse {
  success: boolean;
  tokens: Token[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
  stats?: {
    totalCreated: number;
    emergencyCount: number;
    waitingCount: number;
    activeCount: number;
  };
}

export interface SingleTokenResponse {
  success: boolean;
  data: Token;
}
