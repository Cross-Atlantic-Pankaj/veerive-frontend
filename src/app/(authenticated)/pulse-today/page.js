'use client';

import { useEffect, useState } from 'react';

export default function PulseToday() {
  const [contexts, setContexts] = useState([]);
  const [sidebarMessage, setSidebarMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [contextsResponse, messageResponse] = await Promise.all([
          fetch('/api/pulse-today'),
          fetch('/api/sidebar-messages')
        ]);
        
        const contextsData = await contextsResponse.json();
        const messageData = await messageResponse.json();
        
        setContexts(contextsData.contexts || []);
        setSidebarMessage(messageData.messages[0] || null);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  return (
    <main className="w-full mx-auto p-6 bg-white min-h-screen">
      <div className="flex gap-6">
        <div className="w-[72%]">
          {contexts.map((context, index) => (
            <div key={index} className="mb-12">
              <div className="flex flex-col">
                <div className="flex gap-6 mb-4">
                  <div className="w-1/4">
                    {context.bannerImage ? (
                      <img
                        src={context.bannerImage}
                        alt="Banner"
                        className="w-full h-auto object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 rounded-lg" />
                    )}
                  </div>

                  <div className="w-3/4 flex">
                    <div className="flex-1">
                      <div className="text-sm text-red-600 font-semibold mb-2">
                        {[...context.sectors, ...context.subSectors].join(' • ')}
                      </div>
                      <h1 className="text-2xl font-bold mb-3">{context.contextTitle}</h1>
                    </div>

                    {context.posts.length > 2 && (
                      <div className="w-1/2 ml-6">
                        <div className="space-y-2">
                          {context.posts.map((post, idx) => (
                            <div key={idx} className="font-semibold">
                              {post.postTitle}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pl-0">
                  <div className="text-gray-700 mb-4">
                    {context.summary ? (
                      context.summary.split('\n').map((point, idx) => (
                        <div key={idx} className="mb-1">
                          {point.startsWith('•') ? point : `• ${point}`}
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No summary available</div>
                    )}
                  </div>

                  {context.posts.length <= 2 && (
                    <div className="flex gap-8">
                      {context.posts.map((post, idx) => (
                        <div key={idx} className="font-semibold">
                          {post.postTitle}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-[28%]">
          {sidebarMessage && (
            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-green-500">✦</span>
                <span className="font-semibold">{sidebarMessage.title}</span>
              </div>
              <p className="text-gray-700 text-sm">
                {sidebarMessage.content}
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
