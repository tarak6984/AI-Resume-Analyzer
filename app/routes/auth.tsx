import {usePuterStore} from "~/lib/puter";
import {useEffect, useState} from "react";
import {useLocation, useNavigate} from "react-router";
import {AuthGuard} from "~/components/AuthGuard";
import {ErrorAlert} from "~/components/ErrorBoundary";

export const meta = () => ([
    { title: 'Resumind | Auth' },
    { name: 'description', content: 'Log into your account' },
])

const Auth = () => {
    const { isLoading, auth, error, clearError } = usePuterStore();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const next = searchParams.get('next') || '/';
    const navigate = useNavigate();
    const [authError, setAuthError] = useState<string | null>(null);

    useEffect(() => {
        if(auth.isAuthenticated) {
            navigate(next, { replace: true });
        }
    }, [auth.isAuthenticated, next, navigate])

    const handleSignIn = async () => {
        try {
            setAuthError(null);
            await auth.signIn();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign in';
            setAuthError(errorMessage);
        }
    };

    const handleSignOut = async () => {
        try {
            setAuthError(null);
            await auth.signOut();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
            setAuthError(errorMessage);
        }
    };

    return (
        <AuthGuard requireAuth={false}>
            <main className="bg-[url('/images/bg-auth.svg')] bg-cover min-h-screen flex items-center justify-center p-4">
                <div className="gradient-border shadow-lg w-full max-w-md">
                    <section className="flex flex-col gap-6 bg-white rounded-2xl p-8">
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Welcome to AI Resume Analyzer</h1>
                            <h2 className="text-gray-600">Sign in to analyze your resumes and get AI-powered feedback</h2>
                        </div>
                        
                        {/* Error Display */}
                        {(error || authError) && (
                            <ErrorAlert
                                title="Authentication Error"
                                message={authError || error || 'An unknown error occurred'}
                                onDismiss={() => {
                                    setAuthError(null);
                                    clearError();
                                }}
                            />
                        )}
                        
                        <div className="space-y-4">
                            {isLoading ? (
                                <button className="auth-button animate-pulse" disabled>
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <p>Signing you in...</p>
                                    </div>
                                </button>
                            ) : (
                                <>
                                    {auth.isAuthenticated ? (
                                        <div className="space-y-4">
                                            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                                                <p className="text-green-800 font-medium">Successfully signed in!</p>
                                                <p className="text-green-600 text-sm mt-1">Redirecting to your dashboard...</p>
                                            </div>
                                            <button 
                                                className="auth-button bg-red-600 hover:bg-red-700" 
                                                onClick={handleSignOut}
                                            >
                                                <p>Sign Out</p>
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="auth-button" onClick={handleSignIn}>
                                            <div className="flex items-center justify-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                </svg>
                                                <p>Sign In with Puter</p>
                                            </div>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        
                        <div className="text-center text-sm text-gray-500">
                            <p>Secure authentication powered by Puter.js</p>
                        </div>
                    </section>
                </div>
            </main>
        </AuthGuard>
    )
}

export default Auth
