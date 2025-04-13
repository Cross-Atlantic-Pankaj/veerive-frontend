import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Theme from '@/models/Theme';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';

export async function GET() {
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
      .sort({ overallScore: -1 })
      .populate('sectors', 'sectorName')
      .populate('subSectors', 'subSectorName')
      .select('themeTitle sectors subSectors trendingScore impactScore predictiveMomentumScore overallScore bannerImage');

    return NextResponse.json({ 
      success: true, 
      data: themes 
    });

  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}
