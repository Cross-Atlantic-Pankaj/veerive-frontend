import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { registerModels } from '@/lib/registerModels';

export async function GET(request, { params }) {
  await connectDB();
  registerModels();
  const { contextId } = await params;

  try {
    const context = await mongoose.model('Context').findById(contextId);

    if (!context) {
      return NextResponse.json({ error: 'Context not found' }, { status: 404 });
    }

    if (!context.pdfFile || !context.pdfFile.data) {
      return NextResponse.json({ error: 'PDF file not found in context' }, { status: 404 });
    }

    // For now, we'll use a reasonable default page count
    // In a real implementation, you might want to use pdf-parse to get actual page count
    const totalSlides = 5; // Reduced default assumption

    console.log(`Using default page count: ${totalSlides} pages`);

    // Create slide URLs that point to individual PDF pages
    const slides = Array.from({ length: totalSlides }, (_, index) => ({
      slideNumber: index + 1,
      imageUrl: `/api/ppt-file/${contextId}/pdf#page=${index + 1}&toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=FitH&pagemode=none`,
      width: 1200,
      height: 800
    }));

    return NextResponse.json({
      success: true,
      totalSlides,
      slides,
      fileName: context.pdfFile.fileName,
      pdfUrl: `/api/ppt-file/${contextId}/pdf`
    });

  } catch (error) {
    console.error('Error preparing PDF slides:', error);
    return NextResponse.json(
      { error: 'Failed to prepare PDF slides', details: error.message },
      { status: 500 }
    );
  }
}