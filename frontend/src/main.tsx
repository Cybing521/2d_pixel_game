// 应用入口文件
import React from 'react';
import ReactDOM from 'react-dom/client';
import { enableMapSet } from 'immer';
import App from './App';
import './index.css';

// 启用Immer对Map和Set的支持（解决技能树学习报错）
enableMapSet();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
