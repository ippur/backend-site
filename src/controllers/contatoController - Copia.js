import dns from "dns";
import nodemailer from "nodemailer";

dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function enviarContato(req, res) {
  try {
    const { nome, email, telefone, assunto, mensagem } = req.body;

    if (!nome || !email || !assunto || !mensagem) {
      return res.status(400).json({
        error: "Preencha os campos obrigatórios: nome, e-mail, assunto e mensagem.",
      });
    }

    const attachments = [];

    if (req.file) {
      attachments.push({
        filename: req.file.originalname,
        content: req.file.buffer,
        contentType: req.file.mimetype,
      });
    }

    await transporter.sendMail({
      from: `"Site IPPUR" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      replyTo: email,
      subject: `Contato pelo site: ${assunto}`,
      html: `
        <h2>Nova mensagem enviada pelo formulário do site</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Telefone / WhatsApp:</strong> ${telefone || "-"}</p>
        <p><strong>Assunto:</strong> ${assunto}</p>
        <p><strong>Mensagem:</strong></p>
        <p style="white-space: pre-line;">${mensagem}</p>
      `,
      attachments,
    });

    return res.json({ ok: true, message: "Mensagem enviada com sucesso." });
  } catch (error) {
    console.error("Erro ao enviar contato:", error);
    return res.status(500).json({
      error: "Não foi possível enviar a mensagem no momento.",
    });
  }
}