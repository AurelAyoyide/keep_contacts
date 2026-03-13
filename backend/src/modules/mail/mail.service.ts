import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(MailService.name);

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('mail.host');
    const port = this.configService.get<number>('mail.port');
    const user = this.configService.get<string>('mail.user');
    const pass = this.configService.get<string>('mail.pass');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('Mail transporter configured');
    } else {
      // Fallback: log emails to console in development
      this.transporter = nodemailer.createTransport({
        jsonTransport: true,
      });
      this.logger.warn(
        'SMTP not configured — emails will be logged to console',
      );
    }
  }

  async sendVerificationEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const baseUrl = this.configService.get<string>('baseUrl');
    const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('mail.from') || '"Keep Contacts" <noreply@keepcontacts.app>',
      to: email,
      subject: 'Vérifiez votre adresse email — Keep Contacts',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bienvenue sur Keep Contacts !</h2>
          <p>Merci de vous être inscrit. Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p>
          <p style="margin: 24px 0;">
            <a href="${verifyUrl}"
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Vérifier mon email
            </a>
          </p>
          <p style="color: #6B7280; font-size: 14px;">
            Si vous n'avez pas créé de compte, ignorez cet email.
          </p>
        </div>
      `,
    };

    await this.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
  ): Promise<void> {
    const frontendUrl = this.configService.get<string>('frontendUrl') || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: this.configService.get<string>('mail.from') || '"Keep Contacts" <noreply@keepcontacts.app>',
      to: email,
      subject: 'Réinitialisation de mot de passe — Keep Contacts',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Réinitialisation de votre mot de passe</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous :</p>
          <p style="margin: 24px 0;">
            <a href="${resetUrl}"
               style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </p>
          <p style="color: #6B7280; font-size: 14px;">
            Ce lien expire dans 1 heure. Si vous n'avez pas fait cette demande, ignorez cet email.
          </p>
        </div>
      `,
    };

    await this.sendMail(mailOptions);
  }

  private async sendMail(
    mailOptions: nodemailer.SendMailOptions,
  ): Promise<void> {
    try {
      const info = await this.transporter.sendMail(mailOptions);

      // If using jsonTransport (dev mode), log the email
      if (info.message) {
        this.logger.debug(
          `[DEV EMAIL] To: ${mailOptions.to} | Subject: ${mailOptions.subject}`,
        );
        this.logger.debug(info.message);
      } else {
        this.logger.log(`Email sent to ${mailOptions.to}`);
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${mailOptions.to}`, error);
      throw error;
    }
  }
}
