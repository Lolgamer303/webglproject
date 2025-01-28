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
      return 'Welcome! In this little demo I will teach you how raymarching, the second most used 3d rendering technique. Click the "Next Step" button to continue.';
    case 1:
      return "We will see how to render with raymarching a simple shape : a sphere.";
    case 2:
      return "First, we must know how rendering work. the goal of rendering is to find each screen pixel color, so that we can display it on your screen. Here's a simple plane representing a screen.";
    case 3:
      return "Once we have a plane, wich is in fact just multiples points, we need a camera, in other words, a point of view from wich to shoot rays. Here's a camera.";
    case 4:
      return "Now that we have a camera, we can shoot rays from it to the screen. Each ray will hit the screen at a point, and we will calculate the color of this point. This is the basic principle of raymarching.";
    case 5:
      return "We now need to advance the ray into the scene, and once it hits an object, render the color of it on the screen. Here's all the rays";
    case 6:
      return "We still got a bit of a problem, as it would be far too ressource expensive to march the ray forward by a very small amount then check if it hit anything then do this again thousands of times for each ray. We use a clever trick to prevent this very problem. We can get the distance to all objects in the scene, and then if we take the smallest distance, we know that within the range of this distance, there is no object. This is the basic principle of raymarching.";
    case 7:
        return "So as we saw, we can march the ray in their respective direction by the smallest distance to the objects in the scene. As we want to render a sphere, we need a function to get the distance to it. This can be done simply by getting the distance to the center of the sphere, and substracting the radius of the sphere. This is the distance function of a sphere.";
    case 8:
        return "We can now march the ray in its direction by the distance found multiples times until we are very close from the sphere or wander too far from it, and then render the pixel color accordingly.";
    default:
        return "This is the end of the demo, I hope you enjoyed it. If you have any question, feel free to ask me by sending an email at nathanchpaps@icloud.com";
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
  setStepNumber,
}: ShaderOptionProps): JSX.Element {
  const text = getTextByStepNumber(stepNumber);
  return (
    <div className="rounded-md bg-gray-800 text-2xl opacity-85 absolute right-[150px] flex flex-col top-[100px] h-[60vh] w-[18vw] items-center justify-center text-white">
      <div className="relative top-[-60px] text-gray-400 underline font-bold text-center">
        Education demo menu
      </div>
      <p>{text}</p>
      <button
        onClick={() => setStepNumber(stepNumber + 1)}
        className="text-rose-700 bg-slate-400 rounded-md text-md w-[8vw] relative bottom-0"
      >
        Next Step
      </button>
    </div>
  );
}
