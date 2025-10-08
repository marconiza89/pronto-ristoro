import * as React from 'react';

/**
 * Icon names detected in SECTION_PRESETS (deduplicated)
 */
export type IconName =
  | 'appetizer'
  | 'pasta'
  | 'main-course'
  | 'salad'
  | 'dessert'
  | 'drink'
  | 'beer'
  | 'wine'
  | 'pizza'
  | 'bread'
  | 'cheese'
  | 'burger'
  | 'sandwich'
  | 'fries'
  | 'cocktail'
  | 'coffee'
  | 'breakfast'
  | 'chicken'
  | 'cookie'
  | 'cake'
  | 'ice-cream';

export const iconNames: IconName[] = [
  'appetizer',
  'pasta',
  'main-course',
  'salad',
  'dessert',
  'drink',
  'beer',
  'wine',
  'pizza',
  'bread',
  'cheese',
  'burger',
  'sandwich',
  'fries',
  'cocktail',
  'coffee',
  'breakfast',
  'chicken',
  'cookie',
  'cake',
  'ice-cream',
];

/**
 * Generic Icon component
 * Usage: <Icon name="pizza" className="w-5 h-5 text-red-500" />
 */
export function Icon({ name, title, ...props }: React.SVGProps<SVGSVGElement> & { name: IconName, title?: string }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return <Cmp aria-label={name} role="img" focusable={false} {...props}>{title ? <title>{title}</title> : null}</Cmp>;
}

/**
 * All icons are 24x24, stroke currentColor, no fill unless stated.
 */
const base = {
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
};

// Helper to create an SVG with default props
const Svg = (children: React.ReactNode, extra?: React.SVGProps<SVGSVGElement>) => (
  <svg {...base} stroke="currentColor" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...extra}>
    {children}
  </svg>
);

// ————————————————— Icons —————————————————

// appetizer: small plate with toothpick & olive
const Appetizer = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <circle cx="12" cy="14" r="5" />
    <path d="M12 6v3" />
    <circle cx="12" cy="7" r="1.5" fill="currentColor" stroke="none" />
  </>,
  props,
);

// pasta: bowl with noodles
const Pasta = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M4 12h16" />
    <path d="M6 10c2-2 10-2 12 0" />
    <path d="M5 12a7 7 0 0 0 14 0Z" />
    <path d="M9 10c0 2 6 2 6 0" />
  </>,
  props,
);

// main-course: cloche (serving dome)
const MainCourse = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M4 16h16" />
    <path d="M6 16a6 6 0 0 1 12 0Z" />
    <circle cx="12" cy="9" r="1" />
  </>,
  props,
);

// salad: bowl with leaves
const Salad = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M5 13a7 7 0 0 0 14 0Z" />
    <path d="M7 10c1-2 3-3 5-3 2 0 4 1 5 3" />
    <path d="M9 10c0 0 0-2 2-3" />
    <path d="M15 10c0 0 0-2-2-3" />
  </>,
  props,
);

// dessert: cupcake
const Dessert = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M7 11h10" />
    <path d="M6 11c0-2 2-3 6-3s6 1 6 3" />
    <path d="M8 11l1 6h6l1-6" />
    <circle cx="12" cy="7" r="1" />
  </>,
  props,
);

// drink: soda cup with straw
const Drink = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M9 7h6" />
    <path d="M10 7 9 20h6l-1-13" />
    <path d="M12 4l4 1" />
  </>,
  props,
);

// beer: mug
const Beer = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <rect x="7" y="8" width="8" height="11" rx="2" />
    <path d="M15 10h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
    <path d="M8.5 8V6a3.5 3.5 0 0 1 7 0v2" />
  </>,
  props,
);

// wine: glass
const Wine = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M8 4h8l-1 5a5 5 0 0 1-10 0L8 4Z" />
    <path d="M12 14v6" />
    <path d="M9 20h6" />
  </>,
  props,
);

// pizza: slice
const Pizza = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M3 7c6-4 12-4 18 0l-9 14Z" />
    <circle cx="9.5" cy="11.5" r="1.2" />
    <circle cx="14.5" cy="12.5" r="1" />
    <circle cx="12" cy="9.5" r="0.9" />
  </>,
  props,
);

