'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { LiveResultsView } from '@/components/results/LiveResultsView';

export default function PollResultsPage() {
  const params = useParams();
  const idOrSlug = params.id as string;

  return <LiveResultsView pollIdOrSlug={idOrSlug} />;
}
