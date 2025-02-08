const axios = require("axios");
require("dotenv").config();

// Genearate Access Token
// class ApiService {
//   constructor() {
//     this.baseUrl = process.env.BASE_URL;
//     this.apiKey = process.env.API_KEY;
//     this.secretKey = process.env.SECRET_KEY;
//     this.headers = {};
//     // this.authToken = null; // Store the token here
//   }

//   async getToken() {
//     if (!this.apiKey || !this.secretKey) {
//       throw new Error("API Key or Secret Key is missing");
//     }

//     const url = `${this.baseUrl}/api/v1/auth/login`;
//     const data = {};
//     // console.log(url);

//     this.headers.Authorization = `Basic ${Buffer.from(
//       `${this.apiKey}:${this.secretKey}`
//     ).toString("base64")}`;

//     try {
//       const response = await axios.post(url, data, { headers: this.headers });
//       //   this.authToken = response.data.token; // Store the token
//       //   return this.authToken; // Return the token
//       console.log(response.data);
//     } catch (e) {
//       console.error("Error fetching token:", e);
//       return null;
//     }
//   }

//   //   getAuthToken() {
//   //     return this.authToken; // Retrieve the stored token
//   //   }
// }

// module.exports = new ApiService();

class ApiService {
  constructor() {
    this.baseUrl = process.env.BASE_URL;
    this.apiKey = process.env.API_KEY;
    this.secretKey = process.env.SECRET_KEY;
    this.headers = {
      Authorization: `Basic ${Buffer.from(
        `${this.apiKey}:${this.secretKey}`
      ).toString("base64")}`,
    };
  }

  async getToken() {
    if (!this.apiKey || !this.secretKey) {
      throw new Error("API Key or Secret Key is missing");
    }

    const url = `${this.baseUrl}/api/v1/auth/login`;

    try {
      const response = await axios.post(url, {}, { headers: this.headers });

      if (
        response.data &&
        response.data.responseBody &&
        response.data.responseBody.accessToken
      ) {
        return response.data.responseBody.accessToken;
      } else {
        throw new Error("Invalid token response structure");
      }
    } catch (error) {
      console.error(
        "Error fetching token:",
        error.response ? error.response.data : error.message
      );
      throw new Error("Failed to get authentication token");
    }
  }
}

module.exports = new ApiService();
