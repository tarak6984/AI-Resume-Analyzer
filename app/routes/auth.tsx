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
                <div className="w-full max-w-md">
                    <section className="flex flex-col gap-6 bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-2 shadow-lg">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Welcome to<br/>AI Resume Analyzer</h1>
                                <p className="text-gray-600 text-base md:text-lg">Sign in to analyze your resumes and get AI-powered feedback</p>
                            </div>
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
                                <button className="w-full py-4 px-6 bg-gradient-to-r from-gray-400 to-gray-500 text-white font-semibold rounded-xl shadow-lg animate-pulse" disabled>
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-lg">Signing you in...</span>
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
                                                className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200" 
                                                onClick={handleSignOut}
                                            >
                                                <span className="text-lg">Sign Out</span>
                                            </button>
                                        </div>
                                    ) : (
                                        <button 
                                            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105" 
                                            onClick={handleSignIn}
                                        >
                                            <div className="flex items-center justify-center gap-3">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                </svg>
                                                <span className="text-lg">Sign In with Puter</span>
                                            </div>
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                        
                        <div className="text-center">
                            <p className="text-sm text-gray-500">🔒 Secure authentication powered by <span className="font-medium text-gray-700">Puter.js</span></p>
                        </div>
                    </section>
                </div>
            </main>
        </AuthGuard>
    )
}

export default Auth
