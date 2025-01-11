import { AST_NODE_TYPES } from '@typescript-eslint/utils';

const COMPONENT_RULES = {
  'fluent-text': {
    attributes: {
      nowrap: {
        type: 'boolean',
        required: false,
        default: false
      },
      truncate: {
        type: 'boolean',
        required: false,
        default: false
      },
      italic: {
        type: 'boolean',
        required: false,
        default: false
      },
      underline: {
        type: 'boolean',
        required: false,
        default: false
      },
      strikethrough: {
        type: 'boolean',
        required: false,
        default: false
      },
      block: {
        type: 'boolean',
        required: false,
        default: false
      },
      size: {
        type: 'enum',
        values: ['100', '200', '300', '400', '500', '600', '700', '800', '900', '1000'],
        required: false
      },
      font: {
        type: 'enum',
        values: ['base', 'numeric', 'monospace'],
        required: false,
        default: 'base'
      },
      weight: {
        type: 'enum',
        values: ['medium', 'regular', 'semibold', 'bold'],
        required: false,
        default: 'regular'
      },
      align: {
        type: 'enum',
        values: ['start', 'end', 'center', 'justify'],
        required: false,
        default: 'start'
      }
    },
    slots: {
      default: { description: 'The default slot for text content' }
    }
  },
  'fluent-button': {
    attributes: {
      appearance: {
        type: 'enum',
        values: ['primary', 'outline', 'subtle', 'transparent'],
        required: false
      },
      autofocus: {
        type: 'boolean',
        required: false
      },
      disabled: {
        type: 'boolean',
        required: false
      },
      disabledFocusable: {
        type: 'boolean',
        required: false
      },
      form: {
        type: 'string',
        required: false
      },
      formAction: {
        type: 'string',
        required: false
      },
      formEnctype: {
        type: 'string',
        required: false
      },
      formMethod: {
        type: 'string',
        required: false
      },
      formNoValidate: {
        type: 'boolean',
        required: false
      },
      formTarget: {
        type: 'enum',
        values: ['_blank', '_self', '_parent', '_top'],
        required: false
      },
      name: {
        type: 'string',
        required: false
      },
      shape: {
        type: 'enum',
        values: ['circular', 'rounded', 'square'],
        required: false
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large'],
        required: false
      },
      type: {
        type: 'enum',
        values: ['submit', 'reset', 'button'],
        required: false,
        default: 'button'
      },
      value: {
        type: 'string',
        required: false
      },
      iconOnly: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      start: { description: 'Content which can be provided before the button content' },
      end: { description: 'Content which can be provided after the button content' },
      default: { description: 'The default slot for button content' }
    },
    cssparts: {
      content: { description: 'The button content container' }
    }
  },
  'fluent-card': {
    attributes: {
      focusMode: {
        type: 'enum',
        values: ['off', 'no-tab', 'tab-exit', 'tab-only'],
        required: true
      },
      appearance: {
        type: 'enum',
        values: ['filled', 'outline', 'subtle', 'filled-alternative'],
        required: false
      },
      orientation: {
        type: 'enum',
        values: ['horizontal', 'vertical'],
        required: false
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large'],
        required: false
      },
      disabled: {
        type: 'boolean',
        required: true
      },
      interactive: {
        type: 'boolean',
        required: true
      },
      ariaDescribedby: {
        type: 'string',
        required: false
      },
      ariaLabelledby: {
        type: 'string',
        required: false
      },
      card: {
        type: 'object',
        required: true
      },
      root: {
        type: 'object',
        required: true
      },
      focusFirstElement: {
        type: 'function',
        required: true
      },
      focusLastElement: {
        type: 'function',
        required: true
      },
      isFocusable: {
        type: 'boolean',
        required: true
      },
      bounds: {
        type: 'array',
        required: true
      },
      isBoundsZeroIndexFocused: {
        type: 'boolean',
        required: true,
        allowVoid: true
      },
      isBoundsLastIndexFocused: {
        type: 'boolean',
        required: true,
        allowVoid: true
      },
      shouldTrapFocus: {
        type: 'boolean',
        required: true
      }
    },
    slots: {
      default: { description: 'Default slot for card content' }
    }
  },
  'fluent-card-header': {
    slots: {
      start: { description: 'Slot for content positioned at the start of the header' },
      image: { description: 'Slot for an image within the header' },
      header: { description: 'Slot for the main header content' },
      subtitle: { description: 'Slot for the subtitle text' },
      action: { description: 'Slot for action elements' },
      end: { description: 'Slot for content positioned at the end of the header' }
    }
  },
  'fluent-card-footer': {
    slots: {
      default: { description: 'Default slot for footer content' },
      action: { description: 'Slot for action elements' }
    }
  },
  'fluent-rating-display': {
    attributes: {
      count: {
        type: 'number',
        required: false
      },
      'icon-view-box': {
        type: 'string',
        required: false,
        default: '0 0 20 20'
      },
      max: {
        type: 'number',
        required: false
      },
      value: {
        type: 'number',
        required: false
      },
      color: {
        type: 'enum',
        values: ['neutral', 'brand', 'marigold'],
        required: false,
        default: 'marigold'
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large'],
        required: false,
        default: 'medium'
      },
      compact: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      icon: { description: 'SVG element used as the rating icon' }
    }
  },
  'fluent-slider': {
    attributes: {
      size: {
        type: 'enum',
        values: ['small', 'medium'],
        required: false,
        default: 'medium'
      },
      value: {
        type: 'string',
        required: false
      },
      min: {
        type: 'string',
        required: false
      },
      max: {
        type: 'string',
        required: false
      },
      step: {
        type: 'string',
        required: false
      },
      orientation: {
        type: 'enum',
        values: ['horizontal', 'vertical'],
        required: false,
        default: 'horizontal'
      },
      mode: {
        type: 'enum',
        values: ['single-value'],
        required: false,
        default: 'single-value'
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      thumb: { description: 'The slot for a custom thumb element' }
    },
    cssparts: {
      'thumb-container': { description: 'The container element of the thumb' },
      'track-container': { description: 'The container element of the track' }
    },
    events: {
      change: { description: 'Fires a custom change event when the value changes' }
    }
  },
  'fluent-spinner': {
    attributes: {
      size: {
        type: 'enum',
        values: ['tiny', 'extra-small', 'small', 'medium', 'large', 'extra-large', 'huge'],
        required: false,
        default: 'medium'
      },
      appearance: {
        type: 'enum',
        values: ['primary', 'inverted'],
        required: false,
        default: 'primary'
      }
    }
  },
  'fluent-field': {
    attributes: {
      'label-position': {
        type: 'enum',
        values: ['above', 'after', 'before'],
        required: false,
        default: 'above'
      }
    },
    slots: {
      label: { description: 'The label content' },
      input: { description: 'The input element to be associated with the field' },
      message: { description: 'Validation messages or helper text' },
      default: { description: 'The default slot for field content' }
    },
    validation: {
      flags: {
        'bad-input': { description: 'Input cannot be converted to a valid value' },
        'custom-error': { description: 'Custom validation error' },
        'pattern-mismatch': { description: 'Value does not match pattern' },
        'range-overflow': { description: 'Value is above maximum' },
        'range-underflow': { description: 'Value is below minimum' },
        'step-mismatch': { description: 'Value does not match step increment' },
        'too-long': { description: 'Value exceeds maximum length' },
        'too-short': { description: 'Value is below minimum length' },
        'type-mismatch': { description: 'Value does not match type' },
        'value-missing': { description: 'Required value is missing' },
        'valid': { description: 'Input is valid' }
      }
    },
    events: {
      change: { description: 'Emitted when the input value changes' },
      invalid: { description: 'Emitted when the input becomes invalid' }
    }
  },
  'fluent-text-area': {
    attributes: {
      rows: {
        type: 'number',
        required: false
      },
      cols: {
        type: 'number',
        required: false
      },
      resize: {
        type: 'enum',
        values: ['none', 'both', 'horizontal', 'vertical'],
        required: false
      },
      placeholder: {
        type: 'string',
        required: false
      },
      disabled: {
        type: 'boolean',
        required: false
      },
      readonly: {
        type: 'boolean',
        required: false
      }
    }
  },
  'fluent-label': {
    attributes: {
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large'],
        required: false,
        default: 'medium'
      },
      weight: {
        type: 'enum',
        values: ['regular', 'semibold'],
        required: false,
        default: 'regular'
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      },
      required: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      default: { description: 'The default slot for label content' }
    }
  },
  'fluent-tabs': {
    attributes: {
      orientation: {
        type: 'enum',
        values: ['horizontal', 'vertical'],
        required: false,
        default: 'horizontal'
      },
      activeid: {
        type: 'string',
        required: false
      },
      appearance: {
        type: 'enum',
        values: ['subtle', 'transparent'],
        required: false,
        default: 'transparent'
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large'],
        required: false,
        default: 'medium'
      }
    },
    slots: {
      start: { description: 'Content positioned before the tabs' },
      end: { description: 'Content positioned after the tabs' },
      default: { description: 'The default slot for tab elements' },
      tabpanel: { description: 'The slot for tab panel elements' }
    }
  },
  'fluent-tab-panel': {
    attributes: {
      id: {
        type: 'string',
        required: true
      }
    },
    slots: {
      default: { description: 'The default slot for panel content' }
    }
  },
  'fluent-tab': {
    attributes: {
      id: {
        type: 'string',
        required: true
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      start: { description: 'Content positioned before the tab content' },
      end: { description: 'Content positioned after the tab content' },
      default: { description: 'The default slot for tab content' }
    }
  },
  'fluent-radio': {
    attributes: {
      checked: {
        type: 'boolean',
        required: false,
        default: false
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      },
      name: {
        type: 'string',
        required: true
      },
      value: {
        type: 'string',
        required: true
      }
    },
    slots: {
      'checked-indicator': { description: 'The checked indicator slot' }
    },
    events: {
      change: { description: 'Emits a custom change event when the checked state changes' },
      input: { description: 'Emits a custom input event when the checked state changes' }
    }
  },
  'fluent-radio-group': {
    attributes: {
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      },
      name: {
        type: 'string',
        required: true
      },
      value: {
        type: 'string',
        required: false
      },
      orientation: {
        type: 'enum',
        values: ['horizontal', 'vertical'],
        required: false,
        default: 'vertical'
      },
      required: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      default: { description: 'The default slot for the radio group' }
    },
    events: {
      change: { description: 'Emits when the selected radio changes' }
    },
    properties: {
      validity: { description: 'The element\'s validity state' },
      validationMessage: { description: 'The validation message' },
      value: { description: 'The current value of the checked radio' }
    },
    methods: {
      checkValidity: { description: 'Checks the validity of the element' },
      reportValidity: { description: 'Reports the validity of the element' }
    }
  },
  'fluent-divider': {
    attributes: {
      role: {
        type: 'enum',
        values: ['separator', 'presentation'],
        required: false,
        default: 'separator'
      },
      orientation: {
        type: 'enum',
        values: ['horizontal', 'vertical'],
        required: false,
        default: 'horizontal'
      },
      alignContent: {
        type: 'enum',
        values: ['center', 'start', 'end'],
        required: false,
        default: 'center'
      },
      appearance: {
        type: 'enum',
        values: ['strong', 'brand', 'subtle'],
        required: false
      },
      inset: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      default: { description: 'Content within the divider, typically used with alignContent' }
    }
  },
  'fluent-accordion': {
    attributes: {
      expandmode: {
        type: 'enum',
        values: ['single', 'multi'],
        required: false,
        default: 'single'
      }
    },
    slots: {
      default: { description: 'The default slot for the accordion items' }
    },
    events: {
      change: { description: 'Fires when the active item changes' }
    }
  },
  'fluent-accordion-item': {
    attributes: {
      headinglevel: {
        type: 'enum',
        values: [1, 2, 3, 4, 5, 6],
        required: false,
        default: 2
      },
      expanded: {
        type: 'boolean',
        required: false,
        default: false
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      },
      id: {
        type: 'string',
        required: false
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large', 'extra-large'],
        required: false,
        default: 'medium'
      },
      markerPosition: {
        type: 'enum',
        values: ['start', 'end'],
        required: false,
        default: 'start'
      },
      block: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      start: { description: 'Content positioned before heading in the collapsed state' },
      heading: { description: 'Content which serves as the accordion item heading and text of the expand button' },
      default: { description: 'The default slot for accordion item content' },
      'marker-expanded': { description: 'The expanded icon' },
      'marker-collapsed': { description: 'The collapsed icon' }
    },
    cssparts: {
      heading: { description: 'Wraps the button' },
      button: { description: 'The button which serves to invoke the item' },
      content: { description: 'The wrapper for the accordion item content' }
    }
  },
  'fabric-badge': {
    attributes: {
      appearance: {
        type: 'enum',
        values: ['filled', 'ghost', 'outline'],
        required: false,
        default: 'filled'
      },
      color: {
        type: 'enum',
        values: ['neutral', 'brand', 'important', 'informative', 'severe', 'subtle', 'success', 'warning'],
        required: false
      }
    },
    slots: {
      default: { description: 'Badge content' }
    }
  },
  'fluent-accordion-menu': {
    attributes: {
      expandmode: {
        type: 'enum',
        values: ['single', 'multi'],
        required: true
      }
    },
    slots: {
      default: { description: 'The default slot for the accordion items' }
    }
  },
  'fluent-accordion-menu-item': {
    attributes: {
      headinglevel: {
        type: 'enum',
        values: ['1', '2', '3', '4', '5', '6'],
        required: true
      },
      expanded: {
        type: 'boolean',
        required: true,
        default: false
      },
      disabled: {
        type: 'boolean',
        required: true,
        default: false
      },
      id: {
        type: 'string',
        required: true
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large', 'extra-large'],
        required: false
      },
      block: {
        type: 'boolean',
        required: true,
        default: false
      },
      markerPosition: {
        type: 'enum',
        values: ['start', 'end'],
        required: false
      }
    },
    slots: {
      heading: { description: 'Slot for the heading content' },
      'marker-expanded': { description: 'Slot for the expanded icon' },
      'marker-collapsed': { description: 'Slot for the collapsed icon' },
      default: { description: 'Default slot for the accordion item content' }
    }
  },
  'fluent-carousel': {
    attributes: {
      disableAnimation: {
        type: 'boolean',
        required: false
      },
      slottedCarouselItems: {
        type: 'array',
        required: true
      },
      header: {
        type: 'object',
        required: false
      },
      currentIndex: {
        type: 'number',
        required: true
      },
      visibleItemsCount: {
        type: 'number',
        required: true
      }
    },
    slots: {
      header: { description: 'Slot for the carousel header content' },
      default: { description: 'Default slot for carousel items' }
    }
  },
  'fluent-anchor-button': {
    attributes: {
      appearance: {
        type: 'enum',
        values: ['primary', 'outline', 'subtle', 'transparent'],
        required: false
      },
      download: {
        type: 'string',
        required: false
      },
      href: {
        type: 'string',
        required: false
      },
      hreflang: {
        type: 'string',
        required: false
      },
      ping: {
        type: 'string',
        required: false
      },
      referrerpolicy: {
        type: 'string',
        required: false
      },
      rel: {
        type: 'string',
        required: false
      },
      target: {
        type: 'enum',
        values: ['_self', '_blank', '_parent', '_top'],
        required: false
      },
      type: {
        type: 'string',
        required: false
      },
      shape: {
        type: 'enum',
        values: ['circular', 'rounded', 'square'],
        required: false
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large'],
        required: false
      },
      iconOnly: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      start: { description: 'Content which can be provided before the anchor content' },
      end: { description: 'Content which can be provided after the anchor content' },
      default: { description: 'The default slot for anchor content' }
    },
    cssparts: {
      control: { description: 'The anchor element' },
      content: { description: 'The element wrapping anchor content' }
    }
  },
  'fluent-compound-button': {
    attributes: {
      appearance: {
        type: 'enum',
        values: ['primary', 'outline', 'subtle', 'transparent'],
        required: false
      },
      autofocus: {
        type: 'boolean',
        required: false
      },
      disabled: {
        type: 'boolean',
        required: false
      },
      disabledFocusable: {
        type: 'boolean',
        required: false
      },
      form: {
        type: 'string',
        required: false
      },
      formAction: {
        type: 'string',
        required: false
      },
      formEnctype: {
        type: 'string',
        required: false
      },
      formMethod: {
        type: 'string',
        required: false
      },
      formNoValidate: {
        type: 'boolean',
        required: false
      },
      formTarget: {
        type: 'enum',
        values: ['_blank', '_self', '_parent', '_top'],
        required: false
      },
      name: {
        type: 'string',
        required: false
      },
      shape: {
        type: 'enum',
        values: ['circular', 'rounded', 'square'],
        required: false
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large'],
        required: false
      },
      type: {
        type: 'enum',
        values: ['submit', 'reset', 'button'],
        required: false,
        default: 'button'
      },
      value: {
        type: 'string',
        required: false
      }
    },
    slots: {
      start: { description: 'Content which can be provided before the button content' },
      end: { description: 'Content which can be provided after the button content' },
      default: { description: 'The default slot for button content' },
      description: { description: 'The description text that appears below the button content' }
    },
    cssparts: {
      content: { description: 'The button content container' },
      description: { description: 'The description container' }
    }
  },
  'fluent-toggle-button': {
    attributes: {
      appearance: {
        type: 'enum',
        values: ['primary', 'outline', 'subtle', 'transparent'],
        required: false
      },
      autofocus: {
        type: 'boolean',
        required: false
      },
      disabled: {
        type: 'boolean',
        required: false
      },
      disabledFocusable: {
        type: 'boolean',
        required: false
      },
      form: {
        type: 'string',
        required: false
      },
      formAction: {
        type: 'string',
        required: false
      },
      formEnctype: {
        type: 'string',
        required: false
      },
      formMethod: {
        type: 'string',
        required: false
      },
      formNoValidate: {
        type: 'boolean',
        required: false
      },
      formTarget: {
        type: 'enum',
        values: ['_blank', '_self', '_parent', '_top'],
        required: false
      },
      name: {
        type: 'string',
        required: false
      },
      pressed: {
        type: 'boolean',
        required: false,
        default: false
      },
      mixed: {
        type: 'boolean',
        required: false
      },
      shape: {
        type: 'enum',
        values: ['circular', 'rounded', 'square'],
        required: false
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large'],
        required: false
      },
      type: {
        type: 'enum',
        values: ['submit', 'reset', 'button'],
        required: false,
        default: 'button'
      },
      value: {
        type: 'string',
        required: false
      },
      iconOnly: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      start: { description: 'Content which can be provided before the button content' },
      end: { description: 'Content which can be provided after the button content' },
      default: { description: 'The default slot for button content' }
    },
    cssparts: {
      content: { description: 'The button content container' }
    }
  },
  'fluent-avatar': {
    attributes: {
      name: {
        type: 'string',
        required: false
      },
      initials: {
        type: 'string',
        required: false
      },
      active: {
        type: 'enum',
        values: ['active', 'inactive'],
        required: false
      },
      shape: {
        type: 'enum',
        values: ['circular', 'square'],
        required: false,
        default: 'circular'
      },
      appearance: {
        type: 'enum',
        values: ['ring', 'shadow', 'ring-shadow'],
        required: false
      },
      size: {
        type: 'enum',
        values: [16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 72, 96, 120, 128],
        required: false,
        default: 32
      },
      color: {
        type: 'enum',
        values: [
          'dark-red', 'cranberry', 'red', 'pumpkin', 'peach', 'marigold', 'gold', 'brass',
          'brown', 'forest', 'seafoam', 'dark-green', 'light-teal', 'teal', 'steel', 'blue',
          'royal-blue', 'cornflower', 'navy', 'lavender', 'purple', 'grape', 'lilac', 'pink',
          'magenta', 'plum', 'beige', 'mink', 'platinum', 'anchor', 'neutral', 'brand', 'colorful'
        ],
        required: false,
        default: 'neutral'
      },
      colorId: {
        type: 'string',
        required: false
      }
    },
    slots: {
      default: { description: 'The image content for the avatar' }
    },
    cssparts: {
      root: { description: 'The component wrapper' },
      image: { description: 'The image content' },
      initials: { description: 'The initials content' }
    }
  },
  'fluent-badge': {
    attributes: {
      appearance: {
        type: 'enum',
        values: ['filled', 'ghost', 'outline', 'tint'],
        required: false,
        default: 'filled'
      },
      color: {
        type: 'enum',
        values: ['brand', 'danger', 'important', 'informative', 'severe', 'subtle', 'success', 'warning'],
        required: false,
        default: 'brand'
      },
      shape: {
        type: 'enum',
        values: ['circular', 'rounded', 'square'],
        required: false,
        default: 'rounded'
      },
      size: {
        type: 'enum',
        values: ['tiny', 'extra-small', 'small', 'medium', 'large', 'extra-large'],
        required: false,
        default: 'medium'
      }
    },
    slots: {
      start: { description: 'Content positioned before the badge content' },
      end: { description: 'Content positioned after the badge content' },
      default: { description: 'The default slot for badge content' }
    },
    cssparts: {
      root: { description: 'The component wrapper' },
      content: { description: 'The content area' }
    }
  },
  'fluent-checkbox': {
    attributes: {
      autofocus: {
        type: 'boolean',
        required: false,
        default: false
      },
      checked: {
        type: 'boolean',
        required: false,
        default: false
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      },
      form: {
        type: 'string',
        required: false
      },
      indeterminate: {
        type: 'boolean',
        required: false,
        default: false
      },
      name: {
        type: 'string',
        required: false
      },
      required: {
        type: 'boolean',
        required: false,
        default: false
      },
      shape: {
        type: 'enum',
        values: ['circular', 'square'],
        required: false,
        default: 'square'
      },
      size: {
        type: 'enum',
        values: ['medium', 'large'],
        required: false,
        default: 'medium'
      },
      value: {
        type: 'string',
        required: false
      }
    },
    slots: {
      default: { description: 'The label content for the checkbox' },
      'checked-indicator': { description: 'The indicator displayed when the checkbox is checked' },
      'indeterminate-indicator': { description: 'The indicator displayed when the checkbox is in an indeterminate state' }
    },
    cssparts: {
      root: { description: 'The component wrapper' },
      control: { description: 'The checkbox control wrapper' },
      label: { description: 'The label content wrapper' }
    }
  },
  'fluent-counter-badge': {
    attributes: {
      appearance: {
        type: 'enum',
        values: ['filled', 'ghost'],
        required: false,
        default: 'filled'
      },
      color: {
        type: 'enum',
        values: ['brand', 'danger', 'important', 'informative', 'severe', 'subtle', 'success', 'warning'],
        required: false,
        default: 'brand'
      },
      shape: {
        type: 'enum',
        values: ['circular', 'rounded'],
        required: false,
        default: 'circular'
      },
      size: {
        type: 'enum',
        values: ['tiny', 'extra-small', 'small', 'medium', 'large', 'extra-large'],
        required: false,
        default: 'medium'
      },
      count: {
        type: 'number',
        required: false,
        default: 0
      },
      'overflow-count': {
        type: 'number',
        required: false,
        default: 99
      },
      'show-zero': {
        type: 'boolean',
        required: false,
        default: false
      },
      dot: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      start: { description: 'Content positioned before the counter content' },
      end: { description: 'Content positioned after the counter content' },
      default: { description: 'The default slot for custom counter content' }
    },
    cssparts: {
      root: { description: 'The component wrapper' },
      content: { description: 'The content area' }
    }
  },
  'fluent-dialog': {
    attributes: {
      type: {
        type: 'enum',
        values: ['modal', 'non-modal', 'alert'],
        required: true
      },
      ariaDescribedby: {
        type: 'string',
        required: false
      },
      ariaLabelledby: {
        type: 'string',
        required: false
      }
    },
    events: {
      beforetoggle: { description: 'Emitted before dialog state changes' },
      toggle: { description: 'Emitted after dialog state changes' }
    },
    methods: {
      show: { description: 'Method to show the dialog' },
      hide: { description: 'Method to hide the dialog' }
    },
    slots: {
      default: { description: 'Default slot for dialog content' }
    }
  },
  'fluent-dialog-body': {
    attributes: {
      noTitleAction: {
        type: 'boolean',
        required: true
      }
    },
    slots: {
      default: { description: 'Default slot for dialog body content' }
    }
  },
  'fluent-drawer': {
    attributes: {
      type: {
        type: 'enum',
        values: ['non-modal', 'modal', 'inline'],
        required: true
      },
      position: {
        type: 'enum',
        values: ['start', 'end'],
        required: false,
        default: 'start'
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large', 'full'],
        required: false,
        default: 'medium'
      },
      ariaDescribedby: {
        type: 'string',
        required: false
      },
      ariaLabelledby: {
        type: 'string',
        required: false
      }
    },
    events: {
      toggle: { description: 'Emitted after the dialog\'s open state changes' },
      beforetoggle: { description: 'Emitted before the dialog\'s open state changes' }
    },
    methods: {
      show: { description: 'Method to show the drawer' },
      hide: { description: 'Method to hide the drawer' }
    },
    slots: {
      default: { description: 'Default slot for drawer content' }
    },
    cssparts: {
      dialog: { description: 'The dialog element of the drawer' }
    }
  },
  'fluent-drawer-body': {
    slots: {
      title: { description: 'The title slot' },
      close: { description: 'The close button slot' },
      default: { description: 'The default content slot' },
      footer: { description: 'The footer slot' }
    },
    cssparts: {
      header: { description: 'The header part of the drawer' },
      content: { description: 'The content part of the drawer' },
      footer: { description: 'The footer part of the drawer' }
    }
  },
  'fluent-image': {
    attributes: {
      block: {
        type: 'boolean',
        required: false,
        default: false
      },
      bordered: {
        type: 'boolean',
        required: false,
        default: false
      },
      shadow: {
        type: 'boolean',
        required: false,
        default: false
      },
      fit: {
        type: 'enum',
        values: ['none', 'center', 'contain', 'cover'],
        required: false
      },
      shape: {
        type: 'enum',
        values: ['circular', 'rounded', 'square'],
        required: false
      },
      src: {
        type: 'string',
        required: true
      },
      alt: {
        type: 'string',
        required: true
      }
    },
    slots: {
      default: { description: 'The default slot for image content' }
    }
  },
  'fluent-link': {
    attributes: {
      appearance: {
        type: 'enum',
        values: ['subtle'],
        required: false
      },
      inline: {
        type: 'boolean',
        required: false,
        default: false
      },
      download: {
        type: 'string',
        required: false
      },
      href: {
        type: 'string',
        required: false
      },
      hreflang: {
        type: 'string',
        required: false
      },
      ping: {
        type: 'string',
        required: false
      },
      referrerpolicy: {
        type: 'string',
        required: false
      },
      rel: {
        type: 'string',
        required: false
      },
      target: {
        type: 'enum',
        values: ['_self', '_blank', '_parent', '_top'],
        required: false,
        default: '_self'
      },
      type: {
        type: 'string',
        required: false
      }
    },
    slots: {
      start: { description: 'Content which can be provided before the link content' },
      end: { description: 'Content which can be provided after the link content' },
      default: { description: 'The default slot for link content' }
    }
  },
  'fluent-menu': {
    attributes: {
      'open-on-hover': {
        type: 'boolean',
        required: false,
        default: false
      },
      'open-on-context': {
        type: 'boolean',
        required: false,
        default: false
      },
      'close-on-scroll': {
        type: 'boolean',
        required: false,
        default: false
      },
      'persist-on-item-click': {
        type: 'boolean',
        required: false,
        default: false
      },
      split: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      'primary-action': { description: 'Slot for the primary action elements. Used when in split state' },
      trigger: { description: 'Slot for the trigger elements' },
      default: { description: 'Default slot for the menu list' }
    },
    methods: {
      toggleMenu: { description: 'Toggles the open state of the menu' },
      closeMenu: { description: 'Closes the menu' },
      openMenu: { description: 'Opens the menu' },
      focusMenuList: { description: 'Focuses on the menu list' },
      focusTrigger: { description: 'Focuses on the menu trigger' }
    }
  },
  'fluent-menu-button': {
    attributes: {
      appearance: {
        type: 'enum',
        values: ['primary', 'outline', 'subtle', 'transparent'],
        required: false,
        default: 'primary'
      },
      shape: {
        type: 'enum',
        values: ['circular', 'rounded', 'square'],
        required: false,
        default: 'rounded'
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large'],
        required: false,
        default: 'medium'
      }
    },
    slots: {
      start: { description: 'Content which can be provided before the button content' },
      end: { description: 'Content which can be provided after the button content' },
      default: { description: 'The default slot for button content' }
    }
  },
  'fluent-menu-list': {
    slots: {
      default: { description: 'The default slot for the menu items' }
    },
    methods: {
      focus: { description: 'Focuses the first item in the menu' }
    }
  },
  'fluent-menu-item': {
    attributes: {
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      },
      role: {
        type: 'enum',
        values: ['menuitem', 'menuitemcheckbox', 'menuitemradio'],
        required: false,
        default: 'menuitem'
      },
      checked: {
        type: 'boolean',
        required: false,
        default: false
      },
      hidden: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      indicator: { description: 'The checkbox or radio indicator' },
      start: { description: 'Content which can be provided before the menu item content' },
      default: { description: 'The default slot for menu item content' },
      end: { description: 'Content which can be provided after the menu item content' },
      'submenu-glyph': { description: 'The submenu expand/collapse indicator' },
      submenu: { description: 'Used to nest menus within menu items' }
    },
    cssparts: {
      content: { description: 'The element wrapping the menu item content' }
    },
    events: {
      change: { description: 'Fires when a non-submenu item with a role of menuitemcheckbox, menuitemradio, or menuitem is invoked' }
    }
  },
  'fluent-message-bar': {
    attributes: {
      shape: {
        type: 'enum',
        values: ['rounded', 'square'],
        required: false,
        default: 'rounded'
      },
      layout: {
        type: 'enum',
        values: ['multiline', 'singleline'],
        required: false,
        default: 'multiline'
      },
      intent: {
        type: 'enum',
        values: ['success', 'warning', 'error', 'info'],
        required: false,
        default: 'info'
      }
    },
    slots: {
      actions: { description: 'Content that can be provided for the actions' },
      dismiss: { description: 'Content that can be provided for the dismiss button' },
      default: { description: 'The default slot for the content' }
    },
    methods: {
      dismissMessageBar: { description: 'Method to emit a dismiss event when the message bar is dismissed' }
    },
    events: {
      dismiss: { description: 'Emitted when the message bar is dismissed' }
    }
  },
  'fluent-progress-bar': {
    attributes: {
      'validation-state': {
        type: 'enum',
        values: ['success', 'warning', 'error'],
        required: false
      },
      value: {
        type: 'number',
        required: false
      },
      min: {
        type: 'number',
        required: false,
        default: 0
      },
      max: {
        type: 'number',
        required: false,
        default: 100
      },
      thickness: {
        type: 'enum',
        values: ['medium', 'large'],
        required: false,
        default: 'medium'
      },
      shape: {
        type: 'enum',
        values: ['rounded', 'square'],
        required: false,
        default: 'rounded'
      }
    },
    properties: {
      percentComplete: { description: 'Read-only property indicating progress in percentage' }
    }
  },
  'fluent-switch': {
    attributes: {
      checked: {
        type: 'boolean',
        required: false,
        default: false
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      },
      required: {
        type: 'boolean',
        required: false,
        default: false
      },
      name: {
        type: 'string',
        required: false
      },
      value: {
        type: 'string',
        required: false
      },
      'label-position': {
        type: 'enum',
        values: ['above', 'after', 'before'],
        required: false,
        default: 'after'
      }
    },
    slots: {
      default: { description: 'The default slot for the switch label' },
      'checked-indicator': { description: 'The checked indicator slot' }
    },
    events: {
      change: { description: 'Fires a custom change event when the checked state changes' },
      input: { description: 'Fires a custom input event when the checked state changes' }
    }
  },
  'fluent-tablist': {
    attributes: {
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      },
      orientation: {
        type: 'enum',
        values: ['horizontal', 'vertical'],
        required: false,
        default: 'horizontal'
      },
      activeid: {
        type: 'string',
        required: false
      },
      appearance: {
        type: 'enum',
        values: ['subtle', 'transparent'],
        required: false,
        default: 'transparent'
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large'],
        required: false,
        default: 'medium'
      }
    },
    slots: {
      default: { description: 'The default slot for tab elements' }
    },
    events: {
      change: { description: 'Fires when the active tab changes' }
    }
  },
  'fluent-text-input': {
    attributes: {
      appearance: {
        type: 'enum',
        values: ['outline', 'underline', 'filled-lighter', 'filled-darker'],
        required: false,
        default: 'outline'
      },
      type: {
        type: 'enum',
        values: ['text', 'email', 'password', 'tel', 'url'],
        required: false,
        default: 'text'
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large'],
        required: false,
        default: 'medium'
      },
      placeholder: {
        type: 'string',
        required: false
      },
      value: {
        type: 'string',
        required: false
      },
      name: {
        type: 'string',
        required: false
      },
      required: {
        type: 'boolean',
        required: false,
        default: false
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      },
      readonly: {
        type: 'boolean',
        required: false,
        default: false
      },
      autofocus: {
        type: 'boolean',
        required: false,
        default: false
      },
      maxlength: {
        type: 'number',
        required: false
      },
      minlength: {
        type: 'number',
        required: false
      },
      pattern: {
        type: 'string',
        required: false
      },
      spellcheck: {
        type: 'boolean',
        required: false
      },
      autocomplete: {
        type: 'string',
        required: false
      },
      list: {
        type: 'string',
        required: false
      },
      dirname: {
        type: 'string',
        required: false
      },
      form: {
        type: 'string',
        required: false
      },
      multiple: {
        type: 'boolean',
        required: false,
        default: false
      }
    },
    slots: {
      start: { description: 'Content which can be provided before the input' },
      end: { description: 'Content which can be provided after the input' },
      default: { description: 'The default slot for label content' }
    },
    cssparts: {
      label: { description: 'The internal label element' },
      root: { description: 'The root container for the internal control' },
      control: { description: 'The internal input control' }
    },
    events: {
      change: { description: 'Fires when the value has been changed and committed by the user' },
      input: { description: 'Fires when the value is being changed by the user' }
    }
  },
  'fluent-textarea': {
    attributes: {
      appearance: {
        type: 'enum',
        values: ['outline', 'filled-lighter', 'filled-darker'],
        required: false,
        default: 'outline'
      },
      size: {
        type: 'enum',
        values: ['small', 'medium', 'large'],
        required: false,
        default: 'medium'
      },
      'auto-resize': {
        type: 'boolean',
        required: false,
        default: false
      },
      'display-shadow': {
        type: 'boolean',
        required: false,
        default: false
      },
      block: {
        type: 'boolean',
        required: false,
        default: false
      },
      placeholder: {
        type: 'string',
        required: false
      },
      value: {
        type: 'string',
        required: false
      },
      name: {
        type: 'string',
        required: false
      },
      required: {
        type: 'boolean',
        required: false,
        default: false
      },
      disabled: {
        type: 'boolean',
        required: false,
        default: false
      },
      readonly: {
        type: 'boolean',
        required: false,
        default: false
      },
      autofocus: {
        type: 'boolean',
        required: false,
        default: false
      },
      maxlength: {
        type: 'number',
        required: false
      },
      minlength: {
        type: 'number',
        required: false
      },
      rows: {
        type: 'number',
        required: false
      },
      cols: {
        type: 'number',
        required: false
      },
      resize: {
        type: 'enum',
        values: ['none', 'both', 'horizontal', 'vertical'],
        required: false,
        default: 'none'
      },
      spellcheck: {
        type: 'boolean',
        required: false
      },
      autocomplete: {
        type: 'enum',
        values: ['on', 'off'],
        required: false
      },
      dirname: {
        type: 'string',
        required: false
      },
      form: {
        type: 'string',
        required: false
      }
    },
    slots: {
      default: { description: 'The default content/value of the component' },
      label: { description: 'The content for the label, it should be a fluent-label element' }
    },
    cssparts: {
      label: { description: 'The label element' },
      root: { description: 'The container element of the textarea element' },
      control: { description: 'The internal textarea element' }
    },
    events: {
      change: { description: 'Fires after the control loses focus, if the content has changed' },
      select: { description: 'Fires when the select() method is called' },
      input: { description: 'Fires when the value is being changed by the user' }
    }
  },
  'fluent-tooltip': {
    attributes: {
      id: {
        type: 'string',
        required: false
      },
      delay: {
        type: 'number',
        required: false
      },
      positioning: {
        type: 'enum',
        values: [
          'above-start', 'above', 'above-end',
          'below-start', 'below', 'below-end',
          'before-top', 'before', 'before-bottom',
          'after-top', 'after', 'after-bottom'
        ],
        required: false
      },
      anchor: {
        type: 'string',
        required: true
      }
    },
    slots: {
      default: { description: 'The default slot for tooltip content' }
    }
  }
  // Add more components as needed
};

