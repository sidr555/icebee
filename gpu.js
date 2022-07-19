const HiveAPI = require("./hiveos");
const hiveapi = new HiveAPI();

// const { ApolloClient, InMemoryCache } = require("apollo")
class GPU {
    temp = {
        max: 80
    }

    fan = {
        max: 75
    }


    constructor(farm, worker, info, stat, oc ) {
        this.farm = farm
        this.worker = worker
        this.info = info
        this.stat = stat
        this.brand = info.brand
        this.oc = oc
        this.index = info.index

        // console.log("worker", this);
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
        console.log("overclock", this)
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
            data.gpu_data[this.brand] = oc;
            const res = await hiveapi.overclock(this.farm, data);
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