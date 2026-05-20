import { redirect } from 'next/navigation';

export default function ShippingPolicyRedirectPage() {
  redirect('/terms-and-conditions#delivery');
  return null;
}
