const GPU = require("./gpu")

class NvidiaGPU extends GPU {

    maxTemp = 50;
    power = {
        max: 80,
        min: 60,
        step: {
            up: 5,
            down: 10
        }
    }

    getOverclockParams() {
        const oc = {}
        const power_limit = this.oc.nvidia.power_limit[this.index];
        if (this.isOverheated()) {
            if (power_limit > this.power.min) {
                const power = power_limit - this.power.step.down;
                oc.power_limit = power >= this.power.min ? power : this.power.min;  
            } else {
                console.log("Cannot power down nvidia GPU", this.info);
                return false;
            }
        } else {
            if (power_limit < this.power.max) {
                const power = power_limit + this.power.step.up;
                oc.power_limit = power <= this.power.max ? power : this.power.max;  
            } else {
                console.log("Cannot power up nvidia GPU", this.info);
                return false;
            }
        }
        return oc;
    }
}
 
module.exports = NvidiaGPU;