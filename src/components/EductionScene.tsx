import { useState } from "react";
import { Vector3 } from "three";

type ShaderOptionProps = {
    color: Vector3;

    setColor: React.Dispatch<React.SetStateAction<Vector3>>;

    distance: number;

    setDistance: React.Dispatch<React.SetStateAction<number>>;

    objectMode: string;

    setObjectMode: React.Dispatch<React.SetStateAction<ObjectMode>>;

    size: number;

    setSize: React.Dispatch<React.SetStateAction<number>>;

    AA: boolean;

    setAA: React.Dispatch<React.SetStateAction<boolean>>;

    stepNumber: number;

    setStepNumber: React.Dispatch<React.SetStateAction<number>>;
};

type ObjectMode = "Sphere" | "Cube" | "Octahedron";

function getTextByStepNumber(stepNumber: number): string {
    switch (stepNumber) {
        case 0:
            return 'Welcome to the education demo! This is a simple scene with a plane that has a shader applied to it. You can interact with the scene using the controls on the right. Click the "Next Step" button to continue.';
        case 1:
            return 'You can change the color of the plane by adjusting the RGB values. Try changing the values to see how the color of the plane changes.';
        case 2:
            return 'You can change the distance of the camera from the plane by scrolling up and down. Try scrolling to see how the distance changes.';
        case 3:
            return 'You can change the object mode of the plane by selecting one of the options from the dropdown. Try changing the object mode to see how the shape of the plane changes.';
        case 4:
            return 'You can change the size of the object by adjusting the size slider. Try adjusting the size to see how the size of the object changes.';
        case 5:
            return 'You can enable or disable anti-aliasing by toggling the AA switch. Try toggling the switch to see how the scene changes.';
        default:
            return '';
    }
}

export default function ShaderOption({
    AA,
    setAA,
    color,
    setColor,
    distance,
    setDistance,
    objectMode,
    setObjectMode,
    size,
    setSize,
    stepNumber,
    setStepNumber
}: ShaderOptionProps): JSX.Element {
    const text = getTextByStepNumber(stepNumber);
    return (
        <div className='rounded-md bg-gray-800 text-2xl opacity-85 absolute right-[150px] flex flex-col top-[100px] h-[60vh] w-[18vw] items-center justify-center text-white'>
            <div className='relative top-[-60px] text-gray-400 underline font-bold text-center'>Education demo menu</div>
            <p>{text}</p>
            <button onClick={() => setStepNumber(stepNumber + 1)} className="text-rose-700 bg-slate-400 rounded-md text-md w-[8vw] relative bottom-0">Next Step</button>
        </div>
    );
}
