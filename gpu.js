const HiveAPI = require("./hiveos");

class GPU {
    temp = {
        max: 80
    }

    fan = {
        max: 75
    }


    constructor(worker, info, stat) {
        this.worker = worker
        this.info = info
        this.stat = stat
        this.brand = info.brand
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
        const data = {
            gpu_data: [
                {
                    nvidia: {},
                    amd: {},
                    gpus: [
                        {
                            gpu_index: this.info.index,
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
            data.gpu_data[this.brand] = oc;
            const res = await HiveAPI.overclock(data);
            console.log("OC result for", { 
                worker: this.worker, 
                brand: this.brand,
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