import { test, expect } from '@playwright/test';
import { parseTime, formatTime, generateTimeOptions, timeToIso } from '../src/shared/parse-time';

test.describe('parseTime utility', () => {
  test('should parse single digit as bare hour with heuristic AM/PM', () => {
    const parsed = parseTime('3');
    expect(formatTime(parsed)).toBe('3:00 PM');
  });

  test('should parse single digit 9 as 9:00 AM', () => {
    const parsed = parseTime('9');
    expect(formatTime(parsed)).toBe('9:00 AM');
  });

  test('should parse 12 as 12:00 PM (noon)', () => {
    const parsed = parseTime('12');
    expect(formatTime(parsed)).toBe('12:00 PM');
  });

  test('should parse 0 as 12:00 AM (midnight)', () => {
    const parsed = parseTime('0');
    expect(formatTime(parsed)).toBe('12:00 AM');
  });

  test('should parse 330 as 3:30 PM', () => {
    const parsed = parseTime('330');
    expect(formatTime(parsed)).toBe('3:30 PM');
  });

  test('should parse 1530 as 3:30 PM (24h format)', () => {
    const parsed = parseTime('1530');
    expect(formatTime(parsed)).toBe('3:30 PM');
  });

  test('should parse 3:30 with colon separator', () => {
    const parsed = parseTime('3:30');
    expect(formatTime(parsed)).toBe('3:30 PM');
  });

  test('should parse 3.30 with period separator', () => {
    const parsed = parseTime('3.30');
    expect(formatTime(parsed)).toBe('3:30 PM');
  });

  test('should parse 15 as 3:00 PM (24h unambiguous)', () => {
    const parsed = parseTime('15');
    expect(formatTime(parsed)).toBe('3:00 PM');
  });

  test('should parse 3pm explicitly', () => {
    const parsed = parseTime('3pm');
    expect(formatTime(parsed)).toBe('3:00 PM');
  });

  test('should parse 3 p explicitly', () => {
    const parsed = parseTime('3 p');
    expect(formatTime(parsed)).toBe('3:00 PM');
  });

  test('should parse 1145pm explicitly', () => {
    const parsed = parseTime('1145pm');
    expect(formatTime(parsed)).toBe('11:45 PM');
  });

  test('should parse 6am with explicit meridiem', () => {
    const parsed = parseTime('6am');
    expect(formatTime(parsed)).toBe('6:00 AM');
  });

  test('should return null for invalid input (25:99)', () => {
    expect(parseTime('25:99')).toBeNull();
  });

  test('should return null for invalid input (13pm)', () => {
    expect(parseTime('13pm')).toBeNull();
  });

  test('should return null for empty input', () => {
    expect(parseTime('')).toBeNull();
  });

  test('should generate 96 time options at 15-minute intervals', () => {
    const options = generateTimeOptions();
    expect(options).toHaveLength(96);
    expect(options[0]).toEqual({ hours: 12, minutes: 0, meridiem: 'AM' });
    expect(options[95]).toEqual({ hours: 11, minutes: 45, meridiem: 'PM' });
  });

  test('should format time correctly', () => {
    expect(formatTime({ hours: 3, minutes: 5, meridiem: 'PM' })).toBe('3:05 PM');
  });

  test('should convert time to ISO format', () => {
    const date = new Date('2026-05-23');
    expect(timeToIso(date, { hours: 3, minutes: 30, meridiem: 'PM' })).toBe('2026-05-23T15:30:00');
  });

  test('should convert midnight correctly to ISO', () => {
    const date = new Date('2026-05-23');
    expect(timeToIso(date, { hours: 12, minutes: 0, meridiem: 'AM' })).toBe('2026-05-23T00:00:00');
  });
});
