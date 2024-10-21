import { GraphQLString, GraphQLNonNull, GraphQLBoolean } from "graphql";
import { mutationWithClientMutationId } from "graphql-relay";

import { errorField, successField } from "@entria/graphql-mongo-helpers";

import { generateToken } from "../../../auth";

import UserModel from "../UserModel";

import * as UserLoader from "../UserLoader";
import UserType from "../UserType";
import { config } from "../../../config";
import { userLoginSchema } from "./zodSchemas";
import { z } from "zod";

export default mutationWithClientMutationId({
  name: "UserLoginWithEmail",
  description: "Login user with email",
  inputFields: {
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    },
    loginForAdmin: {
      type: GraphQLBoolean,
    },
  },
  mutateAndGetPayload: async (
    args,
    context
  ): Promise<{
    token: string;
    id: any;
    success: string;
    error?: undefined;
  }> => {
    try {
      const { password, email, loginForAdmin } = userLoginSchema.parse(args);
      let user = null;

      if (loginForAdmin) {
        user = await UserModel.findOne({
          email: email.trim().toLowerCase(),
          isAdmin: loginForAdmin || false,
        });
      } else {
        user = await UserModel.findOne({
          email: email.trim().toLowerCase(),
        });
      }

      const defaultErrorMessage = "Invalid credentials";
      if (!user) {
        return {
          // @ts-ignore
          error: defaultErrorMessage as string,
        };
      }

      const correctPassword = user.authenticate(password);

      if (!correctPassword) {
        return {
          // @ts-ignore
          error: defaultErrorMessage,
        };
      }

      const token = generateToken(user);

      context.setCookie(config.TRAVELS_COOKIE, token);

      return {
        token: generateToken(user),
        id: user._id,
        success: "Logged with success",
      };
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new Error("Validation error:" + e.errors[0].message);
      }

      throw new Error("Failed to create user, " + (e as Error).message);
    }
  },
  outputFields: {
    token: {
      type: GraphQLString,
      resolve: ({ token }: any) => token,
    },
    me: {
      type: UserType,
      resolve: async ({ id }, _, context) => {
        return await UserLoader.load(context, id);
      },
    },
    ...errorField,
    ...successField,
  },
});
