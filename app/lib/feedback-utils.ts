/**
 * Utility functions for handling AI feedback validation and fallbacks
 */

export const generateFallbackFeedback = (jobTitle?: string): Feedback => {
    const jobSpecific = jobTitle ? ` for a ${jobTitle} position` : '';
    
    return {
        overallScore: 65,
        ATS: {
            score: 70,
            tips: [
                {
                    type: "improve",
                    tip: "Add more relevant keywords"
                },
                {
                    type: "good", 
                    tip: "Clean formatting structure"
                },
                {
                    type: "improve",
                    tip: "Use standard section headings"
                }
            ]
        },
        toneAndStyle: {
            score: 75,
            tips: [
                {
                    type: "good",
                    tip: "Professional language",
                    explanation: "Your resume uses appropriate professional language and maintains a formal tone throughout."
                },
                {
                    type: "improve",
                    tip: "Strengthen action verbs",
                    explanation: `Consider using more powerful action verbs${jobSpecific} to better demonstrate your impact and achievements.`
                },
                {
                    type: "improve",
                    tip: "Quantify achievements",
                    explanation: "Add specific numbers, percentages, or metrics to make your accomplishments more compelling and measurable."
                }
            ]
        },
        content: {
            score: 60,
            tips: [
                {
                    type: "improve",
                    tip: "Add relevant experience details",
                    explanation: `Include more specific details about your experience that directly relates to${jobSpecific} requirements.`
                },
                {
                    type: "improve",
                    tip: "Highlight key achievements",
                    explanation: "Focus on major accomplishments rather than just listing job duties to better showcase your value."
                },
                {
                    type: "good",
                    tip: "Clear work history",
                    explanation: "Your employment history is clearly presented with proper dates and company information."
                }
            ]
        },
        structure: {
            score: 80,
            tips: [
                {
                    type: "good",
                    tip: "Logical section organization",
                    explanation: "Your resume follows a clear, logical structure that's easy to follow for both ATS and human reviewers."
                },
                {
                    type: "improve",
                    tip: "Optimize section order",
                    explanation: `Consider reordering sections to highlight your most relevant qualifications${jobSpecific} first.`
                },
                {
                    type: "good",
                    tip: "Consistent formatting",
                    explanation: "You maintain consistent formatting throughout the document, which improves readability."
                }
            ]
        },
        skills: {
            score: 65,
            tips: [
                {
                    type: "improve",
                    tip: "Add technical skills",
                    explanation: `Include more technical skills and tools that are specifically mentioned in${jobSpecific} job descriptions.`
                },
                {
                    type: "improve",
                    tip: "Organize skills by relevance",
                    explanation: "Group your skills by category and prioritize those most relevant to your target role."
                },
                {
                    type: "good",
                    tip: "Skills section present",
                    explanation: "You have a dedicated skills section, which is important for ATS scanning and recruiter review."
                }
            ]
        }
    };
};

export const validateFeedbackStructure = (feedback: any): boolean => {
    // Check if feedback has all required properties
    const requiredProps = ['overallScore', 'ATS', 'toneAndStyle', 'content', 'structure', 'skills'];
    
    for (const prop of requiredProps) {
        if (!feedback[prop]) return false;
    }
    
    // Check if all category objects have score and tips
    const categories = ['ATS', 'toneAndStyle', 'content', 'structure', 'skills'];
    
    for (const category of categories) {
        const categoryData = feedback[category];
        if (!categoryData.score || !Array.isArray(categoryData.tips)) {
            return false;
        }
        
        // Check if tips have required structure
        if (category !== 'ATS') {
            for (const tip of categoryData.tips) {
                if (!tip.type || !tip.tip || !tip.explanation) {
                    return false;
                }
            }
        } else {
            // ATS tips don't have explanation
            for (const tip of categoryData.tips) {
                if (!tip.type || !tip.tip) {
                    return false;
                }
            }
        }
    }
    
    return true;
};

export const sanitizeFeedback = (feedback: any): Feedback => {
    // Ensure scores are within valid range
    const sanitizeScore = (score: number): number => {
        if (typeof score !== 'number' || isNaN(score)) return 50;
        return Math.max(0, Math.min(100, Math.round(score)));
    };
    
    // Sanitize tips array
    const sanitizeTips = (tips: any[], hasExplanation: boolean = true): any[] => {
        if (!Array.isArray(tips)) return [];
        
        return tips.filter(tip => {
            if (!tip.type || !tip.tip) return false;
            if (hasExplanation && !tip.explanation) return false;
            return true;
        }).slice(0, 4); // Limit to max 4 tips
    };
    
    return {
        overallScore: sanitizeScore(feedback.overallScore),
        ATS: {
            score: sanitizeScore(feedback.ATS?.score),
            tips: sanitizeTips(feedback.ATS?.tips, false)
        },
        toneAndStyle: {
            score: sanitizeScore(feedback.toneAndStyle?.score),
            tips: sanitizeTips(feedback.toneAndStyle?.tips)
        },
        content: {
            score: sanitizeScore(feedback.content?.score),
            tips: sanitizeTips(feedback.content?.tips)
        },
        structure: {
            score: sanitizeScore(feedback.structure?.score),
            tips: sanitizeTips(feedback.structure?.tips)
        },
        skills: {
            score: sanitizeScore(feedback.skills?.score),
            tips: sanitizeTips(feedback.skills?.tips)
        }
    };
};