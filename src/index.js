import React from 'react';
import ReactDOM from 'react-dom/client';
import './client/public/css/style.css';
import App from './client/pages/pages/App';
import reportWebVitals from './client/pages/reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
