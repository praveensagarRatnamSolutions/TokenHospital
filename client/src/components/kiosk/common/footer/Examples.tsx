// Example 1: Basic responsive footer with buttons
import { ArrowBack, ArrowForward, Check } from '@/components/kiosk/common/icons';
import Footer from '.';
import Button from '../button';
import { Save } from 'lucide-react';
import { useState } from 'react';
function ResponsiveFooter() {
  return (
    <Footer.Root responsive>
      <Footer.Actions align="space-between" wrap>
        <Footer.Left>
          <Footer.ButtonGroup>
            <Button.Root variant="back" size="large">
              <Button.StartIcon>
                <ArrowBack />
              </Button.StartIcon>
              <Button.Text>Back</Button.Text>
            </Button.Root>
          </Footer.ButtonGroup>
        </Footer.Left>

        <Footer.Right>
          <Footer.ButtonGroup>
            <Button.Root variant="confirm" size="large">
              <Button.Text>Confirm</Button.Text>
              <Button.EndIcon>
                <Check />
              </Button.EndIcon>
            </Button.Root>
          </Footer.ButtonGroup>
        </Footer.Right>
      </Footer.Actions>
    </Footer.Root>
  );
}

// Example 2: Multi-section footer with responsive behavior
function MultiSectionResponsiveFooter() {
  return (
    <Footer.Root variant="sticky" responsive>
      <Footer.Actions align="space-between">
        <Footer.Left hideOnMobile>
          <span className="footer-logo">🏥 Kiosk System</span>
        </Footer.Left>

        <Footer.Center>
          <Footer.Progress currentStep={2} totalSteps={3} size="medium" showLabel />
        </Footer.Center>

        <Footer.Right>
          <Footer.ButtonGroup direction="row" gap="medium">
            <Button.Root variant="outline" size="medium">
              <Button.Text>Save</Button.Text>
            </Button.Root>

            <Footer.Divider orientation="vertical" hideOnMobile />

            <Button.Root variant="primary" size="medium">
              <Button.Text>Continue</Button.Text>
              <Button.EndIcon>
                <ArrowForward />
              </Button.EndIcon>
            </Button.Root>
          </Footer.ButtonGroup>
        </Footer.Right>
      </Footer.Actions>
    </Footer.Root>
  );
}

// Example 3: Mobile-optimized footer with stacked buttons
function MobileOptimizedFooter() {
  return (
    <Footer.Root variant="sticky" responsive>
      <Footer.Actions stacked>
        <Footer.ButtonGroup direction="column" gap="small">
          <Button.Root variant="primary" size="large" fullWidth>
            <Button.Text>Continue to Payment</Button.Text>
            <Button.EndIcon>
              <ArrowForward />
            </Button.EndIcon>
          </Button.Root>

          <Button.Root variant="outline" size="large" fullWidth>
            <Button.StartIcon>
              <ArrowBack />
            </Button.StartIcon>
            <Button.Text>Go Back</Button.Text>
          </Button.Root>
        </Footer.ButtonGroup>

        <Footer.Center>
          <Footer.Info size="small" hideOnMobile={false}>
            Secure checkout powered by Stripe
          </Footer.Info>
        </Footer.Center>
      </Footer.Actions>
    </Footer.Root>
  );
}

// Example 4: Footer with responsive button grid
function GridFooter() {
  const actions = [
    { label: 'Save Draft', icon: <Save />, variant: 'outline' },
    { label: 'Preview', icon: <Save />, variant: 'outline' },
    { label: 'Share', icon: <Save />, variant: 'outline' },
    { label: 'Publish', icon: <Save />, variant: 'confirm' },
  ];

  return (
    <Footer.Root responsive>
      <Footer.Actions>
        <div className="patient-checkin__footer-grid">
          {actions.map((action, index) => (
            <Button.Root
              key={index}
              variant={action.variant as any}
              size="medium"
              fullWidth
            >
              <Button.StartIcon>{action.icon}</Button.StartIcon>
              <Button.Text>{action.label}</Button.Text>
            </Button.Root>
          ))}
        </div>
      </Footer.Actions>
    </Footer.Root>
  );
}

// Example 5: Footer with responsive status and actions
function StatusResponsiveFooter() {
  const [isOnline, setIsOnline] = useState(true);

  return (
    <Footer.Root variant="floating" responsive>
      <Footer.Actions align="space-between" wrap>
        <Footer.Left hideOnMobile={false}>
          <div className="status-indicator">
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`} />
            <Footer.Info size="small">{isOnline ? 'Connected' : 'Offline'}</Footer.Info>
          </div>
        </Footer.Left>

        <Footer.Center hideOnMobile hideOnTablet>
          <Footer.Info>Last updated: 2 min ago</Footer.Info>
        </Footer.Center>

        <Footer.Right>
          <Footer.ButtonGroup direction="row" gap="small">
            <Button.Root variant="outline" size="small">
              <Button.StartIcon>
                <Save />
              </Button.StartIcon>
              <Button.Text>Sync</Button.Text>
            </Button.Root>

            <Button.Root variant="outline" size="small">
              <Button.StartIcon>
                <Save />
              </Button.StartIcon>
              <Button.Text>Settings</Button.Text>
            </Button.Root>
          </Footer.ButtonGroup>
        </Footer.Right>
      </Footer.Actions>
    </Footer.Root>
  );
}

export {
  ResponsiveFooter,
  MultiSectionResponsiveFooter,
  MobileOptimizedFooter,
  GridFooter,
  StatusResponsiveFooter,
};
