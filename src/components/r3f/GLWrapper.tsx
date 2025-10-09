"use client";
import dynamic from "next/dynamic";
import  Background  from "../ui/Background";

 const GL = dynamic(() => import('./Render').then(mod => mod.Render), { ssr: false });

 export function GLWrapper() {
    return (
    <div className="absolute w-full h-full" >
        {/* <GL /> */}
        <Background />
    </div>
);
}