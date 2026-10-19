import { LegalPage, legalMetadata } from '@/components/marketing/legal-page';

export const generateMetadata = () => legalMetadata('imprint');

export default function Page() {
  return <LegalPage page="imprint" />;
}
