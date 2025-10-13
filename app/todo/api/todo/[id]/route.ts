//kasutatud Groki abi
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

//patch
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { content } = await req.json();

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Content is required and must be a non-empty string' }, { status: 400 });
    }

    // Update the note in the database
    // Example with Prisma; adjust for your database
    const updatedTodo = await db.todos.update({
      where: { id },
      data: { content: content.trim() },
    });

    return NextResponse.json(updatedTodo, { status: 200 });
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json({ error: 'Failed to update todo' }, { status: 500 });
  }
}
//DELET
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  console.log('DELETE /api/', params.id, 'called');
  try {
    const supabase = await createClient();
    console.log('Supabase client initialized');

    const { id } = params;

    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: 'Failed to delete task: ' + error.message }, { status: 500 });
    }

    console.log('Note deleted successfully');
    return NextResponse.json({ message: 'task deleted' }, { status: 200 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error') },
      { status: 500 }
    );
  }
}