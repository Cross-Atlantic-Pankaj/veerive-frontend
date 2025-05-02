import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import User from '@/models/User';

export async function POST(request) {
  try {
    await connectDB();

    const { postId, email, action } = await request.json();

    // Validate email
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 401 });
    }

    // Validate postId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    // Validate action
    if (!['save', 'unsave'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'save') {
      // Check if the post is already saved
      const isAlreadySaved = user.savedPosts.some(
        (post) => post.SavedpostId.toString() === postId && post.SavedpostType === 'Post'
      );

      if (isAlreadySaved) {
        return NextResponse.json({ message: 'Post already saved' }, { status: 200 });
      }

      // Add the post to savedPosts
      user.savedPosts.push({
        SavedpostId: postId,
        SavedpostType: 'Post',
        savedAt: new Date(),
      });

      await user.save();

      return NextResponse.json({ message: 'Post saved successfully' }, { status: 200 });
    } else if (action === 'unsave') {
      // Check if the post is saved
      const isSaved = user.savedPosts.some(
        (post) => post.SavedpostId.toString() === postId && post.SavedpostType === 'Post'
      );

      if (!isSaved) {
        return NextResponse.json({ message: 'Post not saved' }, { status: 200 });
      }

      // Remove the post from savedPosts
      user.savedPosts = user.savedPosts.filter(
        (post) => post.SavedpostId.toString() !== postId || post.SavedpostType !== 'Post'
      );

      await user.save();

      return NextResponse.json({ message: 'Post unsaved successfully' }, { status: 200 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');
    const email = searchParams.get('email');

    // Validate email
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 401 });
    }

    // Validate postId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return NextResponse.json({ error: 'Invalid post ID' }, { status: 400 });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if the post is saved
    const isSaved = user.savedPosts.some(
      (post) => post.SavedpostId.toString() === postId && post.SavedpostType === 'Post'
    );

    return NextResponse.json({ isSaved }, { status: 200 });
  } catch (error) {
    console.error('Error checking saved status:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}