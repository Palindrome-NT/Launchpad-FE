"use client";

import { memo, useState, useMemo } from "react";

let useMemoRenderCount = 0;
const MemoizedChildWithObject = memo(({ data }: { data: { value: number } }) => {
  useMemoRenderCount++;
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">useMemo + React.memo Child</h3>
      <p>Prop value: {data.value}</p>
      <p className="text-green-500">Render count: {useMemoRenderCount}</p>
    </div>
  );
});
MemoizedChildWithObject.displayName = 'MemoizedChildWithObject';

export const UseMemoExample = () => {
  const [count, setCount] = useState(0);
  const [, forceRender] = useState({});
  
  const memoizedData = useMemo(() => ({ value: count }), [count]);

  return (
    <div className="p-6 bg-gray-100 rounded-xl">
      <h2 className="text-xl font-bold mb-4">With useMemo + React.memo</h2>
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
        <MemoizedChildWithObject data={memoizedData} />
        <div className="mt-4 text-sm text-gray-600">
          <p>👆 With useMemo, even object props maintain referential equality</p>
        </div>
      </div>
    </div>
  );
};