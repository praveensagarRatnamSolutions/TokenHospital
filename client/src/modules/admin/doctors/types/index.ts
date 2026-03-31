export interface AvailabilitySlot {
    day: string;
    from: string;
    to: string;
}

export interface BreakSlot {
    from: string;
    to: string;
    label: string;
}

export interface TokenConfig {
    maxPerDay: number;
    avgTimePerPatient: number;
}

export interface Doctor {
    _id?: string;
    name: string;
    email?: string;
    password?: string;
    profilePic?: string; // S3 Key or URL

    departmentId: any; // Can be string ID or populated object

    hospitalId?: string;
    userId?: string;
    isAvailable: boolean;
    experience: number;
    consultationFee: number;
    availability: AvailabilitySlot[];

    tokenConfig: TokenConfig;
    currentToken?: number;
    breaks: BreakSlot[];
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
