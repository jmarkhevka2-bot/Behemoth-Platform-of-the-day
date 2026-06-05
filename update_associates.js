require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Key length:', supabaseKey?.length);

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateAssociates() {
  try {
    // Delete Sehajpreet Kaur
    const { error: deleteError1 } = await supabase
      .from('associates')
      .delete()
      .eq('first_name', 'Sehajpreet')
      .eq('last_name', 'Kaur');
    
    if (deleteError1) {
      console.error('Error deleting Sehajpreet:', deleteError1);
    } else {
      console.log('✅ Deleted Sehajpreet Kaur');
    }

    // Delete Murtaza Ibrahim
    const { error: deleteError2 } = await supabase
      .from('associates')
      .delete()
      .eq('first_name', 'Murtaza')
      .eq('last_name', 'Ibrahim');
    
    if (deleteError2) {
      console.error('Error deleting Murtaza:', deleteError2);
    } else {
      console.log('✅ Deleted Murtaza Ibrahim');
    }

    // Insert Jennifer Gorgees
    const { error: insertError } = await supabase
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
    
    if (insertError) {
      console.error('Error inserting Jennifer:', insertError);
    } else {
      console.log('✅ Added Jennifer Gorgees');
    }

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

updateAssociates();
