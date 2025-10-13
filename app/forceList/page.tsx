import { createClient } from '@/lib/supabase/server';
import EntriesClient from './ForceClient'; // Adjust path

export default async function EntriesPage() {
  const supabase = createClient();
  const { data: entries, error } = await supabase
    .from('mechs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching mechs:', error);
    return <div>Error loading entries</div>;
  }

  return <EntriesClient initialEntries={entries || []} />;
}