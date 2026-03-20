-- CreateTable
CREATE TABLE "NoticiaImagem" (
    "id" SERIAL NOT NULL,
    "noticiaId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoticiaImagem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "NoticiaImagem" ADD CONSTRAINT "NoticiaImagem_noticiaId_fkey" FOREIGN KEY ("noticiaId") REFERENCES "Noticia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
