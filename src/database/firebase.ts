import { DATABASE_URL } from "../../config.json";
import path from "path";

var admin = require("firebase-admin");

// Fetch the service account key JSON file contents
var serviceAccount = require(path.join(
  process.cwd(),
  "./firebase-credentials.json"
));

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: DATABASE_URL,
});

export const rdb = admin.database();
export const firebase = admin;
