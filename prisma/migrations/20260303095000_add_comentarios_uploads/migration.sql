-- Add comentarios (opcional) para uploads

ALTER TABLE "DocumentoTransparencia"
ADD COLUMN "comentarios" TEXT;

ALTER TABLE "Licitacao"
ADD COLUMN "comentarios" TEXT;