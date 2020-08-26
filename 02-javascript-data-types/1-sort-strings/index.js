/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const compareFunction = param === 'asc'
    ? (a, b) => { return a.localeCompare(b, undefined, {caseFirst: 'upper'}); }
    : (a, b) => { return b.localeCompare(a, undefined, {caseFirst: 'upper'}); };
  return arr.slice().sort(compareFunction);
}
