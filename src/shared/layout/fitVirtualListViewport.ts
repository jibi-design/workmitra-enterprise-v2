/** Job Mitra | fitVirtualListViewport — card lists auto-fit; never reserve a cavern. */

export const VIRTUAL_LIST_MAX_HEIGHT_PX = 560;

export function fitVirtualListViewportPx(
  contentHeight: number,
  itemCount: number,
  options?: { readonly rowEstimatePx?: number; readonly maxPx?: number },
): number {
  if (itemCount <= 0) return 0;
  const rowEstimatePx = options?.rowEstimatePx ?? 0;
  const maxPx = options?.maxPx ?? VIRTUAL_LIST_MAX_HEIGHT_PX;
  const sized = Math.max(contentHeight, rowEstimatePx);
  return Math.min(sized, maxPx);
}

export function virtualListNeedsInnerScroll(
  contentHeight: number,
  maxPx: number = VIRTUAL_LIST_MAX_HEIGHT_PX,
): boolean {
  return contentHeight > maxPx;
}
