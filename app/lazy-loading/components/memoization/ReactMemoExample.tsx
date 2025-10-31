"use client";

import { memo, useState } from "react";

let memoRenderCount = 0;
const MemoizedChild = memo(({ value }: { value: number }) => {
  memoRenderCount++;
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">React.memo Child</h3>
      <p>Prop value: {value}</p>
      <p className="text-orange-500">Render count: {memoRenderCount}</p>
    </div>
  );
});
MemoizedChild.displayName = 'MemoizedChild';

export const ReactMemoExample = () => {
  const [count, setCount] = useState(0);
  const [, forceRender] = useState({});
  
  const data = { value: count };

  return (
    <div className="p-6 bg-gray-100 rounded-xl">
      <h2 className="text-xl font-bold mb-4">With React.memo</h2>
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
        <MemoizedChild value={count} />
        <div className="mt-4 text-sm text-gray-600">
          <p>👆 With React.memo and primitive props, child only re-renders when count changes</p>
        </div>
      </div>
    </div>
  );
};