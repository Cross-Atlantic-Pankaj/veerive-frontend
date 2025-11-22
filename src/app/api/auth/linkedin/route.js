import { NextResponse } from "next/server";
import axios from "axios";
import connectDB from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
// Use NEXT_PUBLIC_LINKEDIN_REDIRECT_URI to match client-side, or fallback to LINKEDIN_REDIRECT_URI
const REDIRECT_URI = process.env.NEXT_PUBLIC_LINKEDIN_REDIRECT_URI || process.env.LINKEDIN_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  console.log("🔹 LinkedIn auth callback received, code present:", !!code);

  if (!code) {
    console.error("❌ Authorization code is missing");
    return NextResponse.json({ error: "Authorization code is missing" }, { status: 400 });
  }

  // Validate environment variables
  if (!LINKEDIN_CLIENT_ID || !LINKEDIN_CLIENT_SECRET || !REDIRECT_URI || !JWT_SECRET) {
    console.error("❌ Missing required environment variables");
    return NextResponse.json(
      { error: "Server configuration error. Please contact support." },
      { status: 500 }
    );
  }

  return handleLinkedInAuth(code, req);
}

async function handleLinkedInAuth(code, req) {
  try {
    // Construct redirect URI dynamically from request to match what was sent to LinkedIn
    // This ensures it works regardless of environment (localhost, IP, or domain)
    const url = new URL(req.url);
    const dynamicRedirectUri = `${url.origin}/api/auth/linkedin/callback`;
    
    // Use dynamic redirect URI, but fallback to env variable if needed
    const redirectUriToUse = dynamicRedirectUri || REDIRECT_URI;
    
    console.log("🔄 Exchanging authorization code for access token...");
    console.log("🔹 Using redirect URI:", redirectUriToUse);
    
    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUriToUse,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      console.error("❌ No access token received from LinkedIn:", tokenResponse.data);
      return NextResponse.json({ error: "No access token received from LinkedIn" }, { status: 400 });
    }

    console.log("✅ Access token received, fetching user data from LinkedIn...");
    // Fetch user data from LinkedIn
    const userResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const { sub: linkedinId, email, name, picture } = userResponse.data;

    if (!email) {
      console.error("❌ No email received from LinkedIn");
      return NextResponse.json({ error: "Email is required for authentication" }, { status: 400 });
    }

    // Connect to DB and find or create user
    await connectDB();
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        name,
        linkedinId,
        avatar: picture || "",
        isVerified: true,
      });
      await user.save();
      console.log("✅ New user created:", user);
    } else {
      // Update existing user with LinkedIn ID if not set
      if (!user.linkedinId) {
        user.linkedinId = linkedinId;
        await user.save();
      }
      console.log("✅ User already exists:", user);
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    // Construct absolute URL from request to ensure it works with any origin
    const requestUrl = new URL(req.url);
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar
    };
    
    const redirectUrl = new URL('/home', requestUrl.origin);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('user', JSON.stringify(userData));
    
    return NextResponse.redirect(redirectUrl.toString());

  } catch (error) {
    console.error("❌ LinkedIn login error:", error.response ? error.response.data : error.message);
    
    // Provide more specific error messages
    if (error.response?.status === 400) {
      return NextResponse.json(
        { error: "Invalid authorization code. Please try logging in again." },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to authenticate with LinkedIn. Please try again." },
      { status: 500 }
    );
  }
}