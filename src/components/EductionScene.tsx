type EducationShaderOptionProps = {
  stepNumber: number;
  setStepNumber: React.Dispatch<React.SetStateAction<number>>;
};

function getTextByStepNumber(stepNumber: number): string {
  switch (stepNumber) {
    case 0:
      return 'Welcome! In this little demo I will teach you how raymarching, the second most used 3d rendering technique. Click the "Next Step" button to continue.';
    case 1:
      return "We will see how to render with raymarching a simple shape: a sphere.";
    case 2:
      return "First, we must know how rendering work. The goal of rendering is to find each screen pixel color, so that we can display it on your screen. Here&#39;s a simple plane representing a screen.";
    case 3:
      return "Once we have a plane, which is in fact just multiple points, we need a camera, in other words, a point of view from which to shoot rays. Here&#39;s a camera.";
    case 4:
      return "Now that we have a camera, we can shoot rays from it to the screen. Each ray will hit the screen at a point, and we will calculate the color of this point. This is the basic principle of raymarching.";
    case 5:
      return "We now need to advance the ray into the scene, and once it hits an object, render the color of it on the screen. Here&#39;s all the rays.";
    case 6:
      return "We still got a problem, as it would be far too resource expensive to march the ray forward by a small amount then check if it hit anything and repeat this thousands of times for each ray. We use a clever trick to prevent this: we can get the distance to all objects in the scene, and if we take the smallest distance, we know that within the range of this distance, there is no object.";
    case 7:
      return "So we can march the ray in their respective direction by the smallest distance to the objects in the scene. As we want to render a sphere, we need a function to get the distance to it. This can be done simply by getting the distance to the center of the sphere, and subtracting the radius of the sphere. This is the distance function of a sphere.";
    case 8:
      return "We can now march the ray in its direction by the distance found multiple times until we are very close to the sphere or wander too far from it, and then render the pixel color accordingly.";
    case 9:
      return "We can now march the ray in its direction by the distance found multiple times until we are very close to the sphere or wander too far from it, and then render the pixel color accordingly.";
    case 10:
      return "We can now march the ray in its direction by the distance found multiple times until we are very close to the sphere or wander too far from it, and then render the pixel color accordingly.";
    case 11:
      return "We can now march the ray in its direction by the distance found multiple times until we are very close to the sphere or wander too far from it, and then render the pixel color accordingly.";
    case 12:
      return "We can now march the ray in its direction by the distance found multiple times until we are very close to the sphere or wander too far from it, and then render the pixel color accordingly.";
    case 13:
      return "We can now march the ray in its direction by the distance found multiple times until we are very close to the sphere or wander too far from it, and then render the pixel color accordingly.";
    default:
      return "This is the end of the demo, I hope you enjoyed it. If you have any questions, feel free to ask me by sending an email at nathanchpaps@icloud.com (by the way, this explanation was made in raymarching too)";
  }
}

export default function ShaderOption({
  stepNumber,
  setStepNumber,
}: EducationShaderOptionProps): JSX.Element {
  const text = getTextByStepNumber(stepNumber);
  return (
    <div className="bg-gray-900 p-6 rounded-2xl absolute bottom-[2vh] right-[10vh] left-[10vh] h-[35vh] text-white flex flex-row items-center justify-center border-4 border-yellow-500">
      <div className="flex flex-col items-center justify-center">
        <div className="text-yellow-500 font-bold text-center mb-2">
          Instructor
        </div>
        <div className="bg-gray-800 p-4 rounded-md text-center">
          <p className="mb-4" dangerouslySetInnerHTML={{ __html: text }}></p>
          <div className="flex flex-col items-center justify-center y-4">
            <button
              onClick={() => {
                if (stepNumber < 14) {setStepNumber(stepNumber + 1)}
                else {setStepNumber(14)}
              }}
              className="text-white bg-yellow-500 rounded-md text-md px-4 py-2 mb-2"
            >
              Next Step
            </button>
            <button
              onClick={() => {
                if (stepNumber > 0){setStepNumber(stepNumber - 1)}
                else {setStepNumber(0);}
              }}
              className="text-white bg-yellow-500 rounded-md text-md px-4 py-2"
            >
              Previous Step
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
