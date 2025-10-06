import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ error: 'Note cannot be empty' }, { status: 400 });
    }

    const { error } = await supabase.from('notes').insert([{ content: content.trim() }]);

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to add note: ' + error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Note added' }, { status: 200 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json({ error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error') }, { status: 500 });
  }
}