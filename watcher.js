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
  mutation OverclockNvidia($farm: Int!, $worker: Int!, $index: Int, $power: Int!) {
    overclockNvidiaGPU(farm: $farm, worker: $worker, index: $index, power: $power)
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
    }
  });

  const worker = res.data.worker;

  // console.log("worker data", worker);

  
  // worker.gpu_info.forEach(async gpu => {
  const request = worker.gpu_info.reduce((req, gpu) => {
    
    const stat = worker.gpu_stats.find(item => item.bus_number === gpu.bus_number);

    // console.log("brand", gpu.brand, gpu)
    // return;
    if (gpu.brand === "amd" || gpu.brand === "nvidia") {

      if (gpu.index !== 5) return req;

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

        console.log("send mut", {
          farm,
          worker: worker_id,
          index: board.index,
          power: oc.power_limit
        });

        client.mutate({
          mutation: OVERCLOCK_NVIDIA_GPU,
          variables: {
            farm,
            worker: worker_id,
            index: board.index,
            power: oc.power_limit
          }
        }).then(res => {
          console.log("mutate res", res)
        }).catch(err => {
          console.log("mutate err", err)
        })

        // const item = {
        //     // nvidia: {},
        //     // amd: {},
        //     gpus: [
        //         {
        //             gpu_index: board.index,
        //             worker_id
        //         }
        //     ]
        // }

        // item[board.brand] = oc;

        // req.gpu_data.push(item);
      }

//       req.common_data[board.brand] = board.getCommonDataParams();
//  //     Object.assign(req.common_data.tweakers, board.getTweakers());
//       req.tweakers = board.getTweakers()

    }

    return req;

    // if (gpu.brand === "amd") {
    //     board = new AmdGPU(farm, worker.id, gpu, stat, worker.overclock, hiveapi);
    // } else if (gpu.brand === "nvidia") {
    //     board = new NvidiaGPU(farm, worker.id, gpu, stat, worker.overclock, hiveapi);
    // } else {
    //     return;
    // }

    //const gpu = new GPU(worker, gpu, stat);





    // const oc = await board.overclock();
    // if (oc) {
    //     console.log("GPU overclock is changed");
    // } else if (board.isOverheated()) {
    //     console.log("GPU cannot been overclocked but it is very HOT! You must fix it yourself");
    // } else {

    // }

  }, {
    gpu_data: [], 
    common_data: {
      // amd: {},
      // nvidia: {},
      worker_ids: [ worker_id ]
    },
    tweakers: {}
  });

  return;
  console.log("res arr", request.gpu_data);

  if (request.gpu_data && request.gpu_data.length) {

    console.log(JSON.stringify(request));



    // console.log(gql(JSON.stringify(request)));
  }
  

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
            
            checkWorkerOC(farm, worker);

            // increase period
            redis.hget(key, "period", (err, period) => {
              if (!err) {
                time += 1*period;
                redis.zadd("watch-workers", time, key);
                redis.hset(key, "time", time);
                redis.hset(key, "period", 10);
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
