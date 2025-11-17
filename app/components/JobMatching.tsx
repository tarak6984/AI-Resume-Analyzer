import { useState } from 'react';
import { getJobMatchColor, getJobMatchLabel } from '~/lib/job-matching';
import { LoadingSkeleton } from '~/components/LoadingSkeleton';

interface JobCardProps {
  job: JobPosting;
  onAnalyze: (job: JobPosting) => void;
  isAnalyzing: boolean;
  matchScore?: JobMatchScore;
}

export const JobCard = ({ job, onAnalyze, isAnalyzing, matchScore }: JobCardProps) => {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md border p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
            {job.type && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {job.type}
              </span>
            )}
          </div>
          <p className="text-lg text-gray-700 font-medium">{job.company}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            {job.location && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
            )}
            {job.salary && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                {job.salary}
              </span>
            )}
            <span>Posted {formatDate(job.posted)}</span>
          </div>
        </div>
        
        {/* Match Score Badge */}
        {matchScore && (
          <div className={`px-3 py-2 rounded-lg border text-sm font-medium ${getJobMatchColor(matchScore.overall)}`}>
            <div className="text-center">
              <div className="text-lg font-bold">{matchScore.overall}%</div>
              <div className="text-xs">{getJobMatchLabel(matchScore.overall)}</div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      <p className="text-gray-600 mb-4">{job.description}</p>

      {/* Skills Tags */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {job.skills.slice(0, expanded ? undefined : 6).map((skill, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                matchScore?.matchingSkills.includes(skill)
                  ? 'bg-green-100 text-green-800 border border-green-200'
                  : matchScore?.missingSkills.includes(skill)
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {skill}
            </span>
          ))}
          {job.skills.length > 6 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
            >
              +{job.skills.length - 6} more
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {job.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Match Details */}
      {matchScore && expanded && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-3">Match Analysis</h4>
          
          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{matchScore.skillsMatch}%</div>
              <div className="text-xs text-gray-600">Skills</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{matchScore.experienceMatch}%</div>
              <div className="text-xs text-gray-600">Experience</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{matchScore.keywordMatch}%</div>
              <div className="text-xs text-gray-600">Keywords</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{matchScore.overall}%</div>
              <div className="text-xs text-gray-600">Overall</div>
            </div>
          </div>

          {/* Recommendations */}
          {matchScore.recommendations.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Recommendations:</h5>
              <ul className="text-sm text-gray-600 space-y-1">
                {matchScore.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {expanded ? 'Show less' : 'Show details'}
          </button>
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View job posting →
            </a>
          )}
        </div>
        
        <button
          onClick={() => onAnalyze(job)}
          disabled={isAnalyzing}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            isAnalyzing
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : matchScore
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isAnalyzing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </div>
          ) : matchScore ? (
            'Re-analyze Match'
          ) : (
            'Analyze Match'
          )}
        </button>
      </div>
    </div>
  );
};

interface JobMatchSkeletonProps {
  count?: number;
}

export const JobMatchSkeleton = ({ count = 3 }: JobMatchSkeletonProps) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md border p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <LoadingSkeleton width="w-48" height="h-6" />
                <LoadingSkeleton width="w-16" height="h-5" className="rounded-full" />
              </div>
              <LoadingSkeleton width="w-32" height="h-5" className="mb-2" />
              <div className="flex items-center gap-4">
                <LoadingSkeleton width="w-24" height="h-4" />
                <LoadingSkeleton width="w-20" height="h-4" />
                <LoadingSkeleton width="w-16" height="h-4" />
              </div>
            </div>
            <LoadingSkeleton width="w-20" height="h-16" className="rounded-lg" />
          </div>
          
          <LoadingSkeleton width="w-full" height="h-4" className="mb-4" />
          
          <div className="flex flex-wrap gap-2 mb-4">
            {[1, 2, 3, 4, 5].map(j => (
              <LoadingSkeleton key={j} width="w-16" height="h-6" className="rounded-full" />
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <LoadingSkeleton width="w-24" height="h-4" />
            <LoadingSkeleton width="w-28" height="h-9" className="rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};