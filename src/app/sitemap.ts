import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://meravote.in';
  const currentDate = new Date().toISOString();

  const routes = [
    '',
    '/pm',
    '/cm',
    '/polls',
    '/polls/poll-national-2029/results',
    '/about',
    '/how-to-use',
    '/safety',
    '/terms',
    '/privacy',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route.includes('results') || route === '' ? 'hourly' : 'daily',
    priority: route === '' ? 1.0 : route === '/pm' || route === '/cm' ? 0.9 : 0.7,
  }));
}
