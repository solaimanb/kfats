"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const promises_1 = require("fs/promises");
const path_1 = require("path");
const handlebars_1 = __importDefault(require("handlebars"));
const config_1 = require("../config");
class Email {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: config_1.config.email.host,
            port: config_1.config.email.port,
            auth: {
                user: config_1.config.email.user,
                pass: config_1.config.email.password,
            },
        });
    }
    async loadTemplate(templateName) {
        const templatePath = (0, path_1.join)(__dirname, "..", "templates", "email", `${templateName}.hbs`);
        return (0, promises_1.readFile)(templatePath, "utf-8");
    }
    async send({ to, subject, template, context }) {
        try {
            const templateContent = await this.loadTemplate(template);
            const compiledTemplate = handlebars_1.default.compile(templateContent);
            const html = compiledTemplate(context);
            await this.transporter.sendMail({
                from: `${config_1.config.app.name} <${config_1.config.email.from}>`,
                to,
                subject,
                html,
            });
        }
        catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }
    async sendVerificationEmail(to, name, verificationUrl) {
        await this.send({
            to,
            subject: "Email Verification",
            template: "email-verification",
            context: {
                name,
                verificationUrl,
                appName: config_1.config.app.name,
            },
        });
    }
    async sendPasswordResetEmail(to, name, resetUrl) {
        await this.send({
            to,
            subject: "Password Reset",
            template: "password-reset",
            context: {
                name,
                resetUrl,
                appName: config_1.config.app.name,
            },
        });
    }
    async sendRoleApplicationApproved(to, name, role) {
        await this.send({
            to,
            subject: "Role Application Approved",
            template: "role-application-approved",
            context: {
                name,
                role,
                appName: config_1.config.app.name,
            },
        });
    }
    async sendRoleApplicationRejected(to, name, role, reason) {
        await this.send({
            to,
            subject: "Role Application Status Update",
            template: "role-application-rejected",
            context: {
                name,
                role,
                reason,
                appName: config_1.config.app.name,
            },
        });
    }
}
exports.emailService = new Email();
//# sourceMappingURL=email.util.js.map