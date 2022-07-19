
const NvidiaGPU = require("./nvidia.gpu");
const AmdGPU = require("./amd.gpu");
// const Workers = require("./worker")
// const workers = require("./hiveos.workers.json");
// const HiveAPI = require("./hiveos");

// const { gql } = require("apollo-server");
const { ApolloClient, HttpLink, InMemoryCache, gql } = require("@apollo/client")
const fetch = require('cross-fetch');

const client = new ApolloClient({
    // uri: "http://localhost:4000",
    link: new HttpLink({ uri: 'http://localhost:4000/graphql', fetch }),
    cache: new InMemoryCache()
});


// const hiveapi = new HiveAPI();
// hiveapi.initialize();

const farm = 2212723;


const QUERY_FARM_WORKERS = gql`
query WorkersQuery ($farm: Int!) {
    workers(farm: $farm) {
      id
      name
      active
      vpn
      units_count
      system_type
      ip_addresses
      needs_upgrade
      stats {
        online
        gpus_online
        gpus_offline
        gpus_overheated
        invalid
        overloaded
        overheated
        problems
      }
      hardware_info {
        motherboard {
          manufacturer
          model
        }
        disc {
          model
        }
      }
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
        model
        brand
        details {
          mem_gb
          mem_type
        }
      }
    }  
  }
  `

const workers = client.query({
    query: QUERY_FARM_WORKERS,
    variables: { farm }
}).then( res => {
    console.log("workers", res.data.workers)

}).catch(err => console.log("farm workers error", err));



if (false) {
//workers.forEach(worker => {
    const worker = workers.data.workers[2];
    const overclock = worker.overclock;
    console.log("worker OC", overclock);
    
    worker.gpu_info.forEach(async gpu => {
        const stat = worker.gpu_stats.find(item => item.bus_number === gpu.bus_number);

        const GPUClass = gpu.brand === "amd" ? AmdGPU : NvidiaGPU;

        const board = new GPUClass({
            farm,
            worker: worker.id,
            gpu,
            stat,
            oc: worker.overclock,
            send: () => {
                client.mutate({
                    mutate: gql``
                })
            }
        })

        if (gpu.brand === "amd") {
            board = new AmdGPU(farm, worker.id, gpu, stat, worker.overclock, hiveapi);
        } else if (gpu.brand === "nvidia") {
            board = new NvidiaGPU(farm, worker.id, gpu, stat, worker.overclock, hiveapi);
        } else {
            return;
        }

        //const gpu = new GPU(worker, gpu, stat);
        const oc = await board.overclock();
        if (oc) {
            console.log("GPU overclock is changed");
        } else if (board.isOverheated()) {
            console.log("GPU cannot been overclocked but it is very HOT! You must fix it yourself");
        } else {

        }

    });

// })
}