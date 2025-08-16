function sequence(count: number): number[] {
  const array = [];

  for (let i = 0; i < count; i++) {
    array[i] = i + 1;
  }

  return array;
}

type Props = {
  rows: number;
  columns: number;
  onClick: (i: number) => void;
};

export default function Grid({ rows, columns, onClick }: Props) {
  const numCells = rows * columns;
  return (
    <div className={`min-w-2xs max-w-md grid grid-cols-${columns} gap-1`}>
      {sequence(numCells).map((i) => (
        <div
          className="aspect-square bg-yellow-300 rounded flex justify-center items-center cursor-pointer"
          key={i}
          onClick={() => onClick(i)}
        >
          {i}
        </div>
      ))}
    </div>
  );
}
