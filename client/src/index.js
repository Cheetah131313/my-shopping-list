import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeProvider } from './components/ThemeContext'; 
import './index.css';
import ErrorBoundary from './components/ErrorBoundary'; 
import i18n from './i18n';  // Import the i18n configuration
import { I18nextProvider } from 'react-i18next'; 

const container = document.getElementById('root'); 
const root = ReactDOM.createRoot(container); // Create a root

root.render(
  <I18nextProvider i18n={i18n}>
  <React.StrictMode>
    <ErrorBoundary>
    <ThemeProvider>
      <App />
    </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  </I18nextProvider>,
);

// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import App from './App';
// import { ThemeProvider } from './components/ThemeContext'; 
// //import './index.css';
// import ErrorBoundary from './components/ErrorBoundary'; 

// const container = document.getElementById('root'); 
// const root = ReactDOM.createRoot(container); // Create a root

// root.render(
//   <React.StrictMode>
//     <ErrorBoundary>
//     <ThemeProvider>
//       <App />
//     </ThemeProvider>
//     </ErrorBoundary>
//   </React.StrictMode>,
// );
