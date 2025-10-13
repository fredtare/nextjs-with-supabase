import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Update a todo
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  console.log('PATCH /api/todo/', params.id, 'called');
  try {
    const { id } = params;
    const { task, is_complete } = await req.json();

    if (!task?.trim() && is_complete === undefined) {
      console.log('Invalid input: no task or is_complete provided');
      return NextResponse.json({ error: 'Task or is_complete must be provided' }, { status: 400 });
    }

    const supabase = await createClient();
    console.log('Supabase client initialized');

    const updateData: { task?: string; is_complete?: boolean } = {};
    if (task?.trim()) updateData.task = task.trim();
    if (is_complete !== undefined) updateData.is_complete = !!is_complete;

    const { data, error } = await supabase
      .from('todos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'Failed to update todo: ' + error.message }, { status: 500 });
    }

    console.log('Todo updated successfully:', data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// Delete a todo
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  console.log('DELETE /api/todo/', params.id, 'called');
  try {
    const supabase = await createClient();
    console.log('Supabase client initialized');

    const { id } = params;

    const { error } = await supabase.from('todos').delete().eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: 'Failed to delete todo: ' + error.message }, { status: 500 });
    }

    console.log('Todo deleted successfully');
    return NextResponse.json({ message: 'Todo deleted' }, { status: 200 });
  } catch (err) {
    console.error('API route error:', err);
    return NextResponse.json(
      { error: 'Server error: ' + (err instanceof Error ? err.message : 'Unknown error') },
      { status: 500 }
    );
  }
}