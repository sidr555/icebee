const GPU = require("./gpu")

class AmdGPU extends GPU {
    temp = {
        max: 57,
        critical: 62
    }
    
    oc_keys = ["core_clock", "mem_clock"]

    core_clock = {
        min: 600,
        max: 1200,
        step: {
            up: 50,
            down: 100
        }
    }
    mem_clock = {
        min: 1600,
        max: 2200,
        step: {
            up: 50,
            down: 200
        }
    }

    oc_keys = ["core_clock", "mem_clock"];
    
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

        const oc = {}
        let core_clock = this.oc.amd.core_clock[this.index];
        let mem_clock = this.oc.amd.mem_clock[this.index];

        oc.mem_clock = mem_clock;

        if (this.isOverheated()) {
            console.log(`GPU (a) w:${this.worker} #${this.index} is overheated ${this.stat.temp} (core_clock: ${core_clock}, mem_clock: ${mem_clock}, power: ${this.stat.power})`);
            if (core_clock > this.core_clock.min) {
                core_clock -= this.core_clock.step.down;
                oc.core_clock = core_clock >= this.core_clock.min ? core_clock : this.core_clock.min; 
            } else {
                console.log("Cannot power down amd GPU", this.info);
                return false;
            }
        } else {
            if (core_clock < this.core_clock.max) {
                core_clock += this.core_clock.step.up;
                oc.core_clock = core_clock <= this.core_clock.max ? core_clock : this.core_clock.max;  
            } else {
                console.log("Cannot power up amd GPU", this.info);
                return false;
            }
        }

        // oc.mem_clock = this.stat.memclk;

        return oc;
    }
}
 
 
module.exports = AmdGPU;