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
import tileTemplate from '@/models/TileTemplate';

function normalizeTitle(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\$/g, 'dollar') 
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

    // Ensure all models are registered
    if (!mongoose.models.Sector) mongoose.model('Sector', Sector.schema);
    if (!mongoose.models.SubSector) mongoose.model('SubSector', SubSector.schema);
    if (!mongoose.models.Post) mongoose.model('Post', Post.schema);
    if (!mongoose.models.Theme) mongoose.model('Theme', Theme.schema);
    if (!mongoose.models.Signal) mongoose.model('Signal', Signal.schema);
    if (!mongoose.models.SubSignal) mongoose.model('SubSignal', SubSignal.schema);
	if (!mongoose.models.TileTemplate) {
				mongoose.model('TileTemplate', tileTemplate.schema);
			}

    const normalizedSlug = normalizeTitle(slug);
    const altNormalizedSlug = normalizedSlug.replace(/dollar/g, '');

    let contexts = await Context.find()
      .select('contextTitle _id')
      .lean();
    let targetContext = contexts.find(
      (ctx) =>
        normalizeTitle(ctx.contextTitle) === normalizedSlug ||
        normalizeTitle(ctx.contextTitle) === altNormalizedSlug
    );

    if (targetContext) {
      targetContext = await Context.findById(targetContext._id)
        .populate({
          path: 'themes',
          select: 'themeTitle themeDescription trendingScore impactScore predictiveMomentumScore',
        })
        .populate({
          path: 'sectors',
          select: 'sectorName _id',
        })
        .populate({
          path: 'subSectors',
          select: 'subSectorName _id sectorId',
        })
        .populate({
          path: 'signalCategories',
          select: 'signalName _id',
        })
        .populate({
          path: 'signalSubCategories',
          select: 'subSignalName _id signalId',
        })
        .populate({
          path: 'posts.postId',
          select: 'postTitle postType date isTrending includeInContainer _id sourceUrl sourceUrls tileTemplateId',
          populate: {
            path: 'tileTemplateId',
            select: 'name type jsxCode backgroundColor previewBackgroundColor iconName iconColor iconSize',
            model: 'TileTemplate',
            options: { strictPopulate: false },
          },
        })
        .lean();
    }

    if (!targetContext) {
      // Removed console.log statements for performance
      return NextResponse.json(
        { success: false, error: 'Context not found' },
        { status: 404 }
      );
    }

    const canonicalSlug = normalizeTitle(targetContext.contextTitle);
    if (normalizedSlug !== canonicalSlug) {
      return NextResponse.redirect(new URL(`/context-details/${canonicalSlug}`, request.url));
    }

    let originalTheme = null;
    if (targetContext.themes && targetContext.themes.length > 0) {
      originalTheme = {
        themeTitle: targetContext.themes[0].themeTitle,
        themeDescription: targetContext.themes[0].themeDescription,
        trendingScore: targetContext.themes[0].trendingScore || 0,
        impactScore: targetContext.themes[0].impactScore || 0,
        predictiveMomentumScore: targetContext.themes[0].predictiveMomentumScore || 0,
      };
    }

    const sectors = targetContext.sectors.map((sector) => sector.sectorName);
    const subSectors = targetContext.subSectors.map((subSector) => subSector.subSectorName);
    const signalCategories = targetContext.signalCategories.map((signal) => signal.signalName);
    const signalSubCategories = targetContext.signalSubCategories.map((subSignal) => subSignal.subSignalName);

    let matchingThemes = await Theme.find({
      subSectors: { $in: targetContext.subSectors.map((ss) => ss._id) },
      isTrending: true,
    })
      .populate({
        path: 'subSectors',
        select: 'subSectorName _id',
      })
      .select('themeTitle overallScore sectors subSectors')
      .limit(5)
      .lean()
      .sort({ overallScore: -1 });

    if (matchingThemes.length === 0) {
      matchingThemes = await Theme.find({
        sectors: { $in: targetContext.sectors.map((s) => s._id) },
        isTrending: true,
      })
        .populate({
          path: 'sectors',
          select: 'sectorName _id',
        })
        .select('themeTitle overallScore sectors subSectors')
        .limit(5)
        .lean();
    }

    const processedMatchingThemes = matchingThemes
      .map((theme) => {
        const contextSectorIds = targetContext.sectors.map((s) => s._id.toString());
        const contextSubSectorIds = targetContext.subSectors.map((ss) => ss._id.toString());

        const matchingSubSector = theme.subSectors.find((subSector) =>
          contextSubSectorIds.includes(subSector._id.toString())
        );
        const matchingSector = theme.sectors.find((sector) =>
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
      })
      .filter((theme) => theme.matchedCategory)
      // .sort({ overallScore: -1 });

    let slides = [];
    if (targetContext.hasSlider) {
      for (let i = 1; i <= 10; i++) {
        const slideKey = `slide${i}`;
        if (
          targetContext[slideKey] &&
          (targetContext[slideKey].title || targetContext[slideKey].description)
        ) {
          slides.push({
            title: targetContext[slideKey].title || '',
            description: targetContext[slideKey].description || '',
          });
        }
      }
    }

    const contextSubSectorIds = targetContext.subSectors.map((ss) => ss._id);
    const contextSignalCategoryIds = targetContext.signalCategories
      ? targetContext.signalCategories.map((s) => s._id)
      : [];

    let processedMatchingSubSectors = [];
    let processedMatchingSignalCategories = [];
    let matchingContexts = [];

    if (contextSubSectorIds.length > 0 && contextSignalCategoryIds.length > 0) {
      const pairConditions = [];
      for (const subSectorId of contextSubSectorIds) {
        for (const signalCategoryId of contextSignalCategoryIds) {
          pairConditions.push({
            subSectors: { $in: [subSectorId] },
            signalCategories: { $in: [signalCategoryId] },
          });
        }
      }

      matchingContexts = await Context.find({
        _id: { $ne: targetContext._id },
        $or: pairConditions,
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
          select: 'postTitle postType date isTrending includeInContainer _id sourceUrl sourceUrls',
        })
		.populate({
				path: 'tileTemplates',
				model: 'TileTemplate',
				select: 'name type jsxCode',
				options: { strictPopulate: false },
			})
      .sort({ date: -1 })
        .lean();

      const uniqueMatchingContexts = Array.from(
        new Map(matchingContexts.map((ctx) => [ctx._id.toString(), ctx])).values()
      ).map((ctx) => ({
        ...ctx,
        id: ctx._id.toString(),
        slug: normalizeTitle(ctx.contextTitle),
      }));

      if (uniqueMatchingContexts.length > 0) {
        const firstMatch = uniqueMatchingContexts[0];
        processedMatchingSubSectors = firstMatch.subSectors.map((subSector) => ({
          subSectorId: subSector._id,
          subSectorName: subSector.subSectorName,
        }));

        processedMatchingSignalCategories = firstMatch.signalCategories
          ? firstMatch.signalCategories.map((signal) => ({
              signalCategoryId: signal._id,
              signalName: signal.signalName,
            }))
          : [];
      }

      matchingContexts = uniqueMatchingContexts;
    }

    let processedPosts = [];
    if (targetContext.posts && targetContext.posts.length > 0) {
      const uniquePosts = Array.from(
        new Map(targetContext.posts.map((post) => [post.postId?._id.toString(), post])).values()
      ).filter((post) => post.postId);

      processedPosts = uniquePosts
        .map((post) => ({
          postId: post.postId._id,
          postTitle: post.postId.postTitle,
          postType: post.postId.postType,
          date: post.postId.date,
          isTrending: post.postId.isTrending,
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    let contextPosts = [];
    if (targetContext.posts && targetContext.posts.length > 0) {
      contextPosts = targetContext.posts
        .filter((post) => post.postId)
        .map((post) => ({
          postId: post.postId._id,
          postTitle: post.postId.postTitle,
          postType: post.postId.postType,
          date: post.postId.date,
          isTrending: post.postId.isTrending,
          sourceUrl:
            post.postId.sourceUrl ||
            (post.postId.sourceUrls && post.postId.sourceUrls[0]) ||
            '',
			tileTemplateId: post.postId.tileTemplateId,
        }));
    }

    let trendingExpertOpinions = [];
    matchingContexts.forEach((ctx) => {
      if (ctx.posts && ctx.posts.length > 0) {
        ctx.posts.forEach((post) => {
          if (
            post.postId &&
            post.postId.postType === 'Expert Opinion' &&
            post.postId.isTrending === true
          ) {
            trendingExpertOpinions.push({
              postId: post.postId._id,
              postTitle: post.postId.postTitle,
              postType: post.postId.postType,
              date: post.postId.date,
              contextTitle: ctx.contextTitle,
              contextSlug: normalizeTitle(ctx.contextTitle),
              sourceUrl:
                post.postId.sourceUrl ||
                (post.postId.sourceUrls && post.postId.sourceUrls[0]) ||
                '',
            });
          }
        });
      }
    });

    trendingExpertOpinions = trendingExpertOpinions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);

    const processedContext = {
      ...targetContext,
      id: targetContext._id.toString(),
      imageUrl: targetContext.imageUrl,
      originalContextSector: sectors,
      originalContextSubSector: subSectors,
      originalContextSignalCategory: signalCategories,
      originalContextSignalSubCategory: signalSubCategories,
      originalTheme,
      trendingThemes: processedMatchingThemes,
      slides,
      matchingSubSectors: processedMatchingSubSectors,
      matchingSignalCategories: processedMatchingSignalCategories,
      posts: processedPosts,
      matchingContexts: matchingContexts.map(ctx => ({
        ...ctx,
        imageUrl: ctx.imageUrl
      })),
      trendingExpertOpinions,
      contextPosts: contextPosts.map(post => ({
        ...post,
        imageUrl: post.imageUrl
      })),
    };

    return NextResponse.json({
      success: true,
      context: processedContext,
    });
  } catch (error) {
    console.error('Error fetching context details:', error);
    const isDev = process.env.NODE_ENV === 'development';
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch context details',
        ...(isDev && { details: error.message }),
      },
      { status: 500 }
    );
  }
}