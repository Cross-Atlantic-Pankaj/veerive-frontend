import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: "Authorization code is missing" }, { status: 400 });
  }

  // Construct absolute URL from request to ensure it works with any origin
  const url = new URL(req.url);
  const redirectUrl = new URL('/api/auth/linkedin', url.origin);
  redirectUrl.searchParams.set('code', code);

  return NextResponse.redirect(redirectUrl.toString());
}
