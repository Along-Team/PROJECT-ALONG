const Base = require("../base");

const resource = "/ratings";

export class Rating extends Base {
  getReview(): Promise<any> {
    return this.invoke(`${resource}/getReview`);
  }
  createReview(): Promise<any> {
    return this.invoke(`${resource}/createReview`);
  }
  updateReview(): Promise<any> {
    return this.invoke(`${resource}/updateReview`);
  }
  deleteReview(): Promise<any> {
    return this.invoke(`${resource}/deleteReview`);
  }
  getALLReviews(): Promise<any> {
    return this.invoke(`${resource}/getALLReviews`);
  }
  setTourUserIds(): Promise<any> {
    return this.invoke(`${resource}/setTourUserIds`);
  }
}
