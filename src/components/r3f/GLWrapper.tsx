"use client";
import dynamic from "next/dynamic";

 const GL = dynamic(() => import('./Render').then(mod => mod.Render), { ssr: false });

 export function GLWrapper() {
    return (
    <div className="absolute bg-mainwhite  w-full h-full" >
        <GL />
    </div>
);
}