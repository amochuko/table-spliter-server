// jest.teardown.ts
import { dbClient } from "./src/common/database/sqlConnection";

export default async () => {
  console.log("idleCount:", dbClient.getPool().idleCount);
  console.log("totalCount:", dbClient.getPool().totalCount);
  console.log("waitingCount:", dbClient.getPool().waitingCount);

  console.log("🧹 Global teardown: closing dbClient pool...");

  await dbClient.getPool().end(); // Gracefully close DB connections
  console.log("✅ dbClient pool closed");
};
