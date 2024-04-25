import * as THREE from "three";
import Grid3DFace from "./Grid3DFace";
import Grid3DAxis from "./Grid3DAxis";
import LinesGeometry from "../../utils/geometry/Lines3D";
import layers from "../../constants/layers";

const Grid3DView = () => {
  const FACES = [
    // planeDim0, planeDim1, offsetDim, dir on dim3 axis(gl), plane.
    ["y", "z", "x", -1, "left"],
    ["y", "z", "x", 1, "right"],
    ["x", "y", "z", -1, "bottom"],
    ["x", "y", "z", 1, "top"],
    ["x", "z", "y", -1, "far"],
    ["x", "z", "y", 1, "near"],
  ];

  const DIMS = ["x", "y", "z"];

  const quadsMaterial = new THREE.MeshBasicMaterial({
    color: 0x000000,
    depthWrite: false,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0x000000,
    depthWrite: false,
    transparent: true,
  });

  const Grid3DView = new THREE.Group();

  FACES.forEach((faceInfo) => {
    const grid3DFace = new Grid3DFace(faceInfo, linesMaterial, quadsMaterial);
    Grid3DView.add(grid3DFace.rootNode);
  });

  DIMS.forEach((dim) => {
    const axis = new Grid3DAxis(dim, linesMaterial);
    Grid3DView.add(axis.rootNode);
  });

  const lineGeometry = LinesGeometry();
  lineGeometry.userData.useNativeLine = false;
  const axisPointerLineMesh = new THREE.Line(lineGeometry, linesMaterial);
  axisPointerLineMesh.castShadow = false;
  axisPointerLineMesh.layers.set(layers.IGNORE_RAYCAST);
  axisPointerLineMesh.renderOrder = 3;
  Grid3DView.add(axisPointerLineMesh);

  const axisLabelGeometry = new THREE.BufferGeometry();
  axisLabelGeometry.setAttribute("dynamic", true);
  const axisLabelMaterial = new THREE.SpriteMaterial({
    transparent: true,
    depthWrite: false,
  });
  const axisPointerLabelsMesh = new THREE.Sprite(
    axisLabelGeometry,
    axisLabelMaterial
  );
  axisPointerLabelsMesh.castShadow = false;
  axisPointerLabelsMesh.layers.set(layers.IGNORE_RAYCAST);
  axisPointerLabelsMesh.renderOrder = 4;
  Grid3DView.add(axisPointerLabelsMesh);
};

export default Grid3DView;
