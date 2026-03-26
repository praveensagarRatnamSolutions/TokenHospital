'use client';

import './CheckInDetails.css';

import KioskButton from '../common/button';
import Footer from '../common/footer';
import {
  ArrowBack,
  Backspace,
  Calendar,
  Check,
  Help,
  MedicalServices,
  OutlinePerson,
  Phone,
} from '../common/icons';
import InputField from '../common/input/Input';
import Select from '../common/select/Select';
import useCheckDetails, { ICheckDetailsProps } from './useCheckDetails';

export default function PatientCheckin(props: ICheckDetailsProps) {
  const { errors, register, handleClearPhone, handleBack, handleConfirm, handleSubmit } =
    useCheckDetails(props);

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <form onSubmit={handleSubmit(handleConfirm)} className="patient-checkin">
      {/* TopAppBar */}
      <header className="patient-checkin__header">
        <div className="patient-checkin__brand">
          <div className="patient-checkin__brand-icon-wrapper">
            <span className="material-symbols-outlined patient-checkin__brand-icon">
              <MedicalServices />
            </span>
          </div>
          <div>
            <h1 className="patient-checkin__title">Hospital Name</h1>
            <p className="patient-checkin__subtitle">Patient Check-in</p>
          </div>
        </div>
        <div className="patient-checkin__help">
          <span className="material-symbols-outlined patient-checkin__help-icon">
            <Help />
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="patient-checkin__main">
        <div className="patient-checkin__grid">
          {/* Left Column: Primary Forms */}
          {/* <div className="patient-checkin__left-column"> */}
          {/* Instruction Card */}
          <div className="patient-checkin__instruction">
            <h2 className="patient-checkin__instruction-title">Welcome</h2>
            <p className="patient-checkin__instruction-text">
              Please complete the check-in details below to proceed to your appointment.
            </p>
          </div>

          {/* Input Fields Section */}
          <div className="patient-checkin__form">
            {/* Full Name */}
            <InputField.Root error={errors.name?.message?.toString()}>
              <InputField.Label>Full Name</InputField.Label>
              <InputField.Wrapper>
                <InputField.LeadingIcon>
                  <OutlinePerson />
                </InputField.LeadingIcon>
                <InputField.Input placeholder="e.g. John Doe" {...register('name')} />
              </InputField.Wrapper>
              <InputField.Error />
            </InputField.Root>

            <div className="patient-checkin__row">
              {/* Age */}
              <InputField.Root error={errors.age?.message?.toString()}>
                <InputField.Label>Age</InputField.Label>
                <InputField.Wrapper>
                  <InputField.LeadingIcon>
                    <Calendar />
                  </InputField.LeadingIcon>
                  <InputField.Input
                    placeholder="00"
                    {...register('age')}
                    inputMode="numeric"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
                    }}
                  />
                </InputField.Wrapper>
                <InputField.Error />
              </InputField.Root>
              {/* Weight */}
              {/* <InputField.Root error={errors.weight?.message?.toString()}>
                <InputField.Label>Weight</InputField.Label>
                <InputField.Wrapper>
                  <InputField.LeadingIcon>
                    <Monitor />
                  </InputField.LeadingIcon>
                  <InputField.Input
                    placeholder="0.0"
                    {...register('weight')}
                    inputMode="decimal"
                    onInput={(e) => {
                      e.currentTarget.value = e.currentTarget.value.replace(
                        /[^0-9.]/g,
                        '',
                      );
                    }}
                  />
                </InputField.Wrapper>
                <InputField.Error />
              </InputField.Root> */}

              {/* Gender */}
              <Select
                name="gender"
                register={register('gender')}
                options={genderOptions}
                label="Gender"
                placeholder="Select a gender"
                size="md"
                error={errors}
              />
            </div>

            {/* Phone Number Display */}
            <InputField.Root error={errors.phone?.message?.toString()}>
              <InputField.Label>Phone Number</InputField.Label>
              <InputField.Wrapper>
                <InputField.LeadingIcon>
                  <Phone />
                </InputField.LeadingIcon>
                <InputField.Input
                  placeholder="00000000000"
                  {...register('phone')}
                  inputMode="numeric"
                  max={10}
                  onInput={(e) => {
                    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
                  }}
                />
                <InputField.TrailingIcon showWhen="hasValue" onClick={handleClearPhone}>
                  <Backspace />
                </InputField.TrailingIcon>
              </InputField.Wrapper>
              <InputField.Error />
            </InputField.Root>
          </div>
        </div>
      </main>

      {/* BottomNavBar / Actions */}
      <Footer.Root variant="sticky">
        <Footer.Actions align="space-between">
          <KioskButton.Root variant="back" onClick={handleBack} size="large">
            <KioskButton.StartIcon>
              <ArrowBack />
            </KioskButton.StartIcon>
            <KioskButton.Text>Back</KioskButton.Text>
          </KioskButton.Root>
          <KioskButton.Root type="submit" variant="confirm" size="large">
            <KioskButton.Text>Confirm</KioskButton.Text>
            <KioskButton.EndIcon>
              <Check />
            </KioskButton.EndIcon>
          </KioskButton.Root>
        </Footer.Actions>
      </Footer.Root>
    </form>
  );
}
