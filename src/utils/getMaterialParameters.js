import convertTexture from "./convertTexture";

const _getColorArray = (color) => {
  if (color) {
    return color.slice(0, 3).map((c) => c * 255);
  }
  return [255, 255, 255];
};

const _phongFromRoughness = (r) => {
  if (r == null) {
    r = 1;
  }
  return Math.pow(1000.0, 1 - r);
};

// 텍스처 관련 코드는 현재 제외함
const getMaterialParameters = (material, textureLib) => {
  const obj = {};
  obj.color = _getColorArray(material.get("color"));
  obj.specular = _getColorArray(material.get("specular"));
  obj.roughness = _phongFromRoughness(material.get("roughness"));
  convertTexture(material, "diffuseMap", textureLib, obj, "diffuseMap");
  convertTexture(material, "roughnessMap", textureLib, obj, "map_Pr");
  convertTexture(material, "metalnessMap", textureLib, obj, "map_Pm");

  return obj;
};

export default getMaterialParameters;
