class Axis {
  constructor({ dataType, data, name }) {
    this.dataType = dataType;
    this.data = data ?? null;
    this.name = name ?? null;
  }

  setDataType(dataType) {
    this.dataType = dataType;
  }

  setData(data) {
    this.data = data;
  }

  setName(name) {
    this.name = name;
  }
}

export default Axis;
