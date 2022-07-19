const { BaseRedisCache } = require("apollo-server-cache-redis");
const Redis = require("ioredis");

const redis = new Redis();

const { ApolloServer, gql } = require("apollo-server");


const HiveAPI = require("./hiveos");


const workersData = require("./hiveos.workers.json");
const { watch } = require("fs");

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

  type OverClock {
    nvidia: OverClockNvidia
    amd: OverClockAMD
    tweakers: Tweakers
  }

  type OverClockNvidia {
    # power_limit: String
    power_limit: [Int]
  }

  type OverClockAMD {
    #mem_clock: String
    #core_clock: String
    #core_state: String
    mem_clock: [Int]
    core_clock: [Int]
    core_state: [Int]
    aggressive: Boolean
  }

  type Tweakers {
    amdtweaker: [ AmdTweak ]
  }

  type AmdTweak {
    ref: String
  }




  type Query {
    boards: [Board!]
    workers (farm: Int!): [Worker!]
    farms: [Farm!]
  }




  input WorkerOCCommonDataAMD {
    aggressive: Boolean
  }

  input WorkerOCCommonDataNVidia {
    data: String
  }

  input WorkerOCCommonData {
    amd: WorkerOCCommonDataAMD,
    nvidia: WorkerOCCommonDataNVidia,
    worker_ids: [ Int! ]!
  }

  input WorkerOCTweakersAMD {
    ref: String
  }
  
  input WorkerOCTweakers {
    amdmemtweak: WorkerOCTweakersAMD
  }

  input WorkerOCGPUDataNvidia {
    power_limit: String
  }
  input WorkerOCGPUDataAMD {
    core_clock: String!
    mem_clock: String!
    core_state: String
    fan_speed: String
    power_limit: String
  }

  input WorkerOCGPUDataGPU {
    gpu_index: Int!
    worker_id: Int!
  }
  input WorkerOCGPUData {
    nvidia: WorkerOCGPUDataNvidia
    amd: WorkerOCGPUDataAMD
    gpus: [ WorkerOCGPUDataGPU! ]!
    common_data: WorkerOCCommonData
    tweakers: WorkerOCTweakers
  }

  input WorkerOC {
    farm: Int!
    worker: Int!
    gpu_data: [ WorkerOCGPUData! ]!
  }

  input inputWatchWorkerOC {
    farm: Int!,
    worker: Int!,
    period: Int
  }

  # union overclockWorkerResult = Worker | null 

  type Mutation {
    overclockWorker(oc: WorkerOC!): Worker 
    watchWorkerOC(data: inputWatchWorkerOC): Boolean
    #overclockWorkerResult
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
      workers.data.forEach( worker => convertOverclock(worker));

      // console.log("worker 0 OC", workers.data[0].overclock);
      // console.log("worker 1 OC", workers.data[1].overclock);
      // console.log("worker 2 OC", workers.data[2].overclock);
      // console.log("worker 3 OC", workers.data[3].overclock.tweakers.amdmemtweak);

      return workers.data;
    },
  },
  Farm: {
    async workers(parent, args, { dataSources }) {
      // return workersData
      const workers = await dataSources.hiveAPI.getWorkers({ farm: parent.id });
      workers.data.forEach( worker => convertOverclock(worker));
      return workers.data;

      // return workers.filter((parent) => this.farm === parent.id);
    },
    //   async getList() {
    //     const farms = await hiveos.getFarms();
    //     return farms;
    //   }
  },


  Mutation: {
    async overclockWorker(parent, { oc }, { dataSources }) {
      console.log("MUT overclockWorker", oc);
      const worker = await dataSources.hiveAPI.overclockWorker(oc.farm, oc.worker, oc.gpu_data);
      console.log("MUT overclockWorker res", worker);
      return worker;

      //workers.data.forEach( worker => convertOverclock(worker));
      //return workers.data;
    },

    watchWorkerOC(parent, { data }, { dataSources }) {
      console.log("watchWorkerOC", data.worker, data.farm);
      const { farm, worker, period } = data;
      if (!farm || !worker) {
        console.log("watchWorkerOC - Bad input data", data);
        return false;
      }
      const key = `watch-workers:hive:${farm}:${worker}`;
      if (!period) {
        redis.del(key);
      } else {
        const time = parseInt(Date.now()/1000) + period;
        console.log("time", time)
        // redis.hset(key, "farm", farm);
        // redis.hset(key, "worker", worker);
        // redis.hset(key, "period", period);
        // redis.hset(key, "time", time);
        // redis.hset(key, {farm, worker, period, time});
        redis.hset(key, "farm", farm, "worker", worker, "period", period, "time", time);
        redis.zadd("watch-workers", time, key);
      }
      return true;
    }
  }
};   
                                   
function convertOverclock(worker) {                                                                                                                                                                                                                                   x
  if (worker.overclock) {
    if (worker.overclock.nvidia) {
      worker.overclock.nvidia.power_limit = ocToArray(worker.overclock.nvidia.power_limit, worker.gpu_info.length);
    }
    if (worker.overclock.amd) {
      worker.overclock.amd.mem_clock = ocToArray(worker.overclock.amd.mem_clock, worker.gpu_info.length);
      worker.overclock.amd.core_clock = ocToArray(worker.overclock.amd.core_clock, worker.gpu_info.length);
      worker.overclock.amd.core_state = ocToArray(worker.overclock.amd.core_state, worker.gpu_info.length);
      worker.overclock.amd.power_limit = ocToArray(worker.overclock.amd.power_limit, worker.gpu_info.length);
    }
  }
}

function ocToArray(str, len) {
  if (typeof str === "undefined") { 
    str = "0";
  }
  let arr = str.split(" ").map(s => 1*s);
  if (arr.length === 1) {
    for (let i = 1; i < len; i++) {
      arr.push(arr[0]);
    }
  }
  return arr;
}

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


const watcher = () => {
  redis.zrange("watch-workers", 0, 10, (err, res) => {
    if (err) {
      console.log("watcher error", err);
      return false;
    }

    const now = parseInt(Date.now()/1000);
    res.forEach(key => {
      redis.hget(key, "time", (err, timeStr) => {
        if (!err && timeStr) {
          let time = parseInt(timeStr);
          console.log("test key", key, time, now, now-time);
          if (time <= now) {
            console.log("process key", key, "delta", now-time, "sec");
            redis.hget(key, "period", (err, period) => {
              if (!err) {
                time += 1*period;
                redis.zadd("watch-workers", time, key);
                redis.hset(key, "time", time);
                redis.hset(key, "period", 10);

              }
            });
          }
        }  
      });
    });


    // console.log("watcher res", res.length, res);

  })
}

setInterval(watcher, 2000);
