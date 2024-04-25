import * as THREE from "three";
import getColorArray from "./getColorArray";

// TODO: Add more light types
const _lightMapping = (name) => {
  const mapping = {
    DIRECTIONAL_LIGHT: THREE.DirectionalLight,
    AMBIENT_LIGHT: THREE.AmbientLight,
  };

  if (!mapping[name]) {
    console.warn("Unknown light type: ", name);
  }

  return mapping[name];
};

const getLight = (clayLight, scene) => {
  const name = clayLight
    .get("name")
    .split("_")
    .slice(0, 2)
    .join("_")
    .toUpperCase();

  const Light = _lightMapping(name);
  const color = getColorArray(clayLight.get("color"));
  const intensity = clayLight.get("intensity");
  const position = clayLight.get("position")?.array;
  const scale = clayLight.get("scale")?.array;
  const target = clayLight.get("target")?.array;

  const light = new Light(color, intensity);

  if (light.isDirectionalLight) {
    light.position.set(...position);
    light.scale.set(...scale);

    const targetObj = new THREE.Object3D();
    target.position.set(...target);
    scene.add(targetObj); // For the target's position to be changed to anything other than the default, it must be added to the scene using
    light.target = target;
  }

  return light;
};

export default getLight;
