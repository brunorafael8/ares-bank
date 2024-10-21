import { Request, Context } from "koa";
import { DataLoaders, getDataloaders } from "../modules/loader/loaderRegister";
import { IUser } from "../modules/user/UserModel";

export type ContextVars = {
  user?: IUser | null;
  req?: Request;
  koaContext: Context;
  setCookie: (cookieName: string, token: string) => void;
};

export type GraphQLContext = {
  user?: IUser;
  dataloaders: DataLoaders;
};

const getContext = (ctx: ContextVars) => {
  const dataloaders = getDataloaders();

  return {
    req: ctx.req,
    dataloaders,
    user: ctx.user,
    koaContext: ctx.koaContext,
    setCookie: ctx.setCookie,
  } as GraphQLContext;
};

export { getContext };
