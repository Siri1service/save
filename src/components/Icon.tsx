import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

export const Icon: React.FC<IconProps> = ({ name, size = 20, color = '#ffffff', style }) => {
  // Safe lookup of icon component
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Tag;

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}>
      <IconComponent size={size} color={color} />
    </span>
  );
};
