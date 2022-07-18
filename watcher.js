const workers = require("./hiveos.workers.json");
// const GPU = require("./gpu.js");
const NvidiaGPU = require("./nvidia.gpu");
const AmdGPU = require("./amd.gpu");


//workers.forEach(worker => {
    const worker = workers[2];    
    worker.gpu_info.forEach(async gpu => {
        const stat = worker.gpu_stats.find(item => item.bus_number === gpu.bus_number);

        let board = {}

        if (gpu.brand === "amd") {
            board = new AmdGPU(worker.id, gpu, stat);
        } else if (gpu.brand === "nvidia") {
            board = new NvidiaGPU(worker.id, gpu, stat);
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