import { useState, useEffect } from 'react';
import Navbar from '~/components/Navbar';
import { AuthGuard } from '~/components/AuthGuard';
import { usePuterStore } from '~/lib/puter';
import { ResumeComparison, ComparisonSkeleton } from '~/components/ResumeComparison';
import { calculateResumeAnalytics, generateComparisonInsights } from '~/lib/analytics';
import { ErrorAlert, EmptyState } from '~/components/ErrorBoundary';

export const meta = () => ([
    { title: 'AI Resume Analyzer | Analytics' },
    { name: 'description', content: 'Compare and analyze your resume performance' },
]);

const Analytics = () => {
    const { kv } = usePuterStore();
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [analytics, setAnalytics] = useState<ResumeAnalytics[]>([]);
    const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadAnalyticsData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Load resumes
                const resumeList = (await kv.list('resume:*', true)) as KVItem[];
                
                if (!resumeList || resumeList.length === 0) {
                    setLoading(false);
                    return;
                }

                const parsedResumes = resumeList.map((resume) => {
                    try {
                        return JSON.parse(resume.value) as Resume;
                    } catch (parseError) {
                        console.error('Failed to parse resume:', parseError);
                        return null;
                    }
                }).filter(Boolean) as Resume[];

                setResumes(parsedResumes);

                // Load analytics for each resume
                const analyticsPromises = parsedResumes.map(async (resume) => {
                    try {
                        // Load job matches for this resume
                        const matches = await kv.list(`jobmatch:${resume.id}:*`, true) as KVItem[];
                        const jobMatches: JobMatch[] = [];
                        
                        matches?.forEach(match => {
                            try {
                                const matchData: JobMatch = JSON.parse(match.value);
                                jobMatches.push(matchData);
                            } catch (parseError) {
                                console.error('Failed to parse job match:', parseError);
                            }
                        });

                        // Calculate analytics for this resume
                        return await calculateResumeAnalytics(resume, jobMatches, kv);
                    } catch (error) {
                        console.error('Failed to calculate analytics for resume:', resume.id, error);
                        // Return default analytics
                        return {
                            resumeId: resume.id,
                            uploadedAt: new Date().toISOString(),
                            totalJobMatches: 0,
                            averageMatchScore: 0,
                            bestMatchScore: 0,
                            improvementTrend: 'stable' as const,
                            categoryScores: {
                                ATS: resume.feedback?.ATS?.score || 0,
                                toneAndStyle: resume.feedback?.toneAndStyle?.score || 0,
                                content: resume.feedback?.content?.score || 0,
                                structure: resume.feedback?.structure?.score || 0,
                                skills: resume.feedback?.skills?.score || 0,
                            },
                            recentActivity: {
                                matchesLast7Days: 0,
                                matchesLast30Days: 0,
                            }
                        };
                    }
                });

                const resolvedAnalytics = await Promise.all(analyticsPromises);
                setAnalytics(resolvedAnalytics);

                // Generate comparison insights
                const insights = generateComparisonInsights(parsedResumes, resolvedAnalytics);
                
                setComparisonData({
                    resumes: parsedResumes,
                    analytics: resolvedAnalytics,
                    insights
                });

            } catch (error) {
                console.error('Failed to load analytics data:', error);
                setError('Failed to load analytics data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadAnalyticsData();
    }, [kv]);

    if (loading) {
        return (
            <AuthGuard>
                <main className="bg-gray-50 min-h-screen">
                    <Navbar />
                    <section className="main-section">
                        <ComparisonSkeleton />
                    </section>
                </main>
            </AuthGuard>
        );
    }

    return (
        <AuthGuard>
            <main className="bg-gray-50 min-h-screen">
                <Navbar />
                
                <section className="main-section">
                    <div className="page-heading py-16">
                        <h1>Resume Analytics Dashboard</h1>
                        <h2>Compare performance and track improvements across all your resumes</h2>
                    </div>

                    {error && (
                        <div className="mb-8">
                            <ErrorAlert 
                                message={error}
                                onDismiss={() => setError(null)}
                            />
                        </div>
                    )}

                    {resumes.length === 0 ? (
                        <EmptyState
                            title="No resumes to analyze"
                            description="Upload and analyze some resumes to see performance comparisons and trends."
                            actionLabel="Upload Resume"
                            onAction={() => window.location.href = '/upload'}
                        />
                    ) : comparisonData ? (
                        <ResumeComparison 
                            resumes={comparisonData.resumes}
                            analytics={comparisonData.analytics}
                            insights={comparisonData.insights}
                        />
                    ) : (
                        <div className="text-center p-8">
                            <p className="text-gray-600">Failed to load comparison data.</p>
                        </div>
                    )}

                    {/* Additional Insights Section */}
                    {comparisonData && analytics.length > 0 && (
                        <div className="mt-12 space-y-6">
                            {/* Performance Trends */}
                            <div className="bg-white rounded-lg shadow-md border p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Performance Insights
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-blue-600 mb-2">
                                            {Math.round(analytics.reduce((sum, a) => sum + a.averageMatchScore, 0) / analytics.length)}%
                                        </div>
                                        <div className="text-sm text-gray-600">Portfolio Average Match Score</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-green-600 mb-2">
                                            {analytics.reduce((sum, a) => sum + a.totalJobMatches, 0)}
                                        </div>
                                        <div className="text-sm text-gray-600">Total Job Matches Analyzed</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-purple-600 mb-2">
                                            {analytics.filter(a => a.improvementTrend === 'up').length}
                                        </div>
                                        <div className="text-sm text-gray-600">Resumes Showing Improvement</div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-white rounded-lg shadow-md border p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Next Steps
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <a
                                        href="/jobs"
                                        className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Analyze More Jobs</h4>
                                            <p className="text-sm text-gray-600">Find more job matches to improve insights</p>
                                        </div>
                                    </a>
                                    <a
                                        href="/upload"
                                        className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900">Upload New Resume</h4>
                                            <p className="text-sm text-gray-600">Add updated versions to track improvements</p>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </AuthGuard>
    );
};

export default Analytics;