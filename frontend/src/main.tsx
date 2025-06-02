import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import GetStarted from "./pages/GetStartedPage";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const routes=createBrowserRouter(
  [
    {
      path:"/",
      element:<App/>
    },
    {
      path:"/getstarted",
      element:<GetStarted/>
    },
  ]
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={routes}/>
  </StrictMode>
);
