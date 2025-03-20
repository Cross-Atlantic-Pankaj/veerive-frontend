// import { NextResponse } from "next/server";
// import axios from "axios";
// import connectDB from "@/lib/db";
// import User from "@/models/User";
// import jwt from "jsonwebtoken";

// const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
// const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
// const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
// const JWT_SECRET = process.env.JWT_SECRET;

// // ✅ Handle LinkedIn OAuth callback (GET request)
// export async function GET(req) {
//   const { searchParams } = new URL(req.url);
//   const code = searchParams.get("code");

//   if (!code) {
//     return NextResponse.json({ error: "Authorization code is missing" }, { status: 400 });
//   }

//   console.log("🔹 Received LinkedIn Auth Code - Converting to Access Token");
//   return handleLinkedInAuth(code);
// }

// // 🔥 Common function to handle LinkedIn authentication
// // async function handleLinkedInAuth(code) {
// //   try {
// //     // Exchange code for access token
// //     const tokenResponse = await axios.post(
// //       "https://www.linkedin.com/oauth/v2/accessToken",
// //       new URLSearchParams({
// //         grant_type: "authorization_code",
// //         code,
// //         redirect_uri: REDIRECT_URI,
// //         client_id: LINKEDIN_CLIENT_ID,
// //         client_secret: LINKEDIN_CLIENT_SECRET,
// //       }).toString(),
// //       { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
// //     );

// //     const accessToken = tokenResponse.data.access_token;
// //     console.log("✅ LinkedIn Access Token:", accessToken);

// //     // Fetch user data from LinkedIn
// //     const userResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
// //       headers: { Authorization: `Bearer ${accessToken}` },
// //     });

// //     const linkedinUser = userResponse.data;
// //     console.log("✅ LinkedIn User Data:", linkedinUser);

// //     const { sub: linkedinId, email, name, picture } = linkedinUser;

// //     await connectDB();
// //     let user = await User.findOne({ email });

// //     if (!user) {
// //       user = new User({
// //         email,
// //         name,
// //         linkedinId,
// //         avatar: picture || "",
// //         isVerified: true,
// //       });

// //       await user.save();
// //       console.log("✅ New user created:", user);
// //     } else {
// //       console.log("✅ User already exists:", user);
// //     }

// //     // Generate JWT token
// //     const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

// //     // ✅ Return JSON instead of redirecting
// //     // return NextResponse.json({ token, user });
// //     const redirectUrl = `${REDIRECT_URI}?token=${token}`;
// // return NextResponse.redirect(redirectUrl);

// //   } catch (error) {
// //     console.error("❌ LinkedIn login error:", error);
// //     return NextResponse.json({ error: "Internal server error" }, { status: 500 });
// //   }
// // }
// async function handleLinkedInAuth(code) {
//   try {
//       console.log("🔹 Exchanging code for token...");

//       const tokenResponse = await axios.post(
//           "https://www.linkedin.com/oauth/v2/accessToken",
//           new URLSearchParams({
//               grant_type: "authorization_code",
//               code,
//               redirect_uri: "http://localhost:3000/api/auth/linkedin/callback", // Ensure this matches LinkedIn settings
//               client_id: process.env.LINKEDIN_CLIENT_ID,
//               client_secret: process.env.LINKEDIN_CLIENT_SECRET,
//           }).toString(),
//           { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
//       );

//       console.log("✅ LinkedIn Token Response:", tokenResponse.data);
//       const accessToken = tokenResponse.data.access_token;

//       if (!accessToken) {
//           console.error("❌ No access token received from LinkedIn:", tokenResponse.data);
//           return NextResponse.json({ error: "No access token received from LinkedIn" }, { status: 400 });
//       }

//       // Fetch user profile from LinkedIn
//       const userResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
//           headers: { Authorization: `Bearer ${accessToken}` },
//       });

//       console.log("✅ LinkedIn User Data:", userResponse.data);

//       const user = userResponse.data;

//       // Generate a frontend redirect URL with the token
//       // const redirectUrl = `http://localhost:3000/login-success?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(user))}`;

//       return NextResponse.json({ token: accessToken, user });


//       // console.log("🔹 Redirecting to:", redirectUrl);
//       // return NextResponse.redirect(redirectUrl); // Redirect to frontend

//   } catch (error) {
//       console.error("❌ LinkedIn login error:", error.response ? error.response.data : error);
//       return NextResponse.json({ error: "Failed to authenticate with LinkedIn" }, { status: 500 });
//   }
// }



// /api/auth/linkedin
import { NextResponse } from "next/server";
import axios from "axios";
import connectDB from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.LINKEDIN_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Authorization code is missing" }, { status: 400 });
  }

  console.log("🔹 Received LinkedIn Auth Code - Converting to Access Token");
  return handleLinkedInAuth(code);
}

async function handleLinkedInAuth(code) {
  try {
    console.log("🔹 Exchanging code for token...");

    const tokenResponse = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("✅ LinkedIn Token Response:", tokenResponse.data);
    const accessToken = tokenResponse.data.access_token;

    if (!accessToken) {
      console.error("❌ No access token received from LinkedIn:", tokenResponse.data);
      return NextResponse.json({ error: "No access token received from LinkedIn" }, { status: 400 });
    }

    // Fetch user data from LinkedIn
    const userResponse = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log("✅ LinkedIn User Data:", userResponse.data);
    const { sub: linkedinId, email, name, picture } = userResponse.data;

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
      console.log("✅ User already exists:", user);
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    // Redirect to /dashboard with token and user data in query params
    const redirectUrl = new URL("http://localhost:3000/dashboard"); // Adjust base URL for production
    redirectUrl.searchParams.set("token", token);
    redirectUrl.searchParams.set("user", encodeURIComponent(JSON.stringify(user)));

    console.log("🔹 Redirecting to:", redirectUrl.toString());
    return NextResponse.redirect(redirectUrl);

  } catch (error) {
    console.error("❌ LinkedIn login error:", error.response ? error.response.data : error);
    return NextResponse.json({ error: "Failed to authenticate with LinkedIn" }, { status: 500 });
  }
}