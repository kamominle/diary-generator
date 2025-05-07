// next-sitemap.config.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

module.exports = {
  siteUrl: 'https://ai-sheep.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  generateIndexSitemap: false,

  additionalPaths: async () => {
    const { data } = await supabase
      .from('diaries')
      .select('slug')
      .eq('initial_display', true);  // 公開ページのみ取得

    return data.map(diary => ({
      loc: `https://ai-sheep.com/${diary.slug}`,
      changefreq: 'daily',
      priority: 0.7,
    }));
  },
};