import * as XLSX from "xlsx";
import * as echart from "echarts";
import "echarts-gl";
import Axis from "../class/Axis";
import EchartOption from "../class/EchartOption";
import exportGL2THREE from "../../exportGL2THREE";

const xAxis = new Axis({ dataType: "category", name: "x" });
const yAxis = new Axis({ dataType: "category", name: "y" });
const zAxis = new Axis({ dataType: "value", name: "z" });

const excel2json = (file, setMesh) => {
  const reader = new FileReader();
  reader.readAsArrayBuffer(file);
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet);

    const Option = new EchartOption({
      type: "bar3D",
      data: json,
      xAxis,
      yAxis,
      zAxis,
    });
    const option = Option.makeEchartOption();

    const chartDom = document.createElement("div");
    chartDom.style.width = "100%";
    chartDom.style.height = "100%";
    chartDom.style.position = "absolute";
    chartDom.style.visibility = "hidden";
    const myChart = echart.init(chartDom);
    myChart.setOption(option);
    document.body.appendChild(chartDom);

    const query = {
      mainType: "series",
    };
    const mesh = exportGL2THREE(echart, myChart, query);
    setMesh(mesh);
    console.log(mesh);
    document.body.removeChild(chartDom);
  };
};

export default excel2json;
