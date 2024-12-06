// utils/idgenerator.js
const { v4: uuidv4 } = require("uuid");

class Route {
  constructor(name) {
    this.name = name;
    this.routeno = this.routeNo(); // Call the routeNo method directly
  }

  routeNo() {
    // Generate a UUID, strip hyphens, and take only 7 characters after "rut"
    return `rut${uuidv4().replace(/-/g, "").slice(0, 7)}`;
  }

  getDetails() {
    return {
      name: this.name,
      routeno: this.routeno,
    };
  }
}

module.exports = Route;
