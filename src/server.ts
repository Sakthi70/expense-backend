import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { useServer } from 'graphql-ws/lib/use/ws';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { Context, createContext } from './context';
import { schema } from './schema';

const PORT = process.env.PORT || 4000

const app = express()
const httpServer = createServer(app)

async function start() {
  /** Create WS Server */
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  })

  /** hand-in created schema and have the WS Server start listening */
  const serverCleanup = useServer({ schema ,context: createContext}, wsServer)

  const server = new ApolloServer<Context>({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  app.use(
    cors({
      origin: process.env.Origins.split(','),
      // methods: "GET,HEAD,PUT,PATCH,POST",
      credentials: true,
    })
  );

  await server.start()
  app.use('/graphql', cors<cors.CorsRequest>(), bodyParser.json(), expressMiddleware(server, { context: async (response) => createContext(response) }));

  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:4000/graphql`)
    console.log(`⏰ Subscriptions ready at http://localhost:4000/graphql`)
    console.log(
      `⭐️ See sample queries: http://pris.ly/e/ts/graphql-subscriptions#using-the-graphql-api`,
    )
  })
}

start()
