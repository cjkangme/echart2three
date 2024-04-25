import * as echarts from "echarts";
import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
import { createTextStyle } from "echarts/lib/label/labelStyle";

import { firstNotNull } from "../../utils/retrieve";
import layers from "../../constants/layers";
import createTextMesh from "../../utils/createTextMesh";

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

class Grid3DAxis {
  constructor(dim, linesMaterial) {
    const linesMesh = new THREE.Mesh(new THREE.BufferGeometry(), linesMaterial);
    linesMesh.castShadow = false;
    linesMesh.layers.set(layers.IGNORE_RAYCAST);
    linesMesh.renderOrder = 2;

    const axisLabelGeometry = new THREE.BufferGeometry();
    axisLabelGeometry.setAttribute("dynamic", true);
    const axisLabelMaterial = new THREE.SpriteMaterial({
      transparent: true,
      sizeAttenuation: false,
    });
    const axisLabelsMesh = new THREE.Sprite(
      axisLabelGeometry,
      axisLabelMaterial
    );

    const rootNode = new THREE.Object3D();
    rootNode.add(linesMesh);
    rootNode.add(axisLabelsMesh);

    this.rootNode = rootNode;
    this.dim = dim;

    this.linesMesh = linesMesh;
    this.labelsMesh = axisLabelsMesh;
    this.axisLineCoords = null;
    this.labelElements = [];
  }

  update(grid3DModel, axisLabelSurface, api) {
    const cartesian = grid3DModel.coordinateSystem;
    const axis = cartesian.getAxis(this.dim);

    const linesGeo = this.linesMesh.geometry;
    const labelsGeo = this.labelsMesh.geometry;
    const axisModel = axis.model;
    const extent = axis.getExtent();

    const dpr = api.getDevicePixelRatio();
    const axisLineModel = axisModel.getModel(
      "axisLine",
      grid3DModel.getModel("axisLine")
    );
    const axisTickModel = axisModel.getModel(
      "axisTick",
      grid3DModel.getModel("axisTick")
    );
    const axisLabelModel = axisModel.getModel(
      "axisLabel",
      grid3DModel.getModel("axisLabel")
    );
    const axisLineColor = axisLineModel.get("lineStyle.color");

    if (axisLineModel.get("show")) {
      const axisLineStyleModel = axisLineModel.getModel("lineStyle");
      const p0 = [0, 0, 0];
      const p1 = [0, 0, 0];
      const idx = dimIndicesMap[axis.dim];
      p0[idx] = extent[0];
      p1[idx] = extent[1];

      this.axisLineCoords = [p0, p1];

      // Line 추가
      const lineVertices = new Float32Array(6);
      lineVertices.set(p0, 0);
      lineVertices.set(p1, 3);
      linesGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(lineVertices, 3)
      );
      // Line 색상 및 두께 설정
      // FIXME: 이거 꼭 매번 설정해줘야 하나?
      const lineColor = new THREE.Color(axisLineColor);
      const lineWidth = firstNotNull(axisLineStyleModel.get("width"), 1.0);
      const opacity = firstNotNull(axisLineStyleModel.get("opacity"), 1.0);
      this.linesMesh.material.linewidth = lineWidth * dpr;
      this.linesMesh.material.color.copy(lineColor);
      this.linesMesh.material.opacity = opacity;
    }

