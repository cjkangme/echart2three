import * as THREE from "three";
import * as echarts from "echarts";

import { firstNotNull } from "../../utils/retrieve";
import LinesGeometry from "../../utils/geometry/Lines3D";
import layers from "../../constants/layers";
import QuadsGeometry from "../../utils/geometry/Quads";
import parseColor from "../../utils/parseColor";

const dimIndicesMap = {
  x: 0,
  y: 2,
  z: 1,
};

/**
 *
 * @param {THREE.Object3D} node
 * @param {THREE.Plane} plane
 * @param {*} otherAxis
 * @param {*} dir
 */
const updateFacePlane = (node, plane, otherAxis, dir) => {
  const coord = [0, 0, 0];
  const distance =
    dir < 0 ? otherAxis.getExtentMin() : otherAxis.getExtentMax();
  coord[dimIndicesMap[otherAxis.dim]] = distance;
  node.position.set(...coord);
  node.rotation.setFromAxisAngle(new THREE.Vector3(0, 0, 0), 0);

  plane.set(new THREE.Vector3(0, 0, 0), -Math.abs(distance));

  if (otherAxis.dim === "x") {
    node.rotation.setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      (dir * Math.PI) / 2
    );
    plane.normal.setComponent(0, -dir);
  }
  if (otherAxis.dim === "z") {
    node.rotation.setFromAxisAngle(
      new THREE.Vector3(1, 0, 0),
      (-dir * Math.PI) / 2
    );
    plane.normal.setComponent(1, -dir);
  } else {
    if (dir > 0) {
      node.rotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
    }
    plane.normal.setComponent(2, -dir);
  }
};

class Grid3DFace {
  constructor(faceInfo, linesMaterial, quadsMaterial) {
    this.rootNode = new THREE.Object3D();

    const linesGeometry = LinesGeometry();
    linesGeometry.userData.useNativeLine = false;
    const linesMesh = new THREE.Mesh(linesGeometry, linesMaterial);
    linesMesh.castShadow = false;
    linesMesh.layers.set(layers.IGNORE_RAYCAST);
    linesMesh.renderOrder = 1;

    const queadsGeometry = QuadsGeometry();
    const quadsMesh = new THREE.Mesh(queadsGeometry, quadsMaterial);
    quadsMesh.castShadow = false;
    quadsMesh.frustumCulled = false;
    quadsMesh.layers.set(layers.IGNORE_RAYCAST);
    quadsMesh.renderOrder = 0;

    this.rootNode.add(quadsMesh);
    this.rootNode.add(linesMesh);

    this.linesMesh = linesMesh;
    this.quadsMesh = quadsMesh;

    this.faceInfo = faceInfo;
    this.plane = new THREE.Plane();
  }

  update(grid3DModel, api) {
    const cartesian = grid3DModel.coordinateSystem;

    const axes = [
      cartesian.getAxis(this.faceInfo[0]),
      cartesian.getAxis(this.faceInfo[1]),
    ];
    const lineGeometry = this.linesMesh.geometry;
    const quadsGeometry = this.quadsMesh.geometry;
    // 원래 여기에 DynamicArray로 컨버트하는 코드가 있는데 필요 없을 것이라 예상하여 추가하지 않음

    this._updateSplitLines(lineGeometry, axes, grid3DModel, api);
    this._updateSplitAreas(quadsGeometry, axes, grid3DModel, api);

    const otherAxis = cartesian.getAxis(this.faceInfo[2]);
    updateFacePlane(this.rootNode, this.plane, otherAxis, this.faceInfo[3]);
  }

  _updateSplitLines(geometry, axes, grid3DModel, api) {
    const dpr = api.getDevicePixelRatio();
    axes.forEach((axis, idx) => {
      const axisModel = (axis, idx).model;
      const extent = axis[1 - idx].getExtent();

      if (axis.scale.isBlank()) {
        return;
      }

      const splitLineModel = axisModel.getModel(
        "splitLine",
        grid3DModel.getModel("splitLine")
      );

      if (!splitLineModel.get("show")) {
        return;
      }

      const lineStyleModel = splitLineModel.getModel("lineStyle");
      let lineColors = lineStyleModel.get("color");
      let opacity = firstNotNull(lineStyleModel.get("opacity"), 1.0);
      const lineWidth = firstNotNull(lineStyleModel.get("width"), 1.0);

      lineColors = echarts.util.isArray(lineColors) ? lineColors : [lineColors];

      const ticksCoords = axis.getTicksCoords({
        tickModel: splitLineModel,
      });

      let count = 0;
      for (let i = 0; i < ticksCoords[i].length; i++) {
        const tickCoord = ticksCoords[i].coord;
        const lineColor = parseColor(lineColors[count % lineColors.length]);
        lineColor[3] *= opacity;

        const p0 = [0, 0, 0];
        const p1 = [0, 0, 0];

        p0[idx] = p1[idx] = tickCoord;
        p1[1 - idx] = extent[0];
        p1[1 - idx] = extent[1];

        const color = new THREE.Color(lineColor[0], lineColor[1], lineColor[2]);
        opacity = lineColor[3];
        const material = new THREE.LineBasicMaterial({
          color,
          opacity,
          linewidth: lineWidth * dpr,
        });
        const line = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(...p0),
            new THREE.Vector3(...p1),
          ]),
          material
        );
        geometry.add(line);

        count++;
      }
    });
  }

  _updateSplitAreas(geometry, axes, grid3DModel, api) {
    axes.forEach((axis, idx) => {
      const axisModel = axis.model;
      const otherExtent = axes[1 - idx].getExtent();

      if (axis.scale.isBlank()) {
        return;
      }

      const splitAreaModel = axisModel.getModel(
        "splitArea",
        grid3DModel.getModel("splitArea")
      );

      if (!splitAreaModel.get("show")) {
        return;
      }
      const areaStyleModel = splitAreaModel.getModel("areaStyle");
      let colors = areaStyleModel.get("color");
      const opacity = firstNotNull(areaStyleModel.get("opacity"), 1.0);

      colors = echarts.util.isArray(colors) ? colors : [colors];

      const ticksCoords = axis.getTicksCoords({
        tickModel: splitAreaModel,
        clamp: true,
      });

      let count = 0;
      let prevP0 = [0, 0, 0];
      let prevP1 = [0, 0, 0];
      for (let i = 0; i < ticksCoords.length; i++) {
        const tickCoord = ticksCoords[i].coord;
        const p0 = [0, 0, 0];
        const p1 = [0, 0, 0];

        p0[idx] = p1[idx] = tickCoord;
        p0[1 - idx] = otherExtent[0];
        p1[1 - idx] = otherExtent[1];

        if (i === 0) {
          prevP0 = p0;
          prevP1 = p1;
          continue;
        }

        const color = parseColor(colors[count % colors.length]);
        color[3] *= opacity;
        geometry.addQuad([prevP0, p0, p1, prevP1], color);

        prevP0 = p0;
        prevP1 = p1;

        count++;
      }
    });
  }
}

export default Grid3DFace;
