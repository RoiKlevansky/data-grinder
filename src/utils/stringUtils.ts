import emojiRegex from 'emoji-regex';

/**
 * Checks if string contains hebrew.
 *
 * @param {string} str
 * @return {boolean}
 */
const containsHe = (str: string): boolean => {
  return (/[\u0590-\u05FF]/).test(str);
};

/**
 * Reverses string.
 *
 * @param {string} str
 * @return {string}
 */
const reverse = (str: string): string => {
  return str.split('').reverse().join('');
};

/**
 * Revers hebrew in string.
 *
 * @param {string} str
 * @return {string}
 */
const reverseHe = (str: string): string => {
  const words = str.split(' ');
  let reversedWords: string[] = [];
  let hebrewWords = [];
  for (let i = 0; i < words.length; i++) {
    if (containsHe(words[i])) {
      hebrewWords.push(reverse(words[i]));
    } else {
      hebrewWords.reverse();
      reversedWords = [...reversedWords, ...hebrewWords];
      hebrewWords = [];
      reversedWords.push(words[i]);
    }
  }
  hebrewWords.reverse();
  reversedWords = [...reversedWords, ...hebrewWords];
  return reversedWords.join(' ');
};

/**
 * Removes a requested amount of words from the start of a string.
 *
 * @param {string} str
 * @param {number} wordCount
 * @return {string}
 */
const removeWordsFromStart = (str: string, wordCount: number): string => {
  return str.split(' ').splice(wordCount).join(' ');
};

/**
 * Removes the first word from a string.
 *
 * @param {string} str
 * @return {string}
 */
const removeFirstWord = (str: string): string => {
  return removeWordsFromStart(str, 1);
};

/**
 * Removes all emojis from a string.
 * @param str {string}
 * @returns {string}
 */
const removeEmojis = (str: string): string => {
  const regex = emojiRegex();
  return str.replace(regex, '');
};

export {
  containsHe,
  reverse,
  reverseHe,
  removeWordsFromStart,
  removeFirstWord,
  removeEmojis,
};
