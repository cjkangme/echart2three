import * as THREE from "three";
import convertMesh from "./utils/object/convertMesh";
import convertLine from "./utils/object/convertLine";
import convertLabels from "./utils/object/convertLabels";

const exportGL2THREE = (echarts, chartInstance, componentQuery) => {
  const group = new THREE.Group(); // Create a group to hold the meshes
  const componentModel = chartInstance
    .getModel()
    .queryComponents(componentQuery)[0];

  if (!componentModel) {
    throw new Error("Unkown component.");
  }

  const coordSys = componentModel.coordinateSystem;
  const view =
    componentQuery.mainType === "series"
      ? chartInstance.getViewOfSeriesModel(componentModel)
      : chartInstance.getViewOfComponentModel(componentModel);

  if (!view.__ecgl__) {
    throw new Error("exportGL2THREE only support GL components.");
  }

  const viewGL = (coordSys && coordSys.viewGL) || view.viewGL;

  for (const dim of ["x", "y", "z"]) {
    const textGroup = convertLabels(coordSys, dim);
    group.add(textGroup);
  }

  viewGL.scene.traverse((mesh) => {
    if (mesh.isRenderable() && mesh.geometry.vertexCount) {
      const meshType = mesh.material.shader.name.split(".")[1];

      switch (meshType) {
        case "color":
          group.add(convertMesh(mesh));
          break;
        case "meshLines3D":
          group.add(convertLine(mesh));
          break;
        case "labels":
          break;
        default:
          console.log("Unsupported mesh type: ", meshType);
      }
    }
  });
  return group;
};

export default exportGL2THREE;
