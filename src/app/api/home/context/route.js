import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Context from '@/models/Context';
import Sector from '@/models/Sector';

export async function GET(request) {
  try {
    await connectDB();

    if (!mongoose.models.Sector) {
      mongoose.model('Sector', Sector.schema);
    }

    const contexts = await Context.find({ isTrending: true })
      .populate({
        path: 'sectors',
        model: 'Sector',
        select: 'sectorName'
      })
      .sort({ date: -1 });

    console.log('Fetched contexts:', contexts.length);

    return new Response(JSON.stringify(contexts), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error in context API:', error);
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