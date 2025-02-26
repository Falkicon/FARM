import { css } from '@microsoft/fast-element';
import { ThemeProvider } from './theme-provider';

// Security enhancements for token validation
const CSS_PROPERTY_REGEX = /^var\(--[a-zA-Z][\w-]*\)$/;
const SAFE_VALUE_REGEX = /^[a-zA-Z0-9-\s#(),%.]+$/;

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateToken = (token: string): ValidationResult => {
  // Check if token is a valid CSS custom property
  if (!CSS_PROPERTY_REGEX.test(token)) {
    return {
      isValid: false,
      error: `Invalid token format: ${token}. Tokens must use CSS custom properties in the format var(--token-name).`,
    };
  }
  return { isValid: true };
};

export const sanitizeTokenValue = (value: string): string => {
  if (!value) {
    return '';
  }

  // If the value contains a semicolon, extract the first part
  if (value.includes(';')) {
    console.warn(`Token value contains semicolon, extracting first part: ${value}`);
    return value.split(';')[0].trim();
  }

  // Check if the value matches the safe pattern
  if (!SAFE_VALUE_REGEX.test(value)) {
    console.warn(`Token value contains unsafe characters: ${value}`);
    // Remove unsafe characters
    return value.replace(/[^a-zA-Z0-9-\s#(),%.]/g, '');
  }

  return value;
};

// Define error types for better error handling
export class TokenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TokenError';
  }
}

export class TokenValidationError extends TokenError {
  constructor(token: string, message: string) {
    super(`Invalid token ${token}: ${message}`);
    this.name = 'TokenValidationError';
  }
}

export class TokenRetrievalError extends TokenError {
  constructor(token: string, cause?: unknown) {
    super(`Failed to retrieve token ${token}${cause ? `: ${cause}` : ''}`);
    this.name = 'TokenRetrievalError';
  }
}

// Get fallback value based on token type
const getFallbackValue = (token: string): string => {
  if (token.includes('color') || token.includes('fill') || token.includes('stroke')) {
    return '#767676'; // Accessible gray
  } else if (token.includes('size') || token.includes('spacing') || token.includes('unit')) {
    return '0';
  } else if (token.includes('weight')) {
    return '400';
  } else if (token.includes('font')) {
    return 'system-ui, sans-serif';
  } else if (token.includes('shadow')) {
    return 'none';
  } else if (token.includes('animation') || token.includes('duration')) {
    return '0s';
  }
  return '';
};

export const getTokenValue = (token: string): string => {
  const validation = validateToken(token);
  if (!validation.isValid) {
    console.warn(validation.error);
    return getFallbackValue(token);
  }

  try {
    // Check if document is available (important for SSR environments)
    if (typeof document === 'undefined' || !document.documentElement) {
      console.warn(`Document not available when retrieving token ${token}`);
      return getFallbackValue(token);
    }

    const computedStyle = getComputedStyle(document.documentElement);

    // Extract property name from token
    const propertyNameMatch = token.match(/--[^)]+/);
    if (!propertyNameMatch) {
      console.warn(`Could not extract property name from token ${token}`);
      return getFallbackValue(token);
    }

    const propertyName = propertyNameMatch[0];

    // Safely access the property value
    const value = computedStyle ? computedStyle.getPropertyValue(propertyName) : '';

    if (!value || value.trim() === '') {
      console.warn(`Token ${token} has no value defined in CSS.`);
      return getFallbackValue(token);
    }

    // Ensure we sanitize the value before returning it
    const sanitizedValue = sanitizeTokenValue(value.trim());

    // Track token usage if in debug mode
    if (ThemeProvider.isDebugMode) {
      const componentName =
        document.currentScript?.ownerDocument?.currentScript?.parentElement?.tagName.toLowerCase() || 'unknown';
      const key = `${token}:${componentName}`;
      const existing = ThemeProvider.tokenUsage.get(key);

      if (existing) {
        existing.count++;
        existing.timestamp = Date.now();
      } else {
        ThemeProvider.tokenUsage.set(key, {
          token,
          component: componentName,
          timestamp: Date.now(),
          count: 1,
        });
      }
    }

    return sanitizedValue;
  } catch (error) {
    console.error(new TokenRetrievalError(token, error));
    return getFallbackValue(token);
  }
};

