import * as THREE from "three";

const QuadsGeometry = () => {
  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(0), 3)
  );
  geometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(new Float32Array(0), 3)
  );
  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(0), 4)
  );

  geometry.userData = {
    segmentSacle: 1,
    useNativeLine: true,
    _vertexOffset: 0,
    _faceOffset: 0,
  };

  geometry.addQuad = function () {
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    const normal = new THREE.Vector3();
    const indices = [0, 3, 1, 3, 2, 1];

    return function (coords, color) {
      const positionAttr = geometry.getAttribute("position");
      const normalAttr = geometry.getAttribute("normal");
      const colorAttr = geometry.getAttribute("color");

      a.subVectors(coords[1], coords[0]);
      b.subVectors(coords[2], coords[1]);
      normal.crossVectors(a, b).normalize();

      const vertexIdx = geometry.userData._vertexOffset;
      positionAttr.setXYZ(vertexIdx, coords[0], coords[1], coords[2]);
      colorAttr.setXYZW(vertexIdx, color[0], color[1], color[2], color[3]);
      normalAttr.setXYZ(vertexIdx, normal.x, normal.y, normal.z);

      const faceIdx = geometry.userData._faceOffset * 3;

      for (let i = 0; i < 6; i++) {
        geometry.index[faceIdx + i] =
          indices[i] + geometry.userData._vertexOffset;
      }

      geometry.userData._vertexOffset += 4;
      geometry.userData._faceOffset += 2;
    };
  };

  return geometry;
};

export default QuadsGeometry;
