import { getResponses } from '@/lib/db';
import { CurationResponse } from '@/lib/questions';
import AdminDashboard from './AdminDashboard';

interface PageProps {
  params: Promise<{ session: string }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const session = decodeURIComponent(resolvedParams.session);

  let responses: CurationResponse[] = [];
  try {
    responses = await getResponses(session);
  } catch (err) {
    console.error('Error fetching responses:', err);
  }

  return (
    <AdminDashboard
      session={session}
      initialResponses={responses}
    />
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
