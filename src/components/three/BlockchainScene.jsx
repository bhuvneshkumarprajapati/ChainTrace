import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Line, OrbitControls } from "@react-three/drei";
import { useRef } from "react";

function Node({ position, size = 0.12 }) {
  return (
    <Float
      speed={1.5}
      rotationIntensity={0.2}
      floatIntensity={0.5}
    >
      <mesh position={position}>
        <sphereGeometry args={[size, 32, 32]} />

        <meshStandardMaterial
          color="#36e6ad"
          emissive="#36e6ad"
          emissiveIntensity={2}
        />
      </mesh>
    </Float>
  );
}

/* MOVING DATA PARTICLE */
function DataParticle({ start, end, delay = 0 }) {
  const ref = useRef();
  const progress = useRef(delay);

  useFrame((_, delta) => {
    if (!ref.current) return;

    progress.current += delta * 0.45;

    if (progress.current > 1) {
      progress.current = 0;
    }

    const t = progress.current;

    ref.current.position.x =
      start[0] + (end[0] - start[0]) * t;

    ref.current.position.y =
      start[1] + (end[1] - start[1]) * t;

    ref.current.position.z =
      start[2] + (end[2] - start[2]) * t;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.045, 16, 16]} />

      <meshStandardMaterial
        color="#ffffff"
        emissive="#36e6ad"
        emissiveIntensity={5}
      />
    </mesh>
  );
}

function Network() {
  const nodes = [
    [-1.6, 0.8, 0],
    [0, 1.5, 0],
    [1.6, 0.8, 0],

    [-1.6, -0.8, 0],
    [0, -1.5, 0],
    [1.6, -0.8, 0],

    [0, 0, 0.2],
  ];

  const connections = [
    [nodes[0], nodes[1]],
    [nodes[1], nodes[2]],

    [nodes[0], nodes[6]],
    [nodes[1], nodes[6]],
    [nodes[2], nodes[6]],

    [nodes[3], nodes[6]],
    [nodes[4], nodes[6]],
    [nodes[5], nodes[6]],

    [nodes[3], nodes[4]],
    [nodes[4], nodes[5]],
  ];

  return (
    <group>

      {/* CONNECTION LINES */}
      {connections.map(([start, end], index) => (
        <Line
          key={index}
          points={[start, end]}
          color="#36e6ad"
          lineWidth={1}
          transparent
          opacity={0.35}
        />
      ))}

      {/* DATA FLOW */}
      {connections.map(([start, end], index) => (
        <DataParticle
          key={`particle-${index}`}
          start={start}
          end={end}
          delay={index * 0.12}
        />
      ))}

      {/* NODES */}
      {nodes.map((position, index) => (
        <Node
          key={index}
          position={position}
          size={index === 6 ? 0.2 : 0.12}
        />
      ))}

    </group>
  );
}

function BlockchainScene() {
  return (
    <div className="h-full w-full">
      <Canvas
        camera={{
          position: [0, 0, 6],
          fov: 45,
        }}
      >

        {/* LIGHT */}
        <ambientLight intensity={0.4} />

        <pointLight
          position={[0, 2, 3]}
          intensity={10}
          color="#36e6ad"
        />

        {/* NETWORK */}
        <Network />

        {/* CAMERA */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />

      </Canvas>
    </div>
  );
}

export default BlockchainScene;