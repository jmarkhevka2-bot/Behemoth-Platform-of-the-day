import { calculateNewStreak, toDateKey, recalculateStreak } from '../dates';
import type { AwardEvent } from '@/lib/types';

describe('Date Utilities', () => {
  describe('toDateKey', () => {
    it('should convert date to YYYY-MM-DD format', () => {
      const date = new Date('2026-06-04');
      expect(toDateKey(date)).toBe('2026-06-04');
    });

    it('should handle different dates correctly', () => {
      const date1 = new Date('2026-01-15');
      const date2 = new Date('2026-12-25');
      expect(toDateKey(date1)).toBe('2026-01-15');
      expect(toDateKey(date2)).toBe('2026-12-25');
    });
  });

  describe('calculateNewStreak', () => {
    it('should start new streak when no previous points', () => {
      const streak = calculateNewStreak(0, null);
      expect(streak).toBe(1);
    });

    it('should continue streak if awarded today', () => {
      const today = toDateKey(new Date());
      const streak = calculateNewStreak(5, today);
      expect(streak).toBe(5);
    });

    it('should reset streak if gap in days', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 2);
      const oldDate = toDateKey(yesterday);

      const streak = calculateNewStreak(5, oldDate);
      expect(streak).toBe(1);
    });

    it('should increment streak if awarded yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = toDateKey(yesterday);

      const streak = calculateNewStreak(5, yesterdayKey);
      expect(streak).toBe(6);
    });
  });

  describe('recalculateStreak', () => {
    it('should return 0 for empty history', () => {
      const streak = recalculateStreak([]);
      expect(streak).toBe(0);
    });

    it('should calculate consecutive day streak', () => {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dayBefore = new Date();
      dayBefore.setDate(dayBefore.getDate() - 2);

      const history: AwardEvent[] = [
        { timestamp: today.toISOString(), id: '1', associateId: '1', reason: '', reasonTag: 'custom', points: 1, shiftId: '' },
        { timestamp: yesterday.toISOString(), id: '2', associateId: '1', reason: '', reasonTag: 'custom', points: 1, shiftId: '' },
        { timestamp: dayBefore.toISOString(), id: '3', associateId: '1', reason: '', reasonTag: 'custom', points: 1, shiftId: '' },
      ];

      const streak = recalculateStreak(history);
      expect(streak).toBe(3);
    });

    it('should break on non-consecutive days', () => {
      const today = new Date();
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const history: AwardEvent[] = [
        { timestamp: today.toISOString(), id: '1', associateId: '1', reason: '', reasonTag: 'custom', points: 1, shiftId: '' },
        { timestamp: twoDaysAgo.toISOString(), id: '2', associateId: '1', reason: '', reasonTag: 'custom', points: 1, shiftId: '' },
      ];

      const streak = recalculateStreak(history);
      expect(streak).toBe(1);
    });
  });
});
