import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { id } = params;

  const { error } = await supabase.from('notes').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete note: ' + error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Note deleted' }, { status: 200 });
}