import * as THREE from "three";

const convertEchart2Three = (chartInstance, query = {}) => {
  if (!query.mainType) {
    throw new Error("mainType is required.");
  }

  const model = chartInstance.getModel().queryComponents(query)[0];

  if (!model) {
    throw new Error("Unknown component. Please check your query.");
  }

  const coordSys = model.coordinateSystem;
  const view =
    query.mainType === "series"
      ? chartInstance.getViewOfSeriesModel(model)
      : chartInstance.getViewOfComponentModel(model);

  console.log(view);
  if (!view.__ecgl__) {
    throw new Error("exportEchart2Three only support GL components.");
  }

  const viewGL = (coordSys && coordSys.viewGL) || view.viewGL;
  const threeGroup = new THREE.Group();
  viewGL.scene.traverse((mesh) => {
    if (mesh.isRenderable() && mesh.geometry.vertexCount) {
      // Create BufferGeometry
      const geometry = mesh.geometry;
      const bufferGeometry = new THREE.BufferGeometry();
      for (const key in geometry.attributes) {
        const attr = geometry.attributes[key];
        if (attr && attr.value) {
          bufferGeometry.setAttribute(
            key,
            new THREE.BufferAttribute(attr.value, attr.size)
          );
        }
      }

      // Create ShaderMaterial
      const vertexShader = mesh.material.shader._vertexCode;
      let fragmentShader = mesh.material.shader._fragmentCode;
      const fragmentShaderLines = fragmentShader.split("\n");
      fragmentShaderLines.unshift("precision mediump float;"); // precision must be declared in the first line (compiling error)
      const uniforms = {};
      for (const key in mesh.material.uniforms) {
        const uniform = mesh.material.uniforms[key];
        uniforms[key] = {
          value: uniform.value,
        };
      }
      fragmentShader = fragmentShaderLines.join("\n");

      const material = new THREE.RawShaderMaterial({
        uniforms,
        vertexShader,
        fragmentShader,
      });

      // Create Mesh
      const threeMesh = new THREE.Mesh(bufferGeometry, material);
      threeGroup.add(threeMesh);
    }
  });
  return threeGroup;
};

export default convertEchart2Three;
