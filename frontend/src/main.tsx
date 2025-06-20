import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import GetStarted from "./pages/GetStartedPage";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CertificateVerifier from './components/VerifyCertificate.tsx';

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
    {
      path:"/verify",
      element:<CertificateVerifier/>
    },
  ]
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={routes}/>
  </StrictMode>
);
