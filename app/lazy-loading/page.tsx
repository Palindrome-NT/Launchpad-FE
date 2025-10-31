"use client";

import TomStory from "./components/tom/tom-story";
import JerryStory from "./components/jerry/jerry-story";
import SpikeStory from "./components/spike/spike-story";
import { NoMemoExample } from "./components/memoization/NoMemoExample";
import { ReactMemoExample } from "./components/memoization/ReactMemoExample";
import { UseMemoExample } from "./components/memoization/UseMemoExample";
import { UseCallbackExample } from "./components/memoization/UseCallbackExample";

export default function LazyLoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Lazy Loading Examples</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <TomStory />
        <JerryStory />
        <SpikeStory />
      </div>
      
      <h1 className="text-4xl font-bold mb-8">Memoization Techniques</h1>
      <div className="grid grid-cols-1 gap-8 w-full max-w-4xl">
        <NoMemoExample />
        <ReactMemoExample />
        <UseMemoExample />
        <UseCallbackExample />
      </div>
    </div>
  );
}