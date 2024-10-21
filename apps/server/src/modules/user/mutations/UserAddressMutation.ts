import { GraphQLString, GraphQLNonNull } from "graphql";
import { mutationWithClientMutationId } from "graphql-relay";
import { z } from "zod";
import { errorField, successField } from "@entria/graphql-mongo-helpers";

import UserModel from "../UserModel";

import UserType from "../UserType";
import * as UserLoader from "../UserLoader";
import { userAddressSchema } from "./zodSchemas";

export default mutationWithClientMutationId({
  name: "UserAddress",
  description: "Edit user address",
  inputFields: {
    address: {
      type: new GraphQLNonNull(GraphQLString),
    },
    city: {
      type: new GraphQLNonNull(GraphQLString),
    },
    state: {
      type: new GraphQLNonNull(GraphQLString),
    },
    country: {
      type: new GraphQLNonNull(GraphQLString),
    },
    zip: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
  mutateAndGetPayload: async (
    args,
    context
  ): Promise<{
    success: string;
    id: string;
    error?: undefined;
  }> => {
    try {
      const token = context.user?._id;

      if (!token) {
        return {
          // @ts-ignore
          error: "Unauthorized user",
        };
      }

      const { address, city, country, zip, state } =
        userAddressSchema.parse(args);

      const user = await UserModel.findOneAndUpdate(
        {
          _id: token,
        },
        {
          address: {
            address,
            city,
            country,
            zip,
            state,
          },
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
