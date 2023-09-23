export function removeSubstring(
  string: string,
  substring: string,
  position: number,
): { match: boolean; value: string } {
  const positionStart =
    position < 0 ? string.length + position + 1 - substring.length : position;
  const actualSubstring = string.substring(
    positionStart,
    positionStart + substring.length,
  );
  // console.log({
  //   string,
  //   substring,
  //   positionStart,
  //   actualSubstring,
  //   "string.substring(0, positionStart)": string.substring(0, positionStart),
  //   "string.substring(positionStart + substring.length)": string.substring(
  //     positionStart + substring.length,
  //   ),
  // });

  if (substring !== actualSubstring) {
    return { match: false, value: string };
  }

  return {
    match: true,
    value:
      string.substring(0, positionStart) +
      string.substring(positionStart + substring.length),
  };
}

// console.assert(removeSubstring("abcdefg", "a", 0).value === "bcdefg");
// console.assert(removeSubstring("abcdefg", "efg", -1).value === "abcd");
// console.assert(removeSubstring("abcdefg", "xxx", -1).value === "abcdefg");
// console.assert(removeSubstring("abcdefg", "xxx", 0).value === "abcdefg");
// console.assert(removeSubstring("abcdefg", "cdef", 2).value === "abg");
// console.assert(removeSubstring("abcdefg", "cdefg", 2).value === "ab");
// console.assert(removeSubstring("abcdefg", "abcdefg", 0).value === "");
// console.assert(removeSubstring("abcdefg", "abcdefg", -1).value === "");
// console.assert(removeSubstring("abcdefg", "abcdefg", 1).value === "abcdefg");
// console.assert(removeSubstring("abcdefg", "", 0).value === "abcdefg");
// console.assert(removeSubstring("abcdefg", "", 1).value === "abcdefg");
// console.assert(removeSubstring("abcdefg", "", -1).value === "abcdefg");
