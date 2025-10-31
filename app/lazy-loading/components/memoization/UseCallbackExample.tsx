"use client";

import { memo, useState, useCallback } from "react";

let useCallbackRenderCount = 0;
const MemoizedChildWithCallback = memo(({ onAction, value }: { onAction: () => void; value: number }) => {
  useCallbackRenderCount++;
  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">useCallback + React.memo Child</h3>
      <p>Prop value: {value}</p>
      <p className="text-purple-500">Render count: {useCallbackRenderCount}</p>
      <button
        className="mt-2 px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
        onClick={onAction}
      >
        Child Button
      </button>
    </div>
  );
});
MemoizedChildWithCallback.displayName = 'MemoizedChildWithCallback';

export const UseCallbackExample = () => {
  const [count, setCount] = useState(0);
  const [childClicks, setChildClicks] = useState(0);
  const [, forceRender] = useState({});
  
  const nonMemoizedHandleClick = () => {
    setChildClicks(prev => prev + 1);
  };

  const memoizedHandleClick = useCallback(() => {
    setChildClicks(prev => prev + 1);
  }, []);

  return (
    <div className="p-6 bg-gray-100 rounded-xl">
      <h2 className="text-xl font-bold mb-4">With useCallback + React.memo</h2>
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Without useCallback</h3>
            <MemoizedChildWithCallback 
              value={count}
              onAction={nonMemoizedHandleClick} 
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">With useCallback</h3>
            <MemoizedChildWithCallback 
              value={count}
              onAction={memoizedHandleClick} 
            />
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Child button clicks: {childClicks}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            👆 Notice how the left child (without useCallback) re-renders on parent renders because the function reference changes,
            while the right child (with useCallback) only re-renders when its value prop changes.
          </p>
        </div>
      </div>
    </div>
  );
};