import Sequelize from 'sequelize';
import { combineResolvers } from 'graphql-resolvers';

import pubsub, { EVENTS } from '../subscription';
import { isAuthenticated, isProductOwner } from './authorization';

const toCursorHash = string => Buffer.from(string).toString('base64');

const fromCursorHash = string =>
  Buffer.from(string, 'base64').toString('ascii');

export default {
  Query: {
    products: async (parent, { cursor, limit = 100 }, { models }) => {
      const cursorOptions = cursor
        ? {
            where: {
              createdAt: {
                [Sequelize.Op.lt]: fromCursorHash(cursor),
              },
            },
          }
        : {};

      const products = await models.Product.findAll({
        order: [['createdAt', 'DESC']],
        limit: limit + 1,
        ...cursorOptions,
      });

      const hasNextPage = products.length > limit;
      const edges = hasNextPage ? products.slice(0, -1) : products;

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: toCursorHash(
            edges[edges.length - 1].createdAt.toString(),
          ),
        },
      };
    },
    product: async (parent, { id }, { models }) => {
      return await models.Product.findById(id);
    },
  },

  Mutation: {
    createProduct: combineResolvers(
      isAuthenticated,
      async (parent, { text }, { models, me }) => {
        const product = await models.Product.create({
          text,
          userId: me.id,
        });

        pubsub.publish(EVENTS.PRODUCT.CREATED, {
          productCreated: { product },
        });

        return product;
      },
    ),

    deleteProduct: combineResolvers(
      isAuthenticated,
      isProductOwner,
      async (parent, { id }, { models }) => {
        return await models.Product.destroy({ where: { id } });
      },
    ),
  },

  Product: {
    user: async (product, args, { loaders }) => {
      return await loaders.user.load(product.userId);
    },
  },

  Subscription: {
    productCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.PRODUCT.CREATED),
    },
  },
};