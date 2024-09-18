const Base = require("../base");

const resource = "/rides";

export class Ride extends Base {
  createRide(): Promise<any> {
    return this.invoke(`${resource}/createRide`);
  }
  isMoving(): Promise<any> {
    return this.invoke(`${resource}/isMoving`);
  }
  updateRideStatus(): Promise<any> {
    return this.invoke(`${resource}/updateRideStatus`);
  }
  getRidersWithin(): Promise<any> {
    return this.invoke(`${resource}/getRidersWithin`);
  }
  getDistances(): Promise<any> {
    return this.invoke(`${resource}/getDistances`);
  }
}
