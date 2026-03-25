import React, { forwardRef, useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import './Select.css';
import { FieldErrors } from 'react-hook-form';
import { TypeCheckInDetailsFormInput } from '@/store/schema/patient.schema';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: string;
}

interface SelectProps {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: FieldErrors<TypeCheckInDetailsFormInput> | null;
  label?: string;
  icon?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'phone';
  register?: any;
  required?: boolean;
}

const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      name,
      value: controlledValue,
      onChange,
      onBlur,
      options,
      placeholder = 'Select an option',
      disabled = false,
      error = undefined,
      label,
      icon,
      size = 'md',
      variant = 'default',
      register,
      required = false,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(controlledValue || '');
    const [isFocused, setIsFocused] = useState(false);

    const triggerRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const selectId = `select-${Math.random().toString(36).substr(2, 9)}`;

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : internalValue;

    const selectedOption = options.find((opt) => opt.value === value);

    const handleSelect = (optionValue: string) => {
      if (disabled) return;

      if (!isControlled) {
        setInternalValue(optionValue);
      }

      onChange?.(optionValue);

      // Handle React Hook Form register
      if (register?.onChange) {
        const syntheticEvent = {
          target: {
            name: name,
            value: optionValue,
            type: 'select',
          },
        };
        register.onChange(syntheticEvent);
      }

      setIsOpen(false);
      setIsFocused(false);
    };

    const handleBlur = () => {
      setIsFocused(false);
      onBlur?.();
      if (register?.onBlur) {
        register.onBlur();
      }
    };

    const handleTriggerClick = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
        setIsFocused(true);
      }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          isOpen &&
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setIsFocused(false);
          handleBlur();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const hasError = useMemo(() => {
      return !!error?.gender?.message;
    }, [error]);

    console.log('hasError', hasError);

    // Close on escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (isOpen && event.key === 'Escape') {
          setIsOpen(false);
          setIsFocused(false);
          handleBlur();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    // Register initial value
    useEffect(() => {
      if (register && value) {
        const syntheticEvent = {
          target: {
            name: name,
            value: value,
            type: 'select',
          },
        };
        register.onChange(syntheticEvent);
      }
    }, []);

    return (
      <div ref={ref} className="select-field">
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'select-field__label',
              `select-field__label--${size}`,
              variant === 'phone' && 'select-field__label--phone',
            )}
          >
            {label}
            {required && <span className="required-star">*</span>}
          </label>
        )}

        <div
          className={cn(
            'select-field__wrapper',
            hasError && 'select-field__wrapper--error',
            isFocused && 'select-field__wrapper--focused',
            disabled && 'select-field__wrapper--disabled',
            variant === 'phone' && 'select-field__wrapper--phone',
          )}
        >
          {icon && (
            <span
              className={cn(
                'select-field__icon',
                isFocused && 'select-field__icon--active',
                hasError && 'select-field__icon--error',
              )}
            >
              {icon}
            </span>
          )}

          <button
            ref={triggerRef}
            type="button"
            id={selectId}
            className={cn(
              'select-field__trigger',
              `select-field__trigger--${size}`,
              isOpen && 'select-field__trigger--open',
              disabled && 'select-field__trigger--disabled',
            )}
            onClick={handleTriggerClick}
            disabled={disabled}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-invalid={hasError}
          >
            <span
              className={cn(
                'select-field__value',
                !value && 'select-field__value--placeholder',
              )}
            >
              {selectedOption?.label || placeholder}
            </span>
          </button>
        </div>

        {isOpen && (
          <div
            ref={dropdownRef}
            className={cn('select-field__dropdown', `select-field__dropdown--${size}`)}
            role="listbox"
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={cn(
                  'select-field__option',
                  `select-field__option--${size}`,
                  value === option.value && 'select-field__option--selected',
                  option.disabled && 'select-field__option--disabled',
                )}
                onClick={() => !option.disabled && handleSelect(option.value)}
                role="option"
                aria-selected={value === option.value}
                aria-disabled={option.disabled}
              >
                {option.icon && (
                  <span className="select-field__option-icon">{option.icon}</span>
                )}
                <span className="select-field__option-label">{option.label}</span>
                {value === option.value && (
                  <span className="select-field__option-check">✓</span>
                )}
              </div>
            ))}
          </div>
        )}

        {hasError && (
          <p className="select-field__error">{error?.gender?.message as string}</p>
        )}

        {/* Hidden input for form submission */}
        <input type="hidden" name={name} value={value} {...register} />
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
