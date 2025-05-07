import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Signal from '@/models/Signal';
import SubSignal from '@/models/SubSignal';
import Context from '@/models/Context';
import connectDB from '@/lib/db';

export async function GET(request) {
  try {
    await connectDB();

    const sectorsWithDetails = await Sector.aggregate([
      {
        $lookup: {
          from: 'subsectors',
          localField: '_id',
          foreignField: 'sectorId',
          as: 'subsectors',
        },
      },
      {
        $lookup: {
          from: 'contexts',
          localField: '_id',
          foreignField: 'sectors',
          as: 'contexts',
        },
      },
      {
        $unwind: {
          path: '$contexts',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'contexts._id',
          foreignField: 'contexts',
          as: 'contextPosts',
        },
      },
      {
        $group: {
          _id: '$_id',
          sectorName: { $first: '$sectorName' },
          subsectors: { $first: '$subsectors' },
          totalPostCount: {
            $sum: { $size: { $ifNull: ['$contextPosts', []] } },
          },
        },
      },      {
        $unwind: {
          path: '$subsectors',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'contexts',
          localField: 'subsectors._id',
          foreignField: 'subSectors',
          as: 'subsectors.contexts',
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'subsectors.contexts._id',
          foreignField: 'contexts',
          as: 'subsectors.posts',
        },
      },
      {
        $group: {
          _id: '$_id',
          sectorName: { $first: '$sectorName' },
          totalPostCount: { $first: '$totalPostCount' },
          subsectors: {
            $push: {
              _id: '$subsectors._id',
              subSectorName: '$subsectors.subSectorName',
              postCount: { $size: { $ifNull: ['$subsectors.posts', []] } },
            },
          },
        },
      },
      {
        $sort: {
          totalPostCount: -1,
        },
      },
      {
        $project: {
          _id: 1,
          sectorName: 1,
          totalPostCount: 1,
          subsectors: {
            $cond: {
              if: { $eq: ['$subsectors', []] },
              then: [],
              else: {
                $sortArray: {
                  input: '$subsectors',
                  sortBy: { postCount: -1 },
                },
              },
            },
          },
        },
      },
    ]);

    const signalsWithDetails = await Signal.aggregate([
      {
        $lookup: {
          from: 'subsignals',
          localField: '_id',
          foreignField: 'signalId',
          as: 'subsignals',
        },
      },
      {
        $lookup: {
          from: 'contexts',
          localField: '_id',
          foreignField: 'signalCategories',
          as: 'contexts',
        },
      },
      {
        $unwind: {
          path: '$contexts',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'contexts._id',
          foreignField: 'contexts',
          as: 'contextPosts',
        },
      },
      {
        $group: {
          _id: '$_id',
          signalName: { $first: '$signalName' },
          subsignals: { $first: '$subsignals' },
          totalPostCount: {
            $sum: { $size: { $ifNull: ['$contextPosts', []] } },
          },
        },
      },
      {
        $unwind: {
          path: '$subsignals',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'contexts',
          localField: 'subsignals._id',
          foreignField: 'signalSubCategories',
          as: 'subsignals.contexts',
        },
      },
      {
        $lookup: {
          from: 'posts',
          localField: 'subsignals.contexts._id',
          foreignField: 'contexts',
          as: 'subsignals.posts',
        },
      },
      {
        $group: {
          _id: '$_id',
          signalName: { $first: '$signalName' },
          totalPostCount: { $first: '$totalPostCount' },
          subsignals: {
            $push: {
              _id: '$subsignals._id',
              subSignalName: '$subsignals.subSignalName',
              postCount: { $size: { $ifNull: ['$subsignals.posts', []] } },
            },
          },
        },
      },
      {
        $sort: {
          totalPostCount: -1,
        },
      },
      {
        $project: {
          _id: 1,
          signalName: 1,
          totalPostCount: 1,
          subsignals: {
            $cond: {
              if: { $eq: ['$subsignals', []] },
              then: [],
              else: {
                $sortArray: {
                  input: '$subsignals',
                  sortBy: { postCount: -1 },
                },
              },
            },
          },
        },
      },
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          sectors: sectorsWithDetails,
          signals: signalsWithDetails,
        },
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