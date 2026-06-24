import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const isSpamApp = process.env.NEXT_PUBLIC_IS_SPAM_APP === 'true';
  const domain = isSpamApp ? 'spam.reanswer.ru' : 'reanswer.ru';
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/register', '/login', '/privacy', '/legal', '/consent', '/settings/instructions', '/amo/policy'],
        disallow: ['/dashboard', '/reviews', '/questions', '/rules', '/settings', '/api/'],
      },
    ],
    sitemap: `https://${domain}/sitemap.xml`,
  };
}
