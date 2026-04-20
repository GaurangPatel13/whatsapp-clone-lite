import { format, formatDistanceToNow, isToday, isYesterday, formatLastSeen } from '@/lib/date';
import { cn, getInitials, formatMessageTime, formatConversationTime, truncateText } from '@/lib/utils';

describe('Date Utilities', () => {
  describe('isToday', () => {
    it('should return true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('should return false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('isYesterday', () => {
    it('should return true for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isYesterday(yesterday)).toBe(true);
    });

    it('should return false for today', () => {
      expect(isYesterday(new Date())).toBe(false);
    });
  });

  describe('format', () => {
    it('should format date correctly', () => {
      const date = new Date('2024-01-15T14:30:00');
      expect(format(date, 'YYYY-MM-DD')).toBe('2024-01-15');
      expect(format(date, 'HH:mm')).toBe('14:30');
    });
  });

  describe('formatDistanceToNow', () => {
    it('should return "Just now" for recent dates', () => {
      const now = new Date();
      expect(formatDistanceToNow(now)).toBe('Just now');
    });

    it('should return minutes ago for dates within an hour', () => {
      const date = new Date();
      date.setMinutes(date.getMinutes() - 5);
      expect(formatDistanceToNow(date)).toBe('5m ago');
    });

    it('should return hours ago for dates within a day', () => {
      const date = new Date();
      date.setHours(date.getHours() - 3);
      expect(formatDistanceToNow(date)).toBe('3h ago');
    });

    it('should return days ago for dates within a week', () => {
      const date = new Date();
      date.setDate(date.getDate() - 2);
      expect(formatDistanceToNow(date)).toBe('2d ago');
    });
  });

  describe('formatLastSeen', () => {
    it('should format today correctly', () => {
      const date = new Date();
      const result = formatLastSeen(date);
      expect(result).toContain('Today');
    });

    it('should format yesterday correctly', () => {
      const date = new Date();
      date.setDate(date.getDate() - 1);
      const result = formatLastSeen(date);
      expect(result).toContain('Yesterday');
    });
  });
});

describe('String Utilities', () => {
  describe('getInitials', () => {
    it('should return initials from name', () => {
      expect(getInitials('John Doe')).toBe('JD');
      expect(getInitials('Alice')).toBe('A'); // Single name = single initial
      expect(getInitials('John Paul Jones')).toBe('JP');
    });

    it('should handle empty string', () => {
      expect(getInitials('')).toBe('');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long message that should be truncated';
      expect(truncateText(text, 20)).toBe('This is a very lo...');
    });

    it('should not truncate short text', () => {
      const text = 'Short';
      expect(truncateText(text, 20)).toBe('Short');
    });

    it('should handle exact length', () => {
      const text = 'Exact';
      expect(truncateText(text, 5)).toBe('Exact');
    });
  });
});

describe('Class Utilities', () => {
  describe('cn', () => {
    it('should combine class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
      expect(cn('foo', undefined, 'bar')).toBe('foo bar');
      expect(cn('foo', null, false, 'bar')).toBe('foo bar');
    });

    it('should filter falsy values', () => {
      expect(cn('foo', undefined, 'bar', null, false)).toBe('foo bar');
    });
  });
});
