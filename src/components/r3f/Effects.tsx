"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useRef, useEffect, useState, use, forwardRef, ComponentProps } from "react";
import { MeshReflectorMaterial,Circle, Lightformer, Float, useVideoTexture, useProgress, Html, OrbitControls, SoftShadows } from "@react-three/drei";

import {
  EffectComposer,
  GodRays,
  BrightnessContrast,
  Bloom,
  ToneMapping,
  TiltShift2,
  WaterEffect,
  FXAA,
  DepthOfField,
  SSAO,
  Noise,
} from "@react-three/postprocessing";

import { Mesh } from 'three'

const Sun = forwardRef<Mesh, any>((props, ref) => (
  <mesh ref={ref} position={[0, -15, -90]} {...props}>
    <circleGeometry args={[1, 64]} />
    <meshStandardMaterial emissive={"#ffffff"} color={"#ffbb00"} />
  </mesh>
));


export function Effects() {
  const color ="#f1f1f1";
  const color2 ="#020d00";
  const color3 ="#000";
 
  const material = useRef<Mesh>(null!); 
  
  return (   
          
             
        <Suspense>
          {/* <Sun ref={material} />     */}
        
          <EffectComposer multisampling={0}  >
            {/* <Noise opacity={0.07} /> */}
              {/* <GodRays sun={material} weight={55} density={1} exposure={0.1034} decay={0.9} blur={true} /> */}
            {/* <BrightnessContrast brightness={-0.05} contrast={-0.04} /> */}
            
            <FXAA />                    
            <Bloom mipmapBlur luminanceThreshold={0.1} intensity={0.00952} />  
          </EffectComposer>
        
        </Suspense>
    
  );
}


