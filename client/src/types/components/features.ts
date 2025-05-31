import {
  WriterApplicationRequest,
  MentorApplicationRequest,
  SellerApplicationRequest,
} from "../api/requests";

export interface WriterFormProps {
  onSubmit: (data: WriterApplicationRequest) => Promise<void>;
  isLoading?: boolean;
}

export interface MentorFormProps {
  onSubmit: (data: MentorApplicationRequest) => Promise<void>;
  isLoading?: boolean;
}

export interface SellerFormProps {
  onSubmit: (data: SellerApplicationRequest) => Promise<void>;
  isLoading?: boolean;
}

export interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface ProfileCardProps {
  user: {
    name: string;
    avatar?: string;
    role: string;
    bio?: string;
  };
  stats?: {
    label: string;
    value: string | number;
  }[];
}
