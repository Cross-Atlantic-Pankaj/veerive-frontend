import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Sector from '@/models/Sector';
import SubSector from '@/models/SubSector';
import Theme from '@/models/Theme';
import Signal from '@/models/Signal';
import SubSignal from '@/models/SubSignal';
import connectDB from '@/lib/db';

export async function POST(request) {
  try {
    await connectDB();
    if (!mongoose.models.Sector) mongoose.model('Sector', Sector.schema);
    if (!mongoose.models.SubSector) mongoose.model('SubSector', SubSector.schema);
    if (!mongoose.models.Post) mongoose.model('Post', Post.schema);
    if (!mongoose.models.Theme) mongoose.model('Theme', Theme.schema);
    if (!mongoose.models.Signal) mongoose.model('Signal', Signal.schema);
    if (!mongoose.models.SubSignal) mongoose.model('SubSignal', SubSignal.schema);

    const body = await request.json();
    const { contextId } = body;

    if (!contextId) {
      return NextResponse.json(
        { error: 'Context ID is required' },
        { status: 400 }
      );
    }

    const context = await Context.findById(contextId)
      .populate({
        path: 'themes',
        select: 'themeTitle themeDescription overallScore trendingScore impactScore predictiveMomentumScore'
      })
      .lean();

    if (!context) {
      return NextResponse.json(
        { error: 'Context not found' },
        { status: 404 }
      );
    }

    let theme = null;
    if (context.themes && context.themes.length > 0) {
      theme = {
        themeTitle: context.themes[0].themeTitle,
        overallScore: context.themes[0].overallScore || 0,
        trendingScore: context.themes[0].trendingScore || 0,
        impactScore: context.themes[0].impactScore || 0,
        predictiveMomentumScore: context.themes[0].predictiveMomentumScore || 0
      };
    }

    let slides = [];
    if (context.hasSlider) {
      for (let i = 1; i <= 10; i++) {
        const slideKey = `slide${i}`;
        if (context[slideKey] && (context[slideKey].title || context[slideKey].description)) {
          slides.push({
            title: context[slideKey].title || '',
            description: context[slideKey].description || ''
          });
        }
      }
    }

    const processedContext = {
      ...context,
      theme,
      slides
    };

    return NextResponse.json({
      context: processedContext
    });

  } catch (error) {
    console.error('Error fetching context details:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}