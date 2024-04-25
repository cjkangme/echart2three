import * as THREE from "three";

const LinesGeometry = () => {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(0), 3)
  );
  geometry.setAttribute(
    "positionPrev",
    new THREE.BufferAttribute(new Float32Array(0), 3)
  );
  geometry.setAttribute(
    "positionNext",
    new THREE.BufferAttribute(new Float32Array(0), 3)
  );
  geometry.setAttribute(
    "prevPositionPrev",
    new THREE.BufferAttribute(new Float32Array(0), 3)
  );
  geometry.setAttribute(
    "prevPositionNext",
    new THREE.BufferAttribute(new Float32Array(0), 3)
  );
  geometry.setAttribute(
    "prevPosition",
    new THREE.BufferAttribute(new Float32Array(0), 3)
  );
  geometry.setAttribute(
    "offset",
    new THREE.BufferAttribute(new Float32Array(0), 1)
  );
  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(0), 4)
  );

  geometry.userData = {
    segmentScale: 1,
    useNativeLine: true,
  };

  return geometry;
};

export default LinesGeometry;
