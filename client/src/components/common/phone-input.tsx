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
};

export default function PhoneNumberInput({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Phone Number</label>

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
        containerClass="w-full"
        inputStyle={{
          width: '100%',
          height: '44px',
          borderRadius: '8px',
          border: '1px solid #d1d5db',
          fontSize: '14px',
          color: 'black',
        }}
        buttonStyle={{
          borderTopLeftRadius: '8px',
          borderBottomLeftRadius: '8px',
        }}
      />
    </div>
  );
}
