import nodemailer from "nodemailer";
import { readFile, readdir } from "fs/promises";
import { join } from "path";
import handlebars from "handlebars";
import { config } from "../config";

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

interface BaseEmailContext {
  name?: string;
  appName: string;
  supportEmail: string;
}

class Email {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.initializeTransporter().catch((err) => {
      console.error("Failed to initialize email transporter:", err);
    });

    // Register handlebars partials
    this.registerPartials().catch((err) => {
      console.error("Failed to register partials:", err);
    });
  }

  private async initializeTransporter(): Promise<void> {
    if (process.env.NODE_ENV === "development") {
      // Create a test account for development
      const testAccount = await nodemailer.createTestAccount();
      console.log("Ethereal Email credentials:", {
        user: testAccount.user,
        pass: testAccount.pass,
      });

      this.transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
        logger: true,
        debug: true,
      });
    } else {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: false,
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });
    }
  }

  private async registerPartials(): Promise<void> {
    try {
      const layoutsPath = join(
        __dirname,
        "..",
        "templates",
        "email",
        "layouts"
      );
      const files = await readdir(layoutsPath);

      for (const file of files) {
        if (file.endsWith(".hbs")) {
          const partialName = file.replace(".hbs", "");
          const partialContent = await readFile(
            join(layoutsPath, file),
            "utf-8"
          );
          handlebars.registerPartial(`layouts/${partialName}`, partialContent);
        }
      }

      // Also register the base layout as just 'base' for backward compatibility
      const baseContent = await readFile(join(layoutsPath, "base.hbs"), "utf-8");
      handlebars.registerPartial("base", baseContent);
    } catch (error) {
      console.error("Error registering partials:", error);
      throw error;
    }
  }

  private async loadTemplate(templateName: string): Promise<string> {
    try {
      const templatePath = join(
        __dirname,
        "..",
        "templates",
        "email",
        `${templateName}.hbs`
      );
      return await readFile(templatePath, "utf-8");
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
      throw error;
    }
  }

  private getBaseContext(name?: string): BaseEmailContext {
    return {
      name,
      appName: config.app.name,
      supportEmail: config.email.user,
    };
  }

  private async sendEmail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, any>
  ): Promise<void> {
    try {
      const baseContext = this.getBaseContext(context.name);
      await this.send({
        to,
        subject,
        template,
        context: { ...baseContext, ...context },
      });
    } catch (error) {
      console.error("Error in sendEmail:", error);
      throw error;
    }
  }

  private async send({
    to,
    subject,
    template,
    context,
  }: EmailOptions): Promise<void> {
    try {
      const templateContent = await this.loadTemplate(template);
      const compiledTemplate = handlebars.compile(templateContent);
      const html = compiledTemplate(context);

      const info = await this.transporter.sendMail({
        from: `${config.app.name} <${config.email.from}>`,
        to,
        subject,
        html,
        text: html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text alternative
      });

      // Log Ethereal URL for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      console.log("Email service is ready");
    } catch (error) {
      console.error("Email service verification failed:", error);
      throw error;
    }
  }

  async sendTestEmail(to: string): Promise<void> {
    await this.sendEmail(to, "Test Email", "password-reset", {
      name: "Test User",
      resetUrl: "http://example.com/test",
    });
  }

  async sendVerificationEmail(
    to: string,
    name: string,
    verificationUrl: string
  ): Promise<void> {
    await this.sendEmail(to, "Email Verification", "email-verification", {
      name,
      verificationUrl,
    });
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string
  ): Promise<void> {
    await this.sendEmail(to, "Password Reset", "password-reset", {
      name,
      resetUrl,
    });
  }

  async sendPasswordChangeNotification(
    to: string,
    name: string
  ): Promise<void> {
    await this.sendEmail(
      to,
      "Password Changed Successfully",
      "password-change-notification",
      {
        name,
      }
    );
  }

  async sendRoleApplicationApproved(
    to: string,
    name: string,
    role: string
  ): Promise<void> {
    await this.sendEmail(
      to,
      "Role Application Approved",
      "role-application-approved",
      {
        name,
        role,
      }
    );
  }

  async sendRoleApprovalEmail(to: string, role: string): Promise<void> {
    await this.sendEmail(to, `${role} Role Approved`, "role-approval", {
      role,
      dashboardUrl: `${config.app.clientUrl}/dashboard`,
    });
  }

  async sendRoleApplicationRejected(
    to: string,
    name: string,
    role: string,
    reason: string
  ): Promise<void> {
    await this.sendEmail(
      to,
      "Role Application Status Update",
      "role-application-rejected",
      {
        name,
        role,
        reason,
      }
    );
  }

  async sendAdminNotification(subject: string, message: string): Promise<void> {
    await this.sendEmail("admnkfats@gmail.com", subject, "admin-notification", {
      message,
    });
  }
}

export const emailService = new Email();
