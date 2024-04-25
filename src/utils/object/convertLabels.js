import * as THREE from "three";

const dimIndicesMap = {
  x: 0,
  y: 2,
  z: 1,
};
const otherDim = {
  x: "y",
  y: "x",
  z: "y",
};

const convertLabels = (coordSys, dim) => {
  const textGroup = new THREE.Group();
  const axis = coordSys.getAxis(dim);
  const axisModel = axis.model;
  const axisLabelModel = axisModel.getModel("axisLabel");

  const tickCoords = axis.getTicksCoords();
  const categoryData = axisModel.getCategories();
  const labelMargin = axisLabelModel.get("margin") ?? 0;
  const labels = axis.getViewLabels();

  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    const tickValue = label.tickValue;
    const formattedLabel = label.formattedLabel;
    const rawLabel = label.rawLabel;
    const tickCoord = axis.dataToCoord(tickValue);

    const p = [0, 0, 0];
    const idx = dimIndicesMap[dim];
    const otherIdx = dimIndicesMap[otherDim[dim]];

    p[idx] = tickCoord;
    p[otherIdx] = 0;

    const textColor = axisLabelModel.get("color") ?? "#000000";

    const textCanvas = document.createElement("canvas");
    const textCtx = textCanvas.getContext("2d");
    textCtx.font = "20px Arial";
    const textWidth = textCtx.measureText(formattedLabel).width;

    textCtx.fillStyle = "#ffffff";
    textCtx.fillText(formattedLabel, 0, 0);

    const texture = new THREE.Texture(textCanvas);
    texture.needsUpdate = true;

    const textMaterial = new THREE.SpriteMaterial({
      map: texture,
      useScreenCoordinates: false,
    });

    const sprite = new THREE.Sprite(textMaterial);

    sprite.position.set(p[0], p[1], p[2]);
    textGroup.add(sprite);
  }
  return textGroup;
};

export default convertLabels;
