const { MeiliSearch } = require("meilisearch");
require("dotenv").config();

const client = new MeiliSearch({
  host: "https://ms-66d57f8fb39e-23456.lon.meilisearch.io", 
  apiKey: process.env.MEILI_MASTER_KEY, 
});

const userIndex = client.index("nodex"); 

module.exports = userIndex;
