import jwt from "jsonwebtoken";

export function auth(req, res, next) {
  const header = req.headers.authorization; // Bearer <token>
  if (!header) return res.status(401).json({ error: "Token não enviado" });

  const [, token] = header.split(" ");
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, tipo }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido" });
  }
}

export function onlyAdmin(req, res, next) {
  if (req.user?.tipo !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores" });
  }
  next();
}
