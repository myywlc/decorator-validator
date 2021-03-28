import { DarukContext, Next } from 'daruk';

export * as z from 'zod';

const errorCode = {
  VALIDATION: {
    CODE: 'VALIDATION',
    STATUS: 400,
  },
};

class BaseError extends Error {
  constructor(message: any) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
  }
}

class ValidationError extends BaseError {
  private status: number;
  private code: string;
  private data: any;
  private errors: any;
  constructor(message: any, errors: any, data?: any, code = errorCode.VALIDATION.CODE) {
    super(message);
    console.log(errors, 'errors');
    this.name = 'ValidationError';
    this.status = 400;
    this.code = code;
    this.data = data;
    this.errors = errors;
  }
}

export function validator(validatorConfig: any): any {
  return (target: Object, propertyKey: string, descriptor: PropertyDescriptor) => {
    const { query, body, params } = validatorConfig;
    const validate = async (ctx: DarukContext) => {
      const validateQuery = (query) ? (await query.parse(ctx.query)) : true;
      const validateBody = (body) ? (await body.parse(ctx.request.body)) : true;
      const validateParams = (params) ? (await params.parse(ctx.params)) : true;
      if (validateQuery && validateBody && validateParams) {

      } else {
        throw new ValidationError('User Input Validate Error', {
          validateQuery,
          validateBody,
          validateParams,
        });
      }
    };
    let oldDescriptor = descriptor.value;
    descriptor.value = async function (...args) {
      await validate(args[0]);
      await oldDescriptor(...args);
    };
    return descriptor;
  };
}
