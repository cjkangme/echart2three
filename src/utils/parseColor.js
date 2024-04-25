import * as echarts from "echarts";

const parseColor = (colorStr, rgba) => {
  if (colorStr instanceof Array) {
    if (!rgba) {
      rgba = [];
    }

    rgba[0] = colorStr[0];
    rgba[1] = colorStr[1];
    rgba[2] = colorStr[2];
    if (colorStr.length === 3) {
      rgba[3] = 1;
    } else {
      rgba[3] = colorStr[3];
    }
    return rgba;
  }
  rgba = echarts.color.parse(colorStr || "#000", rgba) || [0, 0, 0, 0];
  rgba[0] /= 255;
  rgba[1] /= 255;
  rgba[2] /= 255;
  return rgba;
};

export default parseColor;
