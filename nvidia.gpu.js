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
        if (this.isOverheated()) {
            if (this.stat.power > this.power.min) {
                const power = this.stat.power - this.power.step.down;
                oc.power = power >= this.power.min ? power : this.power.min;  
            } else {
                console.log("Cannot power down nvidia GPU", this.info);
                return false;
            }
        } else {
            if (this.stat.power < this.power.max) {
                const power = this.stat.power + this.power.step.up;
                oc.power = power <= this.power.max ? power : this.power.max;  
            } else {
                console.log("Cannot power up nvidia GPU", this.info);
                return false;
            }
        }
        return oc;
    }
}
 
module.exports = NvidiaGPU;