"use client";
import { Canvas, useFrame, extend, ReactThreeFiber } from "@react-three/fiber";

import { Suspense, useEffect, useRef, useState,  } from "react";
import { OrbitControls, MeshDistortMaterial, Environment, Lightformer, Float, MeshTransmissionMaterial, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { type ThreeElement } from '@react-three/fiber'

import { Effects } from "./Effects";

const vertex = /* glsl */ `
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
    }
`;

const fragment = /* glsl */ `
uniform vec3 uBlue;
uniform vec3 uWhite;
uniform float uIntensity;
uniform float uPower;
uniform float uOpacity;
uniform float uEdgeSoftness;

varying vec3 vNormal;
varying vec3 vWorldPos;

void main() {
    vec3 V = normalize(cameraPosition - vWorldPos); // direzione verso camera
    float ndv = clamp(dot(normalize(vNormal), V), 0.0, 1.0);
    
    // glow centrale (più blu al centro)
    float glow = pow(ndv, uPower) * uIntensity;
    
    // colore: dal bianco al blu in base al glow
    vec3 col = mix(uWhite, uBlue, glow);
    
    // morbidezza bordo (fresnel inverso come alpha)
    float alpha = smoothstep(0.0, uEdgeSoftness, glow) * uOpacity;
    
    gl_FragColor = vec4(col, alpha);
}
`;

export const SphericalGlowMaterial = shaderMaterial(
    {
        uBlue: new THREE.Color('#6B75FF'),
        uWhite: new THREE.Color('#FFFFFF'),
        uIntensity: 1.25,
        uPower: 2.6,
        uOpacity: 0.9,
        uEdgeSoftness: 0.45
    },
    vertex,
    fragment
);



declare module '@react-three/fiber' {
  interface ThreeElements {
    sphericalGlowMaterial: ThreeElement<typeof SphericalGlowMaterial>
  }
}


extend({ SphericalGlowMaterial });

function Blob({ pos = [2, -1, -2], r = 1.4 }: { pos?: [number, number, number], r?: number }) {
    const ref = useRef<THREE.Mesh | null>(null)
    useFrame((_, t) => { if (ref.current) ref.current.rotation.y = Math.sin(t * 5.2) * 10.1 })
    return (
        <mesh position={pos} ref={ref}>
            <sphereGeometry args={[r, 64, 64]} />
            {/* Usa il nome in camelCase */}
            <sphericalGlowMaterial />
        </mesh>
    )
}


export function Render() {
    const [canvasKey, setCanvasKey] = useState(0);
    const lightcolor = "#a196ff";
    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            setCanvasKey((k) => k + 1);
        }
    }, []);
    return (
        <div className="w-full h-full ">
            <Canvas
                key={canvasKey}
                camera={{ position: [0, 0, 10], fov: 35, near: 0.1, far: 100 }}
                gl={{ antialias: true }}
            >
                <color attach="background" args={["#f1f1f1"]} />
                {/* <Environment preset="sunset" />" */}
                <Suspense fallback={null}>
                    <OrbitControls enableDamping dampingFactor={0.05} />
                    <pointLight position={[0, 0, 0]} intensity={10} color={lightcolor} />
                    <ambientLight intensity={2.5} />
                    {/* <Sphere position={[2, 0, 0]} scale={1} /> */}
                    <Blob pos={[-8, 0, 0]} r={5.6} />
                    <Blob pos={[8, 0, 0]} r={5.6} />

                    <Effects />
                </Suspense>
            </Canvas>
        </div>
    );
}

function Sphere({ position, scale }: { position: [number, number, number]; scale: number }) {
    const geometry = new THREE.SphereGeometry(1, 64, 64);
    const material = new THREE.MeshStandardMaterial({ color: "white", transparent: true, opacity: 0.2, roughness: 0.5, metalness: 0.1 });
    return (
        <group position={position} scale={scale} >
            <Float
                speed={2} // Animation speed, defaults to 1
                rotationIntensity={2} // XYZ rotation intensity, defaults to 1
                floatIntensity={3} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
                floatingRange={[0.5, -0.5]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
            >
                <mesh geometry={geometry} position={[0, 0, 0]} >
                    <MeshTransmissionMaterial
                        thickness={1.5}
                        chromaticAberration={0.1}
                        clearcoat={1}
                        clearcoatRoughness={0}
                        transmission={0.1}
                    />
                </mesh>
            </Float>
        </group>
    );
}


export const FadeMaterialImpl = shaderMaterial(
    // uniform iniziali
    {
        uColor: new THREE.Color('#9aa8ff'),
        uBg: new THREE.Color('#ffffff'),
        uCenter: new THREE.Vector3(0, 0, 0),
        uRadius: 3.0,
    },
  // vertex
  /* glsl */`
  varying vec3 vPos;
  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vPos = wp.xyz;
    gl_Position = projectionMatrix * viewMatrix * wp;
  }`,
  // fragment
  /* glsl */`
  uniform vec3 uColor, uBg;
  uniform vec3 uCenter;
  uniform float uRadius;
  varying vec3 vPos;
  void main(){
    float d = distance(vPos, uCenter);
    float m = smoothstep(uRadius, uRadius*0.75, d);
    vec3 col = mix(uColor, uBg, m);
    gl_FragColor = vec4(col, 1.0);
  }`
)

// registra la classe come elemento intrinseco <fadeMaterialImpl />
extend({ FadeMaterialImpl })

// TIPI JSX per TypeScript: definisce il tag intrinseco
declare global {
    namespace JSX {
        interface ThreeElements {
            fadeMaterialImpl: ThreeElement<
                typeof FadeMaterialImpl
               
            >
        }
    }
}

