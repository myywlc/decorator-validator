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

type RefineParams = {
  // override error message
  message?: string;
  // appended to error path
  path?: (string | number)[];
  // params object you can use to customize message
  // in error map
  params?: object;
};

type ValidatorConfig = {
  query?: any, body?: any, params?: any
}

export function validator(validatorConfig: ValidatorConfig): any {
  return (_target: Object, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const { query, body, params } = validatorConfig;
    const validate = async (ctx: DarukContext) => {
      const validateQuery: RefineParams = (query) ? (await query.parse(ctx.query)) : true;
      const validateBody: RefineParams = (body) ? (await body.parse(ctx.request.body)) : true;
      const validateParams: RefineParams = (params) ? (await params.parse(ctx.params)) : true;
      if (validateQuery && validateBody && validateParams) {

      } else {
        throw new ValidationError('User Input Validate Error', {
          validateQuery,
          validateBody,
          validateParams,
        });
      }
    };

    const targetFunc = descriptor.value;
    descriptor.value = async function (...args: DarukContext[]) {
      await validate(args[0]);
      await targetFunc(...args);
    };
    return descriptor;
  };
}
