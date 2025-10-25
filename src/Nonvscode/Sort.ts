export type SortPaths = (paths: string[]) => string[];

export class SortPathsManager {
  static eitherSep = /[\\/]/g;

  static swapByDepthAndLocaleCompare(a: string, b: string) {
    const { eitherSep } = SortPathsManager;
    const aParts = a.split(eitherSep);
    const bParts = b.split(eitherSep);
    const bIsFlatter = aParts.length > bParts.length;
    if (bIsFlatter) return 1; // swap

    return a.localeCompare(b);
  }

  static sort(paths: string[]) {
    return paths.sort(SortPathsManager.swapByDepthAndLocaleCompare);
  }
}
