import { createClient } from '@/lib/supabase/server';
import NotesClient from './NotesClient'; // We'll create this next
import { Suspense } from 'react';

async function fetchNotes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error.message);
    return [];
  }
  return data || [];
}

export default async function NotesPage() {
  const notes = await fetchNotes();

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Notes App</h1>
        <NotesClient initialNotes={notes} />
      </div>
    </Suspense>
  );
}