/**
 * Analytics utilities for resume comparison and performance tracking
 */

export const calculateResumeAnalytics = async (
    resume: Resume,
    jobMatches: JobMatch[],
    kv: any
): Promise<ResumeAnalytics> => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Calculate job match statistics
    const totalJobMatches = jobMatches.length;
    const averageMatchScore = totalJobMatches > 0 
        ? Math.round(jobMatches.reduce((sum, match) => sum + match.score.overall, 0) / totalJobMatches)
        : 0;
    const bestMatchScore = totalJobMatches > 0 
        ? Math.max(...jobMatches.map(match => match.score.overall))
        : 0;
    
    // Calculate recent activity
    const matchesLast7Days = jobMatches.filter(
        match => new Date(match.analyzedAt) >= sevenDaysAgo
    ).length;
    
    const matchesLast30Days = jobMatches.filter(
        match => new Date(match.analyzedAt) >= thirtyDaysAgo
    ).length;
    
    const lastAnalyzed = jobMatches.length > 0 
        ? jobMatches.sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime())[0].analyzedAt
        : undefined;
    
    // Calculate improvement trend (simplified)
    let improvementTrend: 'up' | 'down' | 'stable' = 'stable';
    if (jobMatches.length >= 2) {
        const recentMatches = jobMatches
            .filter(match => new Date(match.analyzedAt) >= sevenDaysAgo)
            .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
        
        const olderMatches = jobMatches
            .filter(match => new Date(match.analyzedAt) < sevenDaysAgo)
            .sort((a, b) => new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime());
        
        if (recentMatches.length > 0 && olderMatches.length > 0) {
            const recentAvg = recentMatches.reduce((sum, match) => sum + match.score.overall, 0) / recentMatches.length;
            const olderAvg = olderMatches.reduce((sum, match) => sum + match.score.overall, 0) / olderMatches.length;
            
            const difference = recentAvg - olderAvg;
            if (difference > 5) improvementTrend = 'up';
            else if (difference < -5) improvementTrend = 'down';
        }
    }
    
    // Extract category scores from resume feedback
    const categoryScores = {
        ATS: resume.feedback?.ATS?.score || 0,
        toneAndStyle: resume.feedback?.toneAndStyle?.score || 0,
        content: resume.feedback?.content?.score || 0,
        structure: resume.feedback?.structure?.score || 0,
        skills: resume.feedback?.skills?.score || 0,
    };
    
    return {
        resumeId: resume.id,
        uploadedAt: new Date().toISOString(), // We'll use current date as fallback
        totalJobMatches,
        averageMatchScore,
        bestMatchScore,
        improvementTrend,
        categoryScores,
        recentActivity: {
            matchesLast7Days,
            matchesLast30Days,
            lastAnalyzed
        }
    };
};

export const generateComparisonInsights = (
    resumes: Resume[],
    analytics: ResumeAnalytics[]
): ComparisonData['insights'] => {
    if (analytics.length === 0) {
        return {
            bestPerformer: '',
            mostImproved: '',
            recommendations: [],
            trends: []
        };
    }
    
    // Find best performer (highest average match score)
    const bestPerformer = analytics.reduce((best, current) => 
        current.averageMatchScore > best.averageMatchScore ? current : best
    );
    
    // Find most improved (best improvement trend and positive change)
    const mostImproved = analytics.find(a => a.improvementTrend === 'up') || analytics[0];
    
    // Generate recommendations based on analytics
    const recommendations: string[] = [];
    const avgScores = analytics.reduce((acc, curr) => ({
        ATS: acc.ATS + curr.categoryScores.ATS,
        toneAndStyle: acc.toneAndStyle + curr.categoryScores.toneAndStyle,
        content: acc.content + curr.categoryScores.content,
        structure: acc.structure + curr.categoryScores.structure,
        skills: acc.skills + curr.categoryScores.skills,
    }), { ATS: 0, toneAndStyle: 0, content: 0, structure: 0, skills: 0 });
    
    Object.keys(avgScores).forEach(key => {
        avgScores[key as keyof typeof avgScores] /= analytics.length;
    });
    
    // Generate specific recommendations
    if (avgScores.ATS < 70) {
        recommendations.push("Improve ATS compatibility by using more relevant keywords and standard formatting");
    }
    if (avgScores.skills < 70) {
        recommendations.push("Update skills section with more in-demand technologies and certifications");
    }
    if (avgScores.content < 70) {
        recommendations.push("Strengthen content with more quantified achievements and relevant experience");
    }
    if (analytics.some(a => a.totalJobMatches === 0)) {
        recommendations.push("Start analyzing your resumes against job postings to identify improvement areas");
    }
    
    // Calculate trends
    const trends = Object.keys(avgScores).map(category => {
        const scores = analytics.map(a => a.categoryScores[category as keyof typeof a.categoryScores]);
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        const recentScores = scores.slice(-Math.ceil(scores.length / 2));
        const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
        
        const change = recentAvg - avgScore;
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (change > 2) trend = 'up';
        else if (change < -2) trend = 'down';
        
        return {
            category,
            trend,
            change: Math.round(change)
        };
    });
    
    return {
        bestPerformer: bestPerformer.resumeId,
        mostImproved: mostImproved.resumeId,
        recommendations,
        trends
    };
};

export const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
        case 'up':
            return '↗️';
        case 'down':
            return '↘️';
        default:
            return '→';
    }
};

export const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
        case 'up':
            return 'text-green-600';
        case 'down':
            return 'text-red-600';
        default:
            return 'text-gray-600';
    }
};

export const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
};

export const calculateScoreChange = (current: number, previous: number): { change: number; percentage: number } => {
    const change = current - previous;
    const percentage = previous > 0 ? Math.round((change / previous) * 100) : 0;
    return { change, percentage };
};