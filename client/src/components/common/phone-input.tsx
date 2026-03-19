// src/components/common/phone-input.tsx
"use client";

import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function PhoneNumberInput({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Phone Number
      </label>

      <PhoneInput
        country="in"
        value={value}
        onChange={(phone, data) => {
          // Convert to E.164 format manually
          const formatted = `+${phone}`;
          onChange(formatted);
        }}
        containerClass="w-full"
        inputStyle={{
          width: "100%",
          height: "44px",
          borderRadius: "8px",
          border: "1px solid #d1d5db",
          fontSize: "14px",
        }}
        buttonStyle={{
          borderTopLeftRadius: "8px",
          borderBottomLeftRadius: "8px",
        }}
      />
    </div>
  );
}