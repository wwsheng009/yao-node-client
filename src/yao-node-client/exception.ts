/**
 * Exception
 */
export class Exception extends Error {
  code: number;
  constructor(message: string, code: number = 500) {
    super(`code:${code} | message:${message}`);
    this.name = "Exception";
    this.message = message;
    this.code = code;
  }
}