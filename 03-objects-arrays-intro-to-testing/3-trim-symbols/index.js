/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (string.length === 0 || size === undefined) {
    return string;
  }
  if (size === 0) {
    return '';
  }

  const trimmedChars = [string[0]];
  let prevChar = string[0];
  let curCharCount = 1;
  for (const curChar of string.slice(1)) {
    if (curChar === prevChar) {
      ++curCharCount;
    } else {
      curCharCount = 1;
    }

    if (curCharCount <= size) {
      trimmedChars.push(curChar);
    }

    prevChar = curChar;
  }

  return trimmedChars.join('');
}
