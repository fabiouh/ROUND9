import { LegalPage, legalMetadata } from '@/components/marketing/legal-page';

export const generateMetadata = () => legalMetadata('contact');

export default function Page() {
  return <LegalPage page="contact" />;
}
