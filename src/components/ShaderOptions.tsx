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
};

type ObjectMode = "Sphere" | "Cube" | "Octahedron";

//convert the hex color to a Vector3
function ConvertHexToVector3(s: string) {
    const r = parseInt(s.substring(1, 3), 16) / 255;
    const g = parseInt(s.substring(3, 5), 16) / 255;
    const b = parseInt(s.substring(5, 7), 16) / 255;
    return new Vector3(r, g, b).normalize();
}
//convert the Vector3 to a hex color
function ConvertVector3ToHex(v: Vector3) {
    const r = Math.floor(v.x * 255)
        .toString(16)
        .padStart(2, "0");
    const g = Math.floor(v.y * 255)
        .toString(16)
        .padStart(2, "0");
    const b = Math.floor(v.z * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${r}${g}${b}`;
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
}: ShaderOptionProps): JSX.Element {
    return (
        <div className='rounded-md bg-gray-800 text-2xl opacity-95 absolute right-[150px] flex flex-col top-[100px] h-[30vh] w-[13vw] items-center justify-center text-white'>
            <div className='relative top-[-60px] text-gray-400 underline font-bold'>Shader Options</div>
            <div className='mb-2'>
                Object Color :
                <input
                    type='color'
                    className='bg-transparent align-middle pl-2'
                    value={ConvertVector3ToHex(color)}
                    onChange={(e) =>
                        setColor(ConvertHexToVector3(e.target.value))
                    }
                />
            </div>
            <div className=''>Distance To Center :</div>
            <input
                className='mb-2'
                type='range'
                min='100'
                max='1500'
                value={distance}
                onChange={(e) => {
                    setDistance(Number(e.target.value));
                }}
            ></input>
            <div className=''>
                Object Mode :
                <select
                    className='custom-select bg-transparent align-middle pl-2 text-sm'
                    value={objectMode}
                    onChange={(e) =>
                        setObjectMode(e.target.value as ObjectMode)
                    }
                >
                    <option value='Sphere'>Sphere</option>
                    <option value='Cube'>Cube</option>
                    <option value='Octahedron'>Octahedron</option>
                </select>
            </div>
            <div className=''>
                Size :
                <input
                    type='range'
                    min={1}
                    max={100}
                    value={size}
                    onChange={(e) => {
                        setSize(Number(e.target.value));
                    }}
                ></input>
            </div>
            <div className=''>
                Enable AA :
                <input
                    className='ml-2 size-5 align-middle'
                    type='checkbox'
                    checked={AA}
                    onChange={(e) => {
                        setAA(e.target.checked);
                        console.log(e.target.checked);
                    }}
                ></input>
            </div>
        </div>
    );
}
