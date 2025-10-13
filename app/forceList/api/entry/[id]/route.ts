import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Update a mech
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { name, variant, description } = await req.json();

    if (!name?.trim() && !variant?.trim() && !description?.trim()) {
      console.log('Invalid input: At least one field must be non-empty');
      return NextResponse.json({ error: 'At least one field must be provided' }, { status: 400 });
    }

    const supabase = createClient();
    console.log('Supabase client initialized');

    const updateData: { name?: string; variant?: string; description?: string } = {};
    if (name?.trim()) updateData.name = name.trim();
    if (variant?.trim()) updateData.variant = variant.trim();
    if (description?.trim()) updateData.description = description.trim();

    const { data, error } = await supabase
      .from('mechs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ error: 'Failed to update entry: ' + error.message }, { status: 500 });
    }

    console.log('Mech updated successfully:', data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a mech
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const supabase = createClient();
    console.log('Supabase client initialized');

    const { error } = await supabase.from('mechs').delete().eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      return NextResponse.json({ error: 'Failed to delete entry: ' + error.message }, { status: 500 });
    }

    console.log('Mech deleted successfully');
    return NextResponse.json({ message: 'Entry deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}