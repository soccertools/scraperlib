import "jasmine";
import { teamnameShortener } from './teamname-shortener';

describe('Operator: TeamnameShortener', () => {

  it('should be a function', () => {
    expect(typeof teamnameShortener).toBe('function');
  });

  it('should remove numbers', () => {
    expect(teamnameShortener('SpG TSV 1298 Musterhausen')).not.toContain('1298');
    expect(teamnameShortener('1298 Musterhausen')).not.toContain('1298');
    expect(teamnameShortener('SpG TSV 1 Musterhausen')).not.toContain('1');
    expect(teamnameShortener('2018 Musterhausen II')).toContain('II');
  });

  it('should shorten long names', () => {
    expect(teamnameShortener('SpG SV BW 90 Musterstedt II')).toBe('Musterstedt II');
    expect(teamnameShortener('SpG SV Conc. Mustersüdhausen')).toBe('Conc. Mustersüdhausen');
  });

  it('should avoid to generate too general names', () => {
    const blacklist = ['Blacklisted'];
    expect(teamnameShortener('SpG Lok Blacklisted', blacklist)).not.toBe('Blacklisted');
    expect(teamnameShortener('FC Blacklisted Musterhausen', blacklist)).not.toBe('FC Blacklisted Musterhausen');
    expect(teamnameShortener('SpG Oh Lok Blacklisted', blacklist)).not.toBe('Oh Blacklisted');
  });

  it('should map names to a specified alias if one exists', () => {
    const aliases = {
      'SpG 2000 Musterstedt': 'Aliashausen',
      'SpG Musterwuster': 'Musteralias'
    };

    expect(teamnameShortener('SpG 2000 Musterstedt', [], aliases)).toBe('Aliashausen');
  });

});
