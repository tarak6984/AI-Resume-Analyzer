import { describe, it, expect } from 'vitest';
import { generateUUID } from '~/lib/utils';
import { 
  getJobMatchColor, 
  getJobMatchLabel, 
  generateFallbackJobMatch, 
  sampleJobs 
} from '~/lib/job-matching';
import { 
  getTrendIcon, 
  getTrendColor, 
  formatTimeAgo, 
  calculateScoreChange,
  calculateResumeAnalytics,
  generateComparisonInsights
} from '~/lib/analytics';
import { 
  generateFallbackFeedback,
  validateFeedbackStructure,
  sanitizeFeedback 
} from '~/lib/feedback-utils';

describe('Utils', () => {
  describe('generateUUID', () => {
    it('generates a valid UUID format', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('generates unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();
      expect(uuid1).not.toBe(uuid2);
    });
  });
});

describe('Job Matching Utils', () => {
  describe('getJobMatchColor', () => {
    it('returns green for excellent scores', () => {
      expect(getJobMatchColor(85)).toContain('green');
    });

    it('returns yellow for good scores', () => {
      expect(getJobMatchColor(65)).toContain('yellow');
    });

    it('returns red for poor scores', () => {
      expect(getJobMatchColor(40)).toContain('red');
    });
  });

  describe('getJobMatchLabel', () => {
    it('returns correct labels for different score ranges', () => {
      expect(getJobMatchLabel(85)).toBe('Excellent Match');
      expect(getJobMatchLabel(65)).toBe('Good Match');
      expect(getJobMatchLabel(45)).toBe('Fair Match');
      expect(getJobMatchLabel(30)).toBe('Poor Match');
    });
  });

  describe('generateFallbackJobMatch', () => {
    it('generates valid fallback job match', () => {
      const job = sampleJobs[0];
      const fallback = generateFallbackJobMatch(job);
      
      expect(fallback.overall).toBeGreaterThanOrEqual(0);
      expect(fallback.overall).toBeLessThanOrEqual(100);
      expect(fallback.missingSkills).toBeInstanceOf(Array);
      expect(fallback.matchingSkills).toBeInstanceOf(Array);
      expect(fallback.recommendations).toBeInstanceOf(Array);
    });
  });
});

describe('Analytics Utils', () => {
  describe('getTrendIcon', () => {
    it('returns correct icons for trends', () => {
      expect(getTrendIcon('up')).toBe('↗️');
      expect(getTrendIcon('down')).toBe('↘️');
      expect(getTrendIcon('stable')).toBe('→');
    });
  });

  describe('getTrendColor', () => {
    it('returns correct colors for trends', () => {
      expect(getTrendColor('up')).toBe('text-green-600');
      expect(getTrendColor('down')).toBe('text-red-600');
      expect(getTrendColor('stable')).toBe('text-gray-600');
    });
  });

  describe('formatTimeAgo', () => {
    it('formats recent times correctly', () => {
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      
      expect(formatTimeAgo(tenMinutesAgo.toISOString())).toContain('minutes ago');
      expect(formatTimeAgo(twoHoursAgo.toISOString())).toContain('hours ago');
      expect(formatTimeAgo(threeDaysAgo.toISOString())).toContain('days ago');
    });
  });

  describe('calculateScoreChange', () => {
    it('calculates score changes correctly', () => {
      const { change, percentage } = calculateScoreChange(80, 70);
      expect(change).toBe(10);
      expect(percentage).toBe(14);
    });

    it('handles zero previous score', () => {
      const { change, percentage } = calculateScoreChange(80, 0);
      expect(change).toBe(80);
      expect(percentage).toBe(0);
    });
  });

  describe('generateComparisonInsights', () => {
    it('handles empty analytics', () => {
      const insights = generateComparisonInsights([], []);
      expect(insights.bestPerformer).toBe('');
      expect(insights.mostImproved).toBe('');
      expect(insights.recommendations).toEqual([]);
      expect(insights.trends).toEqual([]);
    });

    it('generates insights for valid analytics', () => {
      const mockResume: Resume = {
        id: '1',
        imagePath: '/test.png',
        resumePath: '/test.pdf',
        feedback: {
          overallScore: 80,
          ATS: { score: 75, tips: [] },
          toneAndStyle: { score: 85, tips: [] },
          content: { score: 80, tips: [] },
          structure: { score: 85, tips: [] },
          skills: { score: 70, tips: [] },
        }
      };

      const mockAnalytics: ResumeAnalytics[] = [{
        resumeId: '1',
        uploadedAt: new Date().toISOString(),
        totalJobMatches: 3,
        averageMatchScore: 75,
        bestMatchScore: 85,
        improvementTrend: 'up',
        categoryScores: {
          ATS: 75,
          toneAndStyle: 85,
          content: 80,
          structure: 85,
          skills: 70,
        },
        recentActivity: {
          matchesLast7Days: 1,
          matchesLast30Days: 3,
        }
      }];

      const insights = generateComparisonInsights([mockResume], mockAnalytics);
      expect(insights.bestPerformer).toBe('1');
      expect(insights.mostImproved).toBe('1');
      expect(insights.recommendations).toBeInstanceOf(Array);
      expect(insights.trends).toBeInstanceOf(Array);
    });
  });
});

