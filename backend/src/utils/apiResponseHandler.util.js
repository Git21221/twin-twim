// A simple class to handle API response with status code, message, and data.

class apiResponseHandler {
  constructor(statusCode, message, data) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export { apiResponseHandler };