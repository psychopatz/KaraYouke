// src/utils/textUtils.js

const unwantedPhrases = [
  'karaoke',
  'lyrics',
  'instrumental',
  'official video',
  'official music video',
  'hd',
  '4k',
  '\\(karaoke version\\)',
  '\\(official video\\)',
  '\\(lyrics\\)',
  '\\(lyric video\\)',
  '\\(instrumental\\)',
  '\\[karaoke\\]',
  '\\[lyrics\\]',
  '\\(audio\\)',
  'official audio'
];

const regex = new RegExp(unwantedPhrases.join('|'), 'gi');

/**
 * Cleans a song title by removing common extraneous phrases like "(Karaoke)", "Lyrics", etc.
 * @param {string} title - The original song title.
 * @returns {string} The sanitized title.
 */
export const sanitizeTitle = (title) => {
  if (!title) return '';
  
  return title
    // 1. Remove all unwanted phrases.
    .replace(regex, '')
    // 2. Remove any leftover parentheses or brackets.
    .replace(/[()\[\]]/g, '')
    // 3. Remove a hyphen that might be left dangling at the end.
    .replace(/\s+-\s*$/, '')
    // 4. Collapse multiple spaces into a single space.
    .replace(/\s\s+/g, ' ')
    // 5. Trim whitespace from the start and end.
    .trim();
};