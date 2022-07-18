const { BaseRedisCache } = require("apollo-server-cache-redis");
const Redis = require("ioredis");

const { ApolloServer, gql } = require("apollo-server");


const HiveAPI = require("./hiveos");


const workersData = require("./hiveos.workers.json");

//const fetch = require('node-fetch')
// import fetch from 'node-fetch';

const users = [
  {
    name: "Сидоров Дмитрий",
    email: "sidr555@gmail.com",
  },
];

// Определение схемы
const typeDefs = gql`  
  type Farm {
    id: Int!
    name: String!
    workers_count: Int,
    rigs_count: Int,
    asics_count: Int,
    workers: [Worker!]
    hashrates_by_coin: [HashRate]
  }

  type HashRate {
    miner: String
    coin: String
    algo: String
    hashrate: Int
    hash: Int
  }

  type MinerHashRate {
    hashrates: [HashRate]
  }


  type GPUInfoDetails {
    mem: String
    mem_gb: Int
    mem_type: String
    mem_oem: String
    vbios: String
    subvendor: String
    oem: String
  }

  type GPUInfoPowerLimits {
    min: String
    def: String
    max: String
  }

  type GPUInfo {
    bus_id: String!
    bus_number: Int!
    index: Int
    brand: String
    model: String
    short_name: String
    details: GPUInfoDetails
    power_limit: GPUInfoPowerLimits
  }

  type GPUStat {
    bus_id: String!
    bus_number: Int!
    temp: Int
    fan: Int
    hash: Int

    # NVidia specific
    power: Int

    # AMD specific
    coreclk: Int
    memclk: Int
    core_clock: Int
    mem_clock: Int
  }



  type Worker {
    id: Int!
    name: String!
    active: Boolean
    ip_addresses: [String!]
    vpn: Boolean
    system_type: String,
    needs_upgrade: Boolean,
    stats: WorkerStats
    hardware_info: HardwareInfo
  #  hardware_stats: {}
    units_count: Int,
    # flight_sheet: {}
    overclock: OverClock
    miners_summary: MinerHashRate
    # miners_stats: {}
    # gpu_summary: {}
    gpu_stats: [GPUStat!]
    gpu_info: [GPUInfo!]



    #gpus: [Board!]
  }

  type WorkerStats {
    online: Boolean
    gpus_online: Int
    gpus_offline: Int
    gpus_overheated: Int
    invalid: Boolean
    overloaded: Boolean
    overheated: Boolean
    problems: [String!]
  }

  type Board {
    type: String!
    slot: Int!
    worker: Worker
  }

  type HardwareInfo {
    motherboard: HardwareMotherboard
    cpu: HardwareCPU
    disc: HardwareDisc
  }

  type HardwareMotherboard {
    manufacturer: String!
    model: String!
    bios: String
  }

  type HardwareCPU {
    id: String!
    model: String!
    cores: Int!
    aes: String
  }

  type HardwareDisc {
    model: String!
  }

  union OverClock = OverClockAMD | OverClockNvidia

  type OverClockNvidia {
    power_limit: String
  }

  type OverClockAMD {
    power_limit: String
  }




  type Query {
    boards: [Board!]
    workers (farm: Int!): [Worker!]
    farms: [Farm!]
  }
`;

// Карта резолверов
const resolvers = {
  Query: {
    boards() {
      return boards;
    },

    async farms(_, __, { dataSources }) {
      const farms = await dataSources.hiveAPI.getFarms();
      return farms.data;
    },

    async workers(_, args, { dataSources }) {
      const workers = await dataSources.hiveAPI.getWorkers({ farm: args.farm });
      const worker = workers.data[1];
      console.log("workers res", worker.gpu_info, worker.gpu_stats);

      // const workersOut = workersIn.data.forEach( data => {
      //   console.log("worker data", data)
      //   data.gpus = [];
      //   for (let i=0; i<data.miner_stats.hashrates[0].bus_number.length; i++) {
      //     data.gpus.push({
      //       bus_number: data.miner_stats.hashrates[0].bus_number[i],
      //       temp: data.miner_stats.hashrates[0].temps[i],
      //       hash: data.miner_stats.hashrates[0].hashes[i],
      //       fan: data.miner_stats.hashrates[0].fans[i],
      //     });
      //     return data
      //   }
      // })

      // console.log(workersOut[1].gpus);

      return workers.data;
    },
  },
  Farm: {
    async workers(parent, args, { dataSources }) {
      return workersData
      // const workers = await dataSources.hiveAPI.getWorkers({ farm: parent.id });
      // return workers.data;

      // return workers.filter((parent) => this.farm === parent.id);
    },
    //   async getList() {
    //     const farms = await hiveos.getFarms();
    //     return farms;
    //   }
  },
  //  Worker: {
  // gpus(parent) {
  //   return boards.filter(board => board.worker === parent.name);
  // }
  // }
};

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
