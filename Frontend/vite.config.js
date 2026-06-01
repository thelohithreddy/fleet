import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
        secure: false,
        ws: true,
        configure: (proxy, _options) => {
          proxy.on("error", (err, _req, _res) => {
            console.log("proxy error", err);
            if (err.code === "ECONNREFUSED") {
              console.log(
                "⚠️ Cannot connect to backend server. Please ensure:"
              );
              console.log("1. Backend server is running on port 5000");
              console.log("2. No firewall is blocking the connection");
              console.log("3. The backend URL is correct");
            }
          });
          proxy.on("proxyReq", (proxyReq, req, _res) => {
            console.log("Sending Request to Backend:", req.method, req.url);
            const bodyData = req.body;
            if (bodyData) {
              const bodyString = JSON.stringify(bodyData);
              proxyReq.setHeader("Content-Type", "application/json");
              proxyReq.setHeader(
                "Content-Length",
                Buffer.byteLength(bodyString)
              );
              proxyReq.write(bodyString);
            }
          });
          proxy.on("proxyRes", (proxyRes, req, _res) => {
            console.log(
              "Received Response from Backend:",
              proxyRes.statusCode,
              req.url
            );
            if (proxyRes.statusCode !== 200) {
              console.log("Response Headers:", proxyRes.headers);
            }
          });
        },
        timeout: 10000,
        proxyTimeout: 10000,
      },
    },
    cors: true,
  },
});
