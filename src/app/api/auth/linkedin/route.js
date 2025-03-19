import { NextResponse } from 'next/server';
import axios from 'axios';
import connectDB from '@/lib/db';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI; // Set this in your .env file

export async function POST(req) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Authorization code is required' }, { status: 400 });
    }

    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://www.linkedin.com/oauth/v2/accessToken',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Fetch user profile from LinkedIn
    const profileResponse = await axios.get(
      'https://api.linkedin.com/v2/me?projection=(id,localizedFirstName,localizedLastName,profilePicture(displayImage~:playableStreams))',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const emailResponse = await axios.get(
      'https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const profile = profileResponse.data;
    const email = emailResponse.data.elements[0]['handle~'].emailAddress;

    await connectDB();

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name: `${profile.localizedFirstName} ${profile.localizedLastName}`,
        linkedinId: profile.id,
        avatar: profile.profilePicture?.['displayImage~']?.elements?.[0]?.identifiers?.[0]?.identifier,
        isVerified: true,
      });

      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return NextResponse.json({ message: 'Login successful', token, user });

  } catch (error) {
    console.error('LinkedIn login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
