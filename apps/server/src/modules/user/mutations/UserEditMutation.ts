import { GraphQLString } from "graphql";
import { mutationWithClientMutationId } from "graphql-relay";

import { errorField, successField } from "@entria/graphql-mongo-helpers";

import * as UserLoader from "../UserLoader";
import UserModel from "../UserModel";
import UserType from "../UserType";
import { z } from "zod";
import { userEditSchema } from "./zodSchemas";

export default mutationWithClientMutationId({
  name: "UserEdit",
  description: "Edit user",
  inputFields: {
    name: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
    phone: {
      type: GraphQLString,
    },
    date_of_birth: {
      type: GraphQLString,
    },
    country: {
      type: GraphQLString,
    },
  },
  mutateAndGetPayload: async (
    args: { name: string; email: string; phone: string; date_of_birth: string, country: string },
    context
  ): Promise<{
    success: string;
    id: string;
    error?: undefined;
  }> => {
    try {
      const { phone, date_of_birth, name, country } = userEditSchema.parse(args);
      const token = context.user?._id;

      if (!token) {
        return {
          // @ts-ignore
          error: "Unauthorized user",
        };
      }

      const user = await UserModel.findOneAndUpdate(
        {
          _id: token,
        },
        {
          name,
          phone,
          date_of_birth,
          country
        }
      );

      const defaultErrorMessage = "Failed to edit user";

      if (!user) {
        return {
          // @ts-ignore
          error: defaultErrorMessage as string,
        };
      }

      return {
        id: user?._id,
        success: `User ${name} edited successfully`,
      };
    } catch (e) {
      if (e instanceof z.ZodError) {
        throw new Error("Validation error:" + e.errors[0].message);
      }

      throw new Error("Failed to create user, " + (e as Error).message);
    }
  },
  // @ts-ignore
  outputFields: {
    me: {
      type: UserType,
      resolve: async ({ id }: any, _, context) => {
        return await UserLoader.load(context, id);
      },
    },
    ...errorField,
    ...successField,
  },
});
