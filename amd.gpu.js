const GPU = require("./gpu")

class AmdGPU extends GPU {

    defaultConfig = {
        temp: {
            good: 56,
            max: 57,
            critical: 62
        },
        fan: {
            max: 90
        },
        core_clock: {
            min: 600,
            max: 1200,
            step: {
                up: 25,
                down: 100
            }
        },
        mem_clock: {
            min: 1600,
            max: 2200,
            step: {
                up: 25,
                down: 100
            }
        }
        
    }

    oc_keys = ["core_clock", "core_state", "mem_clock"]

    constructor(params) {
        super(params);

        this.config = this.defaultConfig;

        // console.log("amd", this.config);
    }
    
    getCommonDataParams() {
        return {
            aggressive: true
        }
    }

    getTweakers() {
        return {
            amdmemtweak: {
                ref: 30
            }
        }
    }
    getOverclockParams() {
        // const oc = {
        //     core_clock: this.oc.amd.core_clock[this.index],
        //     mem_clock: this.oc.amd.mem_clock[this.index],
        //     // core_state: this.oc.amd.core_state[this.index],
        //     // fan_speed: this.oc.amd.fan_speed ? this.oc.amd.fan_speed[this.index] : null,
        //     // power_limit: this.oc.amd.power_limit ? this.oc.amd.power_limit[this.index] : null
        // }

        let core_clock = this.oc.amd.core_clock[this.index];
        let mem_clock = this.oc.amd.mem_clock[this.index];

        const oc = {
            core_clock,
            core_state: this.oc.amd.core_state[this.index],
            mem_clock
        };

        if (this.isOverheated()) {
            console.log(`GPU (a) w:${this.worker} #${this.index} is overheated ${this.stat.temp} (core_clock: ${core_clock}, mem_clock: ${mem_clock}, power: ${this.stat.power})`);
            // if (core_clock > this.core_clock.min) {
            //     core_clock -= this.core_clock.step.down;
            //     oc.core_clock = core_clock >= this.core_clock.min ? core_clock : this.core_clock.min; 
            if (core_clock > this.config.core_clock.min) {
                core_clock -= this.config.core_clock.step.down;
                oc.core_clock = core_clock >= this.config.core_clock.min ? core_clock : this.config.core_clock.min; 
            } else if (mem_clock > this.mem_clock.min) {
                mem_clock -= this.config.mem_clock.step.down;
                oc.mem_clock = mem_clock >= this.config.mem_clock.min ? mem_clock : this.config.mem_clock.min; 
            } else {
                console.log("Cannot power down amd GPU", this.info);
                return false;
            }
        } else if (this.isGood()) {
            return false;
        } else {
            // if (core_clock < this.core_clock.max) {
            //     core_clock += this.core_clock.step.up;
            //     oc.core_clock = core_clock <= this.core_clock.max ? core_clock : this.core_clock.max;  

            if (mem_clock < this.config.mem_clock.max) {
                mem_clock += this.config.mem_clock.step.up;
                oc.mem_clock = mem_clock <= this.config.mem_clock.max ? mem_clock : this.config.mem_clock.max;  
            } else if (core_clock < this.config.core_clock.max) {
                core_clock += this.config.core_clock.step.up;
                oc.core_clock = core_clock <= this.config.core_clock.max ? core_clock : this.config.core_clock.max;  
            } else {
                console.log("Cannot power up amd GPU", this.info);
                return false;
            }
        }

        // oc.mem_clock = this.stat.memclk;
        // console.log(`gpu #${this.index} can be overclocked`, oc)

        return oc;
    }
}
 
 
module.exports = AmdGPU;