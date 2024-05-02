class EchartOption {
  constructor({ type, data, xAxis, yAxis, zAxis }) {
    this.type = type;
    this.data = data;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.zAxis = zAxis;

    this.keys = [xAxis.name, yAxis.name, zAxis.name];
  }

  makeEchartOption() {
    return {
      xAxis3D: {
        type: this.xAxis.dataType,
        data: this.xAxis.data,
      },
      yAxis3D: {
        type: this.yAxis.dataType,
        data: this.yAxis.data,
      },
      zAxis3D: {
        type: this.zAxis.dataType,
      },
      grid3D: {
        boxWidth: 200,
        boxDepth: 80,
      },
      series: [
        {
          type: this.type,
          data: this.data.map((item) => {
            const data = [];
            for (const key of this.keys) {
              data.push(item[key]);
            }
            return data;
          }),
          label: {
            fontSize: 16,
            borderWidth: 1,
          },
          emphasis: {
            label: {
              fontSize: 20,
              color: "#900",
            },
            itemStyle: {
              color: "#900",
            },
          },
        },
      ],
    };
  }
}

export default EchartOption;
