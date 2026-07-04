/**
 * Base class for every error thrown by Yasuo.
 *
 * Catching {@link YasuoError} lets you distinguish failures originating from
 * this library from any other error in your application.
 */
export class YasuoError extends Error {
  constructor(message: string) {
    super(message)
    this.name = new.target.name
    // Restore the prototype chain so `instanceof` works after transpilation
    // to ES5/CJS and across bundle boundaries.
    Object.setPrototypeOf(this, new.target.prototype)
  }
}
