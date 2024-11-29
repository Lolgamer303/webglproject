"use client";
import ShaderOption from "@/components/ShaderOptions";
import ShaderPlane from "@/components/ShaderPlane";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import { Vector3 } from "three";

type ObjectMode = "Sphere" | "Cube" | "Prism";

export default function Page() {
    const [isClient, setIsClient] = useState(false);
    const [color, setColor] = useState(new Vector3(0, 0, 0));
    const [distance, setDistance] = useState(5);
    const [objectMode, setObjectMode] = useState("Sphere" as ObjectMode);

    useEffect(() => {
        setIsClient(true); // Ensures this code only runs on client side
    }, []);

    return (
        <>
            <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full'>
                {isClient && (
                    <Canvas>
                        <ShaderPlane color={color} distance={distance} objectMode={objectMode} />
                    </Canvas>
                )}
            </div>
            <ShaderOption
                color={color}
                setColor={setColor}
                distance={distance}
                setDistance={setDistance}
                objectMode={objectMode}
                setObjectMode={setObjectMode}
            />
        </>
    );
}