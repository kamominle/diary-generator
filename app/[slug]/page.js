import { supabase } from '@/utils/supabase';
import ClientPage from './ClientPage';

export async function generateMetadata({ params }) {
  const { data: diary } = await supabase
    .from('diaries')
    .select('name')
    .eq('slug', params.slug)
    .single();

  return {
    title: diary?.name || '日記',
  };
}

export default function Page() {
  return <ClientPage />;
}