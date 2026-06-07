import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    // Delete all Murtaza Ibrahim records
    const { error: delMurtaza } = await supabase
      .from('associates')
      .delete()
      .eq('first_name', 'Murtaza')
      .eq('last_name', 'Ibrahim');

    if (delMurtaza) {
      console.error('Error deleting Murtaza:', delMurtaza);
      return Response.json({ error: `Failed to delete Murtaza: ${delMurtaza.message}` }, { status: 400 });
    }

    // Delete all Sehajpreet Kaur records
    const { error: delSehaj } = await supabase
      .from('associates')
      .delete()
      .eq('first_name', 'Sehajpreet')
      .eq('last_name', 'Kaur');

    if (delSehaj) {
      console.error('Error deleting Sehajpreet:', delSehaj);
      return Response.json({ error: `Failed to delete Sehajpreet: ${delSehaj.message}` }, { status: 400 });
    }

    // Delete all Jada Sinclair records
    const { error: delJada } = await supabase
      .from('associates')
      .delete()
      .eq('first_name', 'Jada')
      .eq('last_name', 'Sinclair');

    if (delJada) {
      console.error('Error deleting Jada:', delJada);
      return Response.json({ error: `Failed to delete Jada: ${delJada.message}` }, { status: 400 });
    }

    // Get all Jennifers to delete extras
    const { data: jennifers, error: fetchErr } = await supabase
      .from('associates')
      .select('id, created_at')
      .eq('first_name', 'Jennifer')
      .eq('last_name', 'Gorgees')
      .order('created_at', { ascending: true });

    if (fetchErr) {
      console.error('Error fetching Jennifers:', fetchErr);
      return Response.json({ error: `Failed to fetch Jennifers: ${fetchErr.message}` }, { status: 400 });
    }

    // Delete all but the first Jennifer
    if (jennifers && jennifers.length > 1) {
      const idsToDelete = jennifers.slice(1).map(j => j.id);
      const { error: delJennifer } = await supabase
        .from('associates')
        .delete()
        .in('id', idsToDelete);

      if (delJennifer) {
        console.error('Error deleting duplicate Jennifers:', delJennifer);
        return Response.json({ error: `Failed to delete duplicate Jennifers: ${delJennifer.message}` }, { status: 400 });
      }
    }

    return Response.json({
      success: true,
      message: 'Successfully cleaned up duplicates: removed Murtaza, Sehajpreet, and extra Jennifers',
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
