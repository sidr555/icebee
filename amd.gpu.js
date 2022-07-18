const GPU = require("./gpu")

class AmdGPU extends GPU {

    maxTemp = 50;
    core_clock = {
        min: 1200,
        max: 2200,
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
            down: 100
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
            core_clock: "1000",
            mem_clock: "2000",
            core_state: "1",
            fan_speed: "0",
            power_limit: "0"
        }
        if (this.isOverheated()) {
            if (this.stat.coreclk > this.core_clock.min) {
                const core_clock = this.stat.coreclk - this.core_clock.step.down;
                oc.core_clock = core_clock >= this.core_clock.min ? core_clock : this.core_clock.min;  
            } else {
                console.log("Cannot power down amd GPU", this.info);
                return false;
            }
        } else {
            if (this.stat.coreclk < this.core_clock.max) {
                const core_clock = this.stat.coreclk + this.core_clock.step.up;
                oc.core_clock = core_clock <= this.core_clock.max ? core_clock : this.core_clock.max;  
            } else {
                console.log("Cannot power up amd GPU", this.info);
                return false;
            }
        }

        oc.mem_clock = this.stat.memclk;

        return oc;
    }
}
 
 
module.exports = AmdGPU;