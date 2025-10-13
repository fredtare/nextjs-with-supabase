import { createClient } from '@/lib/supabase/server';
import NotesClient from './ForceClient';
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
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><p className="text-lg text-gray-600">Loading...</p></div>}>
      <div className="container mx-auto p-6 max-w-3xl">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Notes App</h1>
        <NotesClient initialNotes={notes} />
      </div>
    </Suspense>
  );
}