// app/api/pulse-today/route.js
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import SidebarMessage from '@/models/SidebarMessage';
import connectDB from '@/lib/db';

export async function GET() {
  try {
    await connectDB();

    // Register models if they don't exist
    if (!mongoose.models.Sector) {
      mongoose.model('Sector', Sector.schema);
    }
    if (!mongoose.models.SubSector) {
      mongoose.model('SubSector', SubSector.schema);
    }
    if (!mongoose.models.Post) {
      mongoose.model('Post', Post.schema);
    }
    if (!mongoose.models.SidebarMessage) {
      mongoose.model('SidebarMessage', SidebarMessage.schema);
    }

    // Fetch both contexts and sidebar messages in parallel
    const [contextsResult, sidebarMessagesResult] = await Promise.all([
      // Fetch contexts with all necessary data
      Context.find()
        .populate({ path: 'sectors', model: Sector })
        .populate({ path: 'subSectors', model: SubSector })
        .populate({
          path: 'posts.postId',
          model: Post,
        })
        .exec(),
      
      // Fetch the most recent active sidebar message
      SidebarMessage.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(1)
        .exec()
    ]);

    // Process contexts data
    const processedContexts = contextsResult.map((context) => {
      const sectors = context.sectors.map((sector) => sector.sectorName);
      const subSectors = context.subSectors.map((subSector) => subSector.subSectorName);

      let contextPosts = context.posts
        .filter((post) => post.postId)
        .map((post) => post.postId);

      contextPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

      const containerSpace = 3;
      if (contextPosts.length > containerSpace) {
        contextPosts = contextPosts.filter((post) => post.isTrending);
        contextPosts = contextPosts.slice(0, containerSpace);
      }

      return {
        contextTitle: context.contextTitle,
        summary: context.summary,
        sectors,
        subSectors,
        posts: contextPosts.map((post) => ({
          postTitle: post.postTitle,
          date: post.date,
          summary: post.summary,
        })),
        bannerShow: context.bannerShow,
        bannerImage: context.bannerImage,
      };
    });

    // Process sidebar messages
    const processedMessages = sidebarMessagesResult.map(message => ({
      title: message.title,
      content: message.content,
      isActive: message.isActive,
      createdAt: message.createdAt
    }));

    return NextResponse.json({ 
      contexts: processedContexts,
      messages: processedMessages 
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching Pulse Today data:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();
    
    // Register SidebarMessage model if it doesn't exist
    if (!mongoose.models.SidebarMessage) {
      mongoose.model('SidebarMessage', SidebarMessage.schema);
    }

    const data = await request.json();
    
    // Handle both context creation and sidebar message creation
    if (data.type === 'sidebarMessage') {
      const message = await SidebarMessage.create(data);
      return NextResponse.json({ message }, { status: 201 });
    } else {
      // Handle context creation if needed
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message 
    }, { status: 500 });
  }
}