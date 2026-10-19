import { LegalPage, legalMetadata } from '@/components/marketing/legal-page';

export const generateMetadata = () => legalMetadata('terms');

export default function Page() {
  return <LegalPage page="terms" />;
}
