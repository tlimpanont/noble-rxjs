const MongoClient = require('mongodb').MongoClient;

// Database Name
const dbName = process.env.DB_NAME;

// Connection URL
const url = process.env.CONNECTION_URL;

// Use connect method to connect to the server
export const dbClientConnect = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, client) => {
      if (err) reject(err)
      console.log("Connected successfully to server");
      resolve({db: client.db(dbName), client: client});
    });
  })
};
