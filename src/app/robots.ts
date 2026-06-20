import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/register', '/login', '/privacy', '/legal', '/consent', '/settings/instructions', '/amo/policy'],
        disallow: ['/dashboard', '/reviews', '/questions', '/rules', '/settings', '/api/'],
      },
    ],
    sitemap: 'https://reanswer.ru/sitemap.xml',
  };
}
