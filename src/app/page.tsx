'use client'
import { useRouter } from "next/navigation";

import { useState, useEffect } from "react";
export default function Home() {
    const [sceneStarted, setSceneStarted] = useState(false);
    const [, setIsClient] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);


    const handleStartClick = () => {
        setSceneStarted(true);
        console.log("Start clicked");
        router.push("/scene");
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-gray-800">
            <main className="relative z-10 text-center max-w-lg px-6">
                <h1 className="text-5xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                        Welcome to WebGL Showcase!
                    </span>
                </h1>
                <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                    WebGL Showcase is a personal project designed to demonstrate
                    the power of 3D Raymarching rendering with WebGL. This project is hosted
                    in the cloud for showcasing purposes. Join me in exploring the
                    capabilities of WebGL and 3D scenes!
                </p>
                <button
                    onClick={handleStartClick}
                    className="px-6 py-3 font-semibold text-white bg-teal-500 rounded-md shadow-md hover:bg-teal-600 transition duration-300"
                >
                    {sceneStarted ? "Loading..." : "Start"}
                </button>
            </main>
        </div>
    );
}
