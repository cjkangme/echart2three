const convertImage = (map, textureLib, outName) => {
  const image = map.image;
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, image.width, image.height);

  textureLib.__count__ = textureLib.__count__ = {};
  let count = (textureLib.__count__[outName] =
    textureLib.__count__[outName] || 0);

  if (count > 0) {
    outName += outName + "_" + count;
  }
  textureLib.__count__[outName]++;
  textureLib[map.__uid__] = {
    data: canvas.toDataURL(),
    file: outName + ".png",
  };
};

export default convertImage;
