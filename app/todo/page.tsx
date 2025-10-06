import { createClient } from '@/lib/supabase/server';
import TodosClient from './TodoClient';
import { Suspense } from 'react';

async function fetchTodos() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching todos:', error.message);
    return [];
  }
  return data || [];
}

export default async function TodosPage() {
  const todos = await fetchTodos();

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><p className="text-lg text-gray-600">Loading...</p></div>}>
      <div className="container mx-auto p-6 max-w-3xl">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-6 text-center">Todo App</h1>
        <TodosClient initialTodos={todos} />
      </div>
    </Suspense>
  );
}