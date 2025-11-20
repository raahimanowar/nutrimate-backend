import app from "./app.js";
import { logger } from "./utils/logger.js";

// ---------------- SERVER ----------------
const port = Number(process.env.PORT) || 5000;

app.listen(port, () => {
  logger.success(`🚀 Server running at http://localhost:${port}/api`);
});