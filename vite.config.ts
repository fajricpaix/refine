import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";
export default defineConfig({
    plugins: [
      react(),
      {
        name: "vite-itunes-library-api",
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url?.startsWith("/api/itunes-library")) {
              try {
                const xmlPath = path.resolve(__dirname, "public", "iTunes Music Library.xml");
                const xml = await fs.promises.readFile(xmlPath, "utf-8");
                res.setHeader("Content-Type", "application/xml");
                res.end(xml);
              } catch (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: (error as Error).message }));
              }
              return;
            }
            next();
          });
        },
      },
    ],
    resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@providers": path.resolve(__dirname, "src/providers"),
    },
  },
});