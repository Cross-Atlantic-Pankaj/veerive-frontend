import { NextResponse } from 'next/server';
import Context from '@/models/Context';
import connectDB from '@/lib/db';
import pdf from 'pdf-parse';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  await connectDB();
  const { contextId } = await params;

  try {
    const context = await Context.findById(contextId);

    if (!context) {
      return NextResponse.json({ error: 'Context not found' }, { status: 404 });
    }

    if (!context.pdfFile || !context.pdfFile.data) {
      return NextResponse.json({ error: 'PDF file not found in context' }, { status: 404 });
    }

    // Get actual page count from PDF
    const pdfBuffer = Buffer.from(context.pdfFile.data);
    const pdfData = await pdf(pdfBuffer);
    const totalSlides = pdfData.numpages;

    console.log(`PDF has ${totalSlides} pages`);

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
      pdfUrl
    });

  } catch (error) {
    console.error('Error preparing PDF slides:', error);
    return NextResponse.json(
      { error: 'Failed to prepare PDF slides', details: error.message },
      { status: 500 }
    );
  }
}