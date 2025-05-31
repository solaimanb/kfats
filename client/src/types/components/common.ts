import { ReactNode } from "react";

export interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export interface FooterProps {
  className?: string;
}

export interface NavbarProps {
  className?: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface LayoutProps {
  children: ReactNode;
  className?: string;
}
