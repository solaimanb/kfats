import { UserRole } from "./rbac.config";

export interface DocumentRequirement {
  type: string;
  label: string;
  required: boolean;
  formats: string[];
  maxSize: number; // in bytes
  description: string;
}

export interface FieldRequirement {
  name: string;
  type: string;
  label: string;
  required: boolean;
  minItems?: number;
  maxItems?: number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    custom?: (value: any) => boolean;
  };
  schema?: Record<
    string,
    {
      type: string;
      required: boolean;
    }
  >;
}

export interface VerificationStep {
  name: string;
  label: string;
  type: "automatic" | "manual";
  required: boolean;
}

export interface RoleRequirement {
  documents: DocumentRequirement[];
  fields: FieldRequirement[];
  verificationSteps: VerificationStep[];
}

export const ROLE_REQUIREMENTS: Record<UserRole, RoleRequirement> = {
  [UserRole.STUDENT]: {
    documents: [],
    fields: [],
    verificationSteps: [],
  },
  [UserRole.MENTOR]: {
    documents: [
      {
        type: "identityProof",
        label: "Government Issued ID",
        required: true,
        formats: ["pdf", "jpg", "png"],
        maxSize: 5 * 1024 * 1024, // 5MB
        description: "A valid government-issued photo ID",
      },
      {
        type: "qualificationCertificate",
        label: "Educational Qualification Certificate",
        required: true,
        formats: ["pdf"],
        maxSize: 10 * 1024 * 1024, // 10MB
        description: "Highest educational qualification certificate",
      },
      {
        type: "teachingCertificate",
        label: "Teaching Certificate or Experience Letter",
        required: true,
        formats: ["pdf"],
        maxSize: 5 * 1024 * 1024,
        description: "Teaching certification or experience proof",
      },
      {
        type: "curriculum",
        label: "Course Curriculum Sample",
        required: true,
        formats: ["pdf", "doc", "docx"],
        maxSize: 5 * 1024 * 1024,
        description: "Sample curriculum for one course",
      },
    ],
    fields: [
      {
        name: "expertise",
        type: "array",
        label: "Areas of Expertise",
        required: true,
        minItems: 1,
        maxItems: 5,
        validation: {
          pattern: "^[a-zA-Z0-9\\s]{3,50}$",
          message: "Each expertise must be 3-50 characters long",
        },
      },
      {
        name: "experience",
        type: "number",
        label: "Years of Teaching Experience",
        required: true,
        validation: {
          min: 1,
          message: "Must have at least 1 year of teaching experience",
        },
      },
      {
        name: "qualifications",
        type: "array",
        label: "Educational Qualifications",
        required: true,
        minItems: 1,
        schema: {
          degree: {
            type: "string",
            required: true,
          },
          institution: {
            type: "string",
            required: true,
          },
          year: {
            type: "number",
            required: true,
          },
          field: {
            type: "string",
            required: true,
          },
        },
      },
      {
        name: "teachingMethodology",
        type: "text",
        label: "Teaching Methodology",
        required: true,
        validation: {
          min: 100,
          max: 1000,
          message:
            "Teaching methodology must be between 100 and 1000 characters",
        },
      },
      {
        name: "languages",
        type: "array",
        label: "Teaching Languages",
        required: true,
        minItems: 1,
      },
    ],
    verificationSteps: [
      {
        name: "documentVerification",
        label: "Document Verification",
        type: "automatic",
        required: true,
      },
      {
        name: "backgroundCheck",
        label: "Background Check",
        type: "manual",
        required: true,
      },
      {
        name: "interviewScheduling",
        label: "Interview Scheduling",
        type: "manual",
        required: true,
      },
      {
        name: "teachingDemo",
        label: "Teaching Demonstration",
        type: "manual",
        required: true,
      },
    ],
  },
  [UserRole.WRITER]: {
    documents: [],
    fields: [],
    verificationSteps: [],
  },
  [UserRole.SELLER]: {
    documents: [],
    fields: [],
    verificationSteps: [],
  },
  [UserRole.ADMIN]: {
    documents: [],
    fields: [],
    verificationSteps: [],
  },
};