// Add token validation to existing token objects
const wrapWithValidation = <T extends Record<string, any>>(obj: T): T => {
  // Skip validation in production for performance
  const isDevelopment = process.env.NODE_ENV === 'development';
  if (!isDevelopment) {
    return obj;
  }

  return new Proxy(obj, {
    get(target: T, prop: string) {
      const value = target[prop];
      if (typeof value === 'string' && value.startsWith('var(--')) {
        const validation = validateToken(value);
        if (!validation.isValid) {
          console.error(validation.error);
        }
      }
      return value;
    },
  });
};

// Define specific interfaces for the color tokens structure
interface BrandColors {
  primary: string;
  secondary: string;
  tertiary: string;
}

interface NeutralColors {
  background: string;
  foreground: string;
  border: string;
  divider: string;
}

interface StatusColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

interface AccentColors {
  base: string;
  hover: string;
  pressed: string;
  selected: string;
}

interface ForegroundColors {
  base: string;
  secondary: string;
  tertiary: string;
  disabled: string;
}

interface BackgroundColors {
  canvas: string;
  layer1: string;
  layer2: string;
  layer3: string;
  layer4: string;
}

interface StrokeColors {
  base: string;
  accessible: string;
  disabled: string;
  focus: string;
}

interface FabricColors {
  accent: AccentColors;
  foreground: ForegroundColors;
  background: BackgroundColors;
  stroke: StrokeColors;
}

interface CompoundColors {
  buttonFace: string;
  buttonText: string;
  fieldBorder: string;
  focusStroke: string;
  cardBackground: string;
  cardShadow: string;
}

interface ColorTokensStructure {
  brand: BrandColors;
  neutral: NeutralColors;
  status: StatusColors;
  fabric: FabricColors;
  compound: CompoundColors;
}

// Define the token record type for simpler tokens
export type TokenRecord = Record<string, string | number>;

// Then define the tokens with the specific structure
export const colorTokens = wrapWithValidation({
  // Brand Colors
  brand: {
    primary: 'var(--accent-fill-rest)',
    secondary: 'var(--accent-fill-hover)',
    tertiary: 'var(--accent-fill-active)',
  },

  // Neutral Colors
  neutral: {
    background: 'var(--neutral-layer-1)',
    foreground: 'var(--neutral-foreground-rest)',
    border: 'var(--neutral-stroke-rest)',
    divider: 'var(--neutral-stroke-divider)',
  },

  // Status Colors
  status: {
    success: 'var(--success-fill-rest)',
    warning: 'var(--warning-fill-rest)',
    error: 'var(--error-fill-rest)',
    info: 'var(--info-fill-rest)',
  },

  // Additional Fabric-specific color tokens
  fabric: {
    accent: {
      base: 'var(--accent-base)',
      hover: 'var(--accent-hover)',
      pressed: 'var(--accent-pressed)',
      selected: 'var(--accent-selected)',
    },
    foreground: {
      base: 'var(--foreground-base)',
      secondary: 'var(--foreground-secondary)',
      tertiary: 'var(--foreground-tertiary)',
      disabled: 'var(--foreground-disabled)',
    },
    background: {
      canvas: 'var(--background-canvas)',
      layer1: 'var(--background-layer1)',
      layer2: 'var(--background-layer2)',
      layer3: 'var(--background-layer3)',
      layer4: 'var(--background-layer4)',
    },
    stroke: {
      base: 'var(--stroke-base)',
      accessible: 'var(--stroke-accessible)',
      disabled: 'var(--stroke-disabled)',
      focus: 'var(--stroke-focus)',
    },
  },

  // Extend with compound tokens
  compound: {
    buttonFace: 'var(--button-face-rest)',
    buttonText: 'var(--button-text-rest)',
    fieldBorder: 'var(--field-border-rest)',
    focusStroke: 'var(--focus-stroke-outer)',
    cardBackground: 'var(--card-background)',
    cardShadow: 'var(--card-shadow)',
  },
} as ColorTokensStructure);

// Memoize computed values for performance
const memoizedSpacing = new Map<number, string>();

interface DynamicSpacing extends Record<number, string> {
  [key: number]: string;
}

const spacingBase: DynamicSpacing = {
  0: '0',
  1: 'var(--design-unit)',
  2: 'calc(var(--design-unit) * 2)',
  3: 'calc(var(--design-unit) * 3)',
  4: 'calc(var(--design-unit) * 4)',
  5: 'calc(var(--design-unit) * 5)',
  6: 'calc(var(--design-unit) * 6)',
};

