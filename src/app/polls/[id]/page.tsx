import type { Metadata } from 'next';
import { PollDetailClient } from './PollDetailClient';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const isPM = id.includes('pm') || id.includes('national');
  const title = isPM
    ? 'Prime Minister (PM) Civic Poll — Lok Sabha 2029'
    : 'Chief Minister (CM) Civic Poll — State Assembly';
  const description = isPM
    ? 'All-India national opinion poll examining voter sentiment across the country for the Prime Minister election. Features national political parties with official symbols.'
    : 'State-specific legislative assembly poll examining citizen preferences for the Chief Minister election. 100% anonymous, decoupled response.';

  return {
    title,
    description,
  };
}

export default async function PollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PollDetailClient idOrSlug={id} />;
}
