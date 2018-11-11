import { GraphQLDateTime } from 'graphql-iso-date';

import userResolvers from '../resolvers/user';
import productResolvers from '../resolvers/product';

const customScalarResolver = {
  Date: GraphQLDateTime,
};

export default [
  customScalarResolver,
  userResolvers,
  productResolvers,
];
