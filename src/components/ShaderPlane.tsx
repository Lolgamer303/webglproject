'use client';
import React, { useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertex from '../shaders/vertex';
import fragment from '../shaders/fragment';

type ObjectMode = "Sphere" | "Cube" | "Prism";

interface ShaderPlaneProps {
    color: THREE.Vector3,
    distance: number,
    objectMode: ObjectMode,
}

function ShaderPlane({color, distance, objectMode}: ShaderPlaneProps) {
    const { size, gl } = useThree();

    // State for mouse position
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [, setTrueMousePos] = useState({ x: 0, y: 0})

    // Mouse event listener to update mouse position
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (event.buttons === 1) { // Check if the left mouse button is pressed
                // Convert mouse position to normalized device coordinates
                const x = (event.clientX / size.width) * 2 - 1;
                const y = -(event.clientY / size.height) * 2 + 1;
                setMousePosition({ x, y });
            } else {
                setMousePosition({ x: 0, y: 0 });
            }
            setTrueMousePos({x: event.clientX / size.width * 2 - 1,y: event.clientY / size.height * 2 + 1});
        };

        const handleMouseUp = () => {
            setMousePosition({ x: 0, y: 0 });
        };

        // Add event listeners
        gl.domElement.addEventListener('mousemove', handleMouseMove);
        gl.domElement.addEventListener('mouseup', handleMouseUp);

        // Clean up on unmount
        return () => {
            gl.domElement.removeEventListener('mousemove', handleMouseMove);
            gl.domElement.removeEventListener('mouseup', handleMouseUp);
        };
    }, [gl.domElement, size.width, size.height]);

    // Define uniforms with useMemo to initialize once
    const tuniform = useMemo(() => {
        const uniforms = {
            iTime: { value: 0 },
            angle: { value: 0},
            sphereColor: { value: new THREE.Vector3(0, 0, 0)},
            iResolution: { value: new THREE.Vector2(size.width, size.height) },
            distanceToCenter: { value: distance },
            Mouse: { value: new THREE.Vector2(0, 0) }, // Initialize mouse uniform
            mode: { value: 0 }
        };

        return uniforms;
    }, [size.width, size.height, distance]);

    // Create the ShaderMaterial once with useMemo
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: tuniform,
            vertexShader: vertex,
            fragmentShader: fragment,
            side: THREE.DoubleSide,
        });
    }, [tuniform]);

    // Update the uniform values on each frame
    useFrame(({ clock }) => {
        tuniform.iTime.value = clock.getElapsedTime();
        tuniform.Mouse.value.set(mousePosition.x, mousePosition.y);
        tuniform.sphereColor.value.set(color.x, color.y, color.z);
        tuniform.distanceToCenter.value = distance;
        switch (objectMode) {
            case "Sphere":
                tuniform.mode.value = 0;
                console.log("Sphere")
                break;
            case "Cube":
                tuniform.mode.value = 1;
                console.log("Cube")
                break;
            case "Prism":
                tuniform.mode.value = 2;
                console.log("Prism")
                break;
        }
        if (mousePosition.x === 0 && mousePosition.y === 0) {
            tuniform.angle.value = 0.0; // Increment angle based on time
        } else {
            tuniform.angle.value += mousePosition.x * 0.01; // Modify angle based on mouse input
        }
        console.log(tuniform.angle.value)
    });

    return (
        <mesh material={shaderMaterial}>
            <planeGeometry args={[size.width, size.height]} />
        </mesh>
    );
}

export default ShaderPlane;
