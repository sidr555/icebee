const { gql } = require('apollo-server');
const fs = require('fs');
const path = require('path');

//function that imports .graphql files
const importGraphQL = (file) =>{
  return fs.readFileSync(path.join(__dirname, file),"utf-8");
}

const gqlWrapper = (...files)=>{
//   console.log("wrap graphql files", ...files)
  return gql`${files}`;
}


const gpus = importGraphQL('./gpus.graphql');
const workers = importGraphQL('./workers.graphql');
const farms = importGraphQL('./farms.graphql');
const queries = importGraphQL('./queries.graphql');
const mutations = importGraphQL('./mutations.graphql');


const schema = gqlWrapper(gpus, workers, farms, queries, mutations);
// console.log(schema)
module.exports = schema;