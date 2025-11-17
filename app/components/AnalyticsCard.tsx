import { getTrendIcon, getTrendColor, formatTimeAgo } from '~/lib/analytics';

interface AnalyticsCardProps {
  analytic: ResumeAnalytics;
  resume: Resume;
  className?: string;
}

export const AnalyticsCard = ({ analytic, resume, className = '' }: AnalyticsCardProps) => {
  const getResumeTitle = () => {
    return resume.companyName && resume.jobTitle 
      ? `${resume.jobTitle} at ${resume.companyName}`
      : `Resume ${resume.id}`;
  };

  return (
    <div className={`bg-white rounded-lg shadow-md border p-4 hover:shadow-lg transition-shadow ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 truncate flex-1">
          {getResumeTitle()}
        </h3>
        <span className={`text-lg ${getTrendColor(analytic.improvementTrend)}`}>
          {getTrendIcon(analytic.improvementTrend)}
        </span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold text-blue-600">
            {resume.feedback?.overallScore || 0}
          </div>
          <div className="text-xs text-gray-500">Resume Score</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">
            {analytic.averageMatchScore}%
          </div>
          <div className="text-xs text-gray-500">Avg Match</div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span>{analytic.totalJobMatches} job matches</span>
        <span>Best: {analytic.bestMatchScore}%</span>
      </div>

      {/* Category Scores */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">ATS</span>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-blue-500 h-1.5 rounded-full transition-all" 
                style={{ width: `${analytic.categoryScores.ATS}%` }}
              />
            </div>
            <span className="text-gray-700 w-8">{analytic.categoryScores.ATS}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Skills</span>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full transition-all" 
                style={{ width: `${analytic.categoryScores.skills}%` }}
              />
            </div>
            <span className="text-gray-700 w-8">{analytic.categoryScores.skills}</span>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-600">Content</span>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-purple-500 h-1.5 rounded-full transition-all" 
                style={{ width: `${analytic.categoryScores.content}%` }}
              />
            </div>
            <span className="text-gray-700 w-8">{analytic.categoryScores.content}</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {analytic.recentActivity.lastAnalyzed && (
        <div className="text-xs text-gray-500 mb-3">
          Last analyzed: {formatTimeAgo(analytic.recentActivity.lastAnalyzed)}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <a
          href={`/resume/${resume.id}`}
          className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-center py-2 px-3 rounded-md text-sm font-medium transition-colors"
        >
          View Details
        </a>
        <a
          href={`/jobs?resume=${resume.id}`}
          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 text-center py-2 px-3 rounded-md text-sm font-medium transition-colors"
        >
          Find Jobs
        </a>
      </div>

      {/* Improvement Badge */}
      {analytic.improvementTrend === 'up' && (
        <div className="mt-3 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full text-center">
          📈 Improving Performance
        </div>
      )}
      {analytic.improvementTrend === 'down' && (
        <div className="mt-3 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full text-center">
          📉 Needs Attention
        </div>
      )}
    </div>
  );
};

interface CompactAnalyticsCardProps {
  analytic: ResumeAnalytics;
  resume: Resume;
  onClick?: () => void;
}

export const CompactAnalyticsCard = ({ analytic, resume, onClick }: CompactAnalyticsCardProps) => {
  const getResumeTitle = () => {
    return resume.companyName && resume.jobTitle 
      ? `${resume.jobTitle} at ${resume.companyName}`
      : `Resume ${resume.id}`;
  };

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg border p-3 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm truncate flex-1">
          {getResumeTitle()}
        </h4>
        <span className={`text-sm ${getTrendColor(analytic.improvementTrend)}`}>
          {getTrendIcon(analytic.improvementTrend)}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-600">
        <span>Score: {resume.feedback?.overallScore || 0}/100</span>
        <span>Matches: {analytic.totalJobMatches}</span>
        <span>Avg: {analytic.averageMatchScore}%</span>
      </div>
    </div>
  );
};