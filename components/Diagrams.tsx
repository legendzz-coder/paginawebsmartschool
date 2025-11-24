
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Book, GraduationCap, Building2 } from 'lucide-react';

// --- SERVICES GRID ---
export const ServicesGrid: React.FC = () => {
  const services = [
    {
      icon: <GraduationCap size={32} />,
      title: "Educación de Calidad",
      desc: "Aplicamos metodologías innovadoras para el desarrollo académico y personal de cada estudiante.",
      color: "bg-sky-100 text-school-primary" // Light Blue
    },
    {
      icon: <Building2 size={32} />,
      title: "Infraestructura Moderna",
      desc: "Contamos con ambientes seguros, aulas equipadas y zonas recreativas para el aprendizaje ideal.",
      color: "bg-sky-50 text-school-secondary" // Lighter Blue
    },
    {
      icon: <Users size={32} />,
      title: "Formación Integral",
      desc: "Promovemos el desarrollo académico, social y emocional para construir una comunidad sólida.",
      color: "bg-amber-100 text-yellow-700" // Gold/Amber
    },
    {
      icon: <Book size={32} />,
      title: "Biblioteca Virtual",
      desc: "Brindamos acceso a recursos educativos digitales actualizados para fortalecer el aprendizaje.",
      color: "bg-slate-200 text-school-dark" // Slate/Dark
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {services.map((service, idx) => (
        <motion.div 
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          viewport={{ once: true }}
          className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 hover:border-school-primary/20 transition-all duration-300 group"
        >
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${service.color} group-hover:scale-110 transition-transform duration-300`}>
            {service.icon}
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-school-primary transition-colors">{service.title}</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            {service.desc}
          </p>
        </motion.div>
      ))}
    </div>
  );
};

// --- HERO IMAGE SLIDER ---
export const ImageSlider: React.FC = () => {
  const [index, setIndex] = useState(0);
  const images = [
    "img/slider1.jpg", // Building Facade
    "img/slider2.jpg", // Parade/Banner
    "img/slider3.jpg"  // Students Awards
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-slate-200">
      <AnimatePresence mode='wait'>
        <motion.img
          key={index}
          src={images[index]}
          alt="Smart School Gallery"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
      </AnimatePresence>
      
      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-school-primary/40 to-transparent pointer-events-none"></div>
      
      {/* Dots */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
        {images.map((_, i) => (
          <div 
            key={i} 
            className={`h-2 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-school-accent' : 'w-2 bg-white/50'}`}
          />
        ))}
      </div>
    </div>
  );
};

// Empty exports to maintain file interface
export const SurfaceCodeDiagram = () => null;
export const TransformerDecoderDiagram = () => null;
export const PerformanceMetricDiagram = () => null;
