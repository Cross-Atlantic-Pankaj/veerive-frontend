import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Theme from '@/models/Theme';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';

export async function GET(request) {
  try {
    await connectDB();

    if (!mongoose.models.Sector) {
      mongoose.model('Sector', Sector.schema);
    }
    if (!mongoose.models.SubSector) {
      mongoose.model('SubSector', SubSector.schema);
    }
    if (!mongoose.models.Theme) {
      mongoose.model('Theme', Theme.schema);
    }

    const themes = await Theme.find({})
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
      .sort({ overallScore: -1 })
      .select('themeTitle sectors subSectors trendingScore impactScore predictiveMomentumScore overallScore');

    console.log('Number of themes found:', themes.length);
    if (themes.length > 0) {
      console.log('Sample theme:', {
        title: themes[0].themeTitle,
        overallScore: themes[0].overallScore
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: themes
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
      success: false,
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
