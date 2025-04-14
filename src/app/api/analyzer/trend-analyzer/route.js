import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Theme from '@/models/Theme';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';

let cachedSectors = null;
let cachedSubsectors = null;

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const sectorId = searchParams.get('sectorId') || null;
    const subSectorId = searchParams.get('subSectorId') || null;
    const skip = (page - 1) * limit;

    if (!mongoose.models.Sector) mongoose.model('Sector', Sector.schema);
    if (!mongoose.models.SubSector) mongoose.model('SubSector', SubSector.schema);
    if (!mongoose.models.Theme) mongoose.model('Theme', Theme.schema);

    const filter = {};
    if (sectorId) {
      filter.sectors = new mongoose.Types.ObjectId(sectorId);
    }
    if (subSectorId) {
      filter.subSectors = new mongoose.Types.ObjectId(subSectorId);
      const subSector = await SubSector.findById(subSectorId).select('sectorId');
      if (subSector && subSector.sectorId) {
        filter.sectors = subSector.sectorId;
      }
    }
    console.log(`Applied filter for page ${page}:`, filter);

    const themes = await Theme.find(filter)
      .sort({ overallScore: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .populate('sectors', 'sectorName')
      .populate('subSectors', 'subSectorName')
      .select(
        'themeTitle sectors subSectors trendingScore impactScore predictiveMomentumScore overallScore bannerImage'
      )
      .lean();

    console.log(`Raw themes for page ${page}:`, themes.map(t => t._id));
    const themeIds = themes.map((theme) => theme._id.toString());
    console.log(`Page ${page}: Theme IDs:`, themeIds);

    const totalThemes = await Theme.countDocuments(filter);

    let sectors, subsectors;
    if (cachedSectors && cachedSubsectors) {
      sectors = cachedSectors;
      subsectors = cachedSubsectors;
    } else {
      sectors = await Sector.find({}).select('sectorName').sort({ sectorName: 1 }).lean();
      subsectors = await SubSector.find({}).select('subSectorName sectorId').sort({ subSectorName: 1 }).lean();
      cachedSectors = sectors;
      cachedSubsectors = subsectors;
    }

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
      totalThemes,
      page,
      limit,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}