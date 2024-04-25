import * as THREE from "three";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import helbetiker from "/src/assets/helbetiker.json";

const dimIndicesMap = {
  x: 0,
  y: 2,
  z: 1,
};
const otherDims = {
  x: ["y", "z"],
  y: ["x", "z"],
  z: ["x", "y"],
};

const convertLabels = (coordSys, dim) => {
  const fontLoader = new FontLoader();
  const font = fontLoader.parse(helbetiker);

  const textGroup = new THREE.Group();
  const axis = coordSys.getAxis(dim);
  const axisModel = axis.model;
  const axisLabelModel = axisModel.getModel("axisLabel");
  const nameTextStyle = axisModel.get("nameTextStyle");
  const { fontSize } = nameTextStyle;
  const labels = axis.getViewLabels();
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const tickValue = label.tickValue;
    const formattedLabel = label.formattedLabel;
    const rawLabel = label.rawLabel;
    const tickCoord = axis.dataToCoord(tickValue);

    const p = [0, 0, 0];
    const idx = dimIndicesMap[dim];

    for (const [index, otherDim] of otherDims[dim].entries()) {
      p[dimIndicesMap[otherDim]] = coordSys.size[dimIndicesMap[otherDim]] / 2;
      if (index === 1) {
        p[dimIndicesMap[otherDim]] *= -1;
      }
    }

    p[idx] = tickCoord;

    const textColor = axisLabelModel.get("color") ?? "#ffffff";

    const textGeometry = new TextGeometry(formattedLabel ?? rawLabel, {
      font,
      size: fontSize ? fontSize / 4 : 1,
      depth: 0.1,
    });
    const nameGap = fontSize ? fontSize / 4 : 1;
    const textMaterial = new THREE.MeshBasicMaterial({ color: textColor });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    switch (dim) {
      case "x":
        p[dimIndicesMap["y"]] += nameGap;
        textMesh.rotation.x = -Math.PI / 2;
        break;
      case "y":
        textMesh.rotation.x = -Math.PI / 2;
        break;
      case "z":
        break;
      default:
        break;
    }

    textMesh.position.set(...p);
    textGroup.add(textMesh);
  }
  return textGroup;
};

export default convertLabels;
