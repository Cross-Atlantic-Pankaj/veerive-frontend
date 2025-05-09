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
  if (!summary || summary.trim() === '') return ['• Summary will be available soon'];

  const parser = new DOMParser();
  const doc = parser.parseFromString(summary, 'text/html');

  const extractText = (node, points = []) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) points.push(text);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();
      if (tagName === 'br') {
        points.push(''); 
      } else if (['li', 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
        const childText = Array.from(node.childNodes)
          .map((child) => child.textContent.trim())
          .filter((text) => text)
          .join(' ');
        if (childText) points.push(childText);
      } else {
        Array.from(node.childNodes).forEach((child) => extractText(child, points));
      }
    }
    return points;
  };

  let textPoints = extractText(doc.body);

  const decodeEntities = (text) => {
    const entities = {
      ' ': ' ',
      '&': '&',
      '<': '<',
      '>': '>',
      '"': '"',
      '&apos;': "'",
      '&quot;': '"',
    };
    return text.replace(/&[a-zA-Z0-9#]+;/g, (match) => entities[match] || match);
  };

  textPoints = textPoints
    .map((point) => decodeEntities(point)) 
    .map((point) => point.replace(/\s+/g, ' ').trim()) 
    .filter((point) => point.length > 0)
    .map((point) => {
      return point.replace(/^\d+\.\s*/, '').trim();
    });

  textPoints = textPoints.map((point) => `• ${point}`);

  return textPoints.length > 0 ? textPoints : ['• Summary will be available soon'];
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

  const typeOneContexts = matchingContexts.filter(
    (context) => context.containerType === 'Type-One'
  );
  const otherContexts = matchingContexts.filter(
    (context) => context.containerType !== 'Type-One'
  );

  const groupedTypeOneContexts = [];
  for (let i = 0; i < typeOneContexts.length; i += 3) {
    groupedTypeOneContexts.push(typeOneContexts.slice(i, i + 3));
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold text-blue-700 mb-4 bg-yellow-200 w-fit px-2">Related Events</h2>
      <div className="space-y-6">
        {otherContexts.map((relatedContext, index) => (
          <div key={`other-${relatedContext.id}-${index}`} className="grid grid-cols-1">
            {renderContainerType(relatedContext, `other-${relatedContext.id}-${index}`)}
          </div>
        ))}
        {groupedTypeOneContexts.map((group, groupIndex) => (
          <div
            key={`type-one-group-${groupIndex}`}
            className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          >
            {group.map((relatedContext, index) => (
              renderContainerType(
                relatedContext,
                `type-one-${relatedContext.id}-${groupIndex}-${index}`
              )
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedEvents;