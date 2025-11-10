import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Theme from '@/models/Theme';
import Context from '@/models/Context';
import Post from '@/models/Post';
import Source from '@/models/Source';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const themeId = searchParams.get('themeId');

    if (!themeId) {
      return NextResponse.json(
        { error: 'Theme ID is required' },
        { status: 400 }
      );
    }

    // Find all contexts where this theme is tagged
    const contexts = await Context.find({ themes: themeId })
      .populate('posts.postId')
      .lean();

    console.log(`Found ${contexts.length} contexts for theme ${themeId}`);

    // Extract all post IDs from the contexts
    const postIds = [];
    contexts.forEach((context, ctxIndex) => {
      console.log(`Context ${ctxIndex + 1}: ${context.contextTitle || context._id}`);
      console.log(`  Total posts in context: ${context.posts?.length || 0}`);
      
      if (context.posts && Array.isArray(context.posts)) {
        context.posts.forEach((postRef, postIndex) => {
          // Handle both populated (object) and unpopulated (ObjectId) postId
          let postId = null;
          
          if (postRef.postId) {
            // If postId is populated (object), use _id
            if (typeof postRef.postId === 'object' && postRef.postId._id) {
              postId = postRef.postId._id;
            } 
            // If postId is just an ObjectId string, use it directly
            else if (typeof postRef.postId === 'string') {
              postId = postRef.postId;
            }
            // If postId is an ObjectId object, convert to string
            else if (postRef.postId.toString) {
              postId = postRef.postId.toString();
            }
          }
          
          if (postId) {
            // For expert opinions, we want ALL posts regardless of includeInContainer
            // includeInContainer only affects context container display, not expert opinions section
            postIds.push(postId);
            console.log(`  Post ${postIndex + 1}: Added postId ${postId}`);
          } else {
            console.log(`  Post ${postIndex + 1}: Could not extract postId from postRef:`, JSON.stringify(postRef));
          }
        });
      }
    });

    console.log(`Found ${postIds.length} post IDs from contexts`);

    if (postIds.length === 0) {
      console.log('No post IDs found, returning empty array');
      return NextResponse.json({ expertOpinions: [] });
    }

    // Debug: Check what postTypes we have for these post IDs
    const allPosts = await Post.find({ _id: { $in: postIds } })
      .select('_id postTitle postType')
      .lean();
    
    console.log('All posts found with their postTypes:');
    allPosts.forEach(post => {
      console.log(`  - Post ID: ${post._id}, Title: ${post.postTitle}, postType: "${post.postType}"`);
    });

    // Find posts where postType matches 'Expert Opinion' or 'ExpertOpinion'
    const expertOpinions = await Post.find({
      _id: { $in: postIds },
      postType: { $in: ['Expert Opinion', 'ExpertOpinion'] }
    })
      .populate('source', 'sourceName sourceType')
      .sort({ createdAt: -1 }) // Sort by most recent first
      .limit(5) // Get only 5 most recent
      .lean();

    console.log(`Found ${expertOpinions.length} expert opinion posts`);

    // Transform the data to include source information
    const transformedOpinions = expertOpinions.map(opinion => {
      // Handle source as array (new format) or single object (legacy format)
      const source = Array.isArray(opinion.source) && opinion.source.length > 0 
        ? opinion.source[0] 
        : (opinion.source || null);
      
      // Handle sourceUrls as array (new format) or single sourceUrl (legacy format)
      const sourceUrl = Array.isArray(opinion.sourceUrls) && opinion.sourceUrls.length > 0
        ? opinion.sourceUrls[0]
        : (opinion.sourceUrl || null);

      return {
      _id: opinion._id,
      postTitle: opinion.postTitle,
      summary: opinion.summary,
      sentiment: opinion.sentiment,
        sourceName: source?.sourceName || 'Unknown Source',
        sourceType: source?.sourceType || 'Industry Expert',
        sourceUrl: sourceUrl,
      createdAt: opinion.createdAt
      };
    });

    return NextResponse.json({ expertOpinions: transformedOpinions });

  } catch (error) {
    console.error('Error fetching expert opinions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch expert opinions',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
