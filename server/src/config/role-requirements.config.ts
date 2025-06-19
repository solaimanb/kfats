import { UserRole } from "./rbac/types";

// Common document requirements
const COMMON_DOCUMENTS = {
  identityProof: {
    type: "identityProof",
    label: "Government Issued ID",
    required: true,
    formats: ["pdf", "jpg", "png"],
    maxSize: 5 * 1024 * 1024, // 5MB
    description: "A valid government-issued photo ID",
  },
};

// Common field requirements
const COMMON_FIELDS = {
  languages: {
    name: "languages",
    type: "array",
    label: "Languages",
    required: true,
    minItems: 1,
  },
  experience: {
    name: "experience",
    type: "number",
    label: "Years of Experience",
    required: true,
    validation: {
      min: 1,
      message: "Must have at least 1 year of experience",
    },
  },
};

// Common verification steps
const COMMON_VERIFICATION_STEPS = {
  documentVerification: {
    name: "documentVerification",
    label: "Document Verification",
    type: "automatic" as const,
    required: true,
  },
  interview: {
    name: "interview",
    label: "Interview",
    type: "manual" as const,
    required: true,
  },
};

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
  [UserRole.USER]: {
    documents: [],
    fields: [],
    verificationSteps: [],
  },
  [UserRole.STUDENT]: {
    documents: [],
    fields: [],
    verificationSteps: [],
  },
  [UserRole.MENTOR]: {
    documents: [
      COMMON_DOCUMENTS.identityProof,
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
        ...COMMON_FIELDS.languages,
        label: "Teaching Languages",
      },
      {
        ...COMMON_FIELDS.experience,
        label: "Years of Teaching Experience",
        validation: {
          min: 1,
          message: "Must have at least 1 year of teaching experience",
        },
      },
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
    ],
    verificationSteps: [
      COMMON_VERIFICATION_STEPS.documentVerification,
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
    documents: [
      COMMON_DOCUMENTS.identityProof,
      {
        type: "writingSamples",
        label: "Writing Samples",
        required: true,
        formats: ["pdf", "doc", "docx"],
        maxSize: 10 * 1024 * 1024, // 10MB
        description: "At least 3 writing samples showcasing your expertise",
      },
      {
        type: "certifications",
        label: "Writing Certifications",
        required: false,
        formats: ["pdf"],
        maxSize: 5 * 1024 * 1024,
        description: "Any relevant writing or journalism certifications",
      },
      {
        type: "publications",
        label: "Published Works",
        required: false,
        formats: ["pdf", "url"],
        maxSize: 5 * 1024 * 1024,
        description: "Links or PDFs of your published works",
      },
    ],
    fields: [
      {
        ...COMMON_FIELDS.languages,
        label: "Writing Languages",
        schema: {
          language: {
            type: "string",
            required: true,
          },
          proficiencyLevel: {
            type: "string",
            required: true,
          },
        },
      },
      {
        name: "specializations",
        type: "array",
        label: "Writing Specializations",
        required: true,
        minItems: 1,
        maxItems: 5,
        validation: {
          pattern: "^[a-zA-Z0-9\\s]{3,50}$",
          message: "Each specialization must be 3-50 characters long",
        },
      },
      {
        name: "experience",
        type: "object",
        label: "Writing Experience",
        required: true,
        schema: {
          years: {
            type: "number",
            required: true,
          },
          publications: {
            type: "array",
            required: false,
          },
        },
        validation: {
          min: 1,
          message: "Must have at least 1 year of writing experience",
        },
      },
      {
        name: "writingStyle",
        type: "text",
        label: "Writing Style Description",
        required: true,
        validation: {
          min: 200,
          max: 1000,
          message:
            "Writing style description must be between 200 and 1000 characters",
        },
      },
      {
        name: "portfolio",
        type: "array",
        label: "Portfolio Links",
        required: false,
        validation: {
          pattern: "^https?://",
          message: "Must be valid URLs",
        },
      },
    ],
    verificationSteps: [
      COMMON_VERIFICATION_STEPS.documentVerification,
      {
        name: "writingSampleReview",
        label: "Writing Sample Review",
        type: "manual",
        required: true,
      },
      {
        name: "styleAssessment",
        label: "Writing Style Assessment",
        type: "manual",
        required: true,
      },
      COMMON_VERIFICATION_STEPS.interview,
    ],
  },
  [UserRole.SELLER]: {
    documents: [
      COMMON_DOCUMENTS.identityProof,
      {
        type: "businessRegistration",
        label: "Business Registration Certificate",
        required: true,
        formats: ["pdf"],
        maxSize: 5 * 1024 * 1024,
        description: "Valid business registration or trade license",
      },
      {
        type: "taxCertificate",
        label: "Tax Registration Certificate",
        required: true,
        formats: ["pdf"],
        maxSize: 5 * 1024 * 1024,
        description: "Tax registration or VAT certificate",
      },
      {
        type: "bankStatement",
        label: "Bank Statement",
        required: true,
        formats: ["pdf"],
        maxSize: 5 * 1024 * 1024,
        description: "Last 3 months bank statement",
      },
      {
        type: "productCatalog",
        label: "Product Catalog",
        required: false,
        formats: ["pdf", "jpg", "png"],
        maxSize: 10 * 1024 * 1024,
        description: "Catalog of products you plan to sell",
      },
    ],
    fields: [
      {
        name: "businessDetails",
        type: "object",
        label: "Business Information",
        required: true,
        schema: {
          businessName: {
            type: "string",
            required: true,
          },
          businessType: {
            type: "string",
            required: true,
          },
          registrationNumber: {
            type: "string",
            required: true,
          },
          taxId: {
            type: "string",
            required: true,
          },
        },
      },
      {
        name: "businessAddress",
        type: "object",
        label: "Business Address",
        required: true,
        schema: {
          street: {
            type: "string",
            required: true,
          },
          city: {
            type: "string",
            required: true,
          },
          state: {
            type: "string",
            required: true,
          },
          postalCode: {
            type: "string",
            required: true,
          },
          country: {
            type: "string",
            required: true,
          },
        },
      },
      {
        name: "bankingDetails",
        type: "object",
        label: "Banking Information",
        required: true,
        schema: {
          bankName: {
            type: "string",
            required: true,
          },
          accountNumber: {
            type: "string",
            required: true,
          },
          routingNumber: {
            type: "string",
            required: true,
          },
          accountType: {
            type: "string",
            required: true,
          },
        },
      },
      {
        name: "productCategories",
        type: "array",
        label: "Product Categories",
        required: true,
        minItems: 1,
        maxItems: 10,
        validation: {
          pattern: "^[a-zA-Z0-9\\s]{3,50}$",
          message: "Each category must be 3-50 characters long",
        },
      },
      {
        name: "businessPlan",
        type: "text",
        label: "Business Plan Summary",
        required: true,
        validation: {
          min: 300,
          max: 2000,
          message: "Business plan must be between 300 and 2000 characters",
        },
      },
    ],
    verificationSteps: [
      COMMON_VERIFICATION_STEPS.documentVerification,
      {
        name: "businessVerification",
        label: "Business Verification",
        type: "manual",
        required: true,
      },
      {
        name: "bankVerification",
        label: "Banking Details Verification",
        type: "manual",
        required: true,
      },
      {
        name: "productReview",
        label: "Product Catalog Review",
        type: "manual",
        required: true,
      },
      COMMON_VERIFICATION_STEPS.interview,
    ],
  },
  [UserRole.ADMIN]: {
    documents: [],
    fields: [],
    verificationSteps: [],
  },
};
