import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Source from '@/models/Source';

export async function GET(request) {
  try {
    await connectDB();

    // Register models explicitly
    if (!mongoose.models.Sector) {
      mongoose.model('Sector', Sector.schema);
    }
    if (!mongoose.models.SubSector) {
      mongoose.model('SubSector', SubSector.schema);
    }
    if (!mongoose.models.Source) {
      mongoose.model('Source', Source.schema);
    }
    
    // Fetch Trending Events
    const trendingEvents = await Context.find({ isTrending: true })
      .populate({
        path: 'sectors',
        model: 'Sector',
        select: 'sectorName'
      })
      .populate({
        path: 'subSectors',
        model: 'SubSector',
        select: 'subSectorName'
      })
      .sort({ date: -1 });

    // Fetch Trending Opinions
    const trendingOpinions = await Post.find({ 
      postType: "Expert Opinion",
      isTrending: true 
    })
    .populate({
      path: 'source',
      model: 'Source',
      select: 'sourceName'
    })
    .sort({ date: -1 })
    .limit(5);
    // Fetch Market Statistics
    const marketStatistics = await Post.find({ 
      postType: "Infographic",
      isTrending: true 
    })
    .populate({
      path: 'source',
      model: 'Source',
      select: 'sourceName'
    })
    .sort({ date: -1 })
    .limit(5);

    // Add debug logging
    console.log('Trending Events:', trendingEvents.length);
    console.log('Trending Opinions:', trendingOpinions.length);
    console.log('Market Statistics:', marketStatistics.length);

    return new Response(JSON.stringify({
      trendingEvents,
      trendingOpinions,
      marketStatistics
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error in API:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
} 