import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Theme from '@/models/Theme';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      );
    }

    if (!mongoose.models.Theme) mongoose.model('Theme', Theme.schema);

    const theme = await Theme.findOne({
      themeTitle: { $regex: new RegExp(`^${slug.replace(/-/g, ' ')}$`, 'i') }
    })
      .populate('sectors', 'sectorName')
      .populate('subSectors', 'subSectorName');

    if (!theme) {
      console.log(`No theme found for slug: ${slug}`);
      return NextResponse.json(
        { success: false, error: 'Theme not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: theme,
    });
  } catch (error) {
    console.error('Error fetching theme details:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch theme details' },
      { status: 500 }
    );
  }
}