const HiveAPI = require("./hiveos");
const hiveapi = new HiveAPI();


class GPU {
    temp = {
        max: 80,
        critical: 90
    }

    fan = {
        max: 75
    }


    constructor({ farm, worker, info, stat, oc }) {
        // console.log("construct GPU", info)
        this.farm = farm
        this.worker = worker
        this.info = info
        this.stat = stat
        this.brand = info.brand
        this.oc = oc
        this.index = info.index

        // console.log("worker oc", this.oc);
    }

    getCurrentOcValue(key) {
        console.log("branf oc", this.brand, this.oc[this.brand])
        return this.oc[this.brand][key][this.index];
    }

    isCritical() {
        return this.stat.temp > this.temp.critical;
    }
    

    isOverheated() {
        return this.stat.temp > this.temp.max || this.stat.fan > this.fan.max;
    }
    
    canOverclock() {
        console.log("GPU cannot been frozen. You must fix it yourself")
        return false;
    }

    getOverclockParams() {
        return {}
    }

    getCommonDataParams() {
        return {}
    }

    getTweakers() {
        return {};
    }
    
    getCommonData() {
        const data = {
            amd: {},
            nvidia: {},
            worker_ids: [ this.worker ]
        }
        data[this.brand] = this.getCommonDataParams();
        return data;
    }



    async overclock() {
        console.log("overclock", this.index)
        const data = {
            gpu_data: [
                {
                    nvidia: {},
                    amd: {},
                    gpus: [
                        {
                            gpu_index: this.index,
                            worker_id: this.worker
                        }
                    ]
                }
            ],
            common_data: this.getCommonData(),
            tweakers: this.getTweakers() 
        };

        const oc = this.getOverclockParams();
        console.log("OC params", this.info, oc);

        if (oc) {
            data.gpu_data[0][this.brand] = oc;
            const res = await hiveapi.overclockWorker(this.farm, this.worker, data);
            console.log("OC result for", { 
                worker: this.worker, 
                brand: this.info.brand,
                info: this.info,
                res
            });
            return res;

        } else {
            // console.log("cannot overclock");
            return false;
        }
        
    }
}

 
module.exports = GPU;

// const factory = (gpu_info) => {
//     switch (gpu_info.brand) {
//         case "amd": return new  
//     }
// }


// export {
//     factory
// }