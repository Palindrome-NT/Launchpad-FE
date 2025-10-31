"use client";

import { useState } from "react";

let regularRenderCount = 0;
const RegularChild = ({ value }: { value: number }) => {
  regularRenderCount++;
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Regular Child</h3>
      <p>Prop value: {value}</p>
      <p className="text-red-500">Render count: {regularRenderCount}</p>
    </div>
  );
};

export const NoMemoExample = () => {
  const [count, setCount] = useState(0);
  const [, forceRender] = useState({});

  return (
    <div className="p-6 bg-gray-100 rounded-xl">
      <h2 className="text-xl font-bold mb-4">Without Memoization</h2>
      <div className="space-y-4">
        <div className="flex space-x-4">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => setCount(c => c + 1)}
          >
            Increment Count ({count})
          </button>
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => forceRender({})}
          >
            Force Parent Render
          </button>
        </div>
        <RegularChild value={count} />
        <div className="mt-4 text-sm text-gray-600">
          <p>👆 Notice how the child re-renders on both count change AND parent render</p>
        </div>
      </div>
    </div>
  );
};