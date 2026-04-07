export type TocHeadingMeasurement = {
  id: string;
  top: number;
  height: number;
};

type ResolveActiveHeadingOptions = {
  scrollY: number;
  viewportHeight: number;
  documentHeight: number;
  headingOffset: number;
};

const BOTTOM_THRESHOLD_PX = 4;

function isHeadingVisible(
  item: TocHeadingMeasurement,
  viewportTop: number,
  viewportBottom: number,
) {
  const itemBottom = item.top + item.height;
  return item.top < viewportBottom && itemBottom > viewportTop;
}

export function resolveActiveHeadingId(
  items: TocHeadingMeasurement[],
  options: ResolveActiveHeadingOptions,
) {
  if (items.length === 0) return "";

  const { scrollY, viewportHeight, documentHeight, headingOffset } = options;
  const viewportTop = scrollY;
  const viewportBottom = scrollY + viewportHeight;
  const marker = scrollY + headingOffset;

  if (viewportBottom >= documentHeight - BOTTOM_THRESHOLD_PX) {
    return items.at(-1)?.id ?? "";
  }

  const visibleItems = items.filter((item) =>
    isHeadingVisible(item, viewportTop, viewportBottom),
  );
  const visibleItemsBeforeMarker = visibleItems.filter(
    (item) => item.top <= marker,
  );

  if (visibleItemsBeforeMarker.length > 0) {
    return visibleItemsBeforeMarker.at(-1)?.id ?? "";
  }

  if (visibleItems.length > 0) {
    return visibleItems[0]?.id ?? "";
  }

  let activeId = items[0]?.id ?? "";
  for (const item of items) {
    if (item.top <= marker) {
      activeId = item.id;
      continue;
    }
    break;
  }

  return activeId;
}
