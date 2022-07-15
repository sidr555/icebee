require('dotenv').config();
const { RESTDataSource } = require('apollo-datasource-rest')

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
        request.headers.set('Authorization', `Bearer: ${this.token}`)
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

    async getFarms () {
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
    async getWorkers ({farm}) {
        return this.get(`/farms/${farm}/workers`)
    }
}


module.exports = HiveAPI;