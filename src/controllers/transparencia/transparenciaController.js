// src/controllers/transparencia/transparenciaController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

/**
 * GET /api/transparencia?tipo=receita|despesa|convenio|...
 */
export const getTransparencia = async (req, res) => {
  try {
    const { tipo } = req.query;

    const where = tipo
      ? { tipo: { equals: String(tipo), mode: "insensitive" } }
      : {};

    const documentos = await prisma.documentoTransparencia.findMany({
      where,
      orderBy: { data: "desc" },
    });

    res.json(documentos);
  } catch (error) {
    console.error("Erro ao buscar documentos:", error);
    res.status(500).json({ error: "Erro ao buscar documentos de transparência" });
  }
};

/** GET /api/transparencia/:id */
export const getDocumento = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const documento = await prisma.documentoTransparencia.findUnique({ where: { id } });
    if (!documento) return res.status(404).json({ error: "Documento não encontrado" });
    res.json(documento);
  } catch (error) {
    console.error("Erro ao buscar documento:", error);
    res.status(500).json({ error: "Erro ao buscar documento" });
  }
};

/** POST /api/transparencia (multipart com campo 'arquivo') */
export const postTransparencia = async (req, res) => {
  try {
    const { titulo, tipo, data } = req.body;
    const arquivo = req.file ? `/uploads/${req.file.filename}` : null;

    const novoDoc = await prisma.documentoTransparencia.create({
      data: { titulo, tipo, data: new Date(data), arquivo },
    });

    res.json(novoDoc);
  } catch (error) {
    console.error("Erro ao criar documento:", error);
    res.status(500).json({ error: "Erro ao criar documento de transparência" });
  }
};

/** PUT /api/transparencia/:id (multipart opcional) */
export const putTransparencia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titulo, tipo, data } = req.body;
    const arquivo = req.file ? `/uploads/${req.file.filename}` : undefined;

    const atualizado = await prisma.documentoTransparencia.update({
      where: { id },
      data: { titulo, tipo, data: new Date(data), ...(arquivo ? { arquivo } : {}) },
    });

    res.json(atualizado);
  } catch (error) {
    console.error("Erro ao atualizar documento:", error);
    res.status(500).json({ error: "Erro ao atualizar documento de transparência" });
  }
};

/** DELETE /api/transparencia/:id */
export const deleteTransparencia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.documentoTransparencia.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    console.error("Erro ao deletar documento:", error);
    res.status(500).json({ error: "Erro ao deletar documento de transparência" });
  }
};
