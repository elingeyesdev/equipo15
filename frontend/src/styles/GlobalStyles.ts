import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Chivo:wght@600;700&display=swap');

  :root {
    --p8-bg: #f5f6fb;
    --p8-ink: #1a1f24;
    --p8-muted: #8a92a5;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Space Grotesk', 'Chivo', 'Segoe UI', sans-serif;
    background-color: var(--p8-bg);
    color: var(--p8-ink);
    -webkit-font-smoothing: antialiased;
    letter-spacing: -0.01em;
  }

  button, input, textarea, select {
    font-family: inherit;
  }

  #root {
    min-height: 100vh;
  }
`;
