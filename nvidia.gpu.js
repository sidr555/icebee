const GPU = require("./gpu")

class NvidiaGPU extends GPU {

    defaultConfig = {
        temp: {
            good: 49,
            max: 50,
            critical: 55
        },
        
        fan: {
            max: 90
        },
    
        power: {
            max: 85,
            min: 60,
            step: {
                up: 2,
                down: 4
            }
        }
    }

    oc_keys = ["power_limit"]


    constructor(params) {
        super(params);

        this.config = this.defaultConfig;

        // console.log("nv", this.defaultConfig);
    }


    getOverclockParams() {
        const oc = {}
        const power_limit = this.oc.nvidia.power_limit[this.index];
        if (this.isOverheated()) {
            console.log(`GPU (n) w:${this.worker} #${this.index} is overheated ${this.stat.temp} (oc pl: ${power_limit}, stat pl: ${this.stat.power})`);
            if (power_limit > this.config.power.min) {
                const power = power_limit - this.config.power.step.down;
                oc.power_limit = power >= this.config.power.min ? power : this.config.power.min;  
            } else {
                // console.log("Cannot power down nvidia GPU", this.info);
                return false;
            }
        } else if (this.isGood()) {
            return false;
        } else {
            // return false;
            if (power_limit < this.config.power.max) {
                const power = power_limit + this.config.power.step.up;
                oc.power_limit = power <= this.config.power.max ? power : this.config.power.max;  
            } else {
                // console.log("Cannot power up nvidia GPU", this.info);
                return false;
            }
        }
        return oc;
    }
}
 
module.exports = NvidiaGPU;