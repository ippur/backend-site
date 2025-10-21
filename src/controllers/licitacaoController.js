import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getLicitacoes = async (_req, res) => {
  const list = await prisma.licitacao.findMany({ orderBy: { criadoEm: "desc" } });
  res.json(list);
};

export const postLicitacao = async (req, res) => {
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
};

export const putLicitacao = async (req, res) => {
  const id = Number(req.params.id);
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
};

export const deleteLicitacao = async (req, res) => {
  const id = Number(req.params.id);
  await prisma.licitacao.delete({ where: { id } });
  res.json({ ok: true });
};
