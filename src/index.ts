import { DarukContext } from 'daruk';

export * as z from 'zod';

class BaseError extends Error {
  constructor(message: any) {
    super(message);
    this.message = message;
  }
}

class ValidationError extends BaseError {
  constructor(message: any, errors: any) {
    super(message);
    console.log(errors, 'errors');
    this.name = 'ValidationError';
  }
}

export function validator(validatorConfig: any): any {
  return (_target: Object, _propertyKey: string, descriptor: PropertyDescriptor) => {
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
    descriptor.value = async function (...args: DarukContext[]) {
      await validate(args[0]);
      await oldDescriptor(...args);
    };
    return descriptor;
  };
}
