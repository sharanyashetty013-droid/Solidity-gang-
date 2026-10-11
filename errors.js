export class AppError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}
export const bad = (code, msg) => new AppError(400, code, msg);
export const unauthorized = (code, msg) => new AppError(401, code, msg);
export const forbidden = (code, msg) => new AppError(403, code, msg);
export const notFound = (code, msg) => new AppError(404, code, msg);
export const conflict = (code, msg) => new AppError(409, code, msg);
