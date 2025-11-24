
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Box, Torus, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

// Fix: Extend JSX.IntrinsicElements to include R3F elements and standard HTML elements
// using an index signature to prevent type errors if the standard definitions are missing or overwritten.
declare global {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      [elemName: string]: any;
    }
  }
}

const FloatingShape = ({ position, color, type = 'sphere', scale = 1, speed = 1 }: any) => {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime();
      ref.current.position.y = position[1] + Math.sin(t * speed + position[0]) * 0.3;
      ref.current.rotation.x = t * 0.2 * speed;
      ref.current.rotation.z = t * 0.1 * speed;
    }
  });

  const Material = <MeshDistortMaterial color={color} speed={2} distort={0.3} roughness={0.2} />;

  if (type === 'box') {
    return <Box ref={ref} args={[1.5, 1.5, 1.5]} position={position} scale={scale}>{Material}</Box>;
  } else if (type === 'torus') {
    return <Torus ref={ref} args={[1, 0.3, 16, 32]} position={position} scale={scale}>{Material}</Torus>;
  } else if (type === 'ico') {
     return <Icosahedron ref={ref} args={[1, 0]} position={position} scale={scale}>{Material}</Icosahedron>;
  }
  
  return (
    <Sphere ref={ref} args={[1, 32, 32]} position={position} scale={scale}>
      {Material}
    </Sphere>
  );
};

export const SchoolHeroScene: React.FC = () => {
  return (
    <div className="w-full h-full absolute inset-0 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 8], fov: 40 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#0EA5E9" /> {/* Light Blue Light */}
        <pointLight position={[-10, -5, -5]} intensity={1} color="#E8C872" /> {/* Gold Light */}
        
        {/* Floating Abstract "Knowledge" Objects */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
           {/* Light Blue Sphere - Main */}
           <FloatingShape position={[3, 1, -2]} color="#0EA5E9" scale={1.2} type="sphere" speed={1} />
           {/* Gold Cube - Structure */}
           <FloatingShape position={[-3, -1, -1]} color="#E8C872" scale={1} type="box" speed={0.8} />
           {/* Lighter Sky Blue Shape - Innovation */}
           <FloatingShape position={[0, 2, -4]} color="#7DD3FC" scale={0.9} type="ico" speed={1.2} />
           {/* Darker Sky Ring - Community */}
           <FloatingShape position={[-2, 2, 1]} color="#0369A1" scale={0.6} type="torus" speed={0.5} />
           {/* Small Gold Accents */}
           <FloatingShape position={[4, -2, -3]} color="#D4AF37" scale={0.4} type="sphere" speed={1.5} />
        </Float>
      </Canvas>
    </div>
  );
};

// Keep export for compatibility if needed, or just empty
export const QuantumComputerScene: React.FC = () => {
  return <div className="hidden"></div>;
}
