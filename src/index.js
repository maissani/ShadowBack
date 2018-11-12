import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import jwt from 'jsonwebtoken';
import DataLoader from 'dataloader';
import express from 'express';
import {
  ApolloServer,
  AuthenticationError,
} from 'apollo-server-express';

import schema from './schema';
import resolvers from './resolvers';
import models, { sequelize } from './models';
import loaders from './loaders';

const app = express();

app.use(cors());

const getMe = async req => {
  const token = req.headers['x-token'];

  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (e) {
      throw new AuthenticationError(
        'Your session expired. Sign in again.',
      );
    }
  }
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');

    return {
      ...error,
      message,
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
        },
      };
    }

    if (req) {
      const me = await getMe(req);

      return {
        models,
        me,
        secret: process.env.SECRET,
        loaders: {
          user: new DataLoader(keys =>
            loaders.user.batchUsers(keys, models),
          ),
        },
      };
    }
  },
});

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const isTest = !!process.env.TEST_DATABASE;
const isProduction = !!process.env.DATABASE_URL;
const port = process.env.PORT || 8000;

sequelize.sync({ force: true }).then(async () => {
  createUsersWithMessages(new Date());

  httpServer.listen({ port }, () => {
    console.log(`Apollo Server on http://localhost:${port}/graphql`);
  });
});

const createUsersWithMessages = async date => {
  await models.User.create(
    {
      firstname: 'Mehdi',
      lastname: 'Aissani',
      username: 'maissani',
      email: 'contact@mehdiaisani.com',
      password: "-bLade+Test=",
      role: 'ADMIN',
      products: [
        {
          name: '1080TI AMP EXTREM',
          description: 'Une carte graphique d exeption',
          price: 999.9,
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
        {
          name: 'Logitech C920 camera',
          description: 'Une caméra haute qualité',
          price: 99.9,
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
        {
          name: 'Elagto Stream deck',
          description: 'Une caméra haute qualité',
          price: 120.9,
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    },
    {
      include: [models.Product],
    },
  );

  await models.User.create(
    {
      firstname: 'Thomas',
      lastname: 'Dupont',
      username: 'tdoupont',
      email: 'contact@thomasdupont.com',
      password: "-User+Test=2",
      products: [
      ],
    },
    {
      include: [models.Product],
    },
  );
};