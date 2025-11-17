import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import ResumeCard from "~/components/ResumeCard";
import Landing from "~/components/Landing";
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import {ResumeCardSkeleton} from "~/components/LoadingSkeleton";
import {ErrorAlert, EmptyState, NetworkErrorFallback} from "~/components/ErrorBoundary";
import {AuthGuard} from "~/components/AuthGuard";
import {JobStats} from "~/components/JobStats";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resumind" },
    { name: "description", content: "Smart feedback for your dream job!" },
  ];
}

export default function Home() {
  const { auth, kv, isLoading } = usePuterStore();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Show landing page for unauthenticated users
  if (!isLoading && !auth.isAuthenticated) {
    return <Landing />;
  }

  useEffect(() => {
    const loadResumes = async () => {
      if (!auth.isAuthenticated) return;
      
      setLoadingResumes(true);
      setError(null);

      try {
        const resumes = (await kv.list('resume:*', true)) as KVItem[];
        
        if (!resumes) {
          setResumes([]);
        } else {
          const parsedResumes = resumes.map((resume) => {
            try {
              return JSON.parse(resume.value) as Resume;
            } catch (parseError) {
              console.error('Failed to parse resume:', parseError);
              return null;
            }
          }).filter(Boolean) as Resume[];
          
          setResumes(parsedResumes);
        }
      } catch (error) {
        console.error('Failed to load resumes:', error);
        setError('Failed to load your resumes. Please try again.');
      } finally {
        setLoadingResumes(false);
      }
    }

    loadResumes()
  }, [auth.isAuthenticated]);

  return (
    <AuthGuard>
      <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar />

    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Applications & Resume Ratings</h1>
        {!loadingResumes && !error && resumes?.length === 0 ? (
            <h2>No resumes found. Upload your first resume to get feedback.</h2>
        ): (
          <h2>Review your submissions and check AI-powered feedback.</h2>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-8">
          <ErrorAlert 
            title="Loading Error"
            message={error}
            onDismiss={() => setError(null)}
          />
          <div className="mt-4 text-center">
            <button 
              onClick={() => window.location.reload()}
              className="primary-button"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingResumes && (
        <div className="resumes-section">
          {[1, 2, 3].map(i => (
            <ResumeCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Job Stats */}
      {!loadingResumes && !error && resumes.length > 0 && (
        <div className="mb-8">
          <JobStats resumes={resumes} />
        </div>
      )}

      {/* Resumes List */}
      {!loadingResumes && !error && resumes.length > 0 && (
        <div className="resumes-section">
          {resumes.map((resume) => (
              <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loadingResumes && !error && resumes?.length === 0 && (
        <EmptyState
          title="No resumes yet"
          description="Upload your first resume to get AI-powered feedback and improve your chances of landing your dream job."
          actionLabel="Upload Resume"
          onAction={() => navigate('/upload')}
        />
      )}
    </section>
      </main>
    </AuthGuard>
  )
}
