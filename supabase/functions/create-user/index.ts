import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.json();
    const eventType = payload.type; // 'user.created' or 'user.updated'
    const { id, email_addresses, first_name, image_url, username } = payload.data;
    const email = email_addresses?.[0]?.email_address;

    // Use upsert to handle both user.created and user.updated events
    const { data, error } = await supabase
      .from('users')
      .upsert(
        {
          id,
          email,
          avatar_url: image_url,
          first_name,
          username: username || null,
        },
        { onConflict: 'id' }
      )
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return new Response(JSON.stringify(error), { status: 400 });
    }

    console.log(`User ${eventType}: ${id} (${email})`);

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: eventType === 'user.created' ? 201 : 200,
    });
  } catch (err) {
    console.error('Webhook error:', err);

    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
