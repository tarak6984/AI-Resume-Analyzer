import {Link} from "react-router";
import {UserProfile, useAuthCheck} from "~/components/AuthGuard";
import {useState} from "react";

const Navbar = () => {
    const { isAuthenticated, signOut, user } = useAuthCheck();
    const [showDropdown, setShowDropdown] = useState(false);
    
    const handleSignOut = async () => {
        await signOut();
        setShowDropdown(false);
    };

    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">RESUMIND</p>
            </Link>
            
            <div className="flex items-center gap-4">
                {isAuthenticated ? (
                    <>
                        <div className="hidden sm:flex items-center gap-3">
                            <Link to="/jobs" className="text-gray-700 hover:text-gray-900 font-medium">
                                Job Matching
                            </Link>
                            <Link to="/analytics" className="text-gray-700 hover:text-gray-900 font-medium">
                                Analytics
                            </Link>
                            <Link to="/upload" className="primary-button w-fit">
                                Upload Resume
                            </Link>
                        </div>
                        
                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <UserProfile />
                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-2 z-50">
                                    <div className="px-4 py-2 border-b">
                                        <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                                        <p className="text-xs text-gray-500">Signed in</p>
                                    </div>
                                    
                                    <div className="py-1">
                                        <Link 
                                            to="/" 
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            Dashboard
                                        </Link>
                                        <Link 
                                            to="/jobs" 
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            Job Matching
                                        </Link>
                                        <Link 
                                            to="/analytics" 
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            Analytics
                                        </Link>
                                        <Link 
                                            to="/upload" 
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 sm:hidden"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            Upload Resume
                                        </Link>
                                    </div>
                                    
                                    <div className="border-t pt-1">
                                        <button 
                                            onClick={handleSignOut}
                                            className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <Link to="/auth" className="primary-button w-fit">
                        Sign In
                    </Link>
                )}
            </div>
            
            {/* Click outside to close dropdown */}
            {showDropdown && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </nav>
    )
}
export default Navbar
