'use client';
import React, { useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import vertex from '../shaders/vertex';
import demo_fragment from '../shaders/default_demo/fragment';
import fragment from '../shaders/explication_scene/fragment';

type ObjectMode = "Sphere" | "Cube" | "Octahedron";

interface ShaderPlaneProps {
    color: THREE.Vector3,
    distance: number,
    objectMode: ObjectMode,
    objectSize: number,
    AA: boolean,
    setDistance: React.Dispatch<React.SetStateAction<number>>,
    educationScene?: boolean
    stepNumber?: number
}

const ShaderPlane = ({ color, distance, objectMode, objectSize, AA, setDistance, educationScene, stepNumber }: ShaderPlaneProps) => {
    const { size, gl } = useThree();
    const [mousePosition, ] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [rotationAngleX, setRotationAngleX] = useState(0);
    const [rotationAngleY, setRotationAngleY] = useState(0);


    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (isDragging) {
                const deltaX = event.movementX;
                const deltaY = event.movementY;
                const newAngleX = rotationAngleX + deltaX * 0.001;
                setRotationAngleX(newAngleX);
                const newAngleY = rotationAngleY + deltaY * 0.001;
                setRotationAngleY(newAngleY);
            }
        };

        const handleMouseDown = () => {
            setIsDragging(true);
        };

        const handleMouseUp = () => {
            setIsDragging(false);
        };

        const handleScroll = (event: WheelEvent) => {
            const newDistance = distance + event.deltaY / 10;
            console.log(newDistance);
            console.log(event.deltaY);
            if (newDistance >= 100 && newDistance <= 1500) {
                setDistance(newDistance);
            }
        }

        gl.domElement.addEventListener('mousemove', handleMouseMove);
        gl.domElement.addEventListener('mousedown', handleMouseDown);
        gl.domElement.addEventListener('mouseup', handleMouseUp);
        gl.domElement.addEventListener('wheel', handleScroll);

        // Clean up on unmount
        return () => {
            gl.domElement.removeEventListener('mousemove', handleMouseMove);
            gl.domElement.removeEventListener('mousedown', handleMouseDown);
            gl.domElement.removeEventListener('mouseup', handleMouseUp);
            gl.domElement.removeEventListener('wheel', handleScroll);
        };
    }, [gl.domElement, rotationAngleX, isDragging, rotationAngleY, setDistance, distance]);

    // Define uniforms with useMemo to initialize once
    const tuniform = useMemo(() => {
        const uniforms = {
            iTime: { value: 0 },
            angleX: { value: 0 },
            angleY: { value: 0 },
            sphereColor: { value: new THREE.Vector3(0, 0, 0) },
            iResolution: { value: new THREE.Vector2(size.width, size.height) },
            Mouse: { value: new THREE.Vector2(0, 0) },
            iStep: { value: 0}, // Initialize mouse uniform
            mode: { value: 0 },
            size: { value: objectSize / 100 },
            enableAntiAliasing: { value: AA },
            cameraPos: { value: new THREE.Vector3(0, 0, distance / 100) }, // Initial camera position
            targetPos: { value: new THREE.Vector3(0, 0, 0) }  // Target position at the origin
        };

        return uniforms;
    }, [size.width, size.height, distance, objectSize, AA]);

    // Create the ShaderMaterial once with useMemo
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: tuniform,
            vertexShader: vertex,
            fragmentShader: (educationScene) ? fragment : demo_fragment,
            side: THREE.DoubleSide,
        });
    }, [tuniform]);

    // Update the uniform values on each frame
    useFrame(({ clock }) => {
        tuniform.iTime.value = clock.getElapsedTime();
        tuniform.Mouse.value.set(mousePosition.x, mousePosition.y);
        tuniform.sphereColor.value.set(color.x, color.y, color.z);
        tuniform.cameraPos.value = new THREE.Vector3(0, 0, distance / 100);
        tuniform.size.value = objectSize / 100;
        tuniform.enableAntiAliasing.value = AA;
        tuniform.angleX.value = rotationAngleX;
        tuniform.angleY.value = rotationAngleY;
        tuniform.iStep.value = stepNumber ? stepNumber : 0;
        switch (objectMode) {
            case "Sphere":
                tuniform.mode.value = 0;
                break;
            case "Cube":
                tuniform.mode.value = 1;
                break;
            case "Octahedron":
                tuniform.mode.value = 2;
                break;
        }
    });

    return (
        <mesh material={shaderMaterial}>
            <planeGeometry args={[size.width, size.height]} />
        </mesh>
    );
};

export default ShaderPlane;
