import api from '@/services/api';
import type {
  Token,
  CreateTokenPayload,
  CreatePaymentPayload,
  VerifyPaymentPayload,
  TokenListResponse,
  SingleTokenResponse,
} from '../types';

const TOKEN_ENDPOINT = '/api/token';
const PAYMENT_ENDPOINT = '/api/payment';

export const getTokens = async (filters: any = {}): Promise<TokenListResponse> => {
  try {
    const response = await api.get<TokenListResponse>(TOKEN_ENDPOINT, { params: filters });
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch tokens',
    };
  }
};

export const createToken = async (payload: CreateTokenPayload): Promise<SingleTokenResponse> => {
  try {
    const response = await api.post<SingleTokenResponse>(TOKEN_ENDPOINT, payload);
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to create token',
    };
  }
};

export const cancelToken = async (id: string): Promise<SingleTokenResponse> => {
  try {
    const response = await api.patch<SingleTokenResponse>(`${TOKEN_ENDPOINT}/${id}/cancel`);
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to cancel token',
    };
  }
};

export const verifyCashPayment = async (id: string): Promise<SingleTokenResponse> => {
  try {
    const response = await api.patch<SingleTokenResponse>(`${TOKEN_ENDPOINT}/${id}/verify-cash`);
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to verify cash payment',
    };
  }
};

export const createPaymentOrder = async (payload: CreatePaymentPayload): Promise<any> => {
  try {
    const response = await api.post(`${PAYMENT_ENDPOINT}/create-order`, payload);
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to create payment order',
    };
  }
};

export const verifyOnlinePayment = async (payload: VerifyPaymentPayload): Promise<any> => {
  try {
    const response = await api.post(`${PAYMENT_ENDPOINT}/verify-payment`, payload);
    return response.data;
  } catch (error: any) {
    throw {
      success: false,
      message: error.response?.data?.message || 'Failed to verify online payment',
    };
  }
};
