import * as echarts from "echarts";
import * as THREE from "three";
import "echarts-gl";
import exportGL2THREE from "./exportGL2THREE";
import { OrbitControls } from "three/examples/jsm/Addons.js";
// import getAxisCoord from "./utils/getAxisCoord";

const chartDom = document.getElementById("root");
var myChart = echarts.init(chartDom);
// prettier-ignore
myChart.setOption({
    grid3D: {},
    xAxis3D: {},
    yAxis3D: {},
    zAxis3D: {},
    series: [{
        type: 'scatter3D',
        symbolSize: 50,
        data: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]],
        itemStyle: {
            opacity: 1
        }
    }]
})

/**
 * The interface is different from queryComponents,
 * which is convenient for inner usage.
 *
 * var result = findComponents(
 *     {mainType: 'dataZoom', query: {dataZoomId: 'abc'}}
 * );
 * var result = findComponents(
 *     {mainType: 'series', subType: 'pie', query: {seriesName: 'uio'}}
 * );
 * var result = findComponents(
 *     {mainType: 'series',
 *     filter: function (model, index) {...}}
 * );
 * // result like [component0, componnet1, ...]
 */
const query = {
  mainType: "series",
};

const convertedObj = exportGL2THREE(echarts, myChart, query);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.y = 50;
camera.position.z = 200;
camera.updateProjectionMatrix();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const color = 0xffffff;
const light = new THREE.DirectionalLight(color, 3);
const ambient = new THREE.AmbientLight(0x404040, 2); // soft white light
light.position.set(0, 5, 10); // X, Y, Z 벡터 방향

scene.add(light);
scene.add(ambient);
scene.add(convertedObj);
console.log("converted", convertedObj);
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}

animate();

// renderer.render(scene, camera);
