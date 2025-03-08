export interface DesignModel {
  layouts: {
    [key: string]: Layout;
  };
  themes: {
    [key: string]: Theme;
  };
  components: {
    [key: string]: ComponentDefinition;
  };
}

export interface Layout {
  type?: string;
  header?: HeaderLayout;
  sidebar?: SidebarLayout;
  footer?: FooterLayout;
  columns?: number;
  gap?: string;
  direction?: 'row' | 'column';
  components?: LayoutComponent[];
}

export interface HeaderLayout {
  type: string;
  height: string;
  components: LayoutComponent[];
}

export interface SidebarLayout {
  type: string;
  width: string;
  collapsible: boolean;
  defaultCollapsed: boolean;
  components: LayoutComponent[];
}

export interface FooterLayout {
  type: string;
  height: string;
  components: LayoutComponent[];
}

export interface LayoutComponent {
  type: string;
  position?: 'left' | 'center' | 'right';
  text?: string;
  imageUrl?: string;
  items?: NavigationItem[];
  title?: string;
  gridArea?: string;
  content?: any;
  data?: string;
  tabs?: TabDefinition[];
  avatar?: boolean;
  label?: string;
  icon?: string;
  route?: string;
  action?: string;
}

export interface NavigationItem {
  label: string;
  route?: string;
  icon?: string;
  action?: string;
  items?: NavigationItem[];
}

export interface TabDefinition {
  label: string;
  content: any;
}

export interface Theme {
  colors: ThemeColors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  info: string;
  success: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

export interface Typography {
  fontFamily: string;
  fontSize: {
    small: string;
    medium: string;
    large: string;
    xlarge: string;
    xxlarge: string;
  };
}

export interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface BorderRadius {
  small: string;
  medium: string;
  large: string;
  circle: string;
}

export interface ComponentDefinition {
  variants: {
    [key: string]: ComponentVariant;
  };
  type?: string;
  shadow?: boolean;
}

export interface ComponentVariant {
  borderRadius?: string;
  padding?: string;
  fontSize?: string;
  fontWeight?: string;
  boxShadow?: string;
  border?: string;
  backgroundColor?: string;
  borderBottom?: string;
  minWidth?: string;
  minHeight?: string;
} 