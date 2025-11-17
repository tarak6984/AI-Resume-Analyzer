import { useEffect, useState } from 'react';
import { usePuterStore } from '~/lib/puter';
import { LoadingSkeleton } from '~/components/LoadingSkeleton';

interface JobStatsProps {
  resumes: Resume[];
}

interface JobStatsData {
  totalMatches: number;
  averageScore: number;
  topMatch: number;
  recentMatches: number;
}

export const JobStats = ({ resumes }: JobStatsProps) => {
  const { kv } = usePuterStore();
  const [stats, setStats] = useState<JobStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJobStats = async () => {
      if (resumes.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let totalMatches = 0;
        let totalScore = 0;
        let topMatch = 0;
        let recentMatches = 0;
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

        for (const resume of resumes) {
          const matches = await kv.list(`jobmatch:${resume.id}:*`, true) as KVItem[];
          
          matches?.forEach(match => {
            try {
              const matchData: JobMatch = JSON.parse(match.value);
              totalMatches++;
              totalScore += matchData.score.overall;
              topMatch = Math.max(topMatch, matchData.score.overall);
              
              if (new Date(matchData.analyzedAt).getTime() > oneDayAgo) {
                recentMatches++;
              }
            } catch (parseError) {
              console.error('Failed to parse job match:', parseError);
            }
          });
        }

        setStats({
          totalMatches,
          averageScore: totalMatches > 0 ? Math.round(totalScore / totalMatches) : 0,
          topMatch,
          recentMatches
        });
      } catch (error) {
        console.error('Failed to load job stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobStats();
  }, [resumes, kv]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border p-6">
        <LoadingSkeleton width="w-48" height="h-6" className="mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="text-center">
              <LoadingSkeleton width="w-12" height="h-8" className="mx-auto mb-1" />
              <LoadingSkeleton width="w-16" height="h-4" className="mx-auto" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats || stats.totalMatches === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Start Job Matching
        </h3>
        <p className="text-gray-600 mb-4">
          Discover how well your resumes match current job opportunities and get personalized recommendations.
        </p>
        <a 
          href="/jobs" 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Find Job Matches
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Job Matching Overview
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600">{stats.totalMatches}</div>
          <div className="text-sm text-gray-600">Total Matches</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-600">{stats.averageScore}%</div>
          <div className="text-sm text-gray-600">Avg Score</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600">{stats.topMatch}%</div>
          <div className="text-sm text-gray-600">Best Match</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600">{stats.recentMatches}</div>
          <div className="text-sm text-gray-600">Recent (24h)</div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-sm text-gray-600">
          {stats.averageScore >= 70 
            ? "Great job! Your resumes are performing well." 
            : stats.averageScore >= 50
            ? "Good progress! Consider optimizing based on feedback."
            : "Room for improvement. Check detailed feedback for tips."
          }
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="/analytics" 
            className="text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            View Analytics →
          </a>
          <a 
            href="/jobs" 
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Find More Jobs →
          </a>
        </div>
      </div>
    </div>
  );
};