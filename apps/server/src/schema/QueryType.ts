import { GraphQLObjectType } from "graphql";

import * as UserLoader from "../modules/user/UserLoader";
import UserType from "../modules/user/UserType";

export const QueryType = new GraphQLObjectType({
  name: "Query",
  fields: () => ({
   
    me: {
      type: UserType,
      description: "Return the current user",
      resolve: async (_, __, context) => {
        return await UserLoader.load(context, context.user?._id);
      },
    },
  }),
});
