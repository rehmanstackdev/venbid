import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SITE_URL = 'https://venbid.com';
const API_URL = 'https://api.venbid.com';

async function fetchListings() {
  try {
    const response = await fetch(`${API_URL}/listings`);
    if (!response.ok) {
      console.warn('Failed to fetch listings, using empty array');
      return [];
    }
    return await response.json();
  } catch (error) {
    console.warn('Error fetching listings:', error.message);
    return [];
  }
}

function generateSitemap(listings) {
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/post-job', priority: '0.9', changefreq: 'weekly' },
    { url: '/auth/customer', priority: '0.7', changefreq: 'monthly' },
    { url: '/auth/vendor', priority: '0.7', changefreq: 'monthly' },
  ];

  const listingPages = listings.map(listing => ({
    url: `/listing/${listing.id}`,
    priority: '0.8',
    changefreq: 'weekly',
    lastmod: listing.updatedAt || listing.createdAt,
  }));

  const allPages = [...staticPages, ...listingPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${SITE_URL}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${new Date(page.lastmod).toISOString().split('T')[0]}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return sitemap;
}

async function main() {
  console.log('Generating sitemap...');
  
  const listings = await fetchListings();
  console.log(`Found ${listings.length} listings`);
  
  const sitemap = generateSitemap(listings);
  
  const publicDir = join(__dirname, '..', 'public');
  const sitemapPath = join(publicDir, 'sitemap.xml');
  
  writeFileSync(sitemapPath, sitemap);
  console.log(`Sitemap generated successfully at ${sitemapPath}`);
}

main().catch(console.error);
