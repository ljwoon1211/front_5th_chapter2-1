import React from 'react';
import ReactDOM from 'react-dom/client';
import AppComponent from './components/AppComponent.tsx';

const rootElement = document.getElementById('app');
if (!rootElement) throw new Error('app 요소를 찾을 수 없습니다');

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AppComponent />
  </React.StrictMode>
);