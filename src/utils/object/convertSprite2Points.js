import * as THREE from "three";

const convertSprite2Points = (mesh) => {
  const material = new THREE.ShaderMaterial({
    vertexShader: _vertexShader(),
    fragmentShader: _fragmentShader(),
    transparent: true,
  });
  const bufferGeometry = new THREE.BufferGeometry();

  const geometry = mesh.geometry;
  const positionAttr = geometry.attributes.position;
  const colorAttr = geometry.attributes.color;
  const sizeAttr = geometry.attributes.size;

  mesh.updateWorldTransform();
  const worldMatrix = new THREE.Matrix4().fromArray(mesh.worldTransform.array);

  const position = new THREE.Vector3();

  const hasColor = !!(colorAttr && colorAttr.value);
  const hasSize = !!(sizeAttr && sizeAttr.value);

  const positions = [];
  const temp = [];
  for (let i = 0; i < geometry.vertexCount; i++) {
    positionAttr.get(i, temp);
    position.set(...temp);
    position.applyMatrix4(worldMatrix);
    positions.push(...position.toArray());
  }
  bufferGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  if (hasColor) {
    const colors = [];
    for (let i = 0; i < geometry.vertexCount; i++) {
      colorAttr.get(i, temp);
      colors.push(...temp);
    }
    bufferGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );
  }
  if (hasSize) {
    const sizes = [];
    for (const value of sizeAttr.value) {
      sizes.push(value / 20);
    }
    bufferGeometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(sizes, 1)
    );
  }
  bufferGeometry.attributes.size.needsUpdate = true;

  const points = new THREE.Points(bufferGeometry, material);
  return points;
};

export default convertSprite2Points;

const _vertexShader = () => {
  return `
    attribute float size;
    attribute vec4 color;
    varying vec4 vColor;
    void main() {
      vColor = color;
      vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
      gl_PointSize = size * ( 250.0 / -mvPosition.z );
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
};

const _fragmentShader = () => {
  return `
    varying vec4 vColor;
    void main() {
      gl_FragColor = vColor;
    }
  `;
};
