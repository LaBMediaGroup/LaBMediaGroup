
export interface Product {
  id: string;
  name: string;
  description: string;
  link: string;
  badge?: string;
  category: 'goggles' | 'radio' | 'drone';
}

export interface ResourceLink {
  name: string;
  description: string;
  url: string;
  type: 'channel' | 'shop' | 'official';
  isLaBPick?: boolean;
}

export interface Part107Step {
  title: string;
  description: string;
  links: { label: string; url: string }[];
  iconName: 'User' | 'BookOpen' | 'GraduationCap' | 'CalendarCheck';
}
