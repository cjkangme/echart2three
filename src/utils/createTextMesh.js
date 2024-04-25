import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const createTextMesh = (text, font, size = 1, color = 0x000000) => {
  const textGeometry = new TextGeometry(text, {
    font: font,
    size: size,
  });
  const textMaterial = new THREE.MeshStandardMaterial({
    color: color,
  });
  return new THREE.Mesh(textGeometry, textMaterial);
};

export default createTextMesh;
