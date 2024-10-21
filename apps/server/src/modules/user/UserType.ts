import { GraphQLObjectType, GraphQLString, GraphQLNonNull } from "graphql";
import { globalIdField } from "graphql-relay";

import {
  connectionDefinitions,
  objectIdResolver,
  timestampResolver,
} from "@entria/graphql-mongo-helpers";

import { nodeInterface, registerTypeLoader } from "../node/typeRegister";

import { IUser, IUserAddress } from "./UserModel";
import { load } from "./UserLoader";
import { GraphQLContext } from "../../server/getContext";

const AddressType = new GraphQLObjectType({
  name: "Address",
  description: "User address",
  fields: () => ({
    address: {
      type: GraphQLString,
      resolve: (address: IUserAddress) => address.address,
    },
    city: {
      type: GraphQLString,
      resolve: (address: IUserAddress) => address.city,
    },
    state: {
      type: GraphQLString,
      resolve: (address: IUserAddress) => address.state,
    },
    zip: {
      type: GraphQLString,
      resolve: (address: IUserAddress) => address.zip,
    },
    country:{
      type: GraphQLString,
      resolve: (address: IUserAddress) => address.country,
    }
  }),
})

const UserType = new GraphQLObjectType<IUser, GraphQLContext>({
  name: "User",
  description: "User data",
  // @ts-ignore
  fields: () => ({
    id: globalIdField("User"),
    ...objectIdResolver,
    name: {
      type: GraphQLString,
      resolve: (user) => user.name,
    },
    email: {
      type: GraphQLString,
      resolve: (user) => user.email,
    },
    date_of_birth: {
      type: GraphQLString,
      resolve: (user) => user.date_of_birth,
    },
    phone: {
      type: GraphQLString,
      resolve: (user) => user.phone,
    },
    address: {
      type: AddressType,
      resolve: (user) => user.address,
    },
    country:{
      type: GraphQLString,
      resolve: (user) => user.country,
    },
    ...timestampResolver,
  }),
  interfaces: () => [nodeInterface],
});

export default UserType;

registerTypeLoader(UserType, load);

export const UserConnection = connectionDefinitions({
  name: "User",
  nodeType: UserType,
});
