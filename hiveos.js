require('dotenv').config();
const { RESTDataSource } = require('apollo-datasource-rest');

class HiveAPI extends RESTDataSource {

    constructor(config) {
        super()

        this.baseURL = process.env.HIVEOS_API_BASE_URL || 'https://api2.hiveos.farm/api/v2/'
        this.token = "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI3MTEwZTIyMi02ZGM2LTQ4MmYtOGE1OS0wOTcwYmQ2NjdkZGQifQ.eyJleHAiOjE5NzM0MDk3ODAxOTksIm5iZiI6MTY1Nzc5MDU4MDE5OSwiaWF0IjoxNjU3NzkwNTgwMTk5LCJqdGkiOiIxOTc3NTIzMi1jZjY5LTQ5MTEtYmRjMC03M2Q1N2E1MGM0YjgiLCJzdWIiOiIxOTc3NTIzMi1jZjY5LTQ5MTEtYmRjMC03M2Q1N2E1MGM0YjgifQ.2kDf7jrEhvvyVxuOg5SYrj0NSZ1nyB9qNIWOEuskw6Y"
        // this.credentials = {
        //     login: process.env.HIVEOS_API_LOGIN,
        //     pass: process.env.HIVEOS_API_PASSWORD
        // }
    }


    async willSendRequest(request) {
        request.headers.set('Authorization', `Bearer ${this.token}`)
    }

    // async doLogin() {
    //     const  data = {
    //         login: this.credentials.login, 
    //         password: this.credentials.pass
    //     }

    //     return this.post(`${this.baseUrl}/auth/login`, JSON.stringify(data)).then( r => {
    //             console.log("dologin res", r)
    //         }).catch( e => {
    //             console.log("dologinerr", e)
    //         })

    // }

    getFarms() {
        return this.get('/farms')
        // .then( res => {
        //     console.log("farm RESS", res.data);
        // }).catch( e => {
        //     if (e.extensions.code === "UNAUTHENTICATED") {
        //         console.log("UNAUTHENTICATED");
        //     }
        //     console.log("getFarms error", e);
        // });
    }

    getWorkers({ farm }) {
        return this.get(`/farms/${farm}/workers`)
    }

    getWorker({ farm, worker }) {
        return this.get(`/farms/${farm}/workers/${worker}`)
    }

    async overclockWorker(farm, worker, gpu_data ) {
        console.log("HiveOS overclock", farm, worker, gpu_data);
        const res = await this.post(`/farms/${farm}/workers/overclock`, { gpu_data });

        // console.log("HiveOS overclock res", res.commands[0].commands);
        console.log("HiveOS overclock res", res.length);
        
        if (res.commands && res.commands.length) {
            const workerUpdated = await this.getWorker({ farm, worker });
            console.log("overclock worker up", workerUpdated)
        // } else {
            // return;
        } 
    }

    async overclock_bak({worker, index, amd, nvidia}) {
        amd |= {
            tref_timing: ""
        }

        nvidia |= {
            tref_timing: ""
        }

        const data = { 
            "gpu_data": [
                { 
                    "gpus": [
                        { 
                            "worker_id": worker, 
                            "gpu_index": index
                        }
                    ],
                    amd,
                    nvidia
                }
            ], 
            "common_data": [], 
            "workerId": worker_id 
        }

        console.log("HiveOS overclock", data);

        return this.post(`/farms/${farm}/workers/overclock`, data);
    }

    async stopMiner(worker) {
        
    } 

    async startMiner(worker) {
        
    } 


}


module.exports = HiveAPI;
