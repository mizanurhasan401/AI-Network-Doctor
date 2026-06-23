import '@testing-library/jest-dom/vitest'

// Shared test setup. Renderer specs run under jsdom (see vitest config glob);
// main/shared specs run under node. Keep environment-agnostic globals here.
