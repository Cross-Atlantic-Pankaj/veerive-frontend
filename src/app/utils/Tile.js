import * as LucideIcons from 'lucide-react';

const Tile = ({ bg, icon, color, size }) => {
  const IconComponent = LucideIcons[icon.charAt(0).toUpperCase() + icon.slice(1)] || LucideIcons.Image;
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: bg, color }}
    >
      <IconComponent size={size} />
    </div>
  );
};

const parseJsxCode = (jsxCode) => {
  if (!jsxCode) return null;
  const regex = /bg="([^"]+)"\s+icon="([^"]+)"\s+color="([^"]+)"\s+size=\{(\d+)\}/;
  const match = jsxCode.match(regex);
  if (match) {
    return {
      bg: match[1],
      icon: match[2],
      color: match[3],
      size: parseInt(match[4], 10),
    };
  }
  console.warn(`Invalid jsxCode format: ${jsxCode}`);
  return null;
};

export { Tile, parseJsxCode };