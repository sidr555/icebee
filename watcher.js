const NvidiaGPU = require("./nvidia.gpu");
const AmdGPU = require("./amd.gpu");

const { ApolloClient, HttpLink, InMemoryCache, gql } = require("@apollo/client")
const fetch = require('cross-fetch');

const client = new ApolloClient({
    // uri: "http://localhost:4000",
    link: new HttpLink({ uri: 'http://localhost:4000/graphql', fetch }),
    cache: new InMemoryCache()
});


const Redis = require("ioredis");
const e = require("express");
const redis = new Redis();






const QUERY_FARM_WORKERS = gql`
query WorkerQuery ($farm: Int!, $worker: Int!) {
    worker(farm: $farm, worker: $worker) {
      id
      name
      active
      oc_algo
      oc_algo_actual
      gpu_stats {
        bus_number
        temp
        power
        hash
        fan
      }
      gpu_info {
        bus_number
        index
        brand
      }
      overclock {
        nvidia {
          power_limit
        }
        amd {
          mem_clock
          core_clock
          core_state
        }
        tweakers {
          amdtweaker {
            ref
          }
        }
      }
    }  
  }
`

// const OVERCLOCK_WORKER = gql`
//   mutation OC($oc: WorkerOC!) {
//     overclockWorker(oc: $oc) {

//     }  
//   } 
// `


const OVERCLOCK_NVIDIA_GPU = gql`
  mutation overclockNvidia($farm_id: Int!, $worker_id: Int!, $gpu_index: Int!, $power_limit: Int!) {
    overclockNvidiaGPU(farm_id: $farm_id, worker_id: $worker_id, gpu_index: $gpu_index, power_limit: $power_limit)
  }
`
const OVERCLOCK_NVIDIA_WORKER = gql`
  mutation overclockWorker($farm: Int!, $worker: Int!, $power_limit: String!) {
    overclockNvidiaWorker(farm: $farm, worker: $worker, power_limit: $power_limit)
  }
`

const OVERCLOCK_AMD_WORKER = gql`
  mutation overclockWorker($farm: Int!, $worker: Int!, $core_clock: String!, $core_state: String!, $mem_clock: String!, $gpus: String!) {
    overclockAmdWorker(farm: $farm, worker: $worker, core_clock: $core_clock, core_state: $core_state, mem_clock: $mem_clock, gpus: $gpus)
  }
`


async function checkWorkerOC(farm, worker_id) {
  // const data = {
  //   farm: parseInt(farm),
  //   worker: parseInt(worker_id)
  // }
  // console.log("check workers OC", data);

  // get worker
  const res = await client.query({
    query: QUERY_FARM_WORKERS, 
    variables: {
      farm: parseInt(farm),
      worker: parseInt(worker_id)
    },
    fetchPolicy: "network-only"
  });

  const worker = res.data.worker;
  // console.log("worker data", worker.overclock.nvidia.power_limit[5]);
  
  const hrate = worker.gpu_stats.reduce( (res, stat) => res + stat.hash, 0);
  // console.log("worker data", worker, hrate);
  
  if (!hrate) {
    console.log(`Skip worker ${worker.name}`);
    return;
  }
  
  if (worker.gpu_stats === null) {
    console.log(`${worker.name} is offline`)
    return false;  
  }

  const result = worker.gpu_info.reduce( (res, gpu) => {
    
    const stat = worker.gpu_stats.find(item => item.bus_number === gpu.bus_number);

    if (gpu.brand === "amd" || gpu.brand === "nvidia") {

      // if (gpu.index !== 5) return;

      const GPUClass = gpu.brand === "amd" ? AmdGPU : NvidiaGPU;

      const board = new GPUClass({
          farm,
          worker: worker.id,
          info: gpu,
          stat,
          oc: worker.overclock
      });

      if (board.isCritical()) {
        res.critical = true;      
      }
  
      const params = board.getOverclockParams();

      // console.log("oc params", params)

      board.oc_keys.forEach(key => {
        if (typeof res.oc[key] === "undefined") {
          res.oc[key] = [];
        }

        if (params) {
          // No way to adjust nv + amd workers
          res.type = board.brand;
          res.oc[key].push(params[key]);        
        } else {
          res.oc[key].push(board.getCurrentOcValue(key));
        }
      });
    }
    return res;

  
  }, {
    type: false, 
    critical: false, 
    oc: {}
  });


  // console.log("result", result);

  if (result.critical) {
    console.log(`!!! CRITICAL GPU TEMP ON FARM ${farm} WORKER ${worker_id}. STOP MINER !!!`);  
  }

  const variables = {
    farm,
    worker: worker_id,
  }

  Object.keys(result.oc).forEach(key => {
    variables[key] = result.oc[key].join(" ");
  });

  try {
    switch (result.type) {
      case "nvidia":
        client.mutate({ 
          mutation: OVERCLOCK_NVIDIA_WORKER, 
          variables
        })
        .then((res) => {
          // console.log("res", res)
          if (res.data.overclockNvidiaWorker) {
            console.log(`GPU OC f:${farm} w:${worker.name} changed power_limit:${variables.power_limit}`)
          } else {
            console.log(`GPU OC f:${farm} w:${worker.name} is not changed power_limit:${variables.power_limit}`)
          }
        }).catch((err) => {
          console.log("mutation error", JSON.stringify(err))
        });

        break;

      case "amd":
        variables.gpus = result.oc.core_clock.map( (val, i) => i ).join(","); 
        // console.log("variables", variables);
        // break;
        client.mutate({ 
          mutation: OVERCLOCK_AMD_WORKER, 
          variables
        })
        .then((res) => {
          // console.log("res", JSON.stringify(res))
          if (res.data.overclockAmdWorker) {
            console.log(`GPU OC f:${farm} w:${worker.name} gpus:${variables.gpus} changed core_clock:${variables.core_clock} mem_clock:${variables.mem_clock}`)
          } else {
            console.log(`GPU OC f:${farm} w:${worker.name} is not changed core_clock:${variables.core_clock} mem_clock:${variables.mem_clock}`)
          }
        }).catch((err) => {
          console.log("mutation error", JSON.stringify(err))
        });
        
        break;
    }
  } catch (err) {
    console.log("worker mutation error", JSON.stringify(err))
  }


}



const watcher = () => {
  try {
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
            // console.log("test key", key, time, now, now-time);
            if (time <= now) {
              const [_, os, farm, worker] = key.split(":");

              try {

                // if (worker != "4857668") return; // nv1 only
                // if (worker != "4946076") return;
              
                // console.log("WATCH ", worker);
                checkWorkerOC(parseInt(farm), parseInt(worker));
                // increase period
                redis.hget(key, "period", (err, period) => {
                  if (!err) {
                    time = now + parseInt(period);
                    redis.zadd("watch-workers", time, key);
                    redis.hset(key, "time", time);
                    // redis.hset(key, "period", 60);
                    // console.log("increase watch time", farm, worker)
                  }
                });

              } catch(err) {
                console.log("ERROR [watcher]", JSON.stringify(err));
              }  
              
            }
          }  
        });
      });


      // console.log("watcher res", res.length, res);

    })
  } catch (err) {
    console.log("ERROR [watcher 2]", err);
  }
}

console.log("### KeenBee watcher started ###")

setInterval(watcher, 2000);
