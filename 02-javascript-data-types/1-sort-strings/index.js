/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const order = param === 'asc' ? 1 : -1;
  return arr.slice().sort(
    (a, b) => { return order * a.localeCompare(b, undefined, {caseFirst: 'upper'}); }
  );
}
