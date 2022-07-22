const { BaseRedisCache } = require("apollo-server-cache-redis");
const Redis = require("ioredis");
const { ApolloServer } = require("apollo-server");

const typeDefs = require('./schemas')
const resolvers = require('./resolvers');

const HiveAPI = require("./hiveos");                                   

// Передаем схему и резовлеры в конструктор `ApolloServer`
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // context: ({ req }) => {

  // },
  cache: new BaseRedisCache({
    client: new Redis({
      host: "localhost",
    }),
  }),
  dataSources: () => ({
    hiveAPI: new HiveAPI(),
  }),
});

// Запускаем сервер
server.listen().then(({ url }) => {
  console.log(`🚀  Сервер запущен по адресу: ${url}`);
});


