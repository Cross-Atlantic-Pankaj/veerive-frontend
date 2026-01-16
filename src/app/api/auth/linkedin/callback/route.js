import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: "Authorization code is missing" }, { status: 400 });
  }

  // Use relative URL for internal redirect
  const redirectUrl = `/api/auth/linkedin?code=${encodeURIComponent(code)}`;

  return NextResponse.redirect(redirectUrl);
}
