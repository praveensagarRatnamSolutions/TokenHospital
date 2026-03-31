import { Ad } from "../../admin/ads/types";

export interface KioskAd {
  adId: string | Ad;
  order: number;
  _id?: string;
}

export interface Kiosk {
  _id: string;
  name: string;
  code: string;
  hospitalId: string;
  departmentIds: string[] | any[];
  doctorIds: string[] | any[];
  ads: KioskAd[];
  locationType: 'reception' | 'waiting_area' | 'doctor_room' | 'general';
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKioskPayload {
  name: string;
  code: string;
  hospitalId: string;
  locationType?: string;
  departmentIds?: string[];
  doctorIds?: string[];
}

export interface UpdateKioskPayload {
  name?: string;
  locationType?: string;
  departmentIds?: string[];
  doctorIds?: string[];
  ads?: { adId: string; order: number }[];
  isActive?: boolean;
}

export interface KioskResponse {
  success: boolean;
  data: Kiosk;
  message?: string;
}

export interface KioskListResponse {
  success: boolean;
  count: number;
  data: Kiosk[];
  message?: string;
}
