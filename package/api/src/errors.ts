export class HttpError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(message: string) {
    super(message, 409);
    this.name = 'ConflictError';
  }
}
