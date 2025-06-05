import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Programs from './components/Programs';
import About from './components/About';
import WhyChoose from './components/WhyChoose';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import Founder from './components/Founder';
import Footer from './components/Footer';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

function App() {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
      setIsLowEndDevice(navigator.hardwareConcurrency <= 4);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // SEO Enhancement - Complete Meta Tags Setup
  useEffect(() => {
    // Update document title with primary keywords
    document.title = "Sankalp Training Program SpectoV";
    
    // Update meta description with compelling copy and keywords
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Join Sankalp Training Program by SpectoV. ');

    // Comprehensive keyword meta tag
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'sankalp training program, sankalp spectov, spectov internship, sankalp internship, sankalp training, sankalp job opportunities, global mnc placements, google jobs, amazon careers, microsoft placements, international training program, professional certification, career development india, global job opportunities, tech training, placement guarantee, industry training, career transformation, professional development, mnc hiring, global careers, tech placement, software training, coding bootcamp, career acceleration');

    // Canonical URL for SEO
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', 'https://sankalp.spectov.in/');

    // Comprehensive Open Graph tags for social media
    const ogTags = [
      { property: 'og:title', content: 'Sankalp Training Program   | SpectoV' },
      { property: 'og:description', content: 'Global professional training with guaranteed placements in Google, Amazon, Microsoft and top MNCs. 500+ successful placements worldwide.' },
      { property: 'og:url', content: 'https://sankalp.spectov.in/' },
      { property: 'og:type', content: 'website' },
      { property: 'og:image', content: 'https://sankalp.spectov.in/images/sankalp-og-image.jpg' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Sankalp Training Program - Global MNC Placements' },
      { property: 'og:site_name', content: 'Sankalp SpectoV Global Training' },
      { property: 'og:locale', content: 'en_IN' }
    ];

    ogTags.forEach(tag => {
      let ogElement = document.querySelector(`meta[property="${tag.property}"]`);
      if (!ogElement) {
        ogElement = document.createElement('meta');
        ogElement.setAttribute('property', tag.property);
        document.head.appendChild(ogElement);
      }
      ogElement.setAttribute('content', tag.content);
    });

    // Twitter Card optimization
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@spectov' },
      { name: 'twitter:creator', content: '@spectov' },
      { name: 'twitter:title', content: 'Sankalp Training Program | Global MNC Placements' },
      { name: 'twitter:description', content: 'Global professional training with guaranteed placements in Google, Amazon, Microsoft and top MNCs.' },
      { name: 'twitter:image', content: 'https://sankalp.spectov.in/images/sankalp-twitter-image.jpg' },
      { name: 'twitter:image:alt', content: 'Sankalp Global Training Program Success Stories' }
    ];

    twitterTags.forEach(tag => {
      let twitterElement = document.querySelector(`meta[name="${tag.name}"]`);
      if (!twitterElement) {
        twitterElement = document.createElement('meta');
        twitterElement.setAttribute('name', tag.name);
        document.head.appendChild(twitterElement);
      }
      twitterElement.setAttribute('content', tag.content);
    });

    // Enhanced structured data with multiple schemas
    const organizationSchema = {
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Sankalp Training Program",
      "alternateName": ["Sankalp SpectoV", "SpectoV Global Training", "Sankalp Global Program"],
      "url": "https://sankalp.spectov.in",
      "logo": {
        "@type": "ImageObject",
        "url": "https://sankalp.spectov.in/images/sankalp-logo.png",
        "width": 300,
        "height": 100
      },
      "description": "Global professional training program with guaranteed placements in top MNCs including Google, Amazon, Microsoft. 500+ successful international placements.",
      "foundingDate": "2020",
      "parentOrganization": {
        "@type": "Organization",
        "name": "SpectoV",
        "url": "https://spectov.in",
        "sameAs": [
          "https://www.linkedin.com/company/spectov",
          "https://twitter.com/spectov"
        ]
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN",
        "addressRegion": "India"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-XXXX-XXXXXX",
        "contactType": "Admissions",
        "email": "admissions@spectov.in",
        "availableLanguage": ["English", "Hindi"]
      },
      "courseMode": ["blended", "online", "onsite"],
      "educationalLevel": "Professional",
      "teaches": [
        "Software Development",
        "Data Science",
        "Cloud Computing",
        "Digital Marketing",
        "Business Analytics",
        "Project Management"
      ],
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "Global Training Programs",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Course",
              "name": "Sankalp Professional Training",
              "description": "Comprehensive professional development with global placement guarantee",
              "provider": {
                "@type": "Organization",
                "name": "SpectoV"
              },
              "coursePrerequisites": "Basic computer knowledge",
              "timeRequired": "P6M",
              "educationalLevel": "Professional"
            },
            "price": "Contact for pricing",
            "priceCurrency": "INR",
            "availability": "InStock"
          }
        ]
      },
      "alumni": {
        "@type": "Person",
        "name": "500+ Global Professionals"
      },
      "numberOfStudents": 2000,
      "sameAs": [
        "https://www.linkedin.com/company/spectov",
        "https://twitter.com/spectov",
        "https://www.facebook.com/spectov",
        "https://www.instagram.com/spectov",
        "https://www.youtube.com/c/spectov"
      ]
    };

    // Course schema for training program
    const courseSchema = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "Sankalp Training Program ",
      "description": "Comprehensive 6-month professional training program with guaranteed global MNC placements",
      "provider": {
        "@type": "EducationalOrganization",
        "name": "SpectoV Global Training",
        "url": "https://spectov.in"
      },
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "blended",
        "duration": "P6M",
        "startDate": "2025-06-01",
        "endDate": "2025-11-30",
        "instructor": {
          "@type": "Person",
          "name": "Industry Expert Trainers"
        },
        "location": {
          "@type": "VirtualLocation",
          "url": "https://sankalp.spectov.in"
        }
      },
      "coursePrerequisites": "Basic computer literacy and graduation in any field",
      "educationalLevel": "Professional",
      "teaches": [
        "Technical Skills Development",
        "Industry Best Practices",
        "Professional Communication",
        "Project Management",
        "Interview Preparation",
        "Global Work Culture"
      ],
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "reviewCount": "500",
        "bestRating": "5",
        "worstRating": "1"
      },
      "offers": {
        "@type": "Offer",
        "category": "Professional Training",
        "price": "Contact for pricing",
        "priceCurrency": "INR",
        "availability": "InStock",
        "validFrom": "2025-05-27"
      }
    };

    // FAQ Schema for better search visibility
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is Sankalp Training Program?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sankalp Training Program is a comprehensive 6-month professional development program by SpectoV that offers global training with guaranteed placements in top MNCs including Google, Amazon, and Microsoft."
          }
        },
        {
          "@type": "Question",
          "name": "What are the global placement opportunities?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We provide guaranteed placements in 500+ global companies including Google, Amazon, Microsoft, Meta, Apple, and other Fortune 500 companies across multiple countries."
          }
        },
        {
          "@type": "Question",
          "name": "How can I apply for SpectoV internship through Sankalp?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You can apply for SpectoV internship opportunities through our Sankalp training program by visiting our application page and completing the enrollment process. All training participants get guaranteed internship opportunities."
          }
        },
        {
          "@type": "Question",
          "name": "What is the success rate of global placements?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Sankalp Training Program has achieved 100% placement success rate with over 500 graduates placed in top global MNCs with average salary packages ranging from 5-20 LPA."
          }
        }
      ]
    };

    // Website schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Sankalp SpectoV Global Training",
      "alternateName": "Sankalp Training Program",
      "url": "https://sankalp.spectov.in",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://sankalp.spectov.in/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": "SpectoV Global Training Solutions"
      }
    };

    // Job posting schema for placement opportunities
    const jobPostingSchema = {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": "Global MNC Placement Opportunities",
      "description": "Guaranteed job placements in top multinational companies including Google, Amazon, Microsoft for Sankalp Training Program graduates",
      "hiringOrganization": {
        "@type": "Organization",
        "name": "Global MNC Partners",
        "sameAs": "https://sankalp.spectov.in/placement-partners"
      },
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressCountry": ["IN", "US", "GB", "CA", "AU"]
        }
      },
      "employmentType": ["FULL_TIME", "PART_TIME", "CONTRACTOR"],
      "jobLocationType": ["TELECOMMUTE", "HYBRID"],
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": "INR",
        "value": {
          "@type": "QuantitativeValue",
          "minValue": 500000,
          "maxValue": 2000000,
          "unitText": "YEAR"
        }
      },
      "datePosted": "2025-05-27",
      "validThrough": "2025-12-31",
      "applicantLocationRequirements": {
        "@type": "Country",
        "name": "Global"
      }
    };

    // Remove existing structured data scripts
    const existingScripts = document.querySelectorAll('script[data-structured-data]');
    existingScripts.forEach(script => script.remove());

    // Add all structured data schemas
    const schemas = [
      { data: organizationSchema, id: 'organization' },
      { data: courseSchema, id: 'course' },
      { data: faqSchema, id: 'faq' },
      { data: websiteSchema, id: 'website' },
      { data: jobPostingSchema, id: 'jobposting' }
    ];

    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-structured-data', schema.id);
      script.textContent = JSON.stringify(schema.data);
      document.head.appendChild(script);
    });

    // Add additional SEO meta tags
    const additionalMetas = [
      { name: 'robots', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' },
      { name: 'author', content: 'SpectoV Global Training Solutions' },
      { name: 'language', content: 'English' },
      { name: 'revisit-after', content: '3 days' },
      { name: 'distribution', content: 'global' },
      { name: 'rating', content: 'general' },
      { name: 'coverage', content: 'Worldwide' },
      { name: 'target', content: 'global' },
      { name: 'subject', content: 'Global Professional Training & MNC Placement Program' },
      { name: 'copyright', content: 'SpectoV Global Training Solutions' },
      { name: 'reply-to', content: 'admissions@spectov.in' },
      { name: 'owner', content: 'SpectoV International' },
      { name: 'url', content: 'https://sankalp.spectov.in' },
      { name: 'identifier-URL', content: 'https://sankalp.spectov.in' },
      { name: 'category', content: 'Education, Professional Training, Career Development, Global Placements, MNC Jobs' },
      { name: 'classification', content: 'Global Professional Training and Career Placement' },
      { name: 'audience', content: 'Global Professionals' }
    ];

    additionalMetas.forEach(meta => {
      let metaElement = document.querySelector(`meta[name="${meta.name}"]`);
      if (!metaElement) {
        metaElement = document.createElement('meta');
        metaElement.setAttribute('name', meta.name);
        document.head.appendChild(metaElement);
      }
      metaElement.setAttribute('content', meta.content);
    });

    // Add Dublin Core metadata
    const dublinCoreMetas = [
      { name: 'DC.title', content: 'Sankalp Training Program - Global MNC Placements' },
      { name: 'DC.creator', content: 'SpectoV Global Training Solutions' },
      { name: 'DC.subject', content: 'Professional Training, Global Placements, MNC Jobs, Career Development' },
      { name: 'DC.description', content: 'Comprehensive global training program with guaranteed placements in top MNCs including Google, Amazon, Microsoft' },
      { name: 'DC.publisher', content: 'SpectoV International' },
      { name: 'DC.contributor', content: 'Industry Expert Trainers' },
      { name: 'DC.date', content: '2025-05-27' },
      { name: 'DC.type', content: 'Educational Service' },
      { name: 'DC.format', content: 'text/html' },
      { name: 'DC.identifier', content: 'https://sankalp.spectov.in' },
      { name: 'DC.language', content: 'en-IN' },
      { name: 'DC.coverage', content: 'Global' },
      { name: 'DC.rights', content: 'Copyright 2025 SpectoV Global Training Solutions' }
    ];

    dublinCoreMetas.forEach(meta => {
      let metaElement = document.querySelector(`meta[name="${meta.name}"]`);
      if (!metaElement) {
        metaElement = document.createElement('meta');
        metaElement.setAttribute('name', meta.name);
        document.head.appendChild(metaElement);
      }
      metaElement.setAttribute('content', meta.content);
    });

  }, []);

  // Performance monitoring for SEO
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP (SEO):', entry.startTime);
          }
          if (entry.entryType === 'first-input') {
            console.log('FID (SEO):', entry.processingStart - entry.startTime);
          }
          if (entry.entryType === 'layout-shift') {
            console.log('CLS (SEO):', entry.value);
          }
        }
      });
      observer.observe({entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']});
    }
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: isMobile ? 10 : 20 },
    animate: { opacity: 1, y: 0 },
    transition: { 
      duration: isMobile ? 0.3 : 0.6,
      ease: "easeOut"
    }
  };

  return (
    <AnimatePresence mode='wait'>
      <motion.div 
        className={`min-h-screen bg-black ${isLowEndDevice ? 'reduce-motion' : ''}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: isMobile ? 0.3 : 0.5 }}
      >
        <Navbar />
        <motion.div {...fadeInUp} transition={{ 
          delay: isMobile ? 0.1 : 0.2,
          duration: isLowEndDevice ? 0.2 : (isMobile ? 0.3 : 0.5)
        }}>
          <Hero />
        </motion.div>
        {/* <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
          <Features />
        </motion.div> */}
        <motion.div {...fadeInUp} transition={{ delay: 0.2 }}>
          <Programs />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.3 }}>
          <About />
        </motion.div>
        {/* <motion.div {...fadeInUp} transition={{ delay: 0.4 }}>
          <WhyChoose />
        </motion.div> */}
        <motion.div {...fadeInUp} transition={{ delay: 0.5 }}>
          <Services />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.6 }}>
          <Testimonials />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.7 }}>
          <FAQ />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.8 }}>
          <Contact />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 0.9 }}>
          <Founder />
        </motion.div>
        <motion.div {...fadeInUp} transition={{ delay: 1.0 }}>
          <Footer />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
