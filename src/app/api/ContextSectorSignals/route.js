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

    const sectorsWithSubsectors = await Sector.aggregate([
      {
        $lookup: {
          from: 'subsectors',
          localField: '_id',
          foreignField: 'sectorId',
          as: 'subsectors',
        },
      },
      {
        $project: {
          _id: 1, 
          sectorName: 1, 
          subsectors: {
            _id: 1,
            subSectorName: 1,
          },
        },
      },
    ]);

    sectorsWithSubsectors.sort((a, b) => a.sectorName.localeCompare(b.sectorName));

    sectorsWithSubsectors.forEach(sector => {
      sector.subsectors.sort((a, b) => a.subSectorName.localeCompare(b.subSectorName));
    });

    const signalsWithSubsignals = await Signal.aggregate([
      {
        $lookup: {
          from: 'subsignals',
          localField: '_id',
          foreignField: 'signalId',
          as: 'subsignals',
        },
      },
      {
        $project: {
          _id: 1,
          signalName: 1, 
          subsignals: {
            _id: 1,
            subSignalName: 1,  
          },
        },
      },
    ]);

    signalsWithSubsignals.sort((a, b) => a.signalName.localeCompare(b.signalName));

    signalsWithSubsignals.forEach(signal => {
      signal.subsignals.sort((a, b) => a.subSignalName.localeCompare(b.subSignalName));
    });

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