// Map of component names to their expected import sources
const COMPONENT_IMPORTS = {
  'fluent-text': {
    import: 'TextDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-button': {
    import: 'ButtonDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-card': {
    import: 'CardDefinition',
    source: '@fabric-msft/fabric-web'
  },
  'fluent-rating-display': {
    import: 'RatingDisplayDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-slider': {
    import: 'SliderDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-field': {
    import: 'FieldDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-text-area': {
    import: 'TextAreaDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-label': {
    import: 'LabelDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-tabs': {
    import: 'TabsDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-tab-panel': {
    import: 'TabPanelDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-tab': {
    import: 'TabDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-radio': {
    import: 'RadioDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-radio-group': {
    import: 'RadioGroupDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-divider': {
    import: 'DividerDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-accordion': {
    import: 'accordionDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-accordion-item': {
    import: 'accordionItemDefinition',
    source: '@fluentui/web-components'
  },
  'fabric-badge': {
    import: 'BadgeDefinition',
    source: '@fabric-msft/fabric-web'
  },
  'fluent-anchor-button': {
    import: 'AnchorButtonDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-compound-button': {
    import: 'CompoundButtonDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-toggle-button': {
    import: 'ToggleButtonDefinition',
    source: '@fluentui/web-components'
  },
  'fluent-avatar': {
    import: 'AvatarDefinition',
    source: '@fluentui/web-components'
  }
};

// Add related component groups that should be imported together
const RELATED_COMPONENTS = {
  'fluent-radio': ['fluent-radio-group'],
  'fluent-tab': ['fluent-tabs', 'fluent-tab-panel'],
  'fluent-accordion-item': ['fluent-accordion'],
  'fluent-field': ['fluent-label']
};

// Required ARIA attributes for components
const REQUIRED_ARIA = {
  'fluent-radio-group': ['aria-labelledby'],
  'fluent-tabs': ['aria-label'],
  'fluent-tab-panel': ['aria-labelledby'],
  'fluent-accordion': ['aria-label']
};

function findImportedComponents(node) {
  const imports = new Map();

  if (node.type === AST_NODE_TYPES.Program) {
    node.body.forEach(statement => {
      if (statement.type === AST_NODE_TYPES.ImportDeclaration) {
        const source = statement.source.value;
        statement.specifiers.forEach(specifier => {
          if (specifier.type === AST_NODE_TYPES.ImportSpecifier) {
            imports.set(specifier.local.name, source);
          }
        });
      }
    });
  }

  return imports;
}

function findDefinedComponents(node) {
  const defined = new Set();

  if (node.type === AST_NODE_TYPES.Program) {
    node.body.forEach(statement => {
      if (statement.type === AST_NODE_TYPES.ExpressionStatement &&
        statement.expression.type === AST_NODE_TYPES.CallExpression &&
        statement.expression.callee.type === AST_NODE_TYPES.MemberExpression &&
        statement.expression.callee.property.name === 'define') {
        const object = statement.expression.callee.object;
        if (object.type === AST_NODE_TYPES.Identifier) {
          defined.add(object.name);
        }
      }
    });
  }

  return defined;
}

function findUsedComponents(node) {
  const used = new Set();
  const visited = new WeakSet();

  // Helper to check template literals for component usage
  function checkTemplateLiteral(template) {
    const content = template.quasis.map(quasi => quasi.value.raw).join('');
    Object.keys(COMPONENT_RULES).forEach(tagName => {
      const regex = new RegExp(`<${tagName}[^>]*>`, 'g');
      if (regex.test(content)) {
        const importInfo = COMPONENT_IMPORTS[tagName];
        if (importInfo) {
          used.add(importInfo.import);
        }
      }
    });
  }

  // Walk the AST to find template literals
  function walk(node) {
    if (!node || typeof node !== 'object' || visited.has(node)) {
      return;
    }

    visited.add(node);

    // Check template literals
    if (node.type === AST_NODE_TYPES.TemplateLiteral) {
      checkTemplateLiteral(node);
    }

    // Check properties of the node
    Object.keys(node).forEach(key => {
      const child = node[key];
      if (child && typeof child === 'object') {
        if (Array.isArray(child)) {
          child.forEach(item => {
            if (item && typeof item === 'object') {
              walk(item);
            }
          });
        } else {
          walk(child);
        }
      }
    });
  }

  walk(node);
  return used;
}

function checkThemeSetup(node) {
  let hasThemeImport = false;
  let hasThemeSet = false;

  if (node.type === AST_NODE_TYPES.Program) {
    node.body.forEach(statement => {
      // Check for theme import
      if (statement.type === AST_NODE_TYPES.ImportDeclaration &&
        statement.source.value.includes('@fabric-msft/theme')) {
        hasThemeImport = true;
      }

      // Check for setTheme call
      if (statement.type === AST_NODE_TYPES.ExpressionStatement &&
        statement.expression.type === AST_NODE_TYPES.CallExpression &&
        statement.expression.callee.name === 'setTheme') {
        hasThemeSet = true;
      }
    });
  }

  return { hasThemeImport, hasThemeSet };
}

function checkEventListenerCleanup(node) {
  let hasAddListener = false;
  let hasRemoveListener = false;

  // Check for event listener cleanup in component disconnectedCallback
  if (node.type === AST_NODE_TYPES.ClassDeclaration) {
    node.body.body.forEach(member => {
      if (member.type === AST_NODE_TYPES.MethodDefinition) {
        if (member.key.name === 'connectedCallback') {
          // Look for addEventListener
          const body = member.value.body;
          body.body.forEach(statement => {
            if (statement.type === AST_NODE_TYPES.ExpressionStatement &&
              statement.expression.type === AST_NODE_TYPES.CallExpression &&
              statement.expression.callee.property?.name === 'addEventListener') {
              hasAddListener = true;
            }
          });
        }
        if (member.key.name === 'disconnectedCallback') {
          // Look for removeEventListener
          const body = member.value.body;
          body.body.forEach(statement => {
            if (statement.type === AST_NODE_TYPES.ExpressionStatement &&
              statement.expression.type === AST_NODE_TYPES.CallExpression &&
              statement.expression.callee.property?.name === 'removeEventListener') {
              hasRemoveListener = true;
            }
          });
        }
      }
    });
  }

  return hasAddListener && !hasRemoveListener;
}

export const validateUsage = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Validate Fluent UI component usage',
      category: 'Possible Errors',
      recommended: true
    },
    fixable: 'code'
  },
  create(context) {
    let imports = new Map();
    let defined = new Set();
    let used = new Set();
    let hasEventListenerIssue = false;

    return {
      Program(node) {
        imports = findImportedComponents(node);
        defined = findDefinedComponents(node);
        used = findUsedComponents(node);

        // Check theme setup
        const { hasThemeImport, hasThemeSet } = checkThemeSetup(node);
        if (hasThemeImport && !hasThemeSet) {
          context.report({
            node,
            message: 'Theme is imported but setTheme() is never called'
          });
        }

        // Check related component imports
        Object.entries(RELATED_COMPONENTS).forEach(([component, related]) => {
          const componentImport = Object.entries(COMPONENT_IMPORTS)
            .find(([tag]) => tag === component);

          if (componentImport && imports.has(componentImport[1].import)) {
            related.forEach(relatedTag => {
              const relatedImport = COMPONENT_IMPORTS[relatedTag];
              if (relatedImport && !imports.has(relatedImport.import)) {
                context.report({
                  node,
                  message: `Component '${component}' is imported but related component '${relatedTag}' is missing`
                });
              }
            });
          }
        });

        // Check for components imported but not used
        imports.forEach((source, name) => {
          if (!used.has(name) && Object.values(COMPONENT_IMPORTS).some(info => info.import === name)) {
            context.report({
              node,
              message: `Component '${name}' is imported but never used`
            });
          }
        });

        // Check for components used without import
        used.forEach(componentName => {
          if (!imports.has(componentName)) {
            const componentEntry = Object.entries(COMPONENT_IMPORTS)
              .find(([, info]) => info.import === componentName);
            if (componentEntry) {
              context.report({
                node,
                message: `Component '${componentEntry[0]}' is used but '${componentName}' is not imported from '${COMPONENT_IMPORTS[componentEntry[0]].source}'`
              });
            }
          }
        });
      },

      ClassDeclaration(node) {
        if (checkEventListenerCleanup(node)) {
          hasEventListenerIssue = true;
          context.report({
            node,
            message: 'Event listener is added in connectedCallback but not removed in disconnectedCallback'
          });
        }
      }
    };
  }
};
