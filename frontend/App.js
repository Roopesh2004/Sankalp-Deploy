import React from 'react';
import Navbar from './src/components/Navbar';
import Hero from './src/components/Hero';
import Features from './src/components/Features';
import Programs from './src/components/Programs';
import About from './src/components/About';
import WhyChoose from './src/components/WhyChoose';
import Services from './src/components/Services';
import Founder from './src/components/Founder';
import Footer from './src/components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <Hero />
      <Features />
      <Programs />
      <About />
      <WhyChoose />
      <Services />
      <Founder />
      <Footer />
    </div>
  );
}

export default App;