export class AppError extends Error {
  constructor(
    public readonly status_code: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}
