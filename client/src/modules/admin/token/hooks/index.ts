'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as tokenApi from '../api/tokenApi';
import type { CreateTokenPayload, CreatePaymentPayload, VerifyPaymentPayload } from '../types';

export const useTokens = (filters: { appointmentDate?: string; page?: number; limit?: number; status?: string; doctorId?: string; departmentId?: string } = {}) => {
  return useQuery({
    queryKey: ['adminTokens', filters],
    queryFn: () => tokenApi.getTokens(filters),
  });
};

export const useCreateToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTokenPayload) => tokenApi.createToken(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTokens'] });
      queryClient.invalidateQueries({ queryKey: ['globalQueue'] });
    },
  });
};

export const useCancelToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tokenApi.cancelToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTokens'] });
      queryClient.invalidateQueries({ queryKey: ['globalQueue'] });
    },
  });
};

export const useVerifyCashToken = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tokenApi.verifyCashPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTokens'] });
      queryClient.invalidateQueries({ queryKey: ['globalQueue'] });
    },
  });
};

export const useCreatePaymentOrder = () => {
  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => tokenApi.createPaymentOrder(payload),
  });
};

export const useVerifyOnlinePayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyPaymentPayload) => tokenApi.verifyOnlinePayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminTokens'] });
      queryClient.invalidateQueries({ queryKey: ['globalQueue'] });
    },
  });
};
