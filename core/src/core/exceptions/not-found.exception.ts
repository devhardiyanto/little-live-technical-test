export class NotFoundException extends Error {
  public readonly statusCode = 404

  constructor(message: string = 'Resource not found') {
    super(message)
    this.name = 'NotFoundException'
    Object.setPrototypeOf(this, NotFoundException.prototype)
  }
}
