import nodemailer from "nodemailer";
import { readFile } from "fs/promises";
import { join } from "path";
import handlebars from "handlebars";
import { config } from "../config";

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

class Email {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  private async loadTemplate(templateName: string): Promise<string> {
    const templatePath = join(
      __dirname,
      "..",
      "templates",
      "email",
      `${templateName}.hbs`
    );
    return readFile(templatePath, "utf-8");
  }

  async send({ to, subject, template, context }: EmailOptions): Promise<void> {
    try {
      // Load and compile template
      const templateContent = await this.loadTemplate(template);
      const compiledTemplate = handlebars.compile(templateContent);
      const html = compiledTemplate(context);

      // Send email
      await this.transporter.sendMail({
        from: `${config.app.name} <${config.email.from}>`,
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    verificationUrl: string
  ): Promise<void> {
    await this.send({
      to,
      subject: "Email Verification",
      template: "email-verification",
      context: {
        name,
        verificationUrl,
        appName: config.app.name,
      },
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string
  ): Promise<void> {
    await this.send({
      to,
      subject: "Password Reset",
      template: "password-reset",
      context: {
        name,
        resetUrl,
        appName: config.app.name,
      },
    });
  }

  async sendRoleApplicationApproved(
    to: string,
    name: string,
    role: string
  ): Promise<void> {
    await this.send({
      to,
      subject: "Role Application Approved",
      template: "role-application-approved",
      context: {
        name,
        role,
        appName: config.app.name,
      },
    });
  }

  async sendRoleApplicationRejected(
    to: string,
    name: string,
    role: string,
    reason: string
  ): Promise<void> {
    await this.send({
      to,
      subject: "Role Application Status Update",
      template: "role-application-rejected",
      context: {
        name,
        role,
        reason,
        appName: config.app.name,
      },
    });
  }
}

export const emailService = new Email(); 