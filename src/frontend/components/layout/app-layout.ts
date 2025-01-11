import { FASTElement, customElement, html, css } from '@microsoft/fast-element';

const template = html<AppLayout>`
  <fluent-design-system-provider>
    <header>
      <fluent-anchor href="/" appearance="lightweight">FARM Stack</fluent-anchor>
      <nav>
        <fluent-anchor href="/" appearance="lightweight">Home</fluent-anchor>
        <fluent-anchor href="/about" appearance="lightweight">About</fluent-anchor>
      </nav>
    </header>

    <main>
      <slot></slot>
    </main>

    <footer>
      <p>&copy; 2024 FARM Stack</p>
    </footer>
  </fluent-design-system-provider>
`;

const styles = css`
  :host {
    display: block;
  }

  fluent-design-system-provider {
    display: grid;
    grid-template-rows: auto 1fr auto;
    min-height: 100vh;
    background-color: var(--neutral-layer-1);
  }

  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: var(--neutral-layer-1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  nav {
    display: flex;
    gap: 1rem;
  }

  main {
    padding: 0;
    background: var(--neutral-layer-1);
  }

  footer {
    padding: 1rem 2rem;
    text-align: center;
    background: var(--neutral-layer-1);
    color: var(--neutral-foreground-rest);
  }

  p {
    margin: 0;
  }
`;

@customElement({
  name: 'app-layout',
  template,
  styles,
})
export class AppLayout extends FASTElement {}
