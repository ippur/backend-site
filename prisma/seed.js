import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const nome = "Administrador IPPUR";
  const email = "ti@ippur.pa.gov.br";
  const senha = "ippur2025";
  const tipo = "admin";

  // Criptografa a senha
  const hash = await bcrypt.hash(senha, 10);

  // Verifica se já existe
  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    console.log("⚠️ Usuário admin já existe:", existente.email);
    return;
  }

  // Cria o usuário
  const novo = await prisma.usuario.create({
    data: { nome, email, senha: hash, tipo },
  });

  console.log("✅ Usuário administrador criado com sucesso!");
  console.log("📧 Email:", novo.email);
  console.log("🔑 Senha:", senha);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error("❌ Erro ao criar usuário:", e);
    prisma.$disconnect();
    process.exit(1);
  });
