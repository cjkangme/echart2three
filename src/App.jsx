import "./App.css";
import { useState } from "react";
import excel2json from "./utils/parse/excel2json";
import { Canvas } from "@react-three/fiber";
import { PerspectiveCamera, OrbitControls } from "@react-three/drei";

function App() {
  const [mesh, setMesh] = useState(null);

  const handleChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const type = file.type.split("/")[1];

    switch (type) {
      case "vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
        excel2json(file, setMesh);

        break;
      }
      default:
        console.log(type + "지원하지 않는 파일 형식입니다.");
    }
  };

  return (
    <>
      <div>엑셀 내놔</div>
      <input type="file" onChange={handleChange} />
      <Canvas
        style={{
          width: "50vw",
          height: "50vh",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 100]} />
        <OrbitControls />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        {mesh ? <primitive object={mesh} /> : null}
      </Canvas>
    </>
  );
}

export default App;
