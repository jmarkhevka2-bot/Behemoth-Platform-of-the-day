export async function GET(request: Request) {
  return Response.json({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
    keyStart: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 50),
    nodeEnv: process.env.NODE_ENV,
  });
}
