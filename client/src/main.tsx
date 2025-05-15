import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import * as React from "react";

// Add a custom title
document.title = "SEKAR NET - Internet Service Provider";

// Add meta description for SEO
const metaDescription = document.createElement('meta');
metaDescription.name = 'description';
metaDescription.content = 'SEKAR NET - Fast and reliable internet service provider with fiber optic connectivity for homes and businesses.';
document.head.appendChild(metaDescription);

// Add Open Graph tags for better social sharing
const ogTitle = document.createElement('meta');
ogTitle.property = 'og:title';
ogTitle.content = 'SEKAR NET - Internet Service Provider';
document.head.appendChild(ogTitle);

const ogDescription = document.createElement('meta');
ogDescription.property = 'og:description';
ogDescription.content = 'Fast and reliable internet service provider with fiber optic connectivity for homes and businesses.';
document.head.appendChild(ogDescription);

const ogType = document.createElement('meta');
ogType.property = 'og:type';
ogType.content = 'website';
document.head.appendChild(ogType);

// Import and use RemixIcon for icons
const remixIconLink = document.createElement('link');
remixIconLink.rel = 'stylesheet';
remixIconLink.href = 'https://cdn.jsdelivr.net/npm/remixicon@3.5.0/fonts/remixicon.css';
document.head.appendChild(remixIconLink);

// Add font imports
const fontLink = document.createElement('link');
fontLink.rel = 'stylesheet';
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
document.head.appendChild(fontLink);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
