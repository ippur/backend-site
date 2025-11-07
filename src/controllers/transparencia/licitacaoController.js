import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * 🔹 Retorna todas as licitações, ordenadas por data de criação (mais recentes primeiro)
 */
export const getLicitacoes = async (_req, res) => {
  try {
    const list = await prisma.licitacao.findMany({
      orderBy: { criadoEm: "desc" },
    });
    res.json(list);
  } catch (error) {
    console.error("Erro ao buscar licitações:", error);
    res.status(500).json({ error: "Erro ao buscar licitações" });
  }
};

/**
 * 🔹 Retorna uma licitação específica por ID
 */
export const getLicitacao = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const item = await prisma.licitacao.findUnique({ where: { id } });
    if (!item) {
      return res.status(404).json({ error: "Licitação não encontrada" });
    }
    res.json(item);
  } catch (error) {
    console.error("Erro ao buscar licitação:", error);
    res.status(500).json({ error: "Erro ao buscar licitação" });
  }
};

/**
 * 🔹 Cria uma nova licitação
 */
export const postLicitacao = async (req, res) => {
  try {
    const { titulo, modalidade, status, data } = req.body;
    const arquivo = req.file ? `/uploads/${req.file.filename}` : null;

    const item = await prisma.licitacao.create({
      data: {
        titulo,
        modalidade,
        status,
        data: new Date(data),
        arquivo,
      },
    });

    res.json(item);
  } catch (error) {
    console.error("Erro ao criar licitação:", error);
    res.status(500).json({ error: "Erro ao criar licitação" });
  }
};

/**
 * 🔹 Atualiza uma licitação existente
 */
export const putLicitacao = async (req, res) => {
  const id = Number(req.params.id);

  try {
    const { titulo, modalidade, status, data } = req.body;
    const arquivo = req.file ? `/uploads/${req.file.filename}` : undefined;

    const item = await prisma.licitacao.update({
      where: { id },
      data: {
        titulo,
        modalidade,
        status,
        ...(data ? { data: new Date(data) } : {}),
        ...(arquivo !== undefined ? { arquivo } : {}),
      },
    });

    res.json(item);
  } catch (error) {
    console.error("Erro ao atualizar licitação:", error);
    res.status(500).json({ error: "Erro ao atualizar licitação" });
  }
};

/**
 * 🔹 Exclui uma licitação
 */
export const deleteLicitacao = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.licitacao.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    console.error("Erro ao excluir licitação:", error);
    res.status(500).json({ error: "Erro ao excluir licitação" });
  }
};
