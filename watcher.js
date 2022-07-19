
const NvidiaGPU = require("./nvidia.gpu");
const AmdGPU = require("./amd.gpu");
// const Workers = require("./worker")
const workers = require("./hiveos.workers.json");
const HiveAPI = require("./hiveos");

const hiveapi = new HiveAPI();
hiveapi.initialize();

const farm = 2212723;

//workers.forEach(worker => {
    const worker = workers.data.workers[2];
    const overclock = worker.overclock;
    console.log("worker OC", overclock);
    
    worker.gpu_info.forEach(async gpu => {
        const stat = worker.gpu_stats.find(item => item.bus_number === gpu.bus_number);

        let board = {}

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