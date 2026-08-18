import { getSupabaseAdmin } from '@/lib/supabase';
import AdminDashboard from './AdminDashboard';

interface PageProps {
  params: Promise<{
    session: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  const session = decodeURIComponent(resolvedParams.session);

  // Fetch all responses for this session using the admin client (RLS bypass)
  const supabaseAdmin = getSupabaseAdmin();
  const { data: responses, error } = await supabaseAdmin
    .from('responses')
    .select('*')
    .eq('session', session)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching responses in page:', error);
  }

  return (
    <AdminDashboard
      session={session}
      initialResponses={responses || []}
    />
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
