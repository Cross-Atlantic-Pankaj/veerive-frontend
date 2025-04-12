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
        select: 'themeTitle themeDescription overallScore trendingScore impactScore predictiveMomentumScore',
      })
      .populate({
        path: 'sectors',
        select: 'sectorName',
      })
      .populate({
        path: 'subSectors',
        select: 'subSectorName _id',
      })
      .populate({
        path: 'signalCategories',
        select: 'signalName _id',
      })
      .populate({
        path: 'posts.postId',
        select: 'postTitle postType date isTrending includeInContainer',
      })
      .lean();

    if (!context) {
      return NextResponse.json(
        { error: 'Context not found' },
        { status: 404 }
      );
    }

    let originalTheme = null;
    if (context.themes && context.themes.length > 0) {
      originalTheme = {
        themeTitle: context.themes[0].themeTitle,
        themeDescription: context.themes[0].themeDescription,
        overallScore: context.themes[0].overallScore || 0,
        trendingScore: context.themes[0].trendingScore || 0,
        impactScore: context.themes[0].impactScore || 0,
        predictiveMomentumScore: context.themes[0].predictiveMomentumScore || 0,
      };
    }

    let matchingThemes = await Theme.find({
      subSectors: { $in: context.subSectors.map(ss => ss._id) },
      isTrending: true
    })
      .populate({
        path: 'subSectors',
        select: 'subSectorName _id',
      })
      .select('themeTitle overallScore sectors subSectors')
      .limit(5)
      .lean();

    if (matchingThemes.length === 0) {
      matchingThemes = await Theme.find({
        sectors: { $in: context.sectors.map(s => s._id) },
        isTrending: true
      })
        .populate({
          path: 'sectors',
          select: 'sectorName _id',
        })
        .select('themeTitle overallScore sectors subSectors')
        .limit(5)
        .lean();
    }

    const processedMatchingThemes = matchingThemes.map(theme => {
      const contextSectorIds = context.sectors.map(s => s._id.toString());
      const contextSubSectorIds = context.subSectors.map(ss => ss._id.toString());

      const matchingSubSector = theme.subSectors.find(subSector =>
        contextSubSectorIds.includes(subSector._id.toString())
      );
      const matchingSector = theme.sectors.find(sector =>
        contextSectorIds.includes(sector._id.toString())
      );

      const matchedCategory = matchingSubSector 
        ? matchingSubSector.subSectorName 
        : matchingSector 
          ? matchingSector.sectorName 
          : null;

      return {
        themeTitle: theme.themeTitle,
        overallScore: theme.overallScore || 0,
        matchedCategory: matchedCategory,
      };
    }).filter(theme => theme.matchedCategory);

    let slides = [];
    if (context.hasSlider) {
      for (let i = 1; i <= 10; i++) {
        const slideKey = `slide${i}`;
        if (context[slideKey] && (context[slideKey].title || context[slideKey].description)) {
          slides.push({
            title: context[slideKey].title || '',
            description: context[slideKey].description || '',
          });
        }
      }
    }

    const contextSubSectorIds = context.subSectors.map(ss => ss._id);
    const contextSignalCategoryIds = context.signalCategories ? context.signalCategories.map(s => s._id) : [];

    if (contextSubSectorIds.length === 0 || contextSignalCategoryIds.length === 0) {
      console.log('Input context has empty subSectors or signalCategories, no matches possible:', {
        subSectors: contextSubSectorIds,
        signalCategories: contextSignalCategoryIds
      });
      const processedContext = {
        ...context,
        originalTheme,
        trendingThemes: processedMatchingThemes,
        slides,
        matchingSubSectors: [],
        matchingSignalCategories: [],
        posts: [],
        matchingContexts: [],
      };
      return NextResponse.json({ context: processedContext });
    }

    const pairConditions = [];
    for (const subSectorId of contextSubSectorIds) {
      for (const signalCategoryId of contextSignalCategoryIds) {
        pairConditions.push({
          subSectors: { $in: [subSectorId] },
          signalCategories: { $in: [signalCategoryId] }
        });
      }
    }

    const matchingContexts = await Context.find({
      _id: { $ne: contextId },
      $or: pairConditions
    })
      .populate({
        path: 'sectors',
        select: 'sectorName _id',
      })
      .populate({
        path: 'subSectors',
        select: 'subSectorName _id',
      })
      .populate({
        path: 'signalCategories',
        select: 'signalName _id',
      })
      .populate({
        path: 'posts.postId',
        select: 'postTitle postType date isTrending includeInContainer _id',
      })
      .lean();

    const uniqueMatchingContexts = Array.from(
      new Map(matchingContexts.map(ctx => [ctx._id.toString(), ctx])).values()
    );

    console.log('Contexts with at least one matching subSector and signalCategory pair Length:', uniqueMatchingContexts.length);
    console.log(
      'Contexts with populated fields:',
      JSON.stringify(
        uniqueMatchingContexts.map(ctx => ({
          _id: ctx._id,
          contextTitle: ctx.contextTitle,
          containerType: ctx.containerType,
          sectors: ctx.sectors,
          subSectors: ctx.subSectors,
          posts: ctx.posts,
        })),
        null,
        2
      )
    );

    let processedMatchingSubSectors = [];
    let processedMatchingSignalCategories = [];

    if (uniqueMatchingContexts.length > 0) {
      const firstMatch = uniqueMatchingContexts[0];
      
      processedMatchingSubSectors = firstMatch.subSectors.map(subSector => ({
        subSectorId: subSector._id,
        subSectorName: subSector.subSectorName,
      }));

      processedMatchingSignalCategories = firstMatch.signalCategories
        ? firstMatch.signalCategories.map(signal => ({
            signalCategoryId: signal._id,
            signalName: signal.signalName,
          }))
        : [];
    }

    let processedPosts = [];
    if (context.posts && context.posts.length > 0) {
      const uniquePosts = Array.from(
        new Map(context.posts.map(post => [post.postId?._id.toString(), post])).values()
      ).filter(post => post.postId);

      processedPosts = uniquePosts
        .map(post => ({
          postId: post.postId._id,
          postTitle: post.postId.postTitle,
          postType: post.postId.postType,
          date: post.postId.date,
          isTrending: post.postId.isTrending,
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    const processedContext = {
      ...context,
      originalTheme,
      trendingThemes: processedMatchingThemes,
      slides,
      matchingSubSectors: processedMatchingSubSectors,
      matchingSignalCategories: processedMatchingSignalCategories,
      posts: processedPosts,
      matchingContexts: uniqueMatchingContexts,
    };

    return NextResponse.json({
      context: processedContext,
    });

  } catch (error) {
    console.error('Error fetching context details:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}