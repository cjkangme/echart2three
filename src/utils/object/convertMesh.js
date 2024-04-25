import * as THREE from "three";
import getMaterialParameters from "../getMaterialParameters";

const convertMesh = (mesh) => {
  const textureLib = {};
  const params = getMaterialParameters(mesh.material, textureLib);

  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(...params.color.map((c) => c / 255)),
    // specular: new THREE.Color(...params.specular.map((c) => c / 255)),
    // shininess: 100 - params.roughness * 100,
    vertexColors: true,
  });
  const bufferGeometry = new THREE.BufferGeometry();

  const geometry = mesh.geometry;
  const positionAttr = geometry.attributes.position;
  const normalAttr = geometry.attributes.normal;
  const texcoordAttr = geometry.attributes.texcoord0;
  const colorAttr = geometry.attributes.color;

  mesh.updateWorldTransform();
  const worldMatrix = new THREE.Matrix4().fromArray(mesh.worldTransform.array);
  const normalMatrix = worldMatrix.clone().invert().transpose();

  const position = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const uv = [];

  const hasNormal = !!(normalAttr && normalAttr.value);
  const hasTexcoord = !!(texcoordAttr && texcoordAttr.value);
  const hasColor = !!(colorAttr && colorAttr.value);

  const positions = [];
  const normals = [];
  const colors = [];
  const temp = [];
  for (let i = 0; i < geometry.vertexCount; i++) {
    positionAttr.get(i, temp);
    position.set(...temp);
    position.applyMatrix4(worldMatrix);
    positions.push(...position.toArray());

    if (hasNormal) {
      normalAttr.get(i, temp);
      normal.set(...temp);
      normal.applyMatrix3(normalMatrix);
      normal.normalize();
      normals.push(...normal.toArray());
    }
    if (hasTexcoord) {
      texcoordAttr.get(i, temp);
      uv.push(temp[0], temp[1]);
    }
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
  if (hasNormal) {
    bufferGeometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(normals, 3)
    );
  }
  if (hasTexcoord) {
    bufferGeometry.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  }
  if (hasColor) {
    bufferGeometry.setAttribute(
      "color",
      new THREE.Float32BufferAttribute(colors, 3)
    );
  }
  const indices = [];
  const tempIndices = [];
  for (let i = 0; i < geometry.triangleCount; i++) {
    geometry.getTriangleIndices(i, tempIndices);
    indices.push(tempIndices[0], tempIndices[1], tempIndices[2]);
  }
  bufferGeometry.setIndex(indices);
  if (!hasNormal) {
    const newNormals = new Array(positions.length).fill(0);
    const _vA = new THREE.Vector3();
    const _vB = new THREE.Vector3();
    const _vC = new THREE.Vector3();
    const _cb = new THREE.Vector3();
    const _ab = new THREE.Vector3();
    for (let i = 0; i < bufferGeometry.index.count; i += 3) {
      const x = bufferGeometry.index.array[i];
      const y = bufferGeometry.index.array[i + 1];
      const z = bufferGeometry.index.array[i + 2];
      const positionAttr = bufferGeometry.attributes.position;
      _vA.fromBufferAttribute(positionAttr, x);
      _vB.fromBufferAttribute(positionAttr, y);
      _vC.fromBufferAttribute(positionAttr, z);
      _cb.subVectors(_vC, _vB);
      _ab.subVectors(_vA, _vB);
      _cb.cross(_ab);
      _cb.normalize();
      // newNormals[x * 3] += _cb.x;
      // newNormals[x * 3 + 1] += _cb.y;
      // newNormals[x * 3 + 2] += _cb.z;
      // newNormals[y * 3] += _cb.x;
      // newNormals[y * 3 + 1] += _cb.y;
      // newNormals[y * 3 + 2] += _cb.z;
      // newNormals[z * 3] += _cb.x;
      // newNormals[z * 3 + 1] += _cb.y;
      // newNormals[z * 3 + 2] += _cb.z;
    }
    for (let i = 0; i < newNormals.length; i += 3) {
      const x = newNormals[i];
      const y = newNormals[i + 1];
      const z = newNormals[i + 2];
      const length = Math.sqrt(x * x + y * y + z * z);
      newNormals[i] = x / length;
      newNormals[i + 1] = y / length;
      newNormals[i + 2] = z / length;
    }
    bufferGeometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(newNormals, 3)
    );
  }

  const threeMesh = new THREE.Mesh(bufferGeometry, material);
  return threeMesh;
};

export default convertMesh;
