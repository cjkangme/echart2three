import * as echarts from "echarts";
import * as THREE from "three";
import "echarts-gl";
import exportGL2THREE from "./exportGL2THREE";
import exportGL2OBJ from "./exportGL2OBJ";
import { OBJLoader } from "three/examples/jsm/Addons.js";
import { OrbitControls } from "three/examples/jsm/Addons.js";
// import getAxisCoord from "./utils/getAxisCoord";

function dataUrlToBlob(strUrl) {
  var parts = strUrl.split(/[:;,]/),
    type = parts[1],
    decoder = parts[2] == "base64" ? atob : decodeURIComponent,
    binData = decoder(parts.pop()),
    mx = binData.length,
    i = 0,
    uiArr = new Uint8Array(mx);

  for (i; i < mx; ++i) uiArr[i] = binData.charCodeAt(i);

  return new myBlob([uiArr], { type: type });
}

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
var payload = exportGL2OBJ(echarts, myChart, query);

let myBlob = self.Blob || self.MozBlob || self.WebKitBlob || toString;
myBlob = myBlob.call ? myBlob.bind(self) : Blob;

// const { obj, mtl, texture, coordSys } = payload;
payload = dataUrlToBlob(payload.obj);
const mimeType = "application/octet-stream";

const blob =
  payload instanceof myBlob
    ? payload
    : new myBlob([payload], { type: mimeType });

const loader = new OBJLoader();

loader.load(URL.createObjectURL(blob), function (object) {
  object.position.set(250, 0, 0);
  console.log("obj", object);
  scene.add(object);
  renderer.render(scene, camera);
});

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

const vertices = new THREE.Float32BufferAttribute(
  [
    // front
    -1, -1, 1, 1, -1, 1, -1, 1, 1, -1, 1, 1, 1, -1, 1, 1, 1, 1,
    // back
    1, -1, -1, -1, -1, -1, 1, 1, -1, 1, 1, -1, -1, -1, -1, -1, 1, -1,
    // left
    -1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1, -1, -1, -1, 1, -1, 1, 1,
    // right
    1, -1, 1, 1, -1, -1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, 1, -1,
    // top
    1, 1, -1, -1, 1, -1, 1, 1, 1, 1, 1, 1, -1, 1, -1, -1, 1, 1,
    // bottom
    1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1, -1, -1, -1, 1, -1, -1, -1,
  ],
  3
);
const geometry = new THREE.BufferGeometry();
geometry.setAttribute("position", vertices);

// geometry.setIndex(indices);
const material = new THREE.MeshPhongMaterial({
  color: 0x156289,
});
geometry.computeVertexNormals();
const mesh = new THREE.Mesh(geometry, material);
mesh.position.set(-200, 0, 0);
mesh.scale.set(100, 100, 100);
scene.add(mesh);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshPhongMaterial({ color: 0x00ff00 })
);
cube.scale.set(100, 100, 100);
cube.position.set(-400, 0, 0);
scene.add(cube);

animate();

// renderer.render(scene, camera);
