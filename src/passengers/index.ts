const Base = require("../base");

const resource = "/passengers";

export class Passenger extends Base {
  signToken(): Promise<any> {
    return this.invoke(`${resource}/signToken`);
  }
  createSendToken(): Promise<any> {
    return this.invoke(`${resource}/createSendToken`);
  }
  signUp(): Promise<any> {
    return this.invoke(`${resource}/signUp`);
  }
  verifyContact(): Promise<any> {
    return this.invoke(`${resource}/verifyContact`);
  }
  login(): Promise<any> {
    return this.invoke(`${resource}/login`);
  }
  protect(): Promise<any> {
    return this.invoke(`${resource}/protect`);
  }
  forgotPassword(): Promise<any> {
    return this.invoke(`${resource}/forgotPassword`);
  }
  resetPassword(): Promise<any> {
    return this.invoke(`${resource}/resetPassword`);
  }
  updatePassenger(): Promise<any> {
    return this.invoke(`${resource}/updatePassenger`);
  }
}
