import { GraphQLString, GraphQLNonNull, GraphQLBoolean } from "graphql";
import { mutationWithClientMutationId } from "graphql-relay";
import { date, z } from "zod";
import { errorField, successField } from "@entria/graphql-mongo-helpers";
import { generateToken } from "../../../auth";

import UserModel from "../UserModel";

import UserType from "../UserType";
import * as UserLoader from "../UserLoader";
import { config } from "../../../config";
import { userSchema } from "./zodSchemas";

export default mutationWithClientMutationId({
  name: "UserRegisterWithEmail",
  description: "Register user with email",
  inputFields: {
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
    },
    isAdmin: {
      type: GraphQLBoolean,
    }
  },
  mutateAndGetPayload: async (args, context) => {
    try {
      const { name, email, password } = userSchema.parse(args);

      const hasUser =
        (await UserModel.countDocuments({
          email: email.trim().toLowerCase(),
        })) > 0;

      if (hasUser) {
        return {
          error: "Email already in use !",
        };
      }

      const user = await new UserModel({
        name,
        email,
        password,
        isAdmin: args.isAdmin || false,
      }).save();

      const token = generateToken(user);

      context.setCookie(config.TRAVELS_COOKIE, token);

      return {
        token,
        id: user._id,
        success: "User registered with success",
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
