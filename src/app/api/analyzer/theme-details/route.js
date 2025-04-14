import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Theme from '@/models/Theme';

function normalizeTitle(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-') 
    .replace(/--+/g, '-') 
    .replace(/^-+|-+$/g, '');
}

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

    const normalizedSlug = normalizeTitle(slug);

    const themes = await Theme.find()
      .populate('sectors', 'sectorName')
      .populate('subSectors', 'subSectorName')
      .lean();

    const theme = themes.find(t => normalizeTitle(t.themeTitle) === normalizedSlug);

    if (!theme) {
      console.log(`No theme found for slug: ${slug}, normalized slug: ${normalizedSlug}, checked themes: ${themes.map(t => t.themeTitle).join(', ')}`); // Detailed debug log
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