const spacingFactory = (target: Record<number, string>, prop: string | symbol): string => {
  if (typeof prop === 'string') {
    const key = Number(prop);
    if (!Number.isNaN(key)) {
      if (!memoizedSpacing.has(key)) {
        memoizedSpacing.set(key, `calc(var(--design-unit) * ${key})`);
      }
      return memoizedSpacing.get(key)!;
    }
  }
  return target[typeof prop === 'string' ? parseInt(prop) : 0] || '0';
};

// Create the proxy for dynamic spacing values
const dynamicSpacing = new Proxy(spacingBase, { get: spacingFactory }) as DynamicSpacing;

// Export combined spacing tokens with both dynamic and Fabric-specific values
export const spacingTokens = {
  ...dynamicSpacing,
  base: spacingBase,
  fabric: {
    xxxs: 'var(--spacing-xxxs)',
    xxs: 'var(--spacing-xxs)',
    xs: 'var(--spacing-xs)',
    s: 'var(--spacing-s)',
    m: 'var(--spacing-m)',
    l: 'var(--spacing-l)',
    xl: 'var(--spacing-xl)',
    xxl: 'var(--spacing-xxl)',
    xxxl: 'var(--spacing-xxxl)',
  },
} as const;

// Add semantic scale utilities
export const createScale = (base: number, ratio: number, steps: number) => {
  return Array.from({ length: steps }, (_, i) => `${Math.round(base * Math.pow(ratio, i))}px`);
};

// Rest of tokens with type safety
export const typographyTokens = {
  family: {
    base: 'var(--body-font)',
    monospace: 'var(--monospace-font)',
  },
  size: {
    100: 'var(--type-ramp-minus-2-font-size)',
    200: 'var(--type-ramp-minus-1-font-size)',
    300: 'var(--type-ramp-base-font-size)',
    400: 'var(--type-ramp-plus-1-font-size)',
    500: 'var(--type-ramp-plus-2-font-size)',
    600: 'var(--type-ramp-plus-3-font-size)',
    700: 'var(--type-ramp-plus-4-font-size)',
    800: 'var(--type-ramp-plus-5-font-size)',
    900: 'var(--type-ramp-plus-6-font-size)',
  },
  weight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    base: 'var(--type-ramp-base-line-height)',
    tight: 'var(--type-ramp-minus-1-line-height)',
    loose: 'var(--type-ramp-plus-1-line-height)',
  },

  // Add Fabric-specific typography tokens
  fabric: {
    body: {
      font: 'var(--body-font)',
      size: 'var(--body-font-size)',
      weight: 'var(--body-font-weight)',
      lineHeight: 'var(--body-line-height)',
    },
    caption: {
      font: 'var(--caption-font)',
      size: 'var(--caption-font-size)',
      weight: 'var(--caption-font-weight)',
      lineHeight: 'var(--caption-line-height)',
    },
    headline: {
      font: 'var(--headline-font)',
      size: 'var(--headline-font-size)',
      weight: 'var(--headline-font-weight)',
      lineHeight: 'var(--headline-line-height)',
    },
  },
} as const;

export const borderTokens = {
  width: {
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },
  radius: {
    none: '0',
    small: 'var(--corner-radius)',
    medium: 'calc(var(--corner-radius) * 2)',
    large: 'calc(var(--corner-radius) * 3)',
    circular: '50%',
  },

  // Add Fabric-specific border tokens
  fabric: {
    cornerRadius: {
      small: 'var(--corner-radius-small)',
      medium: 'var(--corner-radius-medium)',
      large: 'var(--corner-radius-large)',
      circular: 'var(--corner-radius-circular)',
    },
    stroke: {
      thin: 'var(--stroke-width-thin)',
      thick: 'var(--stroke-width-thick)',
      thicker: 'var(--stroke-width-thicker)',
      thickest: 'var(--stroke-width-thickest)',
    },
  },
} as const;

export const shadowTokens = {
  rest: 'var(--elevation-shadow-card-rest)',
  hover: 'var(--elevation-shadow-card-hover)',
  active: 'var(--elevation-shadow-card-active)',
  focus: 'var(--elevation-shadow-card-focus)',
} as const;

