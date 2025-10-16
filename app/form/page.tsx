import { createClient } from '@/lib/supabase/server';
import ContactFormClient from './FormClient';
import { Suspense } from 'react';

async function fetchContacts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('forms') // Changed from 'contacts' to 'form'
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching form submissions:', error.message);
    return [];
  }
  return data || [];
}

export default async function ContactPage() {
  const contacts = await fetchContacts();

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><p className="text-lg text-gray-600">Loading...</p></div>}>
      <ContactFormClient initialContacts={contacts} />
    </Suspense>
  );
}