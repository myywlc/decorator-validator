import { Daruk, controller, DarukContext, DarukServer, post, Next, defineMiddleware, MiddlewareClass } from 'daruk';
import { validator, z } from '../../src/index'

@defineMiddleware('globalErrorCapture')
class GlobalErrorCapture implements MiddlewareClass {
  public initMiddleware(daruk: Daruk) {
    return async (ctx: DarukContext, next: Next) => {
      try {
        await next();
      } catch (err) {
        ctx.body = {
          success: false,
          msg: err.message,
        };
      }
    };
  }
}


@controller()
class HelloWorld {
  @validator({
    query: z.object({
      a: z.string(),
    }),
    body: z.object({
      b: z.number(),
    }),
    params: z.object({
      id: z.string(),
    }),
  })
  @post('/index/:id')
  public async index(ctx: DarukContext, next: Next) {
    console.log(ctx.query, 'ctx.query');
    console.log(ctx.request.body, 'ctx.request.body');
    console.log(ctx.params, 'ctx.params');
    ctx.body = 'hello world';
  }
}

(async () => {
  let app = DarukServer({
    middlewareOrder: ['globalErrorCapture'],
  });
  let port = 3000;
  await app.binding();
  app.listen(port);
  app.logger.info(`app listen port ${port}`);
})();
