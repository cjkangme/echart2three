const getColorArray = (color) => {
  if (color) {
    return color.slice(0, 3).map((c) => c * 255);
  }
  return [255, 255, 255];
};

export default getColorArray;
