import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getDocs = async (_req, res) => {
  const list = await prisma.documentoTransparencia.findMany({ orderBy: { data: "desc" } });
  res.json(list);
};

export const postDoc = async (req, res) => {
  const { titulo, tipo, data } = req.body;
  const arquivo = req.file ? `/uploads/${req.file.filename}` : null;

  const doc = await prisma.documentoTransparencia.create({
    data: {
      titulo,
      tipo,
      data: new Date(data),
      arquivo,
    },
  });
  res.json(doc);
};

export const deleteDoc = async (req, res) => {
  const id = Number(req.params.id);
  await prisma.documentoTransparencia.delete({ where: { id } });
  res.json({ ok: true });
};
