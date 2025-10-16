import { createClient } from '@/lib/supabase/server';
import FlashcardClient from './FlashcardClient';
import { Suspense } from 'react';

async function fetchFlashcards() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('flashcards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching flashcards:', error.message);
    return [];
  }
  return data || [];
}

export default async function FlashcardsPage() {
  const flashcards = await fetchFlashcards();

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><p className="text-lg text-gray-600">Loading...</p></div>}>
      <FlashcardClient initialFlashcards={flashcards} />
    </Suspense>
  );
}