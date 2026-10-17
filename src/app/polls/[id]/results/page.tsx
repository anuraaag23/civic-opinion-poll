import type { Metadata } from 'next';
import { LiveResultsView } from '@/components/results/LiveResultsView';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const isPM = id.includes('pm') || id.includes('national');
  const title = isPM
    ? 'Live Results — Prime Minister (PM) Civic Poll'
    : 'Live Results — Chief Minister (CM) Civic Poll';
  const description =
    'Real-time verified aggregate public counting and percentage distributions. Auto-syncing every 4 seconds with 100% cryptographic decoupling.';

  return {
    title,
    description,
  };
}

export default async function PollResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LiveResultsView pollIdOrSlug={id} />;
}
