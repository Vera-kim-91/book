import SurveyForm from './SurveyForm';

interface PageProps {
  params: Promise<{
    session: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const session = decodeURIComponent(resolvedParams.session);

  return <SurveyForm session={session} />;
}
export const dynamic = 'force-dynamic';
