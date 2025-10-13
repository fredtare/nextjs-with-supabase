import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Create a new note
export async function POST(request: Request) {
  console.log('POST /api/note called');
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
      return NextResponse.json({ error: 'Note cannot be empty' }, { status: 400 });
    }

    const supabase = await createClient();
    console.log('Supabase client initialized');

    const { data, error } = await supabase
      .from('notes')
      .insert([{ content: content.trim() }])
      .select() // Return the inserted note
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to add note: ' + error.message }, { status: 500 });
    }

    console.log('Note inserted successfully:', data);
    return NextResponse.json(data, { status: 201 }); // Return the new note
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// Fetch all notes
export async function GET() {
  console.log('GET /api/note called');
  try {
    const supabase = await createClient();
    console.log('Supabase client initialized');

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch notes: ' + error.message }, { status: 500 });
    }

    console.log('Notes fetched successfully:', data);
    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error') },
      { status: 500 }
    );
  }
}