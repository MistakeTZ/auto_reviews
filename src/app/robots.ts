import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/register', '/login', '/demo'],
        disallow: ['/dashboard', '/reviews', '/rules', '/settings', '/api/'],
      },
    ],
    sitemap: 'https://autoreviews.app/sitemap.xml',
  };
}
