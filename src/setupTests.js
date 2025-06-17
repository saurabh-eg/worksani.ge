import '@testing-library/jest-dom';

// Suppress React 18 deprecated ReactDOM.render and ReactDOMTestUtils.act warnings
const suppressedWarnings = [
  'Warning: ReactDOM.render is no longer supported in React 18.',
  'Warning: `ReactDOMTestUtils.act` is deprecated in favor of `React.act`.',
];

const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && suppressedWarnings.some(warning => args[0].includes(warning))) {
    return;
  }
  originalConsoleError.apply(console, args);
};
