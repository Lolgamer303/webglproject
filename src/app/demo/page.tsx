"use client";
import EducationScene from "@/components/EductionScene";
import ShaderPlane from "@/components/ShaderPlane";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Vector3 } from "three";

type ObjectMode = "Sphere" | "Cube" | "Octahedron";

export default function Page() {
    const [isClient, setIsClient] = useState(false);
    const [color, setColor] = useState(new Vector3(1, 1, 1));
    const [distance, setDistance] = useState(500);
    const [objectMode, setObjectMode] = useState("Sphere" as ObjectMode);
    const [size, setSize] = useState(25);
    const [AA, setAA] = useState(false);
    const [stepNumber, setStepNumber] = useState(0)

    useEffect(() => {
        setIsClient(true); // Ensures this code only runs on client side
    }, []);

    return (
        <>
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full'>
                {isClient && (
                    <Canvas>
                        <ShaderPlane color={color} AA={AA} distance={distance} objectMode={objectMode} objectSize={size} setDistance={setDistance} educationScene={true} stepNumber={stepNumber}/>
                    </Canvas>
                )}
            </div>
            <EducationScene
                AA={AA}
                setAA={setAA}
                color={color}
                setColor={setColor}
                distance={distance}
                setDistance={setDistance}
                objectMode={objectMode}
                setObjectMode={setObjectMode}
                setSize={setSize}
                size={size}
                stepNumber={stepNumber}
                setStepNumber={setStepNumber}
            />
        </>
    );
}