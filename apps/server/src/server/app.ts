import "isomorphic-fetch";
import Koa, { Context } from "koa";
import Router from "koa-router";
import logger from "koa-logger";
import cors from "kcors";
import bodyParser from "koa-bodyparser";
import koaPlayground from "graphql-playground-middleware-koa";

import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  sendResult,
  shouldRenderGraphiQL,
} from "graphql-helix";

import { schema } from "../schema/schema";
import { getUser } from "../auth";
import { getContext } from "./getContext";

const router = new Router();

const app = new Koa();

app.use(bodyParser());

app.on("error", (err) => {
  // eslint-disable-next-line
  console.log("app error: ", err);
});

app.use(logger());
app.use(cors());

export const setCookie =
  (context: Context) => (cookieName: string, token: string) => {
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "lax" as const,
      path: "/",
    };

    context.cookies.set(cookieName, token, options);
  };

router.get("/", async (ctx) => {
  ctx.body = "Welcome";
});

router.all(
  "/graphiql",
  koaPlayground({
    endpoint: "/graphql",
    subscriptionEndpoint: "/subscriptions",
  })
);

router.all("/graphql", async (ctx) => {
  const { user } = await getUser(ctx.header.authorization);
  const request = {
    body: ctx.request.body,
    headers: ctx.req.headers,
    method: ctx.request.method,
    query: ctx.request.query,
  };

  if (shouldRenderGraphiQL(request)) {
    ctx.body = renderGraphiQL({});
  } else {
    const { operationName, query, variables } = getGraphQLParameters(request);

    const result = await processRequest({
      operationName,
      query,
      variables,
      request,
      schema,
      contextFactory: () => {
        return getContext({
          req: request,
          user,
          setCookie: setCookie(ctx),
        });
      },
    });

    ctx.respond = false;
    sendResult(result, ctx.res);
  }
});

app.use(router.routes()).use(router.allowedMethods());

export default app;
