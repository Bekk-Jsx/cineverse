import config from 'config';
import nano from 'nano';

// Get CouchDB config from our config files
const couchdbConfig = config.get<{
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}>('couchdb');

const connectionUrl = `http://${couchdbConfig.username}:${couchdbConfig.password}@${couchdbConfig.host}:${couchdbConfig.port}`;

// Single nano instance — reused across the app
const couchdb = nano(connectionUrl);

export const db = couchdb.db.use(couchdbConfig.database);
export default couchdb;