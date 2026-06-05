import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Delete Sehajpreet Kaur
    const { error: del1 } = await supabase
      .from('associates')
      .delete()
      .eq('first_name', 'Sehajpreet')
      .eq('last_name', 'Kaur');

    if (del1) {
      console.error('Error deleting Sehajpreet:', del1);
      return Response.json({ error: `Delete 1 failed: ${del1.message}` }, { status: 400 });
    }

    // Delete Murtaza Ibrahim
    const { error: del2 } = await supabase
      .from('associates')
      .delete()
      .eq('first_name', 'Murtaza')
      .eq('last_name', 'Ibrahim');

    if (del2) {
      console.error('Error deleting Murtaza:', del2);
      return Response.json({ error: `Delete 2 failed: ${del2.message}` }, { status: 400 });
    }

    // Insert Jennifer Gorgees
    const { error: insert } = await supabase
      .from('associates')
      .insert({
        name: 'Gorgees Jennifer',
        first_name: 'Jennifer',
        last_name: 'Gorgees',
        emoji: '⭐',
        season_points: 0,
        daily_points: 0,
        potd_wins: 0,
        current_tier: 'none',
        streak: 0,
        notes: '',
        tiers_unlocked: [],
      });

    if (insert) {
      console.error('Error inserting Jennifer:', insert);
      return Response.json({ error: `Insert failed: ${insert.message}` }, { status: 400 });
    }

    return Response.json({
      success: true,
      message: 'Successfully removed Sehajpreet and Murtaza, added Jennifer Gorgees',
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
