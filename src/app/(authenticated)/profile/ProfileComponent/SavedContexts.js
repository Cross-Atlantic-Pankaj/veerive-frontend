'use client';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  TypeOne,
  TypeTwo,
  TypeThree,
  TypeFour,
  TypeFive,
  TypeNum,
} from './_components';
import { useRouter } from 'next/navigation';

export default function SavedContext() {
  const [savedContexts, setSavedContexts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const formatSummary = (summary) => {
    if (!summary || summary.trim() === '') return ['Summary will be available soon'];

    const parser = new DOMParser();
    const doc = parser.parseFromString(summary, 'text/html');

    const pointTags = ['li', 'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];

    const collectPoints = (node, points = []) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tagName = node.tagName.toLowerCase();
        if (pointTags.includes(tagName)) {
          const innerHTML = node.innerHTML.trim();
          if (innerHTML.length > 0) {
            points.push(innerHTML);
          }
        } else {
          Array.from(node.childNodes).forEach((child) => collectPoints(child, points));
        }
      }
      return points;
    };

    let formattedPoints = collectPoints(doc.body);

    formattedPoints = formattedPoints
      .map((point) =>
        point
          .replace(/&/g, '&')
          .replace(/\s+/g, ' ')
          .trim()
      )
      .filter((point) => point.length > 0);

    formattedPoints = formattedPoints.map((point) => `• ${point}`);

    return formattedPoints.length > 0 ? formattedPoints : ['Summary will be available soon'];
  };

  const getUserEmail = () => {
    const userDataStr = localStorage.getItem('user');
    if (userDataStr) {
      const user = JSON.parse(userDataStr);
      return user.email;
    }
    return null;
  };

  useEffect(() => {
    const fetchSavedContexts = async () => {
      const userDataStr = localStorage.getItem('user');
      if (!userDataStr) {
        setError('User not logged in');
        setIsLoading(false);
        return;
      }

      const { email } = JSON.parse(userDataStr);
      if (!email) {
        setError('User email not found');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user-saved-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        if (response.ok) {
          setSavedContexts(data.savedItems.contexts);
        } else {
          throw new Error(data.error || 'Failed to fetch saved contexts');
        }
      } catch (err) {
        console.error('Error fetching saved contexts:', err);
        setError(err.message);
        toast.error(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSavedContexts();
  }, []);

  const handleUnsave = async (contextId) => {
    const email = getUserEmail();
    if (!email) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/context-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextId, email, action: 'unsave' }),
      });
      const data = await response.json();
      if (response.ok) {
        setSavedContexts((prev) => prev.filter((context) => context._id !== contextId));
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to unsave context');
      }
    } catch (error) {
      console.error('Error unsaving context:', error);
      toast.error('Error unsaving context');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full mt-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full mt-8 text-red-600 text-center">
        Error: {error}
      </div>
    );
  }

  if (savedContexts.length === 0) {
    return (
      <></>
    );
  }

  const groupedContexts = {
    'Type-Two': [],
    'Type-Three': [],
    'Type-Four': [],
    'Type-Five': [],
    'Type-Num': [],
    'Type-One': [],
  };

  savedContexts.forEach((context, index) => {
    const type = context.containerType || 'Type-One';
    groupedContexts[type].push({ ...context, index });
  });

  const containerTypes = [
    'Type-Two',
    'Type-Three',
    'Type-Four',
    'Type-Five',
    'Type-Num',
    'Type-One',
  ];

  return (
    <div className="w-full mt-8">
      <div className="space-y-6">
        {containerTypes.map((type) =>
          groupedContexts[type].length > 0 ? (
            <div key={type} className="w-full space-y-4">
              {type === 'Type-One' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {groupedContexts[type].map(({ index, ...context }) => (
                    <TypeOne
                      key={context._id}
                      context={{ ...context, id: context._id }}
                      formatSummary={formatSummary}
                      handleUnsave={handleUnsave}
                    />
                  ))}
                </div>
              ) : (
                groupedContexts[type].map(({ index, ...context }) => {
                  const props = { context: { ...context, id: context._id }, formatSummary, handleUnsave };
                  switch (type) {
                    case 'Type-Two':
                      return <TypeTwo key={context._id} {...props} />;
                    case 'Type-Three':
                      return <TypeThree key={context._id} {...props} />;
                    case 'Type-Four':
                      return <TypeFour key={context._id} {...props} />;
                    case 'Type-Five':
                      return <TypeFive key={context._id} {...props} />;
                    case 'Type-Num':
                      return <TypeNum key={context._id} {...props} />;
                    default:
                      return null;
                  }
                })
              )}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}