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
      .select(
        'themeTitle sectors subSectors trendingScore impactScore predictiveMomentumScore overallScore bannerImage'
      );

    const sectors = await Sector.find({})
      .select('sectorName')
      .sort({ sectorName: 1 });

    const subsectors = await SubSector.find({})
      .select('subSectorName sectorId')
      .sort({ subSectorName: 1 });

    const formattedSectors = sectors.map((sector) => {
      const relatedSubsectors = subsectors
        .filter((subsector) => subsector.sectorId && subsector.sectorId.toString() === sector._id.toString())
        .map((subsector) => ({
          subSectorId: subsector._id.toString(),
          subSectorName: subsector.subSectorName,
        }));

      return {
        sectorId: sector._id.toString(),
        sectorName: sector.sectorName,
        subsectors: relatedSubsectors,
      };
    });

    formattedSectors.sort((a, b) => a.sectorName.localeCompare(b.sectorName));

    return NextResponse.json({
      success: true,
      data: themes,
      Sectordata: formattedSectors,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}