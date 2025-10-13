import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Update a note
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('PATCH /api/note/', params.id, 'called');
  try {
    const { id } = params;
    const { content } = await req.json();

    if (!content?.trim()) {
      console.log('Invalid content: empty');
      return NextResponse.json({ error: 'Content is required and must be a non-empty string' }, { status: 400 });
    }

    const supabase = await createClient();
    console.log('Supabase client initialized');

    const { data, error } = await supabase
      .from('notes')
      .update({ content: content.trim() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'Failed to update note: ' + error.message }, { status: 500 });
    }

    console.log('Note updated successfully:', data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// Delete a note
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  console.log('DELETE /api/note/', params.id, 'called');
  try {
    const supabase = await createClient();
    console.log('Supabase client initialized');

    const { id } = params;

    const { error } = await supabase.from('notes').delete().eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: 'Failed to delete note: ' + error.message }, { status: 500 });
    }

    console.log('Note deleted successfully');
    return NextResponse.json({ message: 'Note deleted' }, { status: 200 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error') },
      { status: 500 }
    );
  }
}