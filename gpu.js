const HiveAPI = require("./hiveos");
const hiveapi = new HiveAPI();

const Redis = require("ioredis")
const redis = new Redis();


class GPU {
    defaultConfig = {
        temp: {
            max: 80,
            good: 70,
            critical: 90
        },

        fan: {
            max: 90
        }
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

        // this.config = this.getConfig();
        // this.config = this.defaultConfig;
        // console.log("conf", this.config);

        // console.log("worker oc", this.oc);
        // this.init();
        try {
            this.config = this.getConfig() || this.getWorkerConfig() || this.getFarmConfig() || this.defaultConfig;
        } catch( err) {
            this.config = this.defaultConfig;
        }

    }

    init() {
        try {
            this.config = this.getConfig() || this.getWorkerConfig() || this.getFarmConfig() || this.defaultConfig;
        } catch( err) {
            this.config = this.defaultConfig;
        }
    }

    async getConfig() {
        return await redis.hget(`hiveos:${this.farm}:${this.worker}:${this.index}`, "config");

        // try {
        //     this.config = await redis.hget(`hiveos:${this.farm}:${this.worker}:${this.index}`, "config");
        //     if (this.config) {
        //         return this.config;
        //     }
        //     // if (config) {
        //     //     return config;
        //     // }
        // } catch (err) {} 

        // return await this.getWorkerConfig();
    }

    async getWorkerConfig() {
        return await redis.hget(`hiveos:${this.farm}:${this.worker}`, "config");
        // try {
        //     const config = await redis.hget(`hiveos:${this.farm}:${this.worker}`, "config");
        //     if (config) {
        //         return config;
        //     }
        // } catch (err) {} 

        // return await this.getFarmConfig();        

    }

    async getFarmConfig() {
        return await redis.hget(`hiveos:${this.farm}`, "config");
        // try {
        //     const config = await redis.hget(`hiveos:${this.farm}`, "config");
        //     if (config) {
        //         return config;
        //     }
        // } catch (err) {} 

        // return this.defaultConfig;
    }

    getCurrentOcValue(key) {
        // console.log("branf oc", this.brand, this.oc[this.brand])
        return this.oc[this.brand][key][this.index];
    }

    isCritical() {
        return this.stat.temp >= this.config.temp.critical;
    }
    

    isOverheated() {
        // return true
        return this.stat.temp >= this.config.temp.max || this.stat.fan >= this.config.fan.max;
    }
    
    isGood() {

        return Math.abs(this.stat.temp - this.config.temp.good) < 1 && this.stat.fan < this.config.fan.max;
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
        // console.log("OC params", this.info, oc);

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
