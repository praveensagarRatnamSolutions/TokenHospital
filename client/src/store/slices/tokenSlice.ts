import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TokenState {
  selectedDepartment: any | null;
  selectedDoctor: any | null;
  patientDetails: {
    name: string;
    age: string;
    problem: string;
  };
  generatedToken: any | null;
  queueStatus: any | null;
}

const initialState: TokenState = {
  selectedDepartment: null,
  selectedDoctor: null,
  patientDetails: {
    name: '',
    age: '',
    problem: '',
  },
  generatedToken: null,
  queueStatus: null,
};

const tokenSlice = createSlice({
  name: 'token',
  initialState,
  reducers: {
    setSelectedDepartment: (state, action: PayloadAction<any>) => {
      state.selectedDepartment = action.payload;
    },
    setSelectedDoctor: (state, action: PayloadAction<any>) => {
      state.selectedDoctor = action.payload;
    },
    setPatientDetails: (state, action: PayloadAction<Partial<TokenState['patientDetails']>>) => {
      state.patientDetails = { ...state.patientDetails, ...action.payload };
    },
    setGeneratedToken: (state, action: PayloadAction<any>) => {
      state.generatedToken = action.payload;
    },
    setQueueStatus: (state, action: PayloadAction<any>) => {
      state.queueStatus = action.payload;
    },
    resetKioskFlow: (state) => {
      state.selectedDepartment = null;
      state.selectedDoctor = null;
      state.patientDetails = initialState.patientDetails;
      state.generatedToken = null;
    },
  },
});

export const {
  setSelectedDepartment,
  setSelectedDoctor,
  setPatientDetails,
  setGeneratedToken,
  setQueueStatus,
  resetKioskFlow,
} = tokenSlice.actions;
export default tokenSlice.reducer;
