// Example 6: Form buttons with ref
import { useRef } from 'react';
import Button from '.';
import { ArrowBack, Check } from '@/components/kiosk/common/icons';
function FormButtonsExample() {
  const submitRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleSubmit = () => {
    console.log('Form submitted');
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    cancelRef.current?.focus();
  };

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <Button.Root ref={cancelRef} variant="outline" onClick={handleCancel}>
        <Button.StartIcon>
          <ArrowBack />
        </Button.StartIcon>
        <Button.Text>Cancel</Button.Text>
      </Button.Root>

      <Button.Root ref={submitRef} variant="confirm" onClick={handleSubmit}>
        <Button.Text>Submit</Button.Text>
        <Button.EndIcon>
          <Check />
        </Button.EndIcon>
      </Button.Root>
    </div>
  );
}
