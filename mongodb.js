const MongoClient = require('mongodb').MongoClient;
const chalk = require('chalk');
// Database Name
const dbName = process.env.DB_NAME;

// Connection URL
const url = process.env.CONNECTION_URL;

// Use connect method to connect to the server
export const dbClientConnect = () => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(url, (err, client) => {
      if (err) {
        reject(err);
        console.error(chalk.red(JSON.stringify(err, null, 4)));
      } else {
        const db = client.db(dbName);
        console.log("Connected successfully to server");
        resolve({db: db, client: client});
      }
    });
  })
};

export const addDocument = (collectionName, data) => {
  if (process.env.DB_NAME && process.env.CONNECTION_URL) {
    return new Promise((resolve, reject) => {
      dbClientConnect().then(({db, client}) => {
        // Get the documents collection
        const collection = db.collection(collectionName);
        // Insert some documents
        collection.insertOne(Object.assign(data, {timestamp: new Date()}), function (err, result) {
          if (err) {
            reject(err);
            console.error(chalk.red(JSON.stringify(err, null, 4)));
          }
          client.close();
          resolve(result);
        });
      });
    });
  }
}
