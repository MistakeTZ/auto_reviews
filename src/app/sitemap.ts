import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const isSpamApp = process.env.NEXT_PUBLIC_IS_SPAM_APP === 'true';
  const BASE_URL = isSpamApp ? 'https://spam.reanswer.ru' : 'https://reanswer.ru';
  const now = new Date();

  const routes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    },
  ];

  if (!isSpamApp) {
    routes.push({
      url: `${BASE_URL}/spam`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 1.0,
    });
  }

  routes.push(
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/legal`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/consent`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/register`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/settings/instructions`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/amo/policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    }
  );

  return routes;
}
