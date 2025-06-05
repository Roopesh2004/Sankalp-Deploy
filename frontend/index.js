import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './src/index.css';
import GetStarted from "./src/pages/GetStartedPage"
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

// Enhanced SEO-Optimized Router Configuration
const routes = createBrowserRouter([
  {
    path: "/",
    element: <App/>,
    handle: {
      seo: {
        title: "Sankalp Training Program ",
        description: "Join Sankalp Training Program  by SpectoV. Global professional training with guaranteed placements in Google, Amazon, Microsoft and top MNCs worldwide. 500+ success stories.",
        keywords: "sankalp training program, sankalp spectov, spectov internship, sankalp internship, global mnc placements, google jobs, amazon careers, microsoft placements",
        canonical: "/",
        structuredData: {
          "@type": "WebPage",
          "name": "Sankalp Training Program  - Home",
          "description": "Global professional training program with MNC placements"
        }
      }
    }
  },
  {
    path: "/getstarted",
    element: <GetStarted/>,
    handle: {
      seo: {
        title: "Apply Now | Sankalp Training Program  | Global MNC Placement Application",
        description: "Start your journey with Sankalp Training Program . Apply for global MNC placements in Google, Amazon, Microsoft. Secure your future with guaranteed job placement.",
        keywords: "sankalp training application, spectov internship application, get started sankalp, join sankalp program, mnc job application, global placement program",
        canonical: "/getstarted",
        structuredData: {
          "@type": "WebPage",
          "name": "Apply for Sankalp Training Program",
          "description": "Application page for global MNC placement program"
        }
      }
    }
  },
  {
    path: "/sankalp-training-program",
    element: <App/>,
    handle: {
      seo: {
        title: "Sankalp Training Program | Professional Development | Global Career Transformation",
        description: "Comprehensive Sankalp training program offering professional development, technical skills, and guaranteed global career advancement with top MNC placements.",
        keywords: "sankalp training program, professional training, career development, spectov training, global skill development, mnc preparation program",
        canonical: "/sankalp-training-program",
        structuredData: {
          "@type": "Course",
          "name": "Sankalp Professional Training Program",
          "description": "6-month comprehensive professional development program"
        }
      }
    }
  },
  {
    path: "/spectov-internship",
    element: <GetStarted/>,
    handle: {
      seo: {
        title: "SpectoV Internship Program | Global Internship Opportunities | Sankalp Training",
        description: "Apply for SpectoV internship through Sankalp program. Gain practical experience with global companies and secure guaranteed job placements in top MNCs.",
        keywords: "spectov internship, sankalp internship, global internship opportunities, professional internship, mnc internship program, international work experience",
        canonical: "/spectov-internship",
        structuredData: {
          "@type": "WebPage",
          "name": "SpectoV Global Internship Program",
          "description": "International internship opportunities with MNC placements"
        }
      }
    }
  },
  {
    path: "/sankalp-job-opportunities",
    element: <GetStarted/>,
    handle: {
      seo: {
        title: "Sankalp Job Opportunities | Global MNC Careers | Google Amazon Microsoft Jobs",
        description: "Explore sankalp job opportunities and global career placements. Get hired in Google, Amazon, Microsoft through our comprehensive training and placement program.",
        keywords: "sankalp job opportunities, global career placement, mnc job openings, spectov careers, google jobs, amazon careers, microsoft jobs, international job placement",
        canonical: "/sankalp-job-opportunities",
        structuredData: {
          "@type": "JobPosting",
          "title": "Global MNC Job Opportunities",
          "description": "Career opportunities in top multinational companies"
        }
      }
    }
  },
  {
    path: "/global-mnc-placements",
    element: <GetStarted/>,
    handle: {
      seo: {
        title: "Global MNC Placements | Google Amazon Microsoft Careers | Sankalp Success Stories",
        description: "500+ successful global MNC placements through Sankalp Training Program . Join professionals working in Google, Amazon, Microsoft, Meta, Apple worldwide.",
        keywords: "global mnc placements, google placements, amazon jobs, microsoft careers, meta jobs, apple careers, international job placement, global career opportunities",
        canonical: "/global-mnc-placements",
        structuredData: {
          "@type": "WebPage",
          "name": "Global MNC Placement Success Stories",
          "description": "Success stories of global MNC placements"
        }
      }
    }
  },
  {
    path: "/international-training-program",
    element: <App/>,
    handle: {
      seo: {
        title: "International Training Program | Global Professional Development | Worldwide Job Placement",
        description: "Join our international training program with global reach. Professional development for worldwide job opportunities in top multinational corporations.",
        keywords: "international training program, global professional development, worldwide job placement, international career program, global skill training, multinational career opportunities",
        canonical: "/international-training-program",
        structuredData: {
          "@type": "Course",
          "name": "International Professional Training Program",
          "description": "Global training program for international career opportunities"
        }
      }
    }
  },
  {
    path: "/professional-certification-program",
    element: <GetStarted/>,
    handle: {
      seo: {
        title: "Professional Certification Program | Industry-Recognized Credentials | Global Career Boost",
        description: "Earn industry-recognized professional certifications through Sankalp Training Program . Boost your global career with credentials valued by top MNCs.",
        keywords: "professional certification program, industry certification, global career credentials, professional development certification, mnc recognized certification, career advancement program",
        canonical: "/professional-certification-program",
        structuredData: {
          "@type": "EducationalOccupationalCredential",
          "name": "Global Professional Certification",
          "description": "Industry-recognized professional certification program"
        }
      }
    }
  },
  {
    path: "/career-transformation-program",
    element: <App/>,
    handle: {
      seo: {
        title: "Career Transformation Program | Professional Growth | Global Opportunities",
        description: "Transform your career with Sankalp's comprehensive program. From skill development to global MNC placements - your complete career transformation journey.",
        keywords: "career transformation program, professional growth, career change program, skill development, global career opportunities, professional transition, career advancement",
        canonical: "/career-transformation-program",
        structuredData: {
          "@type": "WebPage",
          "name": "Career Transformation Program",
          "description": "Comprehensive career transformation and professional growth program"
        }
      }
    }
  },
  {
    path: "/global-placement-guarantee",
    element: <GetStarted/>,
    handle: {
      seo: {
        title: "Global Placement Guarantee | 100% Job Placement Assurance | MNC Career Security",
        description: "100% placement guarantee with Sankalp Training Program . Secure your future with guaranteed job placement in top global MNCs including Google, Amazon, Microsoft.",
        keywords: "global placement guarantee, 100% job placement, placement assurance, mnc job guarantee, career security, guaranteed employment, job placement program",
        canonical: "/global-placement-guarantee",
        structuredData: {
          "@type": "WebPage",
          "name": "Global Placement Guarantee Program",
          "description": "100% job placement guarantee in global MNCs"
        }
      }
    }
  }
]);

