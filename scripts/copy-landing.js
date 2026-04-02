/**
 * Copies landing/ to dist/ for Vercel static output.
 * Keeps requirements.txt at repo root for Streamlit Cloud while avoiding Python build on Vercel.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const src = path.join(root, "landing");
const dest = path.join(root, "dist");

fs.mkdirSync(dest, { recursive: true });
fs.cpSync(src, dest, { recursive: true });
