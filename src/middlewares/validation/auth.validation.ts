import { Request, Response, NextFunction } from "express";
import { ErrorWithStatus } from "../ErrorHandler";
import { ClientErrorStatus } from "../../utils/errorStatusCode";
import { ZodSchema, ZodError } from "zod";
import { authErrorMessages } from "../../utils/errorMessages";

const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the body using Zod schema
      const value = schema.parse(req.body);
      req.body = value;
      next();
    } catch (error: any) {
      const validationErrorDetail: string[] = [];

      //zod need issues to access its error info
      if (error instanceof ZodError) {
        error.issues.forEach((issue) => {
          validationErrorDetail.push(issue.message);
        });
      }
      const err: ErrorWithStatus = new Error(authErrorMessages.VALIDATION_FAIL);
      err.status = ClientErrorStatus.NOT_ACCEPTABLE;
      err.details = validationErrorDetail;

      next(err);
    }
  };
};

export default validateBody;