export const animationTokens = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    easeOut: 'cubic-bezier(0.33, 1, 0.68, 1)',
    easeIn: 'cubic-bezier(0.32, 0, 0.67, 0)',
    easeInOut: 'cubic-bezier(0.65, 0, 0.35, 1)',
  },
} as const;

// Add Fabric-specific elevation tokens
export const elevationTokens = {
  base: 'var(--elevation-base)',
  raised: 'var(--elevation-raised)',
  overlay: 'var(--elevation-overlay)',
  sticky: 'var(--elevation-sticky)',
  dialog: 'var(--elevation-dialog)',
  flyout: 'var(--elevation-flyout)',
} as const;

// Performance optimization for base styles
const createBaseStyles = () => css`
  :host {
    /* Define custom properties only once at root */
    ${Object.entries({
      // Colors
      '--color-brand-primary': validateToken(colorTokens.brand.primary).isValid ? colorTokens.brand.primary : '',
      '--color-brand-secondary': validateToken(colorTokens.brand.secondary).isValid ? colorTokens.brand.secondary : '',
      '--color-brand-tertiary': validateToken(colorTokens.brand.tertiary).isValid ? colorTokens.brand.tertiary : '',

      '--color-neutral-background': validateToken(colorTokens.neutral.background).isValid
        ? colorTokens.neutral.background
        : '',
      '--color-neutral-foreground': validateToken(colorTokens.neutral.foreground).isValid
        ? colorTokens.neutral.foreground
        : '',
      '--color-neutral-border': validateToken(colorTokens.neutral.border).isValid ? colorTokens.neutral.border : '',
      '--color-neutral-divider': validateToken(colorTokens.neutral.divider).isValid ? colorTokens.neutral.divider : '',

      '--color-status-success': validateToken(colorTokens.status.success).isValid ? colorTokens.status.success : '',
      '--color-status-warning': validateToken(colorTokens.status.warning).isValid ? colorTokens.status.warning : '',
      '--color-status-error': validateToken(colorTokens.status.error).isValid ? colorTokens.status.error : '',
      '--color-status-info': validateToken(colorTokens.status.info).isValid ? colorTokens.status.info : '',

      // Fabric Colors
      '--color-fabric-accent-base': validateToken(colorTokens.fabric.accent.base).isValid
        ? colorTokens.fabric.accent.base
        : '',
      '--color-fabric-accent-hover': validateToken(colorTokens.fabric.accent.hover).isValid
        ? colorTokens.fabric.accent.hover
        : '',
      '--color-fabric-accent-pressed': validateToken(colorTokens.fabric.accent.pressed).isValid
        ? colorTokens.fabric.accent.pressed
        : '',
      '--color-fabric-accent-selected': validateToken(colorTokens.fabric.accent.selected).isValid
        ? colorTokens.fabric.accent.selected
        : '',

      '--color-fabric-foreground-base': validateToken(colorTokens.fabric.foreground.base).isValid
        ? colorTokens.fabric.foreground.base
        : '',
      '--color-fabric-foreground-secondary': validateToken(colorTokens.fabric.foreground.secondary).isValid
        ? colorTokens.fabric.foreground.secondary
        : '',
      '--color-fabric-foreground-tertiary': validateToken(colorTokens.fabric.foreground.tertiary).isValid
        ? colorTokens.fabric.foreground.tertiary
        : '',
      '--color-fabric-foreground-disabled': validateToken(colorTokens.fabric.foreground.disabled).isValid
        ? colorTokens.fabric.foreground.disabled
        : '',

      '--color-fabric-background-canvas': validateToken(colorTokens.fabric.background.canvas).isValid
        ? colorTokens.fabric.background.canvas
        : '',
      '--color-fabric-background-layer1': validateToken(colorTokens.fabric.background.layer1).isValid
        ? colorTokens.fabric.background.layer1
        : '',
      '--color-fabric-background-layer2': validateToken(colorTokens.fabric.background.layer2).isValid
        ? colorTokens.fabric.background.layer2
        : '',
      '--color-fabric-background-layer3': validateToken(colorTokens.fabric.background.layer3).isValid
        ? colorTokens.fabric.background.layer3
        : '',
      '--color-fabric-background-layer4': validateToken(colorTokens.fabric.background.layer4).isValid
        ? colorTokens.fabric.background.layer4
        : '',

      '--color-fabric-stroke-base': validateToken(colorTokens.fabric.stroke.base).isValid
        ? colorTokens.fabric.stroke.base
        : '',
      '--color-fabric-stroke-accessible': validateToken(colorTokens.fabric.stroke.accessible).isValid
        ? colorTokens.fabric.stroke.accessible
        : '',
      '--color-fabric-stroke-disabled': validateToken(colorTokens.fabric.stroke.disabled).isValid
        ? colorTokens.fabric.stroke.disabled
        : '',
      '--color-fabric-stroke-focus': validateToken(colorTokens.fabric.stroke.focus).isValid
        ? colorTokens.fabric.stroke.focus
        : '',

      '--color-compound-button-face': validateToken(colorTokens.compound.buttonFace).isValid
        ? colorTokens.compound.buttonFace
        : '',
      '--color-compound-button-text': validateToken(colorTokens.compound.buttonText).isValid
        ? colorTokens.compound.buttonText
        : '',
      '--color-compound-field-border': validateToken(colorTokens.compound.fieldBorder).isValid
        ? colorTokens.compound.fieldBorder
        : '',
      '--color-compound-focus-stroke': validateToken(colorTokens.compound.focusStroke).isValid
        ? colorTokens.compound.focusStroke
        : '',
      '--color-compound-card-background': validateToken(colorTokens.compound.cardBackground).isValid
        ? colorTokens.compound.cardBackground
        : '',
      '--color-compound-card-shadow': validateToken(colorTokens.compound.cardShadow).isValid
        ? colorTokens.compound.cardShadow
        : '',

      // Typography
      '--font-family-base': validateToken(typographyTokens.family.base).isValid ? typographyTokens.family.base : '',
      '--font-family-monospace': validateToken(typographyTokens.family.monospace).isValid
        ? typographyTokens.family.monospace
        : '',

      '--font-size-100': validateToken(typographyTokens.size[100]).isValid ? typographyTokens.size[100] : '',
      '--font-size-200': validateToken(typographyTokens.size[200]).isValid ? typographyTokens.size[200] : '',
      '--font-size-300': validateToken(typographyTokens.size[300]).isValid ? typographyTokens.size[300] : '',
      '--font-size-400': validateToken(typographyTokens.size[400]).isValid ? typographyTokens.size[400] : '',
      '--font-size-500': validateToken(typographyTokens.size[500]).isValid ? typographyTokens.size[500] : '',
      '--font-size-600': validateToken(typographyTokens.size[600]).isValid ? typographyTokens.size[600] : '',
      '--font-size-700': validateToken(typographyTokens.size[700]).isValid ? typographyTokens.size[700] : '',
      '--font-size-800': validateToken(typographyTokens.size[800]).isValid ? typographyTokens.size[800] : '',
      '--font-size-900': validateToken(typographyTokens.size[900]).isValid ? typographyTokens.size[900] : '',

      '--font-weight-regular': validateToken(typographyTokens.weight.regular).isValid
        ? typographyTokens.weight.regular
        : '',
      '--font-weight-medium': validateToken(typographyTokens.weight.medium).isValid
        ? typographyTokens.weight.medium
        : '',
      '--font-weight-semibold': validateToken(typographyTokens.weight.semibold).isValid
        ? typographyTokens.weight.semibold
        : '',
      '--font-weight-bold': validateToken(typographyTokens.weight.bold).isValid ? typographyTokens.weight.bold : '',

      '--line-height-base': validateToken(typographyTokens.lineHeight.base).isValid
        ? typographyTokens.lineHeight.base
        : '',
      '--line-height-tight': validateToken(typographyTokens.lineHeight.tight).isValid
        ? typographyTokens.lineHeight.tight
        : '',
      '--line-height-loose': validateToken(typographyTokens.lineHeight.loose).isValid
        ? typographyTokens.lineHeight.loose
        : '',

      // Fabric Typography
      '--font-fabric-body': validateToken(typographyTokens.fabric.body.font).isValid
        ? typographyTokens.fabric.body.font
        : '',
      '--font-size-fabric-body': validateToken(typographyTokens.fabric.body.size).isValid
        ? typographyTokens.fabric.body.size
        : '',
      '--font-weight-fabric-body': validateToken(typographyTokens.fabric.body.weight).isValid
        ? typographyTokens.fabric.body.weight
        : '',
      '--line-height-fabric-body': validateToken(typographyTokens.fabric.body.lineHeight).isValid
        ? typographyTokens.fabric.body.lineHeight
        : '',

      '--font-fabric-caption': validateToken(typographyTokens.fabric.caption.font).isValid
        ? typographyTokens.fabric.caption.font
        : '',
      '--font-size-fabric-caption': validateToken(typographyTokens.fabric.caption.size).isValid
        ? typographyTokens.fabric.caption.size
        : '',
      '--font-weight-fabric-caption': validateToken(typographyTokens.fabric.caption.weight).isValid
        ? typographyTokens.fabric.caption.weight
        : '',
      '--line-height-fabric-caption': validateToken(typographyTokens.fabric.caption.lineHeight).isValid
        ? typographyTokens.fabric.caption.lineHeight
        : '',

      '--font-fabric-headline': validateToken(typographyTokens.fabric.headline.font).isValid
        ? typographyTokens.fabric.headline.font
        : '',
      '--font-size-fabric-headline': validateToken(typographyTokens.fabric.headline.size).isValid
        ? typographyTokens.fabric.headline.size
        : '',
      '--font-weight-fabric-headline': validateToken(typographyTokens.fabric.headline.weight).isValid
        ? typographyTokens.fabric.headline.weight
        : '',
      '--line-height-fabric-headline': validateToken(typographyTokens.fabric.headline.lineHeight).isValid
        ? typographyTokens.fabric.headline.lineHeight
        : '',

      // Spacing
      '--spacing-0': validateToken(spacingBase[0]).isValid ? spacingBase[0] : '',
      '--spacing-1': validateToken(spacingBase[1]).isValid ? spacingBase[1] : '',
      '--spacing-2': validateToken(spacingBase[2]).isValid ? spacingBase[2] : '',
      '--spacing-3': validateToken(spacingBase[3]).isValid ? spacingBase[3] : '',
      '--spacing-4': validateToken(spacingBase[4]).isValid ? spacingBase[4] : '',
      '--spacing-5': validateToken(spacingBase[5]).isValid ? spacingBase[5] : '',
      '--spacing-6': validateToken(spacingBase[6]).isValid ? spacingBase[6] : '',

      // Fabric Spacing
      '--spacing-fabric-xxxs': validateToken(spacingTokens.fabric.xxxs).isValid ? spacingTokens.fabric.xxxs : '',
      '--spacing-fabric-xxs': validateToken(spacingTokens.fabric.xxs).isValid ? spacingTokens.fabric.xxs : '',
      '--spacing-fabric-xs': validateToken(spacingTokens.fabric.xs).isValid ? spacingTokens.fabric.xs : '',
      '--spacing-fabric-s': validateToken(spacingTokens.fabric.s).isValid ? spacingTokens.fabric.s : '',
      '--spacing-fabric-m': validateToken(spacingTokens.fabric.m).isValid ? spacingTokens.fabric.m : '',
      '--spacing-fabric-l': validateToken(spacingTokens.fabric.l).isValid ? spacingTokens.fabric.l : '',
      '--spacing-fabric-xl': validateToken(spacingTokens.fabric.xl).isValid ? spacingTokens.fabric.xl : '',
      '--spacing-fabric-xxl': validateToken(spacingTokens.fabric.xxl).isValid ? spacingTokens.fabric.xxl : '',
      '--spacing-fabric-xxxl': validateToken(spacingTokens.fabric.xxxl).isValid ? spacingTokens.fabric.xxxl : '',

      // Borders
      '--border-width-thin': validateToken(borderTokens.width.thin).isValid ? borderTokens.width.thin : '',
      '--border-width-medium': validateToken(borderTokens.width.medium).isValid ? borderTokens.width.medium : '',
      '--border-width-thick': validateToken(borderTokens.width.thick).isValid ? borderTokens.width.thick : '',

      '--border-radius-none': validateToken(borderTokens.radius.none).isValid ? borderTokens.radius.none : '',
      '--border-radius-small': validateToken(borderTokens.radius.small).isValid ? borderTokens.radius.small : '',
      '--border-radius-medium': validateToken(borderTokens.radius.medium).isValid ? borderTokens.radius.medium : '',
      '--border-radius-large': validateToken(borderTokens.radius.large).isValid ? borderTokens.radius.large : '',
      '--border-radius-circular': validateToken(borderTokens.radius.circular).isValid
        ? borderTokens.radius.circular
        : '',

      // Fabric Borders
      '--border-radius-fabric-small': validateToken(borderTokens.fabric.cornerRadius.small).isValid
        ? borderTokens.fabric.cornerRadius.small
        : '',
      '--border-radius-fabric-medium': validateToken(borderTokens.fabric.cornerRadius.medium).isValid
        ? borderTokens.fabric.cornerRadius.medium
        : '',
      '--border-radius-fabric-large': validateToken(borderTokens.fabric.cornerRadius.large).isValid
        ? borderTokens.fabric.cornerRadius.large
        : '',
      '--border-radius-fabric-circular': validateToken(borderTokens.fabric.cornerRadius.circular).isValid
        ? borderTokens.fabric.cornerRadius.circular
        : '',

      '--border-stroke-fabric-thin': validateToken(borderTokens.fabric.stroke.thin).isValid
        ? borderTokens.fabric.stroke.thin
        : '',
      '--border-stroke-fabric-thick': validateToken(borderTokens.fabric.stroke.thick).isValid
        ? borderTokens.fabric.stroke.thick
        : '',
      '--border-stroke-fabric-thicker': validateToken(borderTokens.fabric.stroke.thicker).isValid
        ? borderTokens.fabric.stroke.thicker
        : '',
      '--border-stroke-fabric-thickest': validateToken(borderTokens.fabric.stroke.thickest).isValid
        ? borderTokens.fabric.stroke.thickest
        : '',

      // Shadows
      '--shadow-rest': validateToken(shadowTokens.rest).isValid ? shadowTokens.rest : '',
      '--shadow-hover': validateToken(shadowTokens.hover).isValid ? shadowTokens.hover : '',
      '--shadow-active': validateToken(shadowTokens.active).isValid ? shadowTokens.active : '',
      '--shadow-focus': validateToken(shadowTokens.focus).isValid ? shadowTokens.focus : '',

      // Animations
      '--animation-duration-fast': validateToken(animationTokens.duration.fast).isValid
        ? animationTokens.duration.fast
        : '',
      '--animation-duration-normal': validateToken(animationTokens.duration.normal).isValid
        ? animationTokens.duration.normal
        : '',
      '--animation-duration-slow': validateToken(animationTokens.duration.slow).isValid
        ? animationTokens.duration.slow
        : '',

      '--animation-easing-ease-out': validateToken(animationTokens.easing.easeOut).isValid
        ? animationTokens.easing.easeOut
        : '',
      '--animation-easing-ease-in': validateToken(animationTokens.easing.easeIn).isValid
        ? animationTokens.easing.easeIn
        : '',
      '--animation-easing-ease-in-out': validateToken(animationTokens.easing.easeInOut).isValid
        ? animationTokens.easing.easeInOut
        : '',

      // Fabric Elevation
      '--elevation-base': validateToken(elevationTokens.base).isValid ? elevationTokens.base : '',
      '--elevation-raised': validateToken(elevationTokens.raised).isValid ? elevationTokens.raised : '',
      '--elevation-overlay': validateToken(elevationTokens.overlay).isValid ? elevationTokens.overlay : '',
      '--elevation-sticky': validateToken(elevationTokens.sticky).isValid ? elevationTokens.sticky : '',
      '--elevation-dialog': validateToken(elevationTokens.dialog).isValid ? elevationTokens.dialog : '',
      '--elevation-flyout': validateToken(elevationTokens.flyout).isValid ? elevationTokens.flyout : '',
    })
      .map(([key, value]) => `${key}: ${value};`)
      .join('\n')}
  }
`;

// Memoize base styles for performance
export const baseStyles = createBaseStyles();

// Type guard for token validation
export const isValidToken = (token: unknown): token is string => {
  return typeof token === 'string' && token.startsWith('var(--');
};

// Define token types based on the keys
export type ColorToken = string;
export type TypographyToken = keyof typeof typographyTokens;
export type SpacingToken = keyof typeof spacingTokens;
export type BorderToken = keyof typeof borderTokens;
export type ShadowToken = keyof typeof shadowTokens;
export type AnimationToken = keyof typeof animationTokens;

// Export all token types as a union
export type DesignToken = ColorToken | TypographyToken | SpacingToken | BorderToken | ShadowToken | AnimationToken;
