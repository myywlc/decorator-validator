# decorator-validator

decorator-validator 是基于 [zod](https://github.com/colinhacks/zod) 开发的http params 验证装饰器

# Installation

To install the latest version:

```sh
npm install --save decorator-validator
```

```sh
yarn add decorator-validator
```

# Usage

## validator http params objects data

```ts
import { Daruk, controller, DarukContext, DarukServer, post, Next, defineMiddleware, MiddlewareClass } from 'daruk';
import { validator, z } from 'decorator-validator';

@controller()
class HelloWorld {

  // 验证信息需要koa框架全局错误中间件收集
  @validator({
    query: z.object({
      a: z.string(),
      c: z.string().regex(/^\d+$/, { message: "is not num" }),
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
```
