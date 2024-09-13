const Base = require("../base");

const resource = "/drivers";

export class Driver extends Base {
  getDriver(): Promise<any> {
    return this.invoke(`${resource}/getDrivers`);
  }
  getDriversWithin(): Promise<any> {
    return this.invoke(`${resource}/getDriversWithin`);
  }
  getDriversWithinRadius(): Promise<any> {
    return this.invoke(`${resource}/getDriversWithinRadius`);
  }
  createDriverDetails(): Promise<any> {
    return this.invoke(`${resource}/createDriverDetails`);
  }
}
