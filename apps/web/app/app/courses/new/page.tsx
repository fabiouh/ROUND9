import { getTranslations } from 'next-intl/server';
import { PageHeader } from '@/components/app/page-header';
import { CourseForm } from '@/features/courses/course-form';

export async function generateMetadata() {
  return { title: (await getTranslations('app.courses'))('newTitle') };
}

export default async function NewCoursePage() {
  const t = await getTranslations('app.courses');
  return (
    <>
      <PageHeader title={t('newTitle')} description={t('newDescription')} />
      <CourseForm />
    </>
  );
}
