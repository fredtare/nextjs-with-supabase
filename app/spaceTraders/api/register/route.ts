import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  console.log('POST /api/register called');
  try {
    const text = await request.text();
    console.log('Raw request body:', text);

    if (!text) {
      console.log('Empty request body');
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { email, username } = body;

    if (!email?.trim() || !username?.trim()) {
      console.log('Invalid input: required fields missing', { email, username });
      return NextResponse.json({ error: 'Email and username are required' }, { status: 400 });
    }

    const response = await fetch('https://api.spacetraders.io/v2/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), username: username.trim() }),
    });

    console.log('SpaceTraders response status:', response.status);
    console.log('SpaceTraders response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.json();

    if (!response.ok) {
      console.error('SpaceTraders error:', data);
      return NextResponse.json({ error: data.error?.message || 'Failed to register' }, { status: response.status });
    }

    console.log('Registration successful:', data);
    return NextResponse.json({ token: data.token }, { status: 201 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error') },
      { status: 500 }
    );
  }
}