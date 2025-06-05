import React, { useState, useEffect } from 'react';
import { Menu, X, Code, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {Link} from "react-router-dom"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20
      }
    }
  };

  const menuVariants = {
    hidden: { opacity: 0, y: -20, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <motion.nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-dark-200/95 backdrop-blur-sm shadow-lg' : 'bg-transparent'
      } py-4`}
      variants={navVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="container mx-auto px-4 md:px-6">
      <div className="flex justify-between items-center">
      <motion.div 
      className="flex items-center space-x-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      >
      {/* Removed animation from this div */}
      <div>
      <img 
      src="/logo.png" 
      alt="Logo" 
      className="h-16 w-15 text-primary-400"
      />
      </div>
        <span className="text-2xl font-bold text-white font-display">
          Sankalp Training Program<span className="text-primary-400"></span>
        </span>
        </motion.div>

        <div className="hidden md:flex items-center space-x-8">
   <NavLink href="#home">Home</NavLink>
    <NavLink href="#programs">Programs</NavLink>
    <NavLink href="#about">About</NavLink>
    <NavLink href="#services">Services</NavLink>
    <motion.div
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    >
    <Link 
      to="/getstarted"
      className="bg-primary-600 text-white px-6 py-2 rounded-full font-medium hover:bg-primary-700 transition-colors relative overflow-hidden group inline-block"
    >
      <motion.span
      className="absolute inset-0 bg-white/30"
      initial={{ x: "-100%" }}
      whileHover={{ x: "100%" }}
      transition={{ duration: 0.5 }}
      />
      <span className="relative z-10">Apply Now</span>
    </Link>
    </motion.div>
  </div>

        <div className="md:hidden">
        <motion.button
          onClick={toggleMenu}
          className="text-gray-300 hover:text-primary-400 focus:outline-none"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
        <motion.div 
          className="md:hidden mt-4 bg-dark-300 rounded-lg shadow-lg p-4 border border-dark-400"
          variants={menuVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <div className="flex flex-col space-y-4">
          <MobileNavLink href="#home" onClick={toggleMenu}>Home</MobileNavLink>
          <MobileNavLink href="#programs" onClick={toggleMenu}>Programs</MobileNavLink>
          <MobileNavLink href="#about" onClick={toggleMenu}>About</MobileNavLink>
          <MobileNavLink href="#services" onClick={toggleMenu}>Services</MobileNavLink>
          <motion.button
            className="bg-primary-600 text-white px-6 py-2 rounded-full font-medium hover:bg-primary-700 transition-colors w-full relative overflow-hidden"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.span
            className="absolute inset-0 bg-white/30"
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.5 }}
            />
            Apply Now
          </motion.button>
          </div>
        </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <motion.a
      href={href}
      className="text-gray-300 hover:text-primary-400 font-medium transition-colors relative"
      whileHover={{ scale: 1.1 }}
    >
      <span className="relative z-10">{children}</span>
      <motion.span
        className="absolute bottom-0 left-0 w-full h-0.5 bg-primary-400"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.a>
  );
};

const MobileNavLink = ({ 
  href, 
  children, 
  onClick 
}: { 
  href: string; 
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return (
    <motion.a
      href={href}
      className="text-gray-300 hover:text-primary-400 font-medium transition-colors block py-2 px-4 hover:bg-dark-400 rounded relative overflow-hidden"
      onClick={onClick}
      whileHover={{ x: 10 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.span
        className="absolute inset-0 bg-primary-400/10"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.3 }}
      />
      {children}
    </motion.a>
  );
};

export default Navbar;