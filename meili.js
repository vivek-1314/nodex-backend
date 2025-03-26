const { MeiliSearch } = require("meilisearch");
require("dotenv").config();

const client = new MeiliSearch({
  host: "https://ms-6cfda14ef89c-20756.lon.meilisearch.io", 
  apiKey: process.env.MEILI_MASTER_KEY, 
});

const userIndex = client.index("nodex"); 

module.exports = userIndex;
