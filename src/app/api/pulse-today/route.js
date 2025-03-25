import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';

import connectDB from '@/lib/db';

export async function GET() {
	try {
		await connectDB();
		if (!mongoose.models.Sector) {
			mongoose.model('Sector', Sector.schema);
		}
		if (!mongoose.models.SubSector) {
			mongoose.model('SubSector', SubSector.schema);
		}
		if (!mongoose.models.Post) {
			mongoose.model('Post', Theme.schema);
		}
		const contexts = await Context.find()
      .populate({ path: 'sectors', model: Sector }) 
      .populate({ path: 'subSectors', model: SubSector })
      .populate({
        path: 'posts.postId',
        model: Post,
      })
      .exec();

    const processedContexts = contexts.map((context) => {
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

    return NextResponse.json({ contexts: processedContexts }, { status: 200 });
  } catch (error) {
    console.error('Error fetching Pulse Today data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}