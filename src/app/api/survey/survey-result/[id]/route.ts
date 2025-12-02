import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('API route called with id:', params.id);

  try {
    const supabase = createRouteHandlerClient({ cookies });
    console.log('Supabase client created');

    const { data, error } = await supabase
    .from('survey_responses')
    .select(`
      *,
      survey_settings:survey_settings_id (
        questions
      ),
      reviews (*)
    `)
    .eq('id', params.id)
    .single();

    console.log('Supabase query executed');

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      console.log('Survey result not found');
      return NextResponse.json({ error: 'Survey result not found' }, { status: 404 });
    }

    console.log('Survey result found:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in API route:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}