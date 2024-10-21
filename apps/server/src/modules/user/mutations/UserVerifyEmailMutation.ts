import { GraphQLString, GraphQLNonNull } from "graphql";
import { mutationWithClientMutationId } from "graphql-relay";

import { errorField, successField } from "@entria/graphql-mongo-helpers";

import { generateToken } from "../../../auth";

import UserModel from "../UserModel";

import { config } from "../../../config";
import { userVerifySchema } from "./zodSchemas";
import { z } from "zod";

export default mutationWithClientMutationId({
  name: "UserVerifyEmail",
  description: "Verify user email",
  inputFields: {
    email: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  mutateAndGetPayload: async (
    args,
    context
  ): Promise<{ email: string; nextStep: any }> => {
    try {
      const { email } = userVerifySchema.parse(args);

      const user = await UserModel.findOne({
        email: email.trim().toLowerCase(),
      });

      if (!user) {
        return {
          email: email,
          nextStep: "REGISTER",
        };
      }

      const token = generateToken(user);
      
      context.setCookie(config.TRAVELS_COOKIE, token);

      return {
        email: user.email,
        nextStep: "SIGN_IN",
      };
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new Error("Validation error:" + e.errors[0].message);
      }

      throw new Error("Failed to create user, " + (e as Error).message);
    }
  },
  outputFields: {
    email: {
      type: GraphQLString,
      resolve: ({ email }: any) => email,
    },
    nextStep: {
      type: GraphQLString,
      resolve: ({ nextStep }: any) => nextStep,
    },
    ...errorField,
  },
});
