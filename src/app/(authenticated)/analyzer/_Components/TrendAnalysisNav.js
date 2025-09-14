import React, { useState } from 'react';

export default function TrendAnalysisNav({ activeSection, onSectionChange, theme }) {
  const sections = [
    { 
      id: 'drivers-and-signals', 
      label: 'Drivers and Signals',
      hasData: theme?.trendAnalysis?.driversAndSignals?.keyDrivers?.length > 0 || 
               theme?.trendAnalysis?.driversAndSignals?.signalsInAction?.length > 0
    },
    { 
      id: 'impact-and-opinions', 
      label: 'Impact and Opinions',
      hasData: theme?.trendAnalysis?.impactAndOpinions?.title?.content || 
               theme?.trendAnalysis?.impactAndOpinions?.disruptivePotential?.highLowContainer ||
               theme?.trendAnalysis?.impactAndOpinions?.trendMomentum?.highLowContainer
    },
    { 
      id: 'regional-dynamics', 
      label: 'Regional Dynamics',
      hasData: theme?.trendAnalysis?.regionalDynamics?.heatMapChartSection?.length > 0 ||
               theme?.trendAnalysis?.regionalDynamics?.regionalInsights?.regions?.length > 0
    },
    { 
      id: 'consumer-dynamics', 
      label: 'Consumer Dynamics',
      hasData: theme?.trendAnalysis?.consumerDynamics?.behavioralInsights?.length > 0 ||
               theme?.trendAnalysis?.consumerDynamics?.impactAnalyser?.length > 0
    }
  ];

  // Filter out sections with no data
  const availableSections = sections.filter(section => section.hasData);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
      <div className="flex p-6">
        {availableSections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={`flex-1 px-8 py-4 font-semibold text-sm transition-all duration-300 ${
              index === 0 ? 'rounded-l-xl' : ''
            } ${
              index === availableSections.length - 1 ? 'rounded-r-xl' : ''
            } ${
              activeSection === section.id
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                : 'bg-gray-50 text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
    </div>
  );
}
