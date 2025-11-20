// Simple handler that sets CORS headers before anything else
export default function handler(req: any, res: any) {
  // Set CORS headers IMMEDIATELY before any processing
  res.setHeader("Access-Control-Allow-Origin", "https://nutrimate-bice.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");

  // Handle OPTIONS preflight immediately
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  // Import and use the Express app
  import("../src/app.js").then((module) => {
    const app = module.default;
    app(req, res);
  }).catch((error) => {
    console.error("Error loading app:", error);
    res.status(500).json({ error: "Internal server error", message: error.message });
  });
}