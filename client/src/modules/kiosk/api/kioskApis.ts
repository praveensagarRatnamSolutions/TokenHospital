import { AdListResponse } from '@/modules/admin/ads';
import api from '@/services/api';
import { TypeCheckInDetailsFormInput } from '@/store/schema/patient.schema';
import { AxiosError } from 'axios';
const ADS_ENDPOINT = '/api/ads';
const TOKEN_ENDPOINT = '/api/token';

export const getAds = async (): Promise<AdListResponse> => {
  try {
    const response = await api.get<AdListResponse>(`${ADS_ENDPOINT}`);
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      data: [],
      message: error.response?.data?.message || 'Failed to fetch ads',
    };
  }
};

export type PaymentMethodType = 'CASH' | 'UPI' | 'CARD';

export type CreateTokenPayload = {
  departmentId: string;
  patientDetails: TypeCheckInDetailsFormInput;
  doctorId: string;
  appointmentDate: string;
  paymentType: PaymentMethodType;
};

export type FieldErrorItem = {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
};

export type ApiValidationError = {
  success: boolean;
  errors: FieldErrorItem[];
};

export type ApiError = {
  success: boolean;
  message: string;
};

export type CreateTokenResponse = {
  success: true;
  data: Token;
};

export type Token = {
  _id: string;
  tokenNumber: string;
  sequenceNumber: number;

  departmentId: Department;
  doctorId: Doctor;

  hospitalId: string;
  status: TokenStatus;

  patientId: Patient;

  calledAt: string | null;
  completedAt: string | null;
  canceledAt: string | null;

  createdAt: string;
  updatedAt: string;
};

export type Department = {
  _id: string;
  name: string;
  prefix: string;
};

export type Doctor = {
  _id: string;
  name: string;
};

export type Patient = {
  _id: string;
  name: string;
  phone: string;
  age: number;
};

export type TokenStatus = 'PROVISIONAL' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';

export const createToken = async (
  payload: CreateTokenPayload,
): Promise<CreateTokenResponse> => {
  try {
    const response = await api.post<CreateTokenResponse>(`${TOKEN_ENDPOINT}`, payload);
    return response.data;
  } catch (error: unknown) {
    const err = error as AxiosError<any>;

    if (err?.response?.data?.errors) {
      throw {
        success: false,
        errors: err.response.data.errors,
      } satisfies ApiValidationError;
    }

    throw {
      success: false,
      message: err?.response?.data?.message || 'Failed to create token',
    } satisfies ApiError;
  }
};
