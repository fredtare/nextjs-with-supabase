import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

//PATCH
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { content } = await req.json();

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Content is required and must be a non-empty string' }, { status: 400 });
    }

    // Update the note in the database
    // Example with Prisma; adjust for your database
    const updatedNote = await db.note.update({
      where: { id },
      data: { content: content.trim() },
    });

    return NextResponse.json(updatedNote, { status: 200 });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 });
  }
}
//DE:LET
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