export function stemmer(word: string): string {
  return word
    .replace(/ing$/, '')
    .replace(/s$/, '')
    .replace(/ed$/, '')
    .replace(/er$/, '')
    .replace(/ly$/, '');
}