// Enhanced SEO utility functions with global optimization
const updatePageSEO = (route) => {
  if (route?.handle?.seo) {
    const { title, description, keywords, canonical, structuredData } = route.handle.seo;
    
    // Update document title with global branding
    document.title = title;
    
    // Update meta description with global appeal
    let metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    } else {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      metaDescription.setAttribute('content', description);
      document.head.appendChild(metaDescription);
    }
    
    // Update meta keywords with global terms
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      metaKeywords.setAttribute('content', keywords);
      document.head.appendChild(metaKeywords);
    }
    
    // Update canonical URL with proper global structure
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', `https://sankalp.spectov.in${canonical}`);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', `https://sankalp.spectov.in${canonical}`);
      document.head.appendChild(canonicalLink);
    }
    
    // Update Open Graph tags for global social sharing
    const ogTags = [
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:url', content: `https://sankalp.spectov.in${canonical}` },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'en_IN' },
      { property: 'og:site_name', content: 'Sankalp SpectoV Global Training' }
    ];

    ogTags.forEach(tag => {
      let ogElement = document.querySelector(`meta[property="${tag.property}"]`);
      if (ogElement) {
        ogElement.setAttribute('content', tag.content);
      } else {
        ogElement = document.createElement('meta');
        ogElement.setAttribute('property', tag.property);
        ogElement.setAttribute('content', tag.content);
        document.head.appendChild(ogElement);
      }
    });

    // Update Twitter Card tags for global reach
    const twitterTags = [
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@spectov' }
    ];

    twitterTags.forEach(tag => {
      let twitterElement = document.querySelector(`meta[name="${tag.name}"]`);
      if (twitterElement) {
        twitterElement.setAttribute('content', tag.content);
      } else {
        twitterElement = document.createElement('meta');
        twitterElement.setAttribute('name', tag.name);
        twitterElement.setAttribute('content', tag.content);
        document.head.appendChild(twitterElement);
      }
    });

    // Add route-specific structured data
    if (structuredData) {
      addRouteStructuredData(structuredData, canonical);
    }
  }
};

// Enhanced structured data for global SEO
const addRouteStructuredData = (data, canonical) => {
  // Remove existing route-specific structured data
  const existingScript = document.querySelector('script[data-route-structured]');
  if (existingScript) {
    existingScript.remove();
  }

  // Create enhanced structured data with global context
  const enhancedData = {
    "@context": "https://schema.org",
    ...data,
    "url": `https://sankalp.spectov.in${canonical}`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Sankalp SpectoV Global Training",
      "url": "https://sankalp.spectov.in"
    },
    "provider": {
      "@type": "Organization",
      "name": "SpectoV Global Training Solutions",
      "url": "https://spectov.in"
    },
    "inLanguage": "en-IN",
    "audience": {
      "@type": "Audience",
      "audienceType": "Global Professionals"
    }
  };

  // Add new route-specific structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-route-structured', 'true');
  script.textContent = JSON.stringify(enhancedData);
  document.head.appendChild(script);
};

