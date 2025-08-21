export default function QuantitySelector({ value, setValue }) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => setValue(value > 1 ? value - 1 : 1)}
        className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
      >
        -
      </button>
      <span className="text-lg font-medium">{value}</span>
      <button
        onClick={() => setValue(value + 1)}
        className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
      >
        +
      </button>
    </div>
  );
}
