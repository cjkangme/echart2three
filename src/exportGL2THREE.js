import * as THREE from "three";
import convertLine from "./utils/object/convertLine";
import convertLabels from "./utils/object/convertLabels";
import convertMeshNoIndex from "./utils/object/convertMeshNoIndex";
import convertSprite2Sphere from "./utils/object/convertSprite2Sphere";

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
          group.add(convertMeshNoIndex(mesh));
          break;
        case "meshLines3D":
          group.add(convertLine(mesh));
          break;
        case "sdfSprite":
          group.add(convertSprite2Sphere(mesh));
          break;
        // labels는 앞 단계에서 별도로 만들어서 넣어줌
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
