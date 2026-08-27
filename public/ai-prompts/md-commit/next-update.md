# Next Update: Hybrid MongoDB with JSON Fallback Architecture

## Objective
Upgrade the system to primarily use MongoDB for fast, efficient data querying, while preserving the existing local `.json` file system as a reliable, automatic fallback. If MongoDB disconnects or fails, the application should seamlessly switch to reading and writing from the local JSON files without crashing.

## Complete Implementation Plan

### Phase 1: Setup and Initialization
1. **Install Dependencies:** Install the MongoDB driver (e.g., `npm install mongodb` or `mongoose`).
2. **Configuration:** Add your MongoDB connection string (URI) to a `.env` file.
3. **Database Manager Module:** Create a centralized file (e.g., `utils/db-manager.js`) to act as a "wrapper" or "proxy" for all database operations. 

### Phase 2: Connection & State Management
1. **Connection State:** The `db-manager.js` will maintain a variable like `isMongoAlive` (boolean).
2. **Startup Connection:** When `server.js` starts, it attempts to connect to MongoDB. 
   - If successful: `isMongoAlive = true`.
   - If failed: Log a warning, set `isMongoAlive = false`, and allow the server to start anyway (relying on JSON files).
3. **Reconnection Logic:** Set up listeners for MongoDB connection drops to toggle `isMongoAlive` automatically.

### Phase 3: The Hybrid CRUD Wrapper Logic
Instead of API routes calling MongoDB or `fs` directly, they will call the wrapper functions in `db-manager.js`.

**Read Operations (GET):**
1. Check `isMongoAlive`.
2. **If True:** Try fetching the data from MongoDB. 
   - *If the query succeeds:* Return the data.
   - *If the query throws an error (sudden failure):* Catch the error, log it, and trigger the JSON fallback.
3. **If False (or Fallback Triggered):** Read the data from the appropriate `.json` file (e.g., `company-database-z.json`) and return it.

**Write Operations (POST / PUT):**
To ensure the local files are always a perfect backup, implement a **"Write-Through"** or **"Dual-Write"** strategy:
1. **Always** write the new data to the local `.json` file first using `fs.writeFile`.
2. Check `isMongoAlive`.
3. **If True:** Also write/update the document in MongoDB.
   - *If MongoDB fails here:* The data is safely saved in the JSON file. 

### Phase 4: Migration & Synchronization
1. **Data Seeder Script:** Create a standalone script (`migrate-json-to-mongo.js`). This script will read all existing `.json` files in `local-data` and bulk-insert them into your MongoDB collections.
2. **Self-Healing / Syncing (Optional but Recommended):** Since MongoDB might be down while a user saves data to a JSON file, the databases could go out of sync. Create a lightweight check on server startup that compares the JSON files to MongoDB and updates MongoDB with any newer records.

### Phase 5: Refactoring `server.js`
1. Go through `server.js` and locate all instances where `fs.readFile` or `fs.writeFile` is used for database operations.
2. Replace them with the new functions from `db-manager.js` (e.g., `await DB.getCompany(companyId)`).
3. Test all API routes with MongoDB running, and then test again with MongoDB manually stopped to ensure the fallback works flawlessly.
