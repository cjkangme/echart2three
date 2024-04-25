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
var hours = ['12a', '1a', '2a', '3a', '4a', '5a', '6a',
    '7a', '8a', '9a', '10a', '11a',
    '12p', '1p', '2p', '3p', '4p', '5p',
    '6p', '7p', '8p', '9p', '10p', '11p'];
// prettier-ignore
var days = ['Saturday', 'Friday', 'Thursday',
    'Wednesday', 'Tuesday', 'Monday', 'Sunday'];
// prettier-ignore
var data = [[0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]];
const option = {
  tooltip: {},
  visualMap: {
    max: 20,
    inRange: {
      color: [
        "#313695",
        "#4575b4",
        "#74add1",
        "#abd9e9",
        "#e0f3f8",
        "#ffffbf",
        "#fee090",
        "#fdae61",
        "#f46d43",
        "#d73027",
        "#a50026",
      ],
    },
  },
  xAxis3D: {
    type: "category",
    data: hours,
  },
  yAxis3D: {
    type: "category",
    data: days,
  },
  zAxis3D: {
    type: "value",
  },
  grid3D: {
    boxWidth: 200,
    boxDepth: 80,
    light: {
      main: {
        intensity: 1,
      },
      ambient: {
        intensity: 0.3,
      },
    },
  },
  series: [
    {
      type: "bar3D",
      data: data.map(function (item) {
        return {
          value: [item[1], item[0], item[2]],
        };
      }),
      shading: "color",
      label: {
        show: false,
        fontSize: 16,
        borderWidth: 1,
      },
      itemStyle: {
        opacity: 0.4,
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
myChart.setOption(option);

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
  object.position.set(200, 0, 0);
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
const intensity = 1;
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
const indices = [
  0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 5, 4, 0, 5, 0, 3, 1, 7, 6, 1, 6, 2, 3, 2,
  6, 3, 6, 5, 0, 1, 7, 0, 7, 4,
];

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
