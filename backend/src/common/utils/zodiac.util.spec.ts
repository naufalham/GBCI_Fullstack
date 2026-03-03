import { getHoroscope, getZodiac } from './zodiac.util';

describe('Zodiac Utilities', () => {
  describe('getHoroscope', () => {
    const cases: [string, string][] = [
      ['2000-01-15', 'Capricorn'],
      ['2000-01-20', 'Aquarius'],
      ['2000-02-19', 'Pisces'],
      ['2000-03-21', 'Aries'],
      ['2000-04-20', 'Taurus'],
      ['2000-05-21', 'Gemini'],
      ['2000-06-22', 'Cancer'],
      ['2000-07-23', 'Leo'],
      ['2000-08-23', 'Virgo'],
      ['2000-09-23', 'Libra'],
      ['2000-10-24', 'Scorpio'],
      ['2000-11-22', 'Sagittarius'],
      ['2000-12-22', 'Capricorn'],
    ];

    it.each(cases)('should return correct horoscope for %s', (date, expected) => {
      expect(getHoroscope(new Date(date))).toBe(expected);
    });
  });

  describe('getZodiac', () => {
    const cases: [number, string][] = [
      [2000, 'Dragon'],
      [1996, 'Rat'],
      [1997, 'Ox'],
      [1998, 'Tiger'],
      [1999, 'Rabbit'],
      [2001, 'Snake'],
      [2002, 'Horse'],
      [2003, 'Goat'],
      [2004, 'Monkey'],
      [2005, 'Rooster'],
      [2006, 'Dog'],
      [2007, 'Pig'],
    ];

    it.each(cases)('should return correct zodiac for year %d', (year, expected) => {
      expect(getZodiac(new Date(`${year}-06-15`))).toBe(expected);
    });
  });
});
