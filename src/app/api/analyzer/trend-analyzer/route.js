import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Theme from '@/models/Theme';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import tileTemplate from '@/models/TileTemplate';

let cachedSectors = null;
let cachedSubsectors = null;

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '9');
    const sectorId = searchParams.get('sectorId');
    const subSectorId = searchParams.get('subSectorId');

    if (!mongoose.models.Sector) mongoose.model('Sector', Sector.schema);
    if (!mongoose.models.SubSector) mongoose.model('SubSector', SubSector.schema);
    if (!mongoose.models.Theme) mongoose.model('Theme', Theme.schema);
    if (!mongoose.models.TileTemplate) {
          mongoose.model('TileTemplate', tileTemplate.schema);
        }

    const filter = {};

    if (sectorId) {
      filter.sectors = { $in: [new mongoose.Types.ObjectId(sectorId)] };
    }

    if (subSectorId) {
      const subSector = await SubSector.findById(subSectorId).select('sectorId');
      if (subSector && subSector.sectorId) {
        filter.$and = [
          { subSectors: { $in: [new mongoose.Types.ObjectId(subSectorId)] } },
          { sectors: { $in: [subSector.sectorId] } }
        ];
      } else {
        filter.subSectors = { $in: [new mongoose.Types.ObjectId(subSectorId)] };
      }
    }

    const aggregation = [
      { $match: filter },
      { $sort: { overallScore: -1, _id: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ];

    const themes = await Theme.aggregate(aggregation);

    const uniqueThemes = [...new Set(themes.map(t => t._id.toString()))].map(id => themes.find(t => t._id.toString() === id));

    const totalThemes = await Theme.countDocuments(filter);

    const populatedThemes = await Theme.populate(uniqueThemes, [
      { path: 'sectors', select: 'sectorName' },
      { path: 'subSectors', select: 'subSectorName' },
      { path: 'tileTemplateId', select: 'name type jsxCode', options: { strictPopulate: false }, },
    ]);

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

    const sectorsInThemes = new Set();
    const subSectorsInThemes = new Set();

    populatedThemes.forEach((theme) => {
      theme.sectors.forEach((sector) => sectorsInThemes.add(sector._id.toString()));
      theme.subSectors.forEach((subSector) => subSectorsInThemes.add(subSector._id.toString()));
    });

    const filteredSectors = sectors
      .filter((sector) => sectorsInThemes.has(sector._id.toString()))
      .map((sector) => {
        const relatedSubsectors = subsectors
          .filter((subsector) => subsector.sectorId && subsector.sectorId.toString() === sector._id.toString())
          .filter((subsector) => subSectorsInThemes.has(subsector._id.toString()))
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

    filteredSectors.sort((a, b) => a.sectorName.localeCompare(b.sectorName));

    return NextResponse.json({
      success: true,
      data: populatedThemes,
      Sectordata: filteredSectors,
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
