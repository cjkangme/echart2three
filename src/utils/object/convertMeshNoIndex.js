import * as THREE from "three";
import getMaterialParameters from "../getMaterialParameters";

const convertMeshNoIndex = (mesh) => {
  const textureLib = {};
  const params = getMaterialParameters(mesh.material, textureLib);

  const material = new THREE.MeshPhongMaterial({
    // color: new THREE.Color(...params.color.map((c) => c / 255)),
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

  // 인덱스 정보 가져오기
  const indices = [];
  const tempIndices = [];
  for (let i = 0; i < geometry.triangleCount; i++) {
    geometry.getTriangleIndices(i, tempIndices);
    indices.push(tempIndices[0], tempIndices[1], tempIndices[2]);
  }

  for (const index of indices) {
    positionAttr.get(index, temp);
    position.set(...temp);
    position.applyMatrix4(worldMatrix);
    positions.push(...position.toArray());

    if (hasNormal) {
      normalAttr.get(index, temp);
      normal.set(...temp);
      normal.applyMatrix3(normalMatrix);
      normal.normalize();
      normals.push(...normal.toArray());
    }
    if (hasTexcoord) {
      texcoordAttr.get(index, temp);
      uv.push(temp[0], temp[1]);
    }
    if (hasColor) {
      colorAttr.get(index, temp);
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
  if (!hasNormal) {
    bufferGeometry.computeVertexNormals();
  }

  const threeMesh = new THREE.Mesh(bufferGeometry, material);
  return threeMesh;
};

export default convertMeshNoIndex;
