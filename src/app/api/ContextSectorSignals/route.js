import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Signal from '@/models/Signal';
import SubSignal from '@/models/SubSignal';
import connectDB from '@/lib/db';

export async function GET(request) {
  try {
    await connectDB();

    // Fetching sectors with their subsectors, including _id
    const sectorsWithSubsectors = await Sector.aggregate([
      {
        $lookup: {
          from: 'subsectors', // Name of the subsector collection
          localField: '_id',
          foreignField: 'sectorId',
          as: 'subsectors',
        },
      },
      {
        $project: {
          _id: 1,  // Include sector _id
          sectorName: 1,  // Include sector name
          subsectors: {
            _id: 1,  // Include subsector _id
            subSectorName: 1,  // Include subsector name
          },
        },
      },
    ]);

    // Sort sectors alphabetically by sectorName
    sectorsWithSubsectors.sort((a, b) => a.sectorName.localeCompare(b.sectorName));

    // Sort subsectors alphabetically within each sector
    sectorsWithSubsectors.forEach(sector => {
      sector.subsectors.sort((a, b) => a.subSectorName.localeCompare(b.subSectorName));
    });

    // Fetching signals with their subsignals, including _id
    const signalsWithSubsignals = await Signal.aggregate([
      {
        $lookup: {
          from: 'subsignals', // Name of the subsignal collection
          localField: '_id',
          foreignField: 'signalId',
          as: 'subsignals',
        },
      },
      {
        $project: {
          _id: 1,  // Include signal _id
          signalName: 1,  // Include signal name
          subsignals: {
            _id: 1,  // Include subsignal _id
            subSignalName: 1,  // Include subsignal name
          },
        },
      },
    ]);

    // Sort signals alphabetically by signalName
    signalsWithSubsignals.sort((a, b) => a.signalName.localeCompare(b.signalName));

    // Sort subsignals alphabetically within each signal
    signalsWithSubsignals.forEach(signal => {
      signal.subsignals.sort((a, b) => a.subSignalName.localeCompare(b.subSignalName));
    });

    // Return both sector-subsector and signal-subsignal data in the response
    return NextResponse.json(
      { 
        success: true, 
        data: { 
          sectors: sectorsWithSubsectors, 
          signals: signalsWithSubsignals 
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error fetching sectors, subsectors, signals, and subsignals:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
