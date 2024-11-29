'use client'
import ShaderPlane from "@/components/ShaderPlane";
import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";

export default function Page() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true); // Ensures this code only runs on client side
    }, []);

    return (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            {isClient && (
                <Canvas>
                    <ShaderPlane />
                </Canvas>
            )}
        </div>
    );
}
