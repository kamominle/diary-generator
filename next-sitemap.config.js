// next-sitemap.config.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

module.exports = {
  siteUrl: 'https://diary-generator.vercel.app',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  generateIndexSitemap: false,

  additionalPaths: async () => {
    const { data } = await supabase.from('diaries').select('slug');
    return data.map(diary => ({
      loc: `https://diary-generator.vercel.app/${diary.slug}`,
      changefreq: 'daily',
      priority: 0.7,
    }));
  },
};