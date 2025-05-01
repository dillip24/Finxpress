class apiError extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    error = [],
    statck = ""
  ) {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.error = error;
    this.statck = statck;
  }
}

export { apiError };