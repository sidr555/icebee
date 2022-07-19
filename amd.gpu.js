const GPU = require("./gpu")

class AmdGPU extends GPU {

    maxTemp = 50;
    core_clock = {
        min: 1200,
        max: 2200,
        step: {
            up: 50,
            down: 200
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
        const oc = {
            core_clock: this.oc.amd.core_clock[this.index],
            mem_clock: this.oc.amd.mem_clock[this.index],
            core_state: this.oc.amd.core_state[this.index],
            fan_speed: this.oc.amd.fan_speed ? this.oc.amd.fan_speed[this.index] : null,
            power_limit: this.oc.amd.power_limit ? this.oc.amd.power_limit[this.index] : null
        }
        if (this.isOverheated()) {
            if (oc.core_clock > this.core_clock.min) {
                const core_clock = oc.core_clock - this.core_clock.step.down;
                oc.core_clock = core_clock >= this.core_clock.min ? core_clock : this.core_clock.min;  
            } else {
                console.log("Cannot power down amd GPU", this.info);
                return false;
            }
        } else {
            if (oc.core_clock < this.core_clock.max) {
                const core_clock = oc.core_clock + this.core_clock.step.up;
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