import { useState } from "react";

type Props = {
  rows: number;
  columns: number;
  onSelectedChange: (numbers: number[]) => void;
};

export default function Grid({ rows, columns, onSelectedChange }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const numCells = rows * columns;

  function toggle(i: number) {
    if (selected.has(i)) {
      selected.delete(i);
    } else {
      selected.add(i);
    }
    
    const newSet = new Set(selected);
    setSelected(newSet);
    onSelectedChange([...newSet]);
  }

  return (
    <div className={`min-w-xs max-w-lg grid grid-cols-${columns} gap-1`}>
      {generateSequence(numCells).map((i) => (
        <div
          className={`aspect-square ${selected.has(i) ? "bg-blue-500" : "bg-yellow-300"} rounded flex justify-center items-center cursor-pointer transition-colors duration-300`}
          key={i}
          onClick={() => toggle(i)}
        >
          {i}
        </div>
      ))}
    </div>
  );
}

function generateSequence(number: number): number[] {
  return Array.from({ length: number }, (_, i) => i + 1);
}