// Enhanced analytics tracking with global parameters
const trackPageView = (path, title) => {
  // Enhanced page view tracking for global audience
  console.log(`Global Page View: ${path} - ${title}`);
  
  // Track user location for global analytics
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      console.log('User location tracked for global analytics:', {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        page: path
      });
    }, () => {
      console.log('Location tracking not available');
    });
  }
  
  // Google Analytics 4 tracking (uncomment when GA4 is implemented)
  // if (typeof gtag !== 'undefined') {
  //   gtag('config', 'GA_MEASUREMENT_ID', {
  //     page_path: path,
  //     page_title: title,
  //     custom_map: {
  //       'custom_parameter_1': 'global_training_program',
  //       'custom_parameter_2': 'mnc_placements'
  //     }
  //   });
  // }
};

// Enhanced breadcrumb generation for global SEO
const addBreadcrumbStructuredData = (path) => {
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": []
  };
  
  const pathSegments = path.split('/').filter(segment => segment);
  let currentPath = '';
  
  // Always add home with global branding
  breadcrumbData.itemListElement.push({
    "@type": "ListItem",
    "position": 1,
    "name": "Global Training Home",
    "item": "https://sankalp.spectov.in/"
  });
  
  // Enhanced path segment processing with global context
  const segmentNames = {
    'sankalp-training-program': 'Sankalp Training Program',
    'spectov-internship': 'Global Internship Program',
    'sankalp-job-opportunities': 'Global Job Opportunities',
    'global-mnc-placements': 'Global MNC Placements',
    'international-training-program': 'International Training',
    'professional-certification-program': 'Professional Certification',
    'career-transformation-program': 'Career Transformation',
    'global-placement-guarantee': 'Placement Guarantee',
    'getstarted': 'Apply Now'
  };

  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const name = segmentNames[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    breadcrumbData.itemListElement.push({
      "@type": "ListItem",
      "position": index + 2,
      "name": name,
      "item": `https://sankalp.spectov.in${currentPath}`
    });
  });
  
  // Remove existing breadcrumb script
  const existingScript = document.querySelector('script[data-breadcrumb]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Add enhanced breadcrumb structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-breadcrumb', 'true');
  script.textContent = JSON.stringify(breadcrumbData);
  document.head.appendChild(script);
};

// Enhanced router provider with global SEO capabilities
const EnhancedRouterProvider = ({ router }) => {
  return <RouterProvider router={router} />;
};

// Global SEO event listeners with enhanced tracking
window.addEventListener('popstate', (event) => {
  const currentPath = window.location.pathname;
  const currentRoute = routes.routes?.find(route => route.path === currentPath);
  const title = currentRoute?.handle?.seo?.title || document.title;
  
  trackPageView(currentPath, title);
  addBreadcrumbStructuredData(currentPath);
  updatePageSEO(currentRoute);
});

// Enhanced performance monitoring for global SEO
const measurePerformance = () => {
  if ('PerformanceObserver' in window) {
    // Core Web Vitals monitoring for global SEO
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('LCP (Global SEO):', entry.startTime);
        }
        if (entry.entryType === 'first-input') {
          console.log('FID (Global SEO):', entry.processingStart - entry.startTime);
        }
        if (entry.entryType === 'layout-shift') {
          console.log('CLS (Global SEO):', entry.value);
        }
      }
    });

    observer.observe({entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']});

    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0];
        const globalSEOMetrics = {
          loadTime: `${perfData.loadEventEnd - perfData.loadEventStart}ms`,
          domLoadTime: `${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`,
          ttfb: `${perfData.responseStart - perfData.requestStart}ms`,
          firstContentfulPaint: performance.getEntriesByType('paint')[0]?.startTime
        };
        
        console.log('Global SEO Performance Metrics:', globalSEOMetrics);
        
        // Alert for SEO-critical performance issues
        if (perfData.loadEventEnd - perfData.loadEventStart > 3000) {
          console.warn('⚠️ Global SEO Warning: Page load time exceeds 3 seconds');
        }
        
        if (perfData.responseStart - perfData.requestStart > 600) {
          console.warn('⚠️ Global SEO Warning: TTFB exceeds 600ms');
        }
      }, 0);
    });
  }
};

