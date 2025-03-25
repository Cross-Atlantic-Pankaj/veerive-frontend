import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import SidebarMessage from '@/models/SidebarMessage';

export async function GET() {
  try {
    await connectDB();
    // Get the most recent active message
    const messages = await SidebarMessage.find({ 
      isActive: true 
    }).sort({ 
      createdAt: -1 
    }).limit(1);
    
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error('Error fetching sidebar messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const data = await request.json();
    const message = await SidebarMessage.create(data);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 