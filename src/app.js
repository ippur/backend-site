import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import noticiaRoutes from "./routes/noticias.js";
import licitacaoRoutes from "./routes/licitacoes.js";
import transparenciaRoutes from "./routes/transparencia.js";
import usuarioRoutes from "./routes/usuarios.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// servir uploads estaticamente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Rotas
app.use("/api/noticias", noticiaRoutes);
app.use("/api/licitacoes", licitacaoRoutes);
app.use("/api/transparencia", transparenciaRoutes);
app.use("/api/usuarios", usuarioRoutes);

// Health check
app.get("/", (req, res) => res.send("API IPPUR - Online 🚀"));

export default app;
