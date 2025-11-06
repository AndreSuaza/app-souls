import { Resend } from "resend";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export const sendEmailVerification = async (email: string, token: string) => {

  console.log('incia envio de corre');
  
  try {
    await resend.emails.send({
      from: "Souls In Xtinction Verificación de correo <verificacion@soulsinxtinction.com>",
      to: email,
      subject: "Verifica tu correo",
      html: `
        <html lang="es">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Verifica tu cuenta - Souls In Xtinction</title>
        </head>
        <body style="margin:0;padding:0;background-color:#f5f7fb;font-family:Arial, Helvetica, sans-serif;">
          <!-- Wrapper table -->
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f5f7fb;padding:24px 0;">
            <tr>
              <td align="center">
                <!-- Container -->
                <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.06);">
                  
                  <!-- Header / Logo -->
                  <tr>
                    <td style="padding:20px 24px;background:linear-gradient(90deg,#000000,#000000);color:#fff;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td style="vertical-align:middle;">
                            <!-- Logo: reemplazar src -->
                            <img src="https://www.soulsinxtinction.com/souls-in-xtinction-logo-h.webp" alt="Souls In Xtinction" width="140" style="display:block;border:0;outline:none;text-decoration:none;">
                          </td>
                          <td align="right" style="color:#fff;font-size:14px;">
                            <strong>Souls In Xtinction</strong><br>
                            Verificación de cuenta
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:28px 32px;color:#0f1724;">
                      <h1 style="margin:0 0 12px;font-size:20px;color:#0b1220;">¡Activa tu cuenta!</h1>
                      <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#334155;">
                        Gracias por unirte a <strong>Souls In Xtinction</strong>. Para completar el registro y activar tu cuenta, confirma tu correo electrónico haciendo clic en el botón de abajo.
                      </p>

                      <!-- Button -->
                      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;">
                        <tr>
                          <td align="center">
                            <a href="${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}" style="background:linear-gradient(90deg,#c59f0f,#f2d479);color:#081024;text-decoration:none;padding:12px 22px;border-radius:8px;display:inline-block;font-weight:600;">
                              Verificar mi cuenta
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:18px 0 0;font-size:14px;color:#475569;line-height:1.5;">
                        Si no te registraste en Souls In Xtinction o crees que este correo es un error, puedes ignorarlo. Este enlace expirará en 24 horas.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:18px 32px;background:#fbfbfd;color:#64748b;font-size:13px;">
                      <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                        <tr>
                          <td>
                            <strong style="color:#0b1220;">Souls In Xtinction</strong><br>
                            Trading Card Game. © <span id="year">2025</span>
                          </td>
                          <td align="right" style="vertical-align:middle;">
                            <a href="https://instagram.com/soulsinxtinction" style="text-decoration:none;color:#0b1220;margin-left:8px;">Instagram</a> |
                            <a href="https://facebook.com/soulsinxtinction" style="text-decoration:none;color:#0b1220;margin-left:8px;">Facebook</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <!-- /Container -->
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return {
      success: true,
    };
  } catch (error) {
    console.log(error);
    return {
      error: true,
    };
  }
};