// bread: loaf
const Bread = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M4 12a4 4 0 0 1 4-4h8a4 4 0 0 1 0 8H8a4 4 0 0 1-4-4Z" />
    <path d="M10 8v8M14 8v8" />
  </>,
  props,
);

// cheese: wedge
const Cheese = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M3 12l9-6 9 6-9 6-9-6Z" />
    <circle cx="9.5" cy="12" r="1" />
    <circle cx="14" cy="10.5" r="0.9" />
    <circle cx="14.5" cy="13.5" r="0.7" />
  </>,
  props,
);

// burger
const Burger = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M5 11h14" />
    <path d="M4 9c2-4 14-4 16 0" />
    <path d="M4 14h16" />
    <path d="M6 17h12a2 2 0 0 0 2-2H4a2 2 0 0 0 2 2Z" />
  </>,
  props,
);

// sandwich: triangle
const Sandwich = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M4 17 16 5l4 4L8 21l-4-4Z" />
    <path d="M6 15l8-8" />
  </>,
  props,
);

// fries
const Fries = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M7 9 6 6M10 9V5M14 9V6M17 9l1-3" />
    <path d="M5 9h14l-2 10H7L5 9Z" />
  </>,
  props,
);

// cocktail: martini glass
const Cocktail = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M4 4h16L12 12 4 4Z" />
    <path d="M12 12v8" />
    <path d="M9 20h6" />
    <circle cx="17" cy="5" r="1" />
  </>,
  props,
);

// coffee: cup with steam
const Coffee = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M5 10h10a3 3 0 0 1 3 3 3 3 0 0 1-3 3H9a4 4 0 0 1-4-4v-2Z" />
    <path d="M5 18h10" />
    <path d="M9 6c0 1 1 1 1 2s-1 1-1 2" />
    <path d="M12 6c0 1 1 1 1 2s-1 1-1 2" />
  </>,
  props,
);

// breakfast: croissant
const Breakfast = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M7 15a5 5 0 0 1 10 0" />
    <path d="M3 15c0-2 2-4 4-4M21 15c0-2-2-4-4-4" />
    <path d="M9 15c0 2-1 3-3 3M15 15c0 2 1 3 3 3" />
  </>,
  props,
);

// chicken: drumstick
const Chicken = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M14 6a5 5 0 1 1-7 7l-1 1a2 2 0 1 1-3-3l1-1a2 2 0 0 1 3 3" />
    <circle cx="14" cy="8" r="4" />
  </>,
  props,
);

// cookie
const Cookie = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M12 3a9 9 0 1 0 9 9 3 3 0 0 1-4-3 3 3 0 0 1-5-3Z" />
     <circle cx="9" cy="10" r="1" />
     <circle cx="14" cy="14" r="1" />
     <circle cx="10" cy="16" r="1" />
  </>,
  props,
);

// cake: slice
const Cake = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M3 12l9-5 9 5-9 5-9-5Z" />
    <path d="M12 7V5" />
    <path d="M11 5c0 1 2 1 2 0s-2-1-2 0Z" />
    <path d="M3 12v4l9 5 9-5v-4" />
  </>,
  props,
);

// ice-cream: cone
const IceCream = (props: React.SVGProps<SVGSVGElement>) => Svg(
  <>
    <path d="M8 10a4 4 0 1 1 8 0H8Z" />
    <path d="M12 22l-4-8h8l-4 8Z" />
    <path d="M10 14l4 4M14 14l-4 4" />
  </>,
  props,
);

export const ICONS: Record<IconName, React.FC<React.SVGProps<SVGSVGElement>>> = {
  'appetizer': Appetizer,
  'pasta': Pasta,
  'main-course': MainCourse,
  'salad': Salad,
  'dessert': Dessert,
  'drink': Drink,
  'beer': Beer,
  'wine': Wine,
  'pizza': Pizza,
  'bread': Bread,
  'cheese': Cheese,
  'burger': Burger,
  'sandwich': Sandwich,
  'fries': Fries,
  'cocktail': Cocktail,
  'coffee': Coffee,
  'breakfast': Breakfast,
  'chicken': Chicken,
  'cookie': Cookie,
  'cake': Cake,
  'ice-cream': IceCream,
};

export default Icon;
