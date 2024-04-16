import { makeAutoObservable } from "mobx";

class Store {
  meshes = [];

  constructor() {
    makeAutoObservable(this);
  }

  getLength() {
    return this.meshes.length;
  }

  getMesh(index) {
    return this.meshes[index];
  }

  addMesh(mesh) {
    this.meshes.push(mesh);
  }
}

export default Store;
