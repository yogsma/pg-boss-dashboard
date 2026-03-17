import { type LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon?: LucideIcon;
}

export interface UIModuleManifest {
  id: string;
  name: string;
  icon: LucideIcon;
  basePath: string;
  navItems: NavItem[];
}
