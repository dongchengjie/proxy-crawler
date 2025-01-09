export function* charCombinations(
  chars: string,
  minLength?: number,
  maxLength?: number,
): IterableIterator<string> {
  chars = typeof chars === "string" ? chars : "";
  minLength = minLength ?? 0;
  maxLength = Math.max(maxLength ?? 0, minLength);

  // Generate for each word length
  for (let i = minLength; i <= maxLength; i++) {
    // Generate the first word for the password length by the repetition of the first character.
    let word = (chars[0] || "").repeat(i);
    yield word;

    // Generate other possible combinations for the word
    // Total combinations will be chars.length raised to the power of word.length
    // Make iteration for all possible combinations
    for (let j = 1; j < Math.pow(chars.length, i); j++) {
      // Make iteration for all indices of the word
      for (let k = 0; k < i; k++) {
        // Check if the current index char needs to be flipped to the next char.
        if (!(j % Math.pow(chars.length, k))) {
          // Flip the current index char to the next.
          const charIndex = chars.indexOf(word[k]) + 1;
          const char = chars[charIndex < chars.length ? charIndex : 0];
          word = word.slice(0, k) + char + word.slice(k + 1);
        }
      }

      // Re-order not necessary but it makes the words yielded alphabetically in ascending order.
      yield word.split("").reverse().join("");
    }
  }
}
