export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  bio?: string;
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface WriterProfile extends UserProfile {
  specializations: string[];
  languages: string[];
  experience: string;
  portfolio: string;
  rating: number;
  totalArticles: number;
}

export interface MentorProfile extends UserProfile {
  specializations: string[];
  experience: string;
  qualifications: string[];
  teachingStyle: string;
  rating: number;
  totalCourses: number;
  totalStudents: number;
}

export interface SellerProfile extends UserProfile {
  businessName: string;
  businessType: string;
  productCategories: string[];
  experience: string;
  rating: number;
  totalProducts: number;
  totalSales: number;
}
