import React, { useState } from 'react';
import Image from 'next/image';
import keyDriverIcon from '../../../utils/key driver.png';
import signalsInActionIcon from '../../../utils/signals in action.png';

export default function DriversAndSignals({ theme }) {
  const [expandedDrivers, setExpandedDrivers] = useState({});
  const [expandedSignals, setExpandedSignals] = useState({});

  const driversAndSignals = theme?.trendAnalysis?.driversAndSignals;
  const keyDrivers = driversAndSignals?.keyDrivers || [];
  const signalsInAction = driversAndSignals?.signalsInAction || [];

  const toggleDriverExpansion = (index) => {
    setExpandedDrivers(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const toggleSignalExpansion = (index) => {
    setExpandedSignals(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatDescription = (description, isExpanded) => {
    if (!description) return '';
    
    if (isExpanded) {
      return description;
    }
    
    // Show first 2 lines or bullet points
    const lines = description.split('\n').filter(line => line.trim());
    if (lines.length <= 2) {
      return description;
    }
    
    return lines.slice(0, 2).join('\n') + '...';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Key Drivers Section */}
        <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Image 
                src={keyDriverIcon} 
                alt="Key Drivers Icon" 
                width={32} 
                height={32} 
                className="object-contain"
              />
              Key Drivers
            </h3>
          
          {keyDrivers.length > 0 ? (
            <div className="space-y-4">
              {keyDrivers.slice(0, 8).map((driver, index) => (
                <div 
                  key={index}
                  className="bg-blue-50 border-l-4 border-black rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    {driver.icon && (
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <img 
                            src={driver.icon} 
                            alt="Driver Icon" 
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Content */}
                    <div className="flex-1">
                      {/* Driver Type */}
                      {driver.driverType && (
                        <div className="text-xs text-blue-600 font-medium mb-1 uppercase tracking-wide">
                          {typeof driver.driverType === 'object' ? driver.driverType.driverName : driver.driverType}
                        </div>
                      )}
                      
                      {/* Title */}
                      <h4 className="font-bold text-gray-800 mb-2">
                        {driver.driverTitle}
                      </h4>
                      
                      {/* Description */}
                      <div className="text-sm text-gray-600 leading-relaxed mb-3">
                        <pre className="whitespace-pre-wrap font-sans">
                          {formatDescription(driver.description, expandedDrivers[index])}
                        </pre>
                      </div>
                      
                      {/* View More Button */}
                      {driver.description && driver.description.length > 150 && (
                        <button
                          onClick={() => toggleDriverExpansion(index)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 transition-colors"
                        >
                          {expandedDrivers[index] ? 'View Less' : 'View More'}
                          <svg 
                            className={`w-4 h-4 transition-transform ${expandedDrivers[index] ? 'rotate-180' : ''}`} 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No key drivers available</p>
            </div>
          )}
        </div>

        {/* Signals in Action Section */}
        <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Image 
                src={signalsInActionIcon} 
                alt="Signals in Action Icon" 
                width={46} 
                height={46} 
                className="object-contain"
              />
              Signals in Action
            </h3>
          
          {signalsInAction.length > 0 ? (
            <div className="space-y-6">
              {signalsInAction.map((signal, index) => (
                <div 
                  key={index}
                  className="bg-blue-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                >
                  {/* Header Section */}
                  <div className="flex items-start gap-4 mb-6">
                    {/* Logo */}
                    {signal.logo && (
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                          <img 
                            src={signal.logo} 
                            alt="Signal Logo" 
                            className="w-8 h-8 object-contain"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Title and Description */}
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-800 text-lg mb-2">
                        {signal.title}
                      </h4>
                      <p className="text-gray-600 leading-relaxed">
                        {signal.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Content Sections */}
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* Initiative Section */}
                    {signal.initiative?.description && (
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h5 className="font-bold text-red-600 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                             Key Metrics
                          </h5>
                        <div className="text-gray-700 leading-relaxed">
                          <pre className="whitespace-pre-wrap font-sans">
                            {signal.initiative.description}
                          </pre>
                        </div>
                      </div>
                    )}
                    
                    {/* Strategic Imperative Section */}
                    {signal.strategicImperative?.description && (
                      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h5 className="font-bold text-red-600 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                             Strategic Advantage
                          </h5>
                        <div className="text-gray-700 leading-relaxed">
                          <pre className="whitespace-pre-wrap font-sans">
                            {signal.strategicImperative.description}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* View More Button */}
                  {signal.description && signal.description.length > 150 && (
                    <div className="mt-4">
                      <button
                        onClick={() => toggleSignalExpansion(index)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 transition-colors group"
                      >
                        {expandedSignals[index] ? 'View Less' : 'View More'}
                        <svg 
                          className={`w-4 h-4 transition-transform group-hover:translate-y-0.5 ${expandedSignals[index] ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No signals in action available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
