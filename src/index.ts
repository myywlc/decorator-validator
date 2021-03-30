import { DarukContext } from 'daruk';
import zod from 'zod';

export const z = zod;

type ErrDetail = {
  code: string,
  expected: string,
  received: string,
  path: [],
  message: string,
}

type RefineParams = {
  success: boolean,
  data?: object,
  error?: {
    errors: ErrDetail[],
  },
};

type ValidatorConfig = {
  query?: any, body?: any, params?: any
}

export function validator(validatorConfig: ValidatorConfig): any {
  return (_target: Object, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const { query, body, params } = validatorConfig;
    const validate = async (ctx: DarukContext) => {
      const ERR_INFO: string[] = [];
      if (params) {
        const validateParams: RefineParams = await params.safeParse(ctx.params);
        if (!validateParams.success) ERR_INFO.push(`params data validator error: ${validateParams.error?.errors.reduce((accumulator, item) => accumulator + `, ${item.path.join('-')} (${item.message})`, '')}`);
      }

      if (query) {
        const validateQuery: RefineParams = await query.safeParse(ctx.query);
        if (!validateQuery.success) ERR_INFO.push(`query data validator error: ${validateQuery.error?.errors.reduce((accumulator, item) => accumulator + `, ${item.path.join('-')} (${item.message})`, '')}`);
      }

      if (body) {
        const validateBody: RefineParams = await body.safeParse(ctx.request.body);
        if (!validateBody.success) ERR_INFO.push(`body data validator error: ${validateBody.error?.errors.reduce((accumulator, item) => accumulator + `, ${item.path.join('-')} (${item.message})`, '')}`);
      }

      if (ERR_INFO.length > 0) {
        throw new Error(ERR_INFO.join('; '));
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

export default {
  validator,
  z,
}
