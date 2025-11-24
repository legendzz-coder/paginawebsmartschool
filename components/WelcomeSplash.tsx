
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { motion } from 'framer-motion';
import { SchoolLogo } from './SchoolLogo';

export const WelcomeSplash: React.FC = () => {
  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-slate-900 flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
    >
       {/* Background effects */}
       <div className="absolute inset-0 bg-gradient-to-br from-school-dark via-school-primary to-slate-900 opacity-90"></div>
       <div className="absolute -top-24 -left-24 w-96 h-96 bg-school-accent/20 rounded-full blur-3xl animate-pulse"></div>
       <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-school-secondary/20 rounded-full blur-3xl"></div>

       <div className="relative z-10 text-center p-8">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, duration: 1.5 }}
            className="flex items-center justify-center mb-8 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)]"
          >
             {/* New Shield Logo instead of 'S' box */}
             <SchoolLogo className="w-40 h-48" />
          </motion.div>

          <motion.h1 
             initial={{ y: 50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.5, duration: 0.8 }}
             className="text-4xl md:text-6xl font-display font-bold text-white mb-4 tracking-tight"
          >
            Bienvenidos a
          </motion.h1>
          
          <motion.h2
             initial={{ y: 50, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: 0.8, duration: 0.8 }}
             className="text-5xl md:text-7xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-school-accent to-school-secondary drop-shadow-sm"
          >
            Smart School
          </motion.h2>
          
          <motion.div
             initial={{ width: 0 }}
             animate={{ width: "100px" }}
             transition={{ delay: 1.2, duration: 1 }}
             className="h-1.5 bg-school-accent mx-auto mt-8 rounded-full"
          ></motion.div>
       </div>
    </motion.div>
  );
};
