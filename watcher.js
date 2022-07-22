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

  
  const promises = worker.gpu_info.map( gpu => {
    
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

      const oc = board.getOverclockParams();
      
      
      if (oc) {

        // console.log("send mut", {
        //   farm_id: farm,
        //   worker_id,
        //   gpu_index: board.index,
        //   power_limit: oc.power_limit
        // });

        return new Promise((resolve, reject) => {
          client.mutate({
            mutation: OVERCLOCK_NVIDIA_GPU,
            variables: {
              farm_id: farm,
              worker_id,
              gpu_index: board.index,
              power_limit: oc.power_limit
            }
          }).then((res) => {
            if (res.data.overclockNvidiaGPU) {
              resolve(`GPU OC f:${farm} w:${worker_id} #${board.index} t:${stat.temp} h:${stat.hash} f:${stat.fan} changed power limit to ${oc.power_limit}`)
            } else {
              resolve(`GPU OC f:${farm} w:${worker_id} #${board.index} t:${stat.temp} h:${stat.hash} f:${stat.fan} is not changed power limit to ${oc.power_limit}`)
            }
          }).catch((err) => {
            reject(err)
          });
        });        

      } else {
        return new Promise(resolve => resolve(`GPU OC f:${farm} w:${worker_id} #${board.index} t:${stat.temp} h:${stat.hash} f:${stat.fan} is unchanged`))
      }
    }

   
  }, []);


  // console.log("start OC cnt ", promises.length);
  Promise.all(promises).then(results => {
    // console.log("res cnt", results.length);
    results.forEach((res, index) => {
      if (res) {
        console.log(" - ", res);
      }

    })
  }).catch(err => {
    console.log("mutate err", JSON.stringify(err, null, 2))
  })
  


}



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
          // console.log("test key", key, time, now, now-time);
          if (time <= now) {
            const [_, os, farm, worker] = key.split(":");
            
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

            // watch OC settings of worker
             
          }
        }  
      });
    });


    // console.log("watcher res", res.length, res);

  })
}

setInterval(watcher, 2000);
