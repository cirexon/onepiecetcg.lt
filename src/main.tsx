import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

const firebaseHosts = new Set(['onepiecetcglt.web.app', 'onepiecetcglt.firebaseapp.com']);
if (import.meta.env.PROD && firebaseHosts.has(window.location.hostname)) {
  window.location.replace(`https://onepiecetcg.lt${window.location.pathname}${window.location.search}${window.location.hash}`);
} else {
  ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><BrowserRouter><App /></BrowserRouter></React.StrictMode>);
}
