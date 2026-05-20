// src/components/common/phone-input.tsx
'use client';

import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

export type PhoneData = {
  full: string;
  countryCode: string;
  country: string;
  nationalNumber: string;
};

type PhoneInputMeta = {
  dialCode: string;
  countryCode: string;
  name?: string;
};

type Props = {
  value: string;
  onChange: (phone: PhoneData) => void;
  showLabel?: boolean;
};

export default function PhoneNumberInput({ value, onChange, showLabel = true }: Props) {
  return (
    <div className="space-y-2">
      {showLabel && (
        <label className="text-sm font-medium text-gray-700">Phone Number</label>
      )}

      <PhoneInput
        country="in"
        value={value}
        onChange={(phone: string, data: PhoneInputMeta) => {
          if (!data?.dialCode) return;

          const full = `+${phone}`;
          const countryCode = `+${data.dialCode}`;
          const country = data.countryCode.toUpperCase();
          const nationalNumber = phone.slice(data.dialCode.length);

          onChange({
            full,
            countryCode,
            country,
            nationalNumber,
          });
        }}
        containerClass="!w-full"
        inputClass="!w-full !h-12 !pl-14 !pr-4 !bg-white !border !border-slate-200 !rounded-xl !text-slate-900 !text-sm focus:!border-primary focus:!ring-1 focus:!ring-primary !transition-all font-semibold"
        buttonClass="!bg-slate-50 !border !border-slate-200 !rounded-l-xl hover:!bg-slate-100"
        dropdownClass="!bg-white !text-slate-800"
      />
    </div>
  );
}