    if (axisTickModel.get("show")) {
      const lineStyleModel = axisTickModel.getModel("lineStyle");
      const lineColor = new THREE.Color(
        firstNotNull(lineStyleModel.get("color"), axisLineColor)
      );
      const lineWidth = firstNotNull(lineStyleModel.get("width"), 1.0);
      const opacity = firstNotNull(lineStyleModel.get("opacity"), 1.0);
      lineColor.multiplyScalar(opacity);
      this.linesMesh.material.linewidth = lineWidth * dpr;

      const ticksCoords = axis.getTicksCoords();
      const tickLength = axisTickModel.get("length");

      const tickVertices = new Float32Array(ticksCoords.length * 6);
      for (let i = 0; i < ticksCoords.length; i++) {
        const tickCoord = ticksCoords[i].coord;

        const p0 = [0, 0, 0];
        const p1 = [0, 0, 0];
        const idx = dimIndicesMap[axis.dim];
        const otherIdx = dimIndicesMap[otherDim[axis.dim]];
        p0[idx] = p1[idx] = tickCoord;
        p1[otherIdx] = tickLength;

        tickVertices.set(p0, i * 6);
        tickVertices.set(p1, i * 6 + 3);
      }
      linesGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(tickVertices, 3)
      );
    }
    if (axisLabelModel.get("show")) {
      const ticksCoords = axis.getTicksCoords();
      const categoryData = axisModel.get("data");

      const labelMargin = axisLabelModel.get("margin");
      const labels = axis.getViewLabels();

      const labelVertices = new Float32Array(labels.length * 3);
      for (let i = 0; i < labels.length; i++) {
        const tickValue = labels[i].tickValue;
        const formattedLabel = labels[i].formattedLabel;
        const rawLabel = labels[i].rawLabel;

        const tickCoord = axis.dataToCoord(tickValue);

        const p = [0, 0, 0];
        const idx = dimIndicesMap[axis.dim];
        const otherIdx = dimIndicesMap[otherDim[axis.dim]];
        p[idx] = p[idx] = tickCoord;
        p[otherIdx] = labelMargin;

        labelVertices.set(p, i * 3);

        let itemTextStyleModel = axisLabelModel;
        if (
          categoryData &&
          categoryData[tickValue] &&
          categoryData[tickValue].textStyle
        ) {
          itemTextStyleModel = new echarts.Model(
            categoryData[tickValue].textStyle,
            axisLabelModel,
            axisModel.ecModel
          );
        }
        const textColor = firstNotNull(
          itemTextStyleModel.get("color"),
          axisLineColor
        );
        // TODO: createTextStyle 실존하는 라이브러리인지 확인
        const textEl = createTextMesh(
          formattedLabel,
          itemTextStyleModel.get("font"),
          1,
          textColor
        );

        const coords = axisLabelSurface.add(textEl);
        const rect = textEl.getBoundingRect();
        const offset = [0, 0];
        offset[0] = coords[0] - rect.width / 2;
        offset[1] = coords[1] - rect.height / 2;
        labelsGeo.center([offset[0], offset[1]]);

        this.labelElements.push(textEl);
      }
      // TODO: 필요한건지 확인 필요
      labelsGeo.setAttribute(
        "position",
        new THREE.BufferAttribute(labelVertices, 3)
      );

      if (axisModel.get("name")) {
        const nameTextStyleModel = axisModel.getModel("nameTextStyle");
        const p = [0, 0, 0];
        const idx = dimIndicesMap[axis.dim];
        const otherIdx = dimIndicesMap[otherDim[axis.dim]];

        p[idx] = (extent[0] + extent[1]) / 2;
        p[otherIdx] = axisModel.get("nameGap");

        const textEl = createTextMesh(
          axisModel.get("name"),
          nameTextStyleModel.get("font"),
          1,
          nameTextStyleModel.get("color")
        );

        const coords = axisLabelSurface.add(textEl);
        const rect = textEl.getBoundingRect();
        const offset = [0, 0];
        offset[0] = coords[0] - rect.width / 2;
        offset[1] = coords[1] - rect.height / 2;
        labelsGeo.center([offset[0], offset[1]]);
        textEl.__idx = this.labelElements.length;
        this.nameLabelElement = textEl;
      }

      // axisLabelSurface.getTexture()가 무엇을 반환하는지 확인 필요, canvas 등의 HTML 요소이어야 함
      const texture = new THREE.Texture(axisLabelSurface.getTexture());
      // FIXME: uvScale 어떻게 적용되는지 모르겠음
      // const uvScale = axisLabelSurface.getCoordsScale();

      texture.needsUpdate = true;
      this.labelsMesh.material.setValues = {
        map: texture,
      };
    }
  }

  setSpriteAlign(textAlign, textVerticalAlign, api) {
    this.textAlign = textAlign;
    this.textVerticalAlign = textVerticalAlign;
  }
}

export default Grid3DAxis;
