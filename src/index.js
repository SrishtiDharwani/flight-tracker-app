import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthContext } from './components/store/AuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <AuthContext.Provider>
  <React.StrictMode>
    <App />
  </React.StrictMode>
  </AuthContext.Provider>
);
