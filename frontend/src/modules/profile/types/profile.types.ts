// 菜单项
export interface MenuItem {
  name: string;
  icon: string;
  target?: string;
  isPlaceholder?: boolean;
  badge?: string;
}

// 菜单分组
export interface MenuGroup {
  title: string;
  items: MenuItem[];
}
