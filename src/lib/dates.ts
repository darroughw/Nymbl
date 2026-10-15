// ISO date strings (YYYY-MM-DD) sort and compare correctly as plain strings,
// so there's no reason to round-trip through Date objects and risk a
// timezone shifting a date by a day. Every comparison in this app works on
// the strings directly.

export function overlaps(
  aStart: string,
  aEnd: string | null,
  bStart: string,
  bEnd: string | null,
): boolean {
  const aStartsBeforeBEnds = bEnd === null || aStart <= bEnd
  const bStartsBeforeAEnds = aEnd === null || bStart <= aEnd
  return aStartsBeforeBEnds && bStartsBeforeAEnds
}

export function isOnOrBefore(a: string, b: string): boolean {
  return a <= b
}

export function isOnOrAfter(a: string, b: string): boolean {
  return a >= b
}
