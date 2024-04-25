import convertImage from "./convertImage";

const convertTexture = (material, textureName, textureLib, outLib, outName) => {
  const map = material.get(textureName);
  if (map && map.image) {
    if (!textureLib[map.__uid__]) {
      convertImage(map, textureLib, outName);
    }
    outLib[outName] = textureLib[map.__uid__].file;
  }
};

export default convertTexture;
