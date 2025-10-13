import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('POST /api/todo called');
  try {
    const text = await request.text();
    console.log('Request body:', text);
    let body;
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('Request JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { content } = body;
    if (!content?.trim()) {
      console.log('Invalid content: empty');
      return NextResponse.json({ error: 'todos cannot be empty' }, { status: 400 });
    }

    const supabase = await createClient();
    console.log('Supabase client initialized');

    const { error: testError } = await supabase.from('todos').select('id').limit(1);
    if (testError) {
      console.error('Supabase connection error:', testError);
      return NextResponse.json({ error: 'Database connection failed: ' + testError.message }, { status: 500 });
    }

    const { error } = await supabase.from('todos').insert([{ content: content.trim() }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to add todos: ' + error.message }, { status: 500 });
    }

    console.log('task inserted successfully');
    return NextResponse.json({ message: 'task added' }, { status: 200 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error') },
      { status: 500 }
    );
  }
}