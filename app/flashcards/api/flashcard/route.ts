console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('POST /flashcard/api called');
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

    const { question, answer } = body;
    if (!question?.trim() || !answer?.trim()) {
      console.log('Invalid input: question or answer missing');
      return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
    }

    const supabase = await createClient();
    console.log('Supabase client initialized');

    const { data, error } = await supabase
      .from('flashcards')
      .insert([{ question: question.trim(), answer: answer.trim() }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to add flashcard: ' + error.message }, { status: 500 });
    }

    console.log('Flashcard inserted successfully:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log('GET /flashcard/api called');
  try {
    const supabase = await createClient();
    console.log('Supabase client initialized');

    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch flashcards: ' + error.message }, { status: 500 });
    }

    console.log('Flashcards fetched successfully:', data);
    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error') },
      { status: 500 }
    );
  }
}