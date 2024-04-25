const textureFromVertexColor = (geometry) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const colorAttr = geometry.attributes.color;
  const texcoordAttr = geometry.attributes.texcoord0;

  const width = Math.round(Math.sqrt(geometry.vertexCount));
  const height = Math.ceil(geometry.vertexCount / width);

  canvas.width = width;
  canvas.height = height;
  const imgData = ctx.createImageData(width, height);

  const col = [];
  let texcoordsArr = texcoordAttr && texcoordAttr.value;

  if (!texcoordsArr) {
    texcoordsArr = new Float32Array(geometry.vertexCount * 2);
    for (let i = 0; i < geometry.vertexCount; i++) {
      const x = i % width;
      const y = Math.floor(i / width);
      texcoordsArr[i * 2] = x / (width - 1);
      texcoordsArr[i * 2 + 1] = y / (height - 1);
    }
  }
  for (let i = 0; i < geometry.vertexCount; i++) {
    colorAttr.get(i, col);
    if (col[3] == null) {
      col[3] = 1;
    }

    const x = i % width;
    const y = height - 1 - Math.floor(i / width);

    const idx4 = (y * width + x) * 4;
    for (let k = 0; k < 4; k++) {
      imgData.data[idx4 + k] = col[k] * 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return {
    image: canvas,
    texcoords: texcoordsArr,
  };
};

export default textureFromVertexColor;
