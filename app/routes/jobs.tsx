import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router';
import Navbar from '~/components/Navbar';
import { AuthGuard } from '~/components/AuthGuard';
import { usePuterStore } from '~/lib/puter';
import { JobCard, JobMatchSkeleton } from '~/components/JobMatching';
import { sampleJobs, analyzeJobMatch } from '~/lib/job-matching';
import { ErrorAlert, EmptyState } from '~/components/ErrorBoundary';
import { LoadingSkeleton } from '~/components/LoadingSkeleton';

export const meta = () => ([
    { title: 'AI Resume Analyzer | Job Matching' },
    { name: 'description', content: 'Find and analyze job matches for your resumes' },
]);

const Jobs = () => {
    const { kv, ai } = usePuterStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const resumeId = searchParams.get('resume');
    
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
    const [jobMatches, setJobMatches] = useState<Map<string, JobMatchScore>>(new Map());
    const [analyzingJobs, setAnalyzingJobs] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load resumes
    useEffect(() => {
        const loadResumes = async () => {
            try {
                setLoading(true);
                const resumeList = (await kv.list('resume:*', true)) as KVItem[];
                
                if (resumeList) {
                    const parsedResumes = resumeList.map((resume) => {
                        try {
                            return JSON.parse(resume.value) as Resume;
                        } catch (parseError) {
                            console.error('Failed to parse resume:', parseError);
                            return null;
                        }
                    }).filter(Boolean) as Resume[];
                    
                    setResumes(parsedResumes);
                    
                    // Auto-select resume from URL parameter or first resume
                    if (resumeId) {
                        const foundResume = parsedResumes.find(r => r.id === resumeId);
                        if (foundResume) {
                            setSelectedResume(foundResume);
                        }
                    } else if (parsedResumes.length > 0) {
                        setSelectedResume(parsedResumes[0]);
                    }
                }
            } catch (err) {
                console.error('Failed to load resumes:', err);
                setError('Failed to load your resumes. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadResumes();
    }, [kv, resumeId]);

    // Update URL when selected resume changes
    const handleResumeSelect = (resume: Resume) => {
        setSelectedResume(resume);
        setSearchParams({ resume: resume.id });
        // Clear existing job matches when switching resumes
        setJobMatches(new Map());
    };

    // Analyze job match
    const handleAnalyzeJob = async (job: JobPosting) => {
        if (!selectedResume) return;

        setAnalyzingJobs(prev => new Set([...prev, job.id]));
        
        try {
            const matchScore = await analyzeJobMatch(
                selectedResume.resumePath,
                job,
                ai.feedback
            );
            
            setJobMatches(prev => new Map([...prev, [job.id, matchScore]]));
            
            // Store the match result for future reference
            const matchData: JobMatch = {
                jobId: job.id,
                resumeId: selectedResume.id,
                score: matchScore,
                analyzedAt: new Date().toISOString()
            };
            
            await kv.set(`jobmatch:${selectedResume.id}:${job.id}`, JSON.stringify(matchData));
            
        } catch (error) {
            console.error('Job match analysis failed:', error);
            setError('Failed to analyze job match. Please try again.');
        } finally {
            setAnalyzingJobs(prev => {
                const newSet = new Set(prev);
                newSet.delete(job.id);
                return newSet;
            });
        }
    };

    // Load existing job matches for selected resume
    useEffect(() => {
        const loadJobMatches = async () => {
            if (!selectedResume) return;
            
            try {
                const matches = await kv.list(`jobmatch:${selectedResume.id}:*`, true) as KVItem[];
                const matchMap = new Map<string, JobMatchScore>();
                
                matches?.forEach(match => {
                    try {
                        const matchData: JobMatch = JSON.parse(match.value);
                        matchMap.set(matchData.jobId, matchData.score);
                    } catch (parseError) {
                        console.error('Failed to parse job match:', parseError);
                    }
                });
                
                setJobMatches(matchMap);
            } catch (error) {
                console.error('Failed to load job matches:', error);
            }
        };

        loadJobMatches();
    }, [selectedResume, kv]);

    if (loading) {
        return (
            <AuthGuard>
                <main className="bg-gray-50 min-h-screen">
                    <Navbar />
                    <div className="main-section">
                        <div className="page-heading py-16">
                            <LoadingSkeleton width="w-64" height="h-10" className="mx-auto mb-4" />
                            <LoadingSkeleton width="w-96" height="h-6" className="mx-auto" />
                        </div>
                        <JobMatchSkeleton />
                    </div>
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
                        <h1>Job Matching Dashboard</h1>
                        <h2>Discover how well your resume matches current job opportunities</h2>
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
                            title="No resumes found"
                            description="Upload your first resume to start matching with job opportunities."
                            actionLabel="Upload Resume"
                            onAction={() => window.location.href = '/upload'}
                        />
                    ) : (
                        <>
                            {/* Resume Selector */}
                            <div className="mb-8 bg-white rounded-lg shadow-md border p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Select Resume to Match
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {resumes.map((resume) => (
                                        <button
                                            key={resume.id}
                                            onClick={() => handleResumeSelect(resume)}
                                            className={`p-4 rounded-lg border text-left transition-colors ${
                                                selectedResume?.id === resume.id
                                                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                                                    : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    selectedResume?.id === resume.id
                                                        ? 'bg-blue-500'
                                                        : 'bg-gray-300'
                                                }`} />
                                                <div>
                                                    <p className="font-medium">
                                                        {resume.companyName && resume.jobTitle
                                                            ? `${resume.jobTitle} at ${resume.companyName}`
                                                            : 'Resume'
                                                        }
                                                    </p>
                                                    <p className="text-sm opacity-75">
                                                        Score: {resume.feedback?.overallScore || 'N/A'}/100
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Job Listings */}
                            {selectedResume && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-xl font-semibold text-gray-900">
                                            Available Opportunities
                                        </h3>
                                        <div className="text-sm text-gray-600">
                                            {sampleJobs.length} jobs available
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {sampleJobs.map((job) => (
                                            <JobCard
                                                key={job.id}
                                                job={job}
                                                onAnalyze={handleAnalyzeJob}
                                                isAnalyzing={analyzingJobs.has(job.id)}
                                                matchScore={jobMatches.get(job.id)}
                                            />
                                        ))}
                                    </div>

                                    {/* Call to action */}
                                    <div className="mt-12 text-center p-8 bg-white rounded-lg shadow-md border">
                                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                            Want to improve your match scores?
                                        </h4>
                                        <p className="text-gray-600 mb-4">
                                            Get detailed feedback on your resume to increase your chances with these jobs.
                                        </p>
                                        <Link
                                            to={`/resume/${selectedResume.id}`}
                                            className="primary-button inline-flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            View Resume Analysis
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </main>
        </AuthGuard>
    );
};

export default Jobs;