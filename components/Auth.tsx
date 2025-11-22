
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { UserAccount } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: {name: string, role: string, teacherType?: 'tutor' | 'course', username: string, photoUrl?: string}) => void;
  accounts: UserAccount[];
}

export const LoginModal = ({ onClose, onLogin, accounts }: LoginModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Find user in the accounts list
    const foundUser = accounts.find(acc => acc.username === username && acc.password === password);

    if (foundUser) {
      setSuccessMessage(`Bienvenido, ${foundUser.name}`);
      setTimeout(() => {
        onLogin({ 
          name: foundUser.name, 
          role: foundUser.role, 
          teacherType: foundUser.teacherType,
          username: foundUser.username,
          photoUrl: foundUser.photoUrl
        });
        onClose();
      }, 1500);
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-school-dark/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10"
        onClick={(e) => e.stopPropagation()}
      >
         {/* Success State */}
         {successMessage ? (
           <div className="flex flex-col items-center justify-center p-12 text-center">
             <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-12 h-12 text-green-500" />
             </div>
             <h3 className="text-2xl font-display font-bold text-school-dark mb-2">¡Acceso Correcto!</h3>
             <p className="text-lg text-slate-600">{successMessage}</p>
           </div>
         ) : (
           <>
             {/* Decorative Header */}
             <div className="h-32 bg-gradient-to-br from-school-primary to-school-dark relative overflow-hidden flex items-center justify-center">
                {/* Abstract shapes matching site theme */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-school-accent/20 rounded-full blur-3xl"></div>
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-school-secondary/20 rounded-full blur-3xl"></div>
                
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-lg ring-1 ring-white/30">
                    <User className="text-white w-10 h-10" />
                </div>
                
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10 p-2 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
             </div>

             <div className="p-8 pt-6">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-display font-bold text-school-dark">Acceso SmartSchool</h2>
                    <p className="text-slate-500 text-sm mt-1">Plataforma de Gestión Académica</p>
                </div>

                <form className="space-y-5" onSubmit={handleLogin}>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Usuario</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-school-primary transition-colors" size={18} />
                            <input 
                                type="text" 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-school-primary focus:ring-4 focus:ring-school-primary/10 transition-all text-slate-700 font-medium placeholder:text-slate-400"
                                placeholder="Ingrese su usuario"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 ml-1 uppercase tracking-wider">Contraseña</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-school-primary transition-colors" size={18} />
                            <input 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} 
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-11 pr-4 outline-none focus:border-school-primary focus:ring-4 focus:ring-school-primary/10 transition-all text-slate-700 font-medium placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg"
                        >
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    <div className="flex justify-end">
                        <button type="button" className="text-xs text-school-primary font-semibold hover:underline hover:text-school-dark transition-colors">
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>

                    <button type="submit" className="w-full bg-school-primary text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-school-primary/30 hover:shadow-xl hover:bg-school-dark hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group mt-4">
                        Ingresar
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
             </div>
             
             <div className="p-4 bg-slate-50 text-center border-t border-slate-100">
                <p className="text-xs text-slate-400 font-medium">Smart School &copy; 2025</p>
             </div>
           </>
         )}
      </motion.div>
    </div>
  );
};
