import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  // eslint-disable-next-line no-console
  console.error(err);
  const status = (err as { status?: number }).status ?? 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ message });
};

