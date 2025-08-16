import { useState } from "react";

function sequence(number: number): number[] {
  const array = [];

  for (let i = 0; i < number; i++) {
    array[i] = i + 1;
  }

  return array;
}

type Props = {
  rows: number;
  columns: number;
  onSelectedChange: (numbers: number[]) => void;
};

export default function Grid({ rows, columns, onSelectedChange }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set([]));
  const numCells = rows * columns;

  function toggle(i: number): void {
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
    <div className={`min-w-2xs max-w-md grid grid-cols-${columns} gap-1`}>
      {sequence(numCells).map((i) => (
        <div
          className={`aspect-square ${selected.has(i) ? "bg-blue-500" : "bg-yellow-300"} rounded flex justify-center items-center cursor-pointer`}
          key={i}
          onClick={() => toggle(i)}
        >
          {i}
        </div>
      ))}
    </div>
  );
}
