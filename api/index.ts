export default function handler(req: any, res: any) {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://nutrimate-bice.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  import("../src/app.js")
    .then((module) => {
      const app = module.default;
      app(req, res);
    })
    .catch((error) => {
      console.error("Error loading app:", error);
      res
        .status(500)
        .json({ error: "Internal server error", message: error.message });
    });
}
