import { getTier, getNextTierConfig, getTierProgress, isTierHigher } from '../tiers';
import type { TierConfig } from '@/lib/types';

const MOCK_TIER_CONFIGS: TierConfig[] = [
  { tier: 'bronze', label: 'Bronze', emoji: '🥉', threshold: 25, reward: 'test', color: '#CD7F32' },
  { tier: 'silver', label: 'Silver', emoji: '🥈', threshold: 75, reward: 'test', color: '#C0C0C0' },
  { tier: 'gold', label: 'Gold', emoji: '🥇', threshold: 150, reward: 'test', color: '#FFD700' },
  { tier: 'diamond', label: 'Diamond', emoji: '💎', threshold: 300, reward: 'test', color: '#B9F2FF' },
  { tier: 'legend', label: 'Legend', emoji: '👑', threshold: 500, reward: 'test', color: '#9B59B6' },
];

describe('Tier Utilities', () => {
  describe('getTier', () => {
    it('should return "none" for 0 points', () => {
      expect(getTier(0, MOCK_TIER_CONFIGS)).toBe('none');
    });

    it('should return "bronze" for 25+ points', () => {
      expect(getTier(25, MOCK_TIER_CONFIGS)).toBe('bronze');
      expect(getTier(50, MOCK_TIER_CONFIGS)).toBe('bronze');
    });

    it('should return "silver" for 75+ points', () => {
      expect(getTier(75, MOCK_TIER_CONFIGS)).toBe('silver');
      expect(getTier(100, MOCK_TIER_CONFIGS)).toBe('silver');
    });

    it('should return "gold" for 150+ points', () => {
      expect(getTier(150, MOCK_TIER_CONFIGS)).toBe('gold');
      expect(getTier(200, MOCK_TIER_CONFIGS)).toBe('gold');
    });

    it('should return "legend" for 500+ points', () => {
      expect(getTier(500, MOCK_TIER_CONFIGS)).toBe('legend');
      expect(getTier(1000, MOCK_TIER_CONFIGS)).toBe('legend');
    });
  });

  describe('getNextTierConfig', () => {
    it('should return next tier config for non-legend', () => {
      const next = getNextTierConfig(25, MOCK_TIER_CONFIGS);
      expect(next?.tier).toBe('silver');
      expect(next?.threshold).toBe(75);
    });

    it('should return null for legend tier', () => {
      const next = getNextTierConfig(500, MOCK_TIER_CONFIGS);
      expect(next).toBeNull();
    });

    it('should return bronze config for 0 points', () => {
      const next = getNextTierConfig(0, MOCK_TIER_CONFIGS);
      expect(next?.tier).toBe('bronze');
      expect(next?.threshold).toBe(25);
    });
  });

  describe('isTierHigher', () => {
    it('should return true when upgrading tiers', () => {
      expect(isTierHigher('gold', 'silver')).toBe(true);
      expect(isTierHigher('legend', 'gold')).toBe(true);
    });

    it('should return false when same tier', () => {
      expect(isTierHigher('gold', 'gold')).toBe(false);
    });

    it('should return false when downgrading', () => {
      expect(isTierHigher('silver', 'gold')).toBe(false);
    });

    it('should handle none tier correctly', () => {
      expect(isTierHigher('bronze', 'none')).toBe(true);
      expect(isTierHigher('none', 'bronze')).toBe(false);
    });
  });

  describe('getTierProgress', () => {
    it('should return progress as percentage', () => {
      // 25 points out of 75 (silver threshold) = 33%
      const progress = getTierProgress(25, MOCK_TIER_CONFIGS);
      expect(progress).toBeCloseTo(0.33, 1);
    });

    it('should return 0 for no points', () => {
      const progress = getTierProgress(0, MOCK_TIER_CONFIGS);
      expect(progress).toBe(0);
    });

    it('should return 1.0 for legend tier', () => {
      const progress = getTierProgress(500, MOCK_TIER_CONFIGS);
      expect(progress).toBe(1);
    });
  });
});
