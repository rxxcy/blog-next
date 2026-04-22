"use client";

import { type ReactElement, type ReactNode, useEffect, useState } from "react";

type MasonryGridProps = {
  items: { id: string; width: number; height: number }[];
  columnCounts?: [number, number, number];
  gap?: number;
  children: ReactNode;
};

const BREAKPOINTS = [640, 768] as const;

function useColumnCount(counts: [number, number, number]) {
  const [columnCount, setColumnCount] = useState(counts[0]);

  useEffect(() => {
    function update() {
      const w = window.innerWidth;
      if (w >= BREAKPOINTS[1]) setColumnCount(counts[2]);
      else if (w >= BREAKPOINTS[0]) setColumnCount(counts[1]);
      else setColumnCount(counts[0]);
    }

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [counts]);

  return columnCount;
}

export function MasonryGrid({
  items,
  columnCounts = [2, 3, 4],
  gap = 8,
  children,
}: MasonryGridProps) {
  const columnCount = useColumnCount(columnCounts);

  // Distribute item indices into columns using shortest-column-first
  const columns = Array.from({ length: columnCount }, (_, columnIndex) => ({
    key: `column-${columnIndex + 1}`,
    indices: [] as number[],
  }));
  const heights = new Array<number>(columnCount).fill(0);

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const ratio = item.height / (item.width || 1);
    let shortest = 0;
    for (let c = 1; c < columnCount; c++) {
      if (heights[c] < heights[shortest]) shortest = c;
    }
    columns[shortest].indices.push(i);
    heights[shortest] += ratio;
  }

  // Convert children to array for index-based access
  const childArray = Array.isArray(children)
    ? (children as ReactElement[])
    : ([children] as ReactElement[]);

  return (
    <div className="flex" style={{ gap }}>
      {columns.map((column) => (
        <div key={column.key} className="flex flex-1 flex-col" style={{ gap }}>
          {column.indices.map((i) => childArray[i])}
        </div>
      ))}
    </div>
  );
}
