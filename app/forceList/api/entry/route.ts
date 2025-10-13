import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const { name, variant, description } = await req.json();

    if (!name?.trim() || !variant?.trim() || !description?.trim()) {
      return NextResponse.json({ error: 'All fields are required and must be non-empty' }, { status: 400 });
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('entries')
      .insert({ name: name.trim(), variant: variant.trim(), description: description.trim() })
      .select()
      .single();

    if (error) {
      console.error('Error adding entry:', error);
      return NextResponse.json({ error: 'Failed to add entry' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}