import { useState } from 'react';
import { getTrendIcon, getTrendColor, formatTimeAgo } from '~/lib/analytics';
import { LoadingSkeleton } from '~/components/LoadingSkeleton';

interface ResumeComparisonProps {
  resumes: Resume[];
  analytics: ResumeAnalytics[];
  insights: ComparisonData['insights'];
}

export const ResumeComparison = ({ resumes, analytics, insights }: ResumeComparisonProps) => {
  const [selectedResumes, setSelectedResumes] = useState<string[]>([]);
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overview'>('overview');

  const handleResumeSelect = (resumeId: string) => {
    setSelectedResumes(prev => 
      prev.includes(resumeId) 
        ? prev.filter(id => id !== resumeId)
        : prev.length < 3 ? [...prev, resumeId] : prev
    );
  };

  const getResumeTitle = (resume: Resume) => {
    return resume.companyName && resume.jobTitle 
      ? `${resume.jobTitle} at ${resume.companyName}`
      : `Resume ${resume.id}`;
  };

  if (analytics.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Upload and analyze some resumes to see comparison insights.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Resume Analytics</h2>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setComparisonMode('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              comparisonMode === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setComparisonMode('side-by-side')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              comparisonMode === 'side-by-side'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Side-by-Side
          </button>
        </div>
      </div>

      {comparisonMode === 'overview' ? (
        <OverviewMode analytics={analytics} insights={insights} resumes={resumes} />
      ) : (
        <SideBySideMode 
          resumes={resumes}
          analytics={analytics}
          selectedResumes={selectedResumes}
          onResumeSelect={handleResumeSelect}
        />
      )}
    </div>
  );
};

interface OverviewModeProps {
  analytics: ResumeAnalytics[];
  insights: ComparisonData['insights'];
  resumes: Resume[];
}

const OverviewMode = ({ analytics, insights, resumes }: OverviewModeProps) => {
  const bestPerformerResume = resumes.find(r => r.id === insights.bestPerformer);
  const mostImprovedResume = resumes.find(r => r.id === insights.mostImproved);

  return (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best Performer */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-green-900">Best Performer</h3>
          </div>
          {bestPerformerResume && (
            <div>
              <p className="text-green-800 font-medium mb-2">
                {bestPerformerResume.companyName && bestPerformerResume.jobTitle 
                  ? `${bestPerformerResume.jobTitle} at ${bestPerformerResume.companyName}`
                  : 'Resume'
                }
              </p>
              <div className="text-sm text-green-700">
                Average Match: {analytics.find(a => a.resumeId === insights.bestPerformer)?.averageMatchScore || 0}%
              </div>
            </div>
          )}
        </div>

        {/* Most Improved */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-900">Most Improved</h3>
          </div>
          {mostImprovedResume && (
            <div>
              <p className="text-blue-800 font-medium mb-2">
                {mostImprovedResume.companyName && mostImprovedResume.jobTitle 
                  ? `${mostImprovedResume.jobTitle} at ${mostImprovedResume.companyName}`
                  : 'Resume'
                }
              </p>
              <div className="text-sm text-blue-700">
                Trend: {getTrendIcon(analytics.find(a => a.resumeId === insights.mostImproved)?.improvementTrend || 'stable')} Improving
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-lg shadow-md border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-3 font-medium text-gray-700">Resume</th>
                <th className="pb-3 font-medium text-gray-700">Overall Score</th>
                <th className="pb-3 font-medium text-gray-700">Job Matches</th>
                <th className="pb-3 font-medium text-gray-700">Avg Match</th>
                <th className="pb-3 font-medium text-gray-700">Best Match</th>
                <th className="pb-3 font-medium text-gray-700">Trend</th>
              </tr>
            </thead>
            <tbody>
              {analytics.map((analytic, index) => {
                const resume = resumes.find(r => r.id === analytic.resumeId);
                return (
                  <tr key={analytic.resumeId} className="border-b hover:bg-gray-50">
                    <td className="py-3 font-medium">
                      {resume ? getResumeTitle(resume) : 'Unknown Resume'}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {resume?.feedback?.overallScore || 0}/100
                      </span>
                    </td>
                    <td className="py-3">{analytic.totalJobMatches}</td>
                    <td className="py-3">{analytic.averageMatchScore}%</td>
                    <td className="py-3">{analytic.bestMatchScore}%</td>
                    <td className="py-3">
                      <span className={getTrendColor(analytic.improvementTrend)}>
                        {getTrendIcon(analytic.improvementTrend)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      {insights.recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          <ul className="space-y-3">
            {insights.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-gray-700">{rec}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface SideBySideModeProps {
  resumes: Resume[];
  analytics: ResumeAnalytics[];
  selectedResumes: string[];
  onResumeSelect: (resumeId: string) => void;
}

const SideBySideMode = ({ resumes, analytics, selectedResumes, onResumeSelect }: SideBySideModeProps) => {
  return (
    <div className="space-y-6">
      {/* Resume Selector */}
      <div className="bg-white rounded-lg shadow-md border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Select Resumes to Compare (max 3)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => {
            const analytic = analytics.find(a => a.resumeId === resume.id);
            const isSelected = selectedResumes.includes(resume.id);
            
            return (
              <button
                key={resume.id}
                onClick={() => onResumeSelect(resume.id)}
                disabled={!isSelected && selectedResumes.length >= 3}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : selectedResumes.length >= 3
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <p className="font-medium">{getResumeTitle(resume)}</p>
                </div>
                {analytic && (
                  <div className="text-sm opacity-75">
                    Score: {resume.feedback?.overallScore || 0}/100 • 
                    {analytic.totalJobMatches} job matches
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side Comparison */}
      {selectedResumes.length >= 2 && (
        <div className="bg-white rounded-lg shadow-md border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 font-medium text-gray-700">Metric</th>
                  {selectedResumes.map(resumeId => {
                    const resume = resumes.find(r => r.id === resumeId);
                    return (
                      <th key={resumeId} className="text-center py-3 font-medium text-gray-700">
                        {resume ? getResumeTitle(resume) : 'Unknown'}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                <ComparisonRow 
                  label="Overall Score"
                  values={selectedResumes.map(id => {
                    const resume = resumes.find(r => r.id === id);
                    return `${resume?.feedback?.overallScore || 0}/100`;
                  })}
                />
                <ComparisonRow 
                  label="Job Matches"
                  values={selectedResumes.map(id => {
                    const analytic = analytics.find(a => a.resumeId === id);
                    return analytic?.totalJobMatches.toString() || '0';
                  })}
                />
                <ComparisonRow 
                  label="Avg Match Score"
                  values={selectedResumes.map(id => {
                    const analytic = analytics.find(a => a.resumeId === id);
                    return `${analytic?.averageMatchScore || 0}%`;
                  })}
                />
                <ComparisonRow 
                  label="ATS Score"
                  values={selectedResumes.map(id => {
                    const resume = resumes.find(r => r.id === id);
                    return `${resume?.feedback?.ATS?.score || 0}/100`;
                  })}
                />
                <ComparisonRow 
                  label="Skills Score"
                  values={selectedResumes.map(id => {
                    const resume = resumes.find(r => r.id === id);
                    return `${resume?.feedback?.skills?.score || 0}/100`;
                  })}
                />
                <ComparisonRow 
                  label="Content Score"
                  values={selectedResumes.map(id => {
                    const resume = resumes.find(r => r.id === id);
                    return `${resume?.feedback?.content?.score || 0}/100`;
                  })}
                />
                <ComparisonRow 
                  label="Improvement Trend"
                  values={selectedResumes.map(id => {
                    const analytic = analytics.find(a => a.resumeId === id);
                    return getTrendIcon(analytic?.improvementTrend || 'stable');
                  })}
                />
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const ComparisonRow = ({ label, values }: { label: string; values: string[] }) => (
  <tr className="border-b hover:bg-gray-50">
    <td className="py-3 font-medium text-gray-900">{label}</td>
    {values.map((value, index) => (
      <td key={index} className="py-3 text-center">{value}</td>
    ))}
  </tr>
);

const getResumeTitle = (resume: Resume) => {
  return resume.companyName && resume.jobTitle 
    ? `${resume.jobTitle} at ${resume.companyName}`
    : `Resume ${resume.id}`;
};

export const ComparisonSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <LoadingSkeleton width="w-48" height="h-8" />
        <LoadingSkeleton width="w-32" height="h-10" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-lg border p-6">
            <LoadingSkeleton width="w-32" height="h-6" className="mb-4" />
            <LoadingSkeleton width="w-48" height="h-5" className="mb-2" />
            <LoadingSkeleton width="w-24" height="h-4" />
          </div>
        ))}
      </div>
      
      <div className="bg-white rounded-lg border p-6">
        <LoadingSkeleton width="w-40" height="h-6" className="mb-4" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between">
              <LoadingSkeleton width="w-32" height="h-4" />
              <LoadingSkeleton width="w-16" height="h-4" />
              <LoadingSkeleton width="w-12" height="h-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};