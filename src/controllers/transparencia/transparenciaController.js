// src/controllers/transparencia/transparenciaController.js
import { PrismaClient } from "@prisma/client";
import { supabase, BUCKET } from "../../utils/supabase.js";
import fs from "fs";
import path from "path";
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
    const { titulo, tipo, data, comentarios } = req.body;

    let arquivo = null;

    if (req.file) {
      const filePath = req.file.path;
      const fileBuffer = fs.readFileSync(filePath);

      const fileName = `${Date.now()}-${req.file.originalname}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(fileName, fileBuffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        console.error(error);
        return res.status(500).json({ error: "Erro ao enviar arquivo para storage" });
      }

      const { data: url } = supabase.storage
        .from(BUCKET)
        .getPublicUrl(fileName);

      arquivo = url.publicUrl;

      fs.unlinkSync(filePath); // remove arquivo temporário
    }

    const novoDoc = await prisma.documentoTransparencia.create({
      data: {
        titulo,
        tipo,
        data: new Date(data),
        comentarios,
        arquivo,
      },
    });

    res.json(novoDoc);
  } catch (error) {
    console.error("Erro ao criar documento:", error);
    res.status(500).json({ error: "Erro ao criar documento" });
  }
};

/** PUT /api/transparencia/:id (multipart opcional) */
export const putTransparencia = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titulo, tipo, data, comentarios } = req.body;
    const arquivo = req.file ? `/uploads/${req.file.filename}` : undefined;

    const atualizado = await prisma.documentoTransparencia.update({
      where: { id },
      data: { titulo, tipo, data: new Date(data), comentarios, ...(arquivo ? { arquivo } : {}) },
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
