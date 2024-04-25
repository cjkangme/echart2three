import * as THREE from "three";

const convertLine = (mesh) => {
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
  });
  const bufferGeometry = new THREE.BufferGeometry();
  const geometry = mesh.geometry;

  const positionAttr = geometry.attributes.position;
  const colorAttr = geometry.attributes.color;
  const indices = geometry.indices;

  mesh.updateWorldTransform();
  const worldMatrix = new THREE.Matrix4().fromArray(mesh.worldTransform.array);
  const position = new THREE.Vector3();
  const positions = [];
  const colors = [];
  const hasColor = !!(colorAttr && colorAttr.value);
  const temp = [];

  for (let i = 0; i < geometry.vertexCount; i++) {
    positionAttr.get(i, temp);
    position.set(...temp);
    position.applyMatrix4(worldMatrix);
    positions.push(...position.toArray());
    if (hasColor) {
      colorAttr.get(i, temp);
      const color = temp.filter((_, idx) => idx % 4 !== 3);
      const alpha = temp.filter((_, idx) => idx % 4 === 3);
      for (let i = 0; i < color.length; i += 3) {
        color[i] *= alpha[i / 3];
        color[i + 1] *= alpha[i / 3];
        color[i + 2] *= alpha[i / 3];
      }
      colors.push(...color);
    }
  }
  bufferGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  if (hasColor) {
    bufferGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );
  }
  bufferGeometry.setIndex([...indices]);
  const line = new THREE.LineSegments(bufferGeometry, material);

  return line;
};

export default convertLine;
