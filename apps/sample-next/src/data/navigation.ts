import { ComponentType, PropsWithoutRef, SVGProps } from "react";
import {
  ChartPieIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  ComputerDesktopIcon,
  HomeIcon,
  IdentificationIcon,
  InboxIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

export type SideBarNavigationItemIcon = ComponentType<PropsWithoutRef<SVGProps<SVGSVGElement>>>;

export interface SideBarNavigationItem {
  label: string;
  href: string;
  icon: SideBarNavigationItemIcon;
}

export const sideBarNavigationItems: SideBarNavigationItem[] = [
  { label: "Home", href: "/", icon: HomeIcon },
  { label: "Application", href: "/application", icon: IdentificationIcon },
  { label: "Device", href: "/device", icon: ComputerDesktopIcon },
  { label: "Inbox", href: "/inbox", icon: InboxIcon },
  { label: "Segmentation", href: "/segmentation", icon: TagIcon },
  { label: "Analytics", href: "/analytics", icon: ChartPieIcon },
  { label: "Storage", href: "/storage", icon: CircleStackIcon },
  { label: "Settings", href: "/settings", icon: Cog6ToothIcon },
];