describe('Feedback Utils', () => {
  describe('generateFallbackFeedback', () => {
    it('generates valid fallback feedback', () => {
      const feedback = generateFallbackFeedback('Software Engineer');
      
      expect(feedback.overallScore).toBeGreaterThanOrEqual(0);
      expect(feedback.overallScore).toBeLessThanOrEqual(100);
      expect(feedback.ATS.tips).toBeInstanceOf(Array);
      expect(feedback.toneAndStyle.tips).toBeInstanceOf(Array);
      expect(feedback.content.tips).toBeInstanceOf(Array);
      expect(feedback.structure.tips).toBeInstanceOf(Array);
      expect(feedback.skills.tips).toBeInstanceOf(Array);
    });
  });

  describe('validateFeedbackStructure', () => {
    it('validates correct feedback structure', () => {
      const validFeedback = {
        overallScore: 80,
        ATS: { score: 75, tips: [{ type: 'good', tip: 'Great formatting' }] },
        toneAndStyle: { score: 85, tips: [{ type: 'good', tip: 'Professional tone', explanation: 'Detailed explanation' }] },
        content: { score: 80, tips: [{ type: 'improve', tip: 'Add more details', explanation: 'Explanation' }] },
        structure: { score: 85, tips: [{ type: 'good', tip: 'Clear structure', explanation: 'Explanation' }] },
        skills: { score: 70, tips: [{ type: 'improve', tip: 'Update skills', explanation: 'Explanation' }] },
      };
      
      expect(validateFeedbackStructure(validFeedback)).toBe(true);
    });

    it('rejects invalid feedback structure', () => {
      const invalidFeedback = {
        overallScore: 80,
        // Missing required fields
      };
      
      expect(validateFeedbackStructure(invalidFeedback)).toBe(false);
    });
  });

  describe('sanitizeFeedback', () => {
    it('sanitizes invalid scores', () => {
      const invalidFeedback = {
        overallScore: 150, // Invalid score > 100
        ATS: { score: -10, tips: [] }, // Invalid negative score
        toneAndStyle: { score: 'invalid', tips: [] }, // Invalid type
        content: { score: 80, tips: [] },
        structure: { score: 85, tips: [] },
        skills: { score: 70, tips: [] },
      };
      
      const sanitized = sanitizeFeedback(invalidFeedback);
      expect(sanitized.overallScore).toBe(100);
      expect(sanitized.ATS.score).toBe(0);
      expect(sanitized.toneAndStyle.score).toBe(50);
    });

    it('limits tips to maximum of 4', () => {
      const feedbackWithManyTips = {
        overallScore: 80,
        ATS: { 
          score: 75, 
          tips: Array.from({ length: 10 }, (_, i) => ({ type: 'good' as const, tip: `Tip ${i}` }))
        },
        toneAndStyle: { 
          score: 85, 
          tips: Array.from({ length: 10 }, (_, i) => ({ 
            type: 'good' as const, 
            tip: `Tip ${i}`, 
            explanation: `Explanation ${i}` 
          }))
        },
        content: { score: 80, tips: [] },
        structure: { score: 85, tips: [] },
        skills: { score: 70, tips: [] },
      };
      
      const sanitized = sanitizeFeedback(feedbackWithManyTips);
      expect(sanitized.ATS.tips.length).toBeLessThanOrEqual(4);
      expect(sanitized.toneAndStyle.tips.length).toBeLessThanOrEqual(4);
    });
  });
});