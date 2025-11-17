interface Resume {
    id: string;
    companyName?: string;
    jobTitle?: string;
    imagePath: string;
    resumePath: string;
    feedback: Feedback;
}

interface Feedback {
    overallScore: number;
    ATS: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
        }[];
    };
    toneAndStyle: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    content: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    structure: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
    skills: {
        score: number;
        tips: {
            type: "good" | "improve";
            tip: string;
            explanation: string;
        }[];
    };
}

interface JobPosting {
    id: string;
    title: string;
    company: string;
    description: string;
    requirements: string[];
    skills: string[];
    location?: string;
    type?: "full-time" | "part-time" | "contract" | "internship";
    experience?: string;
    salary?: string;
    posted: string; // ISO date string
    url?: string;
}

interface JobMatchScore {
    overall: number;
    skillsMatch: number;
    experienceMatch: number;
    keywordMatch: number;
    missingSkills: string[];
    matchingSkills: string[];
    recommendations: string[];
}

interface JobMatch {
    jobId: string;
    resumeId: string;
    score: JobMatchScore;
    analyzedAt: string;
}

interface ResumeAnalytics {
    resumeId: string;
    uploadedAt: string;
    totalJobMatches: number;
    averageMatchScore: number;
    bestMatchScore: number;
    improvementTrend: 'up' | 'down' | 'stable';
    categoryScores: {
        ATS: number;
        toneAndStyle: number;
        content: number;
        structure: number;
        skills: number;
    };
    recentActivity: {
        matchesLast7Days: number;
        matchesLast30Days: number;
        lastAnalyzed?: string;
    };
}

interface ComparisonData {
    resumes: Resume[];
    analytics: ResumeAnalytics[];
    insights: {
        bestPerformer: string; // resume ID
        mostImproved: string; // resume ID
        recommendations: string[];
        trends: {
            category: string;
            trend: 'up' | 'down' | 'stable';
            change: number;
        }[];
    };
}
