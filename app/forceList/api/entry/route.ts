//kasutatud Groki abi
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Create a new mech
export async function POST(req: NextRequest) {
  try {
    const { name, variant, description } = await req.json();

    if (!name?.trim() || !variant?.trim() || !description?.trim()) {
      console.log('Invalid input: All fields must be non-empty');
      return NextResponse.json({ error: 'All fields are required and must be non-empty' }, { status: 400 });
    }

    const supabase = createClient();
    console.log('Supabase client initialized');

    const { data, error } = await supabase
      .from('mechs')
      .insert({ name: name.trim(), variant: variant.trim(), description: description.trim() })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to add entry: ' + error.message }, { status: 500 });
    }

    console.log('Mech inserted successfully:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Fetch all mechs
export async function GET() {
  try {
    const supabase = createClient();
    console.log('Supabase client initialized');

    const { data, error } = await supabase
      .from('mechs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch mechs: ' + error.message }, { status: 500 });
    }

    console.log('Mechs fetched successfully:', data);
    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error') },
      { status: 500 }
    );
  }
}