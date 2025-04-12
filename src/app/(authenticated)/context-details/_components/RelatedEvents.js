import React from 'react';
import {
  TypeOne,
  TypeTwo,
  TypeThree,
  TypeFour,
  TypeFive,
  TypeNum,
} from './_RecentEventsComponents';

const formatSummary = (summary) => {
  if (!summary) return ['Summary will be available soon'];

  const paragraphs = summary.split('</p>').filter((p) => p.trim().length > 0);
  const formattedPoints = [];

  paragraphs.forEach((paragraph) => {
    const cleaned = paragraph
      .replace(/<[^>]*>/g, '')
      .replace(/ /g, ' ')
      .replace(/&/g, '&')
      .trim();

    if (cleaned.length > 0) {
      const pointText = cleaned.startsWith('•') ? cleaned.slice(1).trim() : cleaned;
      formattedPoints.push(`• ${pointText}`);
    }
  });

  return formattedPoints.length > 0 ? formattedPoints : ['Summary will be available soon'];
};

const renderContainerType = (context, key) => {
  const props = {
    context,
    formatSummary,
  };

  switch (context.containerType) {
    case 'Type-One':
      return <TypeOne key={key} {...props} />;
    case 'Type-Two':
      return <TypeTwo key={key} {...props} />;
    case 'Type-Three':
      return <TypeThree key={key} {...props} />;
    case 'Type-Four':
      return <TypeFour key={key} {...props} />;
    case 'Type-Five':
      return <TypeFive key={key} {...props} />;
    case 'Type-Num':
      return <TypeNum key={key} {...props} />;
    default:
      return null;
  }
};

const RelatedEvents = ({ matchingContexts }) => {
  if (!matchingContexts || matchingContexts.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4 bg-yellow-200 w-fit px-2">Related Events</h2>
      <div className="grid grid-cols-1 gap-6">
        {matchingContexts.map((relatedContext, index) => (
          renderContainerType(relatedContext, `related-${relatedContext._id}-${index}`)
        ))}
      </div>
    </div>
  );
};

export default RelatedEvents;