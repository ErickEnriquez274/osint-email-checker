import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: `"GhostNet" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Recuperación de contraseña — GhostNet",
    html: `
      <div style="font-family: monospace; background: #0d1117; color: #c8d8e0; padding: 40px; max-width: 500px; margin: 0 auto; border-radius: 12px;">
        <h2 style="color: #00e5ff; letter-spacing: 0.1em;">GHOST<span style="color: #ffffff;">NET</span></h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón para continuar:</p>
        <a href="${resetUrl}" style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #00e5ff; color: #0d1117; border-radius: 6px; text-decoration: none; font-weight: bold;">
          Restablecer contraseña
        </a>
        <p style="color: #4a6070; font-size: 12px;">Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este correo.</p>
      </div>
    `,
  });
};