// Enhanced sitemap generation for global routes
const generateSitemapData = () => {
  const globalSitemapUrls = routes.routes?.map(route => ({
    url: `https://sankalp.spectov.in${route.path}`,
    changefreq: route.path === '/' ? 'daily' : 'weekly',
    priority: route.path === '/' ? '1.0' : route.path.includes('global') ? '0.9' : '0.8',
    lastmod: new Date().toISOString().split('T')[0],
    hreflang: [
      { lang: 'en', url: `https://sankalp.spectov.in${route.path}` },
      { lang: 'en-IN', url: `https://sankalp.spectov.in${route.path}` },
      { lang: 'x-default', url: `https://sankalp.spectov.in${route.path}` }
    ]
  }));
  
  return globalSitemapUrls;
};

// Enhanced parent domain signals for global SEO
const addParentDomainSignals = () => {
  const globalParentDomainReference = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SpectoV Global Training Solutions",
    "url": "https://spectov.in",
    "globalLocationNumber": "Global",
    "areaServed": {
      "@type": "Country",
      "name": ["India", "United States", "United Kingdom", "Canada", "Australia"]
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Global Training Programs",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Course",
            "name": "Sankalp Training Program ",
            "url": "https://sankalp.spectov.in",
            "provider": {
              "@type": "Organization",
              "name": "SpectoV Global Training Solutions"
            },
            "courseMode": ["online", "blended"],
            "educationalLevel": "Professional",
            "occupationalCategory": "Technology and Business"
          }
        }
      ]
    },
    "memberOf": {
      "@type": "Organization",
      "name": "Global Training Alliance"
    },
    "award": "Best Global Training Provider 2024",
    "numberOfEmployees": "100-500"
  };
  
  // Remove existing parent domain script
  const existingScript = document.querySelector('script[data-parent-domain]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Add enhanced parent domain structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-parent-domain', 'true');
  script.textContent = JSON.stringify(globalParentDomainReference);
  document.head.appendChild(script);
};

// Global cross-domain SEO optimization
const addGlobalCrossDomainSEO = () => {
  // Add global training network references
  const globalNetworkData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Sankalp Global Training Network",
    "parentOrganization": {
      "@type": "Organization",
      "name": "SpectoV International",
      "url": "https://spectov.in"
    },
    "subOrganization": [
      {
        "@type": "EducationalOrganization",
        "name": "Sankalp India",
        "url": "https://sankalp.spectov.in"
      },
      {
        "@type": "EducationalOrganization", 
        "name": "Sankalp Global",
        "url": "https://sankalp.spectov.in/global"
      }
    ],
    "hasCredential": {
      "@type": "EducationalOccupationalCredential",
      "name": "Global Professional Certification",
      "recognizedBy": [
        {
          "@type": "Organization",
          "name": "Google"
        },
        {
          "@type": "Organization", 
          "name": "Amazon"
        },
        {
          "@type": "Organization",
          "name": "Microsoft"
        }
      ]
    }
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-global-network', 'true');
  script.textContent = JSON.stringify(globalNetworkData);
  document.head.appendChild(script);
};

// Initialize all global SEO enhancements
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  const currentRoute = routes.routes?.find(route => route.path === currentPath);
  const title = currentRoute?.handle?.seo?.title || document.title;
  
  // Initialize all SEO components
  trackPageView(currentPath, title);
  addBreadcrumbStructuredData(currentPath);
  updatePageSEO(currentRoute);
  addParentDomainSignals();
  addGlobalCrossDomainSEO();
  measurePerformance();
  
  // Add global search functionality
  window.globalSearch = {
    keywords: [
      'sankalp training program',
      'global mnc placements', 
      'google amazon microsoft jobs',
      'international training program',
      'professional certification',
      'career transformation'
    ],
    searchUrl: 'https://sankalp.spectov.in/search'
  };
});

// Export enhanced sitemap data for global SEO
window.globalSitemapData = generateSitemapData();

// Enhanced error tracking for SEO
window.addEventListener('error', (event) => {
  console.error('Global SEO Error Tracking:', {
    message: event.error?.message,
    filename: event.filename,
    line: event.lineno,
    column: event.colno,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href
  });
});

// Global SEO health check
const performGlobalSEOHealthCheck = () => {
  const healthCheck = {
    hasTitle: !!document.title,
    hasDescription: !!document.querySelector('meta[name="description"]'),
    hasCanonical: !!document.querySelector('link[rel="canonical"]'),
    hasStructuredData: document.querySelectorAll('script[type="application/ld+json"]').length > 0,
    hasOpenGraph: !!document.querySelector('meta[property^="og:"]'),
    hasTwitterCard: !!document.querySelector('meta[name^="twitter:"]'),
    pageLoadTime: performance.now(),
    timestamp: new Date().toISOString()
  };
  
  console.log('Global SEO Health Check:', healthCheck);
  return healthCheck;
};

// Run SEO health check after page load
window.addEventListener('load', () => {
  setTimeout(performGlobalSEOHealthCheck, 1000);
});

// Initialize React application with enhanced SEO
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <EnhancedRouterProvider router={routes} />
  </StrictMode>
);
