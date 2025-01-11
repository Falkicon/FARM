// Import stylesheets

import {
  LoadingButtonDefinition,
  CardDefinition,
} from '@fabric-msft/fabric-web';

import {
  ButtonDefinition,
  SliderDefinition,
  FieldDefinition,
  TextAreaDefinition,
  LabelDefinition,
  TabsDefinition,
  TabPanelDefinition,
  TabDefinition,
  RadioDefinition,
  RadioGroupDefinition,
} from '@fluentui/web-components';

ButtonDefinition.define(customElements);
CardDefinition.define(customElements);
SliderDefinition.define(customElements);
FieldDefinition.define(customElements);
TextAreaDefinition.define(customElements);
LabelDefinition.define(customElements);
TabsDefinition.define(customElements);
TabPanelDefinition.define(customElements);
TabDefinition.define(customElements);
RadioDefinition.define(customElements);
RadioGroupDefinition.define(customElements);
LoadingButtonDefinition.define(customElements);

import { fabricLightTheme, setTheme } from '@fabric-msft/theme';

setTheme(fabricLightTheme);

const customStyles = `
  <style>
    .form {
      width: 100%;
    }
  </style>
`;

const appDiv: HTMLElement = document.getElementById('app');
appDiv.innerHTML = `
${customStyles}

<fluent-field label-position="above">
  <label slot="label">Favorite Fruit</label>
  <fluent-radio-group
    slot="input"
    aria-labelledby="undefined--label"
    name="favorite-fruit"
  >
    <fluent-field label-position="after">
      <label slot="label">Apple</label>
      <fluent-radio
        slot="input"
        name="favorite-fruit"
        value="apple"
      ></fluent-radio>
    </fluent-field>

    <fluent-field label-position="after">
      <label slot="label">Pear</label>
      <fluent-radio
        slot="input"
        name="favorite-fruit"
        value="pear"
      ></fluent-radio>
    </fluent-field>

    <fluent-field label-position="after">
      <label slot="label">Banana</label>
      <fluent-radio
        slot="input"
        name="favorite-fruit"
        value="banana"
      ></fluent-radio>
    </fluent-field>

    <fluent-field label-position="after">
      <label slot="label">Orange</label>
      <fluent-radio
        slot="input"
        name="favorite-fruit"
        value="orange"  
      ></fluent-radio>
    </fluent-field>
  </fluent-radio-group>
</fluent-field>
<fluent-button>Hi</fluent-button>


<p id="selected-fruit">Selected fruit: None</p>
`;

// Add event listeners to display the selected value
const radios = document.querySelectorAll('fluent-radio');
const selectedFruitDisplay = document.getElementById('selected-fruit');

radios.forEach((radio) => {
  radio.addEventListener('change', (event) => {
    const target = event.target as HTMLInputElement;
    selectedFruitDisplay.textContent = `Selected fruit: ${target.value}`;
  });
});
