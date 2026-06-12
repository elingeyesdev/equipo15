import { createGlobalStyle } from 'styled-components';
import { breakpoints } from '../config/theme';

export const GlobalStyles = createGlobalStyle`
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

  html, body {
    margin: 0;
    padding: 0;
    max-width: 100%;
    overflow-x: hidden;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--p8-bg);
    color: var(--p8-ink);
    -webkit-font-smoothing: antialiased;
    letter-spacing: -0.01em;
    font-size: clamp(14px, 1.6vw, 16px);
  }

  button, input, textarea, select {
    font-family: inherit;
  }

  button {
    min-height: 36px;
  }

  #root {
    min-height: 100vh;
  }

  @media (max-width: ${breakpoints.small}) {
    body {
      font-size: 14px;
    }
  }

  /* Forzar z-index de Sonner Toaster por encima de todos los modales y overlays */
  [data-sonner-toaster], .sonner-toaster {
    z-index: 999999 !important;
  }
`;
