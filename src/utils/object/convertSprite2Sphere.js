import * as THREE from "three";

const convertSprite2Sphere = (mesh) => {
  const material = new THREE.MeshBasicMaterial();
  const bufferGeometry = new THREE.SphereGeometry();

  const geometry = mesh.geometry;
  const positionAttr = geometry.attributes.position;
  const colorAttr = geometry.attributes.color;
  const sizeAttr = geometry.attributes.size;

  mesh.updateWorldTransform();
  const worldMatrix = new THREE.Matrix4().fromArray(mesh.worldTransform.array);

  const instancedMesh = new THREE.InstancedMesh(
    bufferGeometry,
    material,
    geometry.vertexCount
  );

  const position = new THREE.Vector3();

  const hasColor = !!(colorAttr && colorAttr.value);

  const temp = [];
  const colors = [];
  for (let i = 0; i < geometry.vertexCount; i++) {
    const matrix4 = new THREE.Matrix4();
    // FIXME: 20 하드코딩
    const size = sizeAttr.value[i] / 40;
    const scale = new THREE.Vector3(size, size, size);
    matrix4.scale(scale);

    positionAttr.get(i, temp);
    position.set(...temp);
    position.applyMatrix4(worldMatrix);
    matrix4.setPosition(position);

    instancedMesh.setMatrixAt(i, matrix4);

    if (hasColor) {
      colorAttr.get(i, colors);
      const color = colors.slice(0, 3);
      instancedMesh.setColorAt(i, new THREE.Color(...color));
    }
  }
  instancedMesh.instanceColor.needsUpdate = true;

  return instancedMesh;
};

export default convertSprite2Sphere;
