export class ValidationException extends Error {
  public readonly statusCode = 400

  constructor(message: string = 'Validation failed') {
    super(message)
    this.name = 'ValidationException'
    Object.setPrototypeOf(this, ValidationException.prototype)
  }
}
