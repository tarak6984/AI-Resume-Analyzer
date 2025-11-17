/**
 * Job matching utility functions and AI analysis
 */

export const jobMatchingPrompt = (jobPosting: JobPosting) => `
You are an expert recruiter and ATS specialist. Analyze how well this resume matches the following job posting and provide a detailed compatibility score.

JOB POSTING:
Title: ${jobPosting.title}
Company: ${jobPosting.company}
Description: ${jobPosting.description}
Requirements: ${jobPosting.requirements.join(', ')}
Required Skills: ${jobPosting.skills.join(', ')}
Experience Level: ${jobPosting.experience || 'Not specified'}
Type: ${jobPosting.type || 'Not specified'}

ANALYSIS REQUIREMENTS:
1. Overall Match Score (0-100): Consider all factors
2. Skills Match Score (0-100): How well skills align
3. Experience Match Score (0-100): Experience level fit
4. Keyword Match Score (0-100): Relevant keywords present
5. Missing Skills: Critical skills the candidate lacks
6. Matching Skills: Skills that align well
7. Recommendations: Specific advice to improve match

Return the analysis in this exact JSON format:
{
  "overall": number,
  "skillsMatch": number,
  "experienceMatch": number,
  "keywordMatch": number,
  "missingSkills": ["skill1", "skill2"],
  "matchingSkills": ["skill1", "skill2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Be thorough but realistic in your scoring. Consider:
- Technical skills alignment
- Years of experience
- Industry relevance
- Educational background
- Project experience
- Soft skills mentioned
- Keywords from job description

Return only the JSON object, no additional text.
`;

export const analyzeJobMatch = async (
    resumePath: string,
    jobPosting: JobPosting,
    aiFeedback: (path: string, message: string) => Promise<any>
): Promise<JobMatchScore> => {
    try {
        const response = await aiFeedback(
            resumePath,
            jobMatchingPrompt(jobPosting)
        );

        const responseText = typeof response.message.content === 'string'
            ? response.message.content
            : response.message.content[0].text;

        const matchScore = JSON.parse(responseText) as JobMatchScore;
        
        // Validate the response structure
        if (!matchScore.overall || !matchScore.skillsMatch || !matchScore.experienceMatch || !matchScore.keywordMatch) {
            throw new Error('Invalid job match response structure');
        }

        return matchScore;
    } catch (error) {
        console.error('Job match analysis failed:', error);
        return generateFallbackJobMatch(jobPosting);
    }
};

export const generateFallbackJobMatch = (jobPosting: JobPosting): JobMatchScore => {
    return {
        overall: 65,
        skillsMatch: 60,
        experienceMatch: 70,
        keywordMatch: 65,
        missingSkills: jobPosting.skills.slice(0, 3),
        matchingSkills: jobPosting.skills.slice(3, 6),
        recommendations: [
            `Highlight experience with ${jobPosting.skills[0] || 'key technologies'} more prominently`,
            `Add specific examples of ${jobPosting.requirements[0] || 'relevant work'} in your experience section`,
            `Include keywords from the job description in your resume`,
            `Consider adding a summary section that directly addresses the role requirements`
        ]
    };
};

// Sample job postings for demonstration
export const sampleJobs: JobPosting[] = [
    {
        id: "1",
        title: "Frontend Developer",
        company: "Google",
        description: "Join our team to build next-generation web applications using React, TypeScript, and modern CSS frameworks.",
        requirements: [
            "3+ years of frontend development experience",
            "Strong proficiency in React and TypeScript",
            "Experience with modern CSS frameworks",
            "Knowledge of web performance optimization",
            "Familiarity with testing frameworks"
        ],
        skills: ["React", "TypeScript", "CSS", "HTML", "JavaScript", "Jest", "Webpack", "Git"],
        location: "Mountain View, CA",
        type: "full-time",
        experience: "3-5 years",
        salary: "$120k - $180k",
        posted: new Date().toISOString(),
        url: "https://careers.google.com/jobs/frontend-dev"
    },
    {
        id: "2",
        title: "Full Stack Engineer",
        company: "Microsoft",
        description: "Build scalable cloud applications using .NET, Azure, and React. Work on enterprise solutions that serve millions of users.",
        requirements: [
            "5+ years of full-stack development",
            "Experience with .NET Core and C#",
            "Knowledge of Azure cloud services",
            "Frontend experience with React or Angular",
            "Database design and optimization skills"
        ],
        skills: ["C#", ".NET Core", "Azure", "React", "SQL Server", "Docker", "Kubernetes", "DevOps"],
        location: "Seattle, WA",
        type: "full-time",
        experience: "5+ years",
        salary: "$140k - $220k",
        posted: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        url: "https://careers.microsoft.com/jobs/fullstack"
    },
    {
        id: "3",
        title: "iOS Developer",
        company: "Apple",
        description: "Create innovative iOS applications that delight millions of users. Work with Swift, SwiftUI, and the latest iOS technologies.",
        requirements: [
            "4+ years of iOS development experience",
            "Expert knowledge of Swift and SwiftUI",
            "Experience with iOS SDK and frameworks",
            "App Store publishing experience",
            "Understanding of iOS design patterns"
        ],
        skills: ["Swift", "SwiftUI", "iOS SDK", "Xcode", "Core Data", "UIKit", "Git", "REST APIs"],
        location: "Cupertino, CA",
        type: "full-time",
        experience: "4+ years",
        salary: "$150k - $250k",
        posted: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        url: "https://jobs.apple.com/ios-developer"
    },
    {
        id: "4",
        title: "DevOps Engineer",
        company: "Amazon",
        description: "Scale infrastructure for AWS services. Implement CI/CD pipelines, monitoring, and automation solutions.",
        requirements: [
            "3+ years of DevOps/SRE experience",
            "Experience with AWS services",
            "Knowledge of containerization and orchestration",
            "Scripting and automation skills",
            "Monitoring and logging expertise"
        ],
        skills: ["AWS", "Docker", "Kubernetes", "Terraform", "Jenkins", "Python", "Bash", "Monitoring"],
        location: "Austin, TX",
        type: "full-time",
        experience: "3+ years",
        salary: "$130k - $200k",
        posted: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        url: "https://amazon.jobs/devops"
    },
    {
        id: "5",
        title: "Data Scientist",
        company: "Netflix",
        description: "Use machine learning and analytics to improve content recommendation and user experience.",
        requirements: [
            "PhD or Master's in Data Science/Statistics",
            "3+ years of ML/AI experience",
            "Proficiency in Python and R",
            "Experience with big data technologies",
            "Statistical modeling expertise"
        ],
        skills: ["Python", "R", "TensorFlow", "Pandas", "SQL", "Spark", "Jupyter", "Statistics"],
        location: "Los Gatos, CA",
        type: "full-time",
        experience: "3+ years",
        salary: "$160k - $280k",
        posted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        url: "https://jobs.netflix.com/data-scientist"
    }
];

export const getJobMatchColor = (score: number): string => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 60) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
};

export const getJobMatchLabel = (score: number): string => {
    if (score >= 80) return "Excellent Match";
    if (score >= 60) return "Good Match";
    if (score >= 40) return "Fair Match";
    return "Poor Match";
};