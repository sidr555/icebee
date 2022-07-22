const Redis = require("ioredis");
const redis = new Redis(); 

function convertOverclock(worker) {    
    // console.log("conv oc", worker);                                                                                                                                                                                                                               x
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
    
    // console.log("conv oc 2", worker.overclock);                                                                                                                                                                                                                               x

}

function ocToArray(str, len) {
    // console.log("oc2Arr", str, len);
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
  

      async worker(_, { farm, worker }, { dataSources }) {
        console.log("GQL query: /worker", { farm, worker });
        const data = await dataSources.hiveAPI.getWorker({ farm, worker });
        convertOverclock(data);
        //workers.data.forEach( worker => convertOverclock(worker));
        // console.log("worker", data.overclock);
        return data;
      
      },


      async workers(_, { farm }, { dataSources }) {
        console.log("GQL query: /workers", { farm });
        const workers = await dataSources.hiveAPI.getWorkers({ farm });
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

      async overclockNvidiaGPU(parent, { farm_id, worker_id, gpu_index, power_limit }, { dataSources }) {
        // console.log("MUT overclockWorker", { farm_id, worker_id, gpu_index, power_limit });
        const res = await dataSources.hiveAPI.overclockNvidiaGPU(farm_id, worker_id, gpu_index, power_limit);
        console.log(`MUT overclockNvidia f:${farm_id} w:${worker_id} #${gpu_index} pow:${power_limit} :`, res);
        return res;
  
        //workers.data.forEach( worker => convertOverclock(worker));
        //return workers.data;
      },

      async overclockNvidiaWorker(parent, {farm, worker, power_limits}, { dataSources }) {
        const res = await dataSources.hiveAPI.overclockNvidiaWorker( farm, worker, power_limits);
        console.log(`MUT overclockNvidiaWorker f:${farm} w:${worker} pow:${power_limits} :`, res);
        return res;

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
  
  module.exports = resolvers;