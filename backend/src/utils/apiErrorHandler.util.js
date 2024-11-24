// Desc: API Error Handler
// extends Error class to create custom error handler with status code, message, name.

class apiErrorHandler extends Error {
  constructor(code, message) {
    super();
    this.name = this.constructor.name;
    this.statusCode = code;
    this.message = message;
  }
}

export { apiErrorHandler };