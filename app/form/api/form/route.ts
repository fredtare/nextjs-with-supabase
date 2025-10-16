//kasutatud groki abi
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Create a new contact
export async function POST(request: Request) {
  console.log('POST /api/contact called');
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

    const { first_name, last_name, email, phone, message } = body;

    if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !message?.trim()) {
      console.log('Invalid input: required fields missing');
      return NextResponse.json({ error: 'First name, last name, email, and message are required' }, { status: 400 });
    }

    if (phone && isNaN(phone)) {
      console.log('Invalid phone: not a number');
      return NextResponse.json({ error: 'Phone must be a valid number' }, { status: 400 });
    }

    const supabase = await createClient();
    console.log('Supabase client initialized');

    const { data, error } = await supabase
      .from('forms') // Changed from 'contacts' to 'form'
      .insert([{ first_name: first_name.trim(), last_name: last_name.trim(), email: email.trim(), phone: phone ? parseInt(phone) : null, message: message.trim() }])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to submit form: ' + error.message }, { status: 500 });
    }

    console.log('Form submitted successfully:', data);
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// Fetch all form submissions
export async function GET() {
  console.log('GET /api/contact called');
  try {
    const supabase = await createClient();
    console.log('Supabase client initialized');

    const { data, error } = await supabase
      .from('forms') // Changed from 'contacts' to 'form'
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch form submissions: ' + error.message }, { status: 500 });
    }

    console.log('Form submissions fetched successfully:', data);
    return NextResponse.json(data || [], { status: 200 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error') },
      { status: 500 }
    );
  }
}