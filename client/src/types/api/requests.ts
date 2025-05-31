// Auth Requests
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles?: string[];
}

// Role Application Requests
export interface WriterApplicationRequest {
  specializations: string[];
  languages: string[];
  experience: string;
  portfolio: string;
  bio: string;
}

export interface MentorApplicationRequest {
  specializations: string[];
  experience: string;
  qualifications: string[];
  teachingStyle: string;
  bio: string;
}

export interface SellerApplicationRequest {
  businessName: string;
  businessType: string;
  productCategories: string[];
  experience: string;
  bio: string;
}
