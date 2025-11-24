
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { SchoolHeroScene } from './components/QuantumScene';
import { ServicesGrid, ImageSlider } from './components/Diagrams';
import { LoginModal } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { VirtualAssistant } from './components/VirtualAssistant';
import { WelcomeSplash } from './components/WelcomeSplash';
import { SchoolLogo } from './components/SchoolLogo';
import { Menu, X, Share2, MapPin, Phone, Mail, User, ExternalLink } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Student, Teacher, ScheduleItem, TeacherAttendance, ChatMessage, UserAccount } from './types';

interface UserProfile {
  name: string;
  role: string;
  username?: string;
  profileColor?: string;
  teacherType?: 'tutor' | 'course';
}

// --- DEFAULT DATA CONSTANTS (Used if LocalStorage is empty) ---
const DEFAULT_ACCOUNTS: UserAccount[] = [
  { id: '1', username: 'victor', password: '12345', name: 'Victor Admin', role: 'admin', profileColor: '#0EA5E9' }, // Blue
  { id: '2', username: 'luis', password: '12345', name: 'Luis Docente', role: 'docente', teacherType: 'course', profileColor: '#EAB308' }, // Yellow
];

const DEFAULT_STUDENTS: Student[] = [
  { 
    id: '1', 
    name: 'Carlos Alvarez', 
    grade: '4to y 5to Grado', 
    attendance: 'none',
    fatherName: 'Roberto Alvarez',
    motherName: 'Elena Gutierrez',
    dni: '70451234',
    birthDate: '2014-05-12',
    originSchool: 'I.E. San Juan'
  },
  { 
    id: '2', 
    name: 'Maria Lopez', 
    grade: '4to y 5to Grado', 
    attendance: 'none',
    fatherName: 'Juan Lopez',
    motherName: 'Ana Maria Diaz',
    dni: '71239876',
    birthDate: '2014-08-22',
    originSchool: 'I.E. Los Pinos' 
  },
  { id: '3', name: 'Juan Perez', grade: '4to y 5to Grado', attendance: 'none' },
  { id: '4', name: 'Luis Gomez', grade: '1ro y 2do Grado', attendance: 'none' },
];

const DEFAULT_TEACHERS: Teacher[] = [
  { id: '1', name: 'Luis Docente', specialty: 'Matemáticas', email: 'luis@smartschool.edu.pe', assignedGrade: '4to y 5to Grado', teacherType: 'course' },
  { id: '2', name: 'Ana Torres', specialty: 'Ciencias', email: 'ana@smartschool.edu.pe', assignedGrade: '1ro y 2do Grado', teacherType: 'course' },
  { id: '3', name: 'Juan Perez', specialty: 'Tutoría', email: 'juan@smartschool.edu.pe', assignedGrade: '3ro Grado', teacherType: 'tutor' },
  { id: '4', name: 'Pedro Castillo', specialty: 'Historia', email: 'pedro@smartschool.edu.pe', assignedGrade: '6to Grado', teacherType: 'course' }
];

const DEFAULT_SCHEDULES: ScheduleItem[] = [
  { id: '1', day: 'Lunes', startTime: '08:00', endTime: '08:45', subject: 'Matemáticas', grade: '4to y 5to Grado', teacherName: 'Luis Docente' },
  { id: '2', day: 'Lunes', startTime: '08:45', endTime: '09:30', subject: 'Comunicación', grade: '4to y 5to Grado', teacherName: 'Luis Docente' },
  { id: '3', day: 'Martes', startTime: '08:00', endTime: '08:45', subject: 'Ciencias', grade: '4to y 5to Grado', teacherName: 'Ana Torres' },
];

const DEFAULT_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'Victor Admin', role: 'admin', content: 'Bienvenidos al sistema SmartSchool 2025.', timestamp: '08:00 AM' },
  { id: '2', sender: 'Luis Docente', role: 'docente', content: 'Gracias, listo para iniciar las clases.', timestamp: '08:05 AM' }
];

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  
  // Updated Current User State to support Profile updates
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Helper to load from LocalStorage
  const getInitialData = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(`Error loading ${key} from localStorage`, e);
    }
    return defaultValue;
  };
  
  // State for Accounts (Login Credentials) - Persisted
  const [accounts, setAccounts] = useState<UserAccount[]>(() => getInitialData('smartschool_accounts', DEFAULT_ACCOUNTS));

  // State for students database - Persisted
  const [students, setStudents] = useState<Student[]>(() => getInitialData('smartschool_students', DEFAULT_STUDENTS));

  // State for teachers database - Persisted
  const [teachers, setTeachers] = useState<Teacher[]>(() => getInitialData('smartschool_teachers', DEFAULT_TEACHERS));

  // State for schedules - Persisted
  const [schedules, setSchedules] = useState<ScheduleItem[]>(() => getInitialData('smartschool_schedules', DEFAULT_SCHEDULES));

  // State for teacher attendance - Persisted
  const [teacherAttendance, setTeacherAttendance] = useState<TeacherAttendance[]>(() => {
    // Generate a default record for demo purposes if empty, but try to load first
    const saved = getInitialData<TeacherAttendance[]>('smartschool_attendance', []);
    if (saved.length === 0) {
       return [{ id: '1', teacherName: 'Luis Docente', date: new Date().toISOString().split('T')[0], entryTime: '07:45', exitTime: '14:00', status: 'Puntual' }];
    }
    return saved;
  });

  // State for Global Chat - Persisted
  const [messages, setMessages] = useState<ChatMessage[]>(() => getInitialData('smartschool_messages', DEFAULT_MESSAGES));

  // --- PERSISTENCE EFFECTS ---
  useEffect(() => { localStorage.setItem('smartschool_accounts', JSON.stringify(accounts)); }, [accounts]);
  useEffect(() => { localStorage.setItem('smartschool_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('smartschool_teachers', JSON.stringify(teachers)); }, [teachers]);
  useEffect(() => { localStorage.setItem('smartschool_schedules', JSON.stringify(schedules)); }, [schedules]);
  useEffect(() => { localStorage.setItem('smartschool_attendance', JSON.stringify(teacherAttendance)); }, [teacherAttendance]);
  useEffect(() => { localStorage.setItem('smartschool_messages', JSON.stringify(messages)); }, [messages]);


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // Splash Screen Timer
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(splashTimer);
    };
  }, []);

  // Handle Profile Updates (Name, Color, Password)
  const handleUpdateUser = (updatedData: { name?: string; username?: string; profileColor?: string; newPassword?: string }) => {
    if (!currentUser) return;

    const oldName = currentUser.name;
    const newName = updatedData.name || currentUser.name;

    // 1. Update the current active session state
    setCurrentUser(prev => ({ 
      ...prev!, 
      name: newName,
      username: updatedData.username || prev!.username,
      profileColor: updatedData.profileColor || prev!.profileColor
    }));
    
    // 2. Update the Accounts Database (to persist changes)
    if (currentUser.username) {
      setAccounts(prevAccounts => prevAccounts.map(acc => {
        // Find by original username
        if (acc.username === currentUser.username) {
          return { 
            ...acc, 
            name: newName, 
            username: updatedData.username || acc.username,
            profileColor: updatedData.profileColor || acc.profileColor,
            password: updatedData.newPassword || acc.password // Update password if provided
          };
        }
        return acc;
      }));
    }

    // 3. If the name changed, we need to update references in other databases to maintain consistency
    if (newName && newName !== oldName) {
      setTeachers(prevTeachers => prevTeachers.map(t => t.name === oldName ? { ...t, name: newName } : t));
      setSchedules(prevSchedules => prevSchedules.map(s => s.teacherName === oldName ? { ...s, teacherName: newName } : s));
      setTeacherAttendance(prevAttendance => prevAttendance.map(t => t.teacherName === oldName ? { ...t, teacherName: newName } : t));
      setMessages(prevMessages => prevMessages.map(m => m.sender === oldName ? { ...m, sender: newName } : m));
    }
  };

  // Smooth Scroll Function
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement | HTMLDivElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMenuOpen(false);
    }
  };

  // Removed "Noticias" from links
  const navLinks = [
    { name: 'Inicio', id: 'inicio' },
    { name: 'Nosotros', id: 'nosotros' },
    { name: 'Servicios', id: 'servicios' },
    { name: 'Contacto', id: 'contacto' },
  ];

  // If user is logged in, show dashboard
  if (currentUser) {
    return (
      <Dashboard 
        user={currentUser} 
        onLogout={() => setCurrentUser(null)}
        onUpdateUser={handleUpdateUser}
        students={students}
        setStudents={setStudents}
        teachers={teachers}
        setTeachers={setTeachers}
        schedules={schedules}
        setSchedules={setSchedules}
        teacherAttendance={teacherAttendance}
        setTeacherAttendance={setTeacherAttendance}
        messages={messages}
        setMessages={setMessages}
        accounts={accounts}
        setAccounts={setAccounts}
      />
    );
  }

  return (
    <div className="min-h-screen bg-school-light text-slate-800 font-sans relative">
      
      {/* Welcome Splash Screen */}
      <AnimatePresence>
        {showSplash && <WelcomeSplash />}
      </AnimatePresence>

      {/* Virtual Assistant - Only shows when not logged in */}
      {/* Pass the setLoginOpen function to allow the assistant to open the login modal */}
      {!showSplash && <VirtualAssistant onOpenLogin={() => setLoginOpen(true)} />}

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-md py-3' : 'bg-white/80 backdrop-blur-sm py-4'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={(e) => handleScroll(e, 'inicio')}>
            {/* Replaced generic S with School Logo */}
            <div className="filter drop-shadow-md">
              <SchoolLogo className="w-12 h-14" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-school-dark leading-none">
              SMART<br/><span className="text-school-primary">SCHOOL</span>
            </span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button 
              onClick={() => setQrOpen(true)}
              className="flex items-center gap-2 hover:text-school-primary transition-colors"
            >
              <Share2 size={16} className="text-school-accent" /> Compartir
            </button>
            
            {navLinks.map(link => (
              <a 
                key={link.name} 
                href={`#${link.id}`} 
                onClick={(e) => handleScroll(e, link.id)}
                className="hover:text-school-primary transition-colors uppercase tracking-wide font-semibold"
              >
                {link.name}
              </a>
            ))}

            <button 
              onClick={() => setLoginOpen(true)}
              className="px-5 py-2 bg-school-primary text-white rounded-full hover:bg-school-dark transition-colors shadow-md flex items-center gap-2 font-semibold border border-school-accent/30"
            >
              <User size={16} className="text-school-accent" />
              Docentes
            </button>
          </div>

          <button className="lg:hidden text-slate-900 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 flex flex-col items-center gap-8 text-xl font-display"
          >
              <button onClick={() => { setQrOpen(true); setMenuOpen(false); }} className="flex items-center gap-2 text-slate-600">
                <Share2 className="text-school-accent"/> Compartir
              </button>
              {navLinks.map(link => (
                <a 
                  key={link.name} 
                  href={`#${link.id}`} 
                  onClick={(e) => handleScroll(e, link.id)} 
                  className="text-slate-800 hover:text-school-primary font-bold"
                >
                  {link.name}
                </a>
              ))}
              <button 
                onClick={() => { setLoginOpen(true); setMenuOpen(false); }}
                className="px-8 py-3 bg-school-primary text-white rounded-full shadow-lg flex items-center gap-2 border-2 border-school-accent"
              >
                <User /> Inicio Sesión Docente
              </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Modal */}
      <AnimatePresence>
        {qrOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-school-dark/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setQrOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center relative border-t-4 border-school-accent"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setQrOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500">
                <X />
              </button>
              <h3 className="text-xl font-bold mb-4 text-school-dark">Escanea para compartir</h3>
              <div className="bg-school-light p-4 rounded-xl mb-4 inline-block border border-school-secondary/20">
                 {/* This is the referenced QR code image */}
                 <img src="img/qrsmartschool.png" alt="QR Code" className="w-32 h-32 mx-auto" />
              </div>
              <p className="text-slate-500 text-sm">Visita nuestra web desde tu móvil</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {loginOpen && (
          <LoginModal 
            onClose={() => setLoginOpen(false)} 
            onLogin={(user) => {
              setCurrentUser({ ...user, username: user.username });
              setLoginOpen(false);
            }}
            accounts={accounts}
          />
        )}
      </AnimatePresence>

      <main>
        {/* Hero Section */}
        <header id="inicio" className="relative min-h-screen flex flex-col pt-24 overflow-hidden">
          {/* 3D Background */}
          <div className="absolute inset-0 z-0">
            <SchoolHeroScene />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-school-light z-0 pointer-events-none"></div>

          <div className="container mx-auto px-6 relative z-10 flex flex-col lg:flex-row gap-12 items-center flex-1 py-12">
            <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="inline-block px-4 py-1 bg-school-secondary/10 text-school-secondary border border-school-secondary/30 rounded-full text-sm font-bold tracking-wider mb-2"
               >
                 EDUCACIÓN DEL FUTURO
               </motion.div>
               <motion.h1 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.1 }}
                 className="text-5xl lg:text-7xl font-display font-bold text-school-dark leading-tight"
               >
                 Bienvenidos a <br/><span className="text-school-primary drop-shadow-sm">SMART SCHOOL</span>
               </motion.h1>
               <motion.p 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0"
               >
                 Donde la innovación y la tecnología se unen para ofrecer una educación moderna, dinámica y de calidad. Formamos estudiantes con pensamiento crítico y valores sólidos.
               </motion.p>
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.3 }}
                 className="flex flex-wrap justify-center lg:justify-start gap-4"
               >
                 <a 
                   href="#nosotros" 
                   onClick={(e) => handleScroll(e, 'nosotros')}
                   className="px-8 py-3 bg-school-primary text-white rounded-lg font-semibold shadow-lg hover:bg-school-dark transition-all transform hover:-translate-y-1 border-b-4 border-school-dark"
                 >
                   Conócenos
                 </a>
                 <a 
                   href="#servicios" 
                   onClick={(e) => handleScroll(e, 'servicios')}
                   className="px-8 py-3 bg-white text-school-primary border-2 border-school-primary rounded-lg font-semibold hover:bg-school-light transition-all"
                 >
                   Nuestros Servicios
                 </a>
               </motion.div>
            </div>

            <div className="lg:w-1/2 w-full max-w-lg">
               <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-school-primary via-school-accent to-school-secondary rounded-2xl blur opacity-30"></div>
                  <ImageSlider />
               </div>
            </div>
          </div>
        </header>

        {/* Nosotros */}
        <section id="nosotros" className="py-20 bg-white">
          <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
               <div className="bg-school-light rounded-2xl p-2 h-80 md:h-96 relative overflow-hidden border-2 border-school-secondary/20">
                  <img src="img/slider2.jpg" alt="Smart School Students" className="w-full h-full object-cover object-top rounded-xl" />
               </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-display font-bold text-school-dark mb-6 relative inline-block">
                Sobre Nosotros
                <span className="absolute bottom-0 left-0 w-1/2 h-1 bg-school-accent rounded-full"></span>
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                Somos una institución educativa comprometida con la excelencia académica y la formación integral. 
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                En <strong className="text-school-primary">SMART SCHOOL</strong> fomentamos el aprendizaje significativo, el trabajo colaborativo y el uso responsable de la tecnología para preparar a nuestros estudiantes frente a los retos del siglo XXI.
              </p>
              <a 
                href="#contacto" 
                onClick={(e) => handleScroll(e, 'contacto')}
                className="text-school-primary font-bold hover:underline flex items-center gap-2 group"
              >
                Contáctanos <span className="text-xl group-hover:translate-x-1 transition-transform text-school-accent">→</span>
              </a>
            </div>
          </div>
        </section>

        {/* Servicios */}
        <section id="servicios" className="py-20 bg-school-light relative overflow-hidden">
           {/* Decorative circles */}
           <div className="absolute top-0 right-0 w-64 h-64 bg-school-secondary/5 rounded-full -mr-32 -mt-32"></div>
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-school-primary/5 rounded-full -ml-48 -mb-48"></div>
           
           <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                 <h2 className="text-3xl font-display font-bold text-school-dark mb-4">Nuestros Servicios</h2>
                 <div className="w-20 h-1 bg-school-accent mx-auto mb-6 rounded-full"></div>
                 <p className="text-slate-600 max-w-2xl mx-auto">
                    Ofrecemos soluciones tecnológicas y pedagógicas que garantizan una formación integral.
                 </p>
              </div>
              <ServicesGrid />
           </div>
        </section>

        {/* Contacto */}
        <section id="contacto" className="py-20 bg-school-dark text-white relative">
           <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12">
              <div>
                 <h2 className="text-3xl font-display font-bold mb-8 text-white border-l-4 border-school-accent pl-4">Contáctanos</h2>
                 <div className="space-y-6">
                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-school-primary/30 rounded-lg text-school-accent">
                          <Phone />
                       </div>
                       <div>
                          <h3 className="font-bold text-lg">Llámanos</h3>
                          <p className="text-slate-300">48841234</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-school-primary/30 rounded-lg text-school-accent">
                          <Mail />
                       </div>
                       <div>
                          <h3 className="font-bold text-lg">Correo Electrónico</h3>
                          <p className="text-slate-300">informes@smartschool.edu.pe</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-4">
                       <div className="p-3 bg-school-primary/30 rounded-lg text-school-accent">
                          <MapPin />
                       </div>
                       <div>
                          <h3 className="font-bold text-lg">Ubicación</h3>
                          <p className="text-slate-300">Jr las Palmeras 427 - San Ramón, Perú</p>
                       </div>
                    </div>
                 </div>
              </div>
              
              {/* Clickable Map Card */}
              <a 
                href="https://maps.app.goo.gl/2XYnz3SmcVyKLLAMA"
                target="_blank"
                rel="noopener noreferrer"
                className="h-80 bg-white/5 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center relative group cursor-pointer hover:border-school-accent/50 transition-all shadow-xl hover:shadow-school-accent/10"
              >
                  {/* Map Image */}
                  <img 
                    src="img/mapasmartschool.png" 
                    alt="Mapa de Ubicación Smart School" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" 
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-school-dark via-school-dark/40 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-500"></div>

                  {/* Centered Content */}
                  <div className="relative z-10 bg-school-dark/80 p-5 rounded-2xl backdrop-blur-md text-center border border-school-accent/30 shadow-2xl group-hover:-translate-y-2 group-hover:bg-school-primary/90 transition-all duration-300">
                      <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20">
                         <MapPin size={24} className="text-school-accent"/>
                      </div>
                      <span className="font-bold text-white text-lg block flex items-center justify-center gap-2">
                         Ver en Google Maps
                         <ExternalLink size={14} className="opacity-70"/>
                      </span>
                      <span className="text-xs text-school-secondary uppercase tracking-wider font-semibold mt-1 block">San Ramón - Chanchamayo</span>
                  </div>
              </a>
           </div>
        </section>
      </main>

      <footer className="bg-[#0a0a0a] text-slate-500 py-8 border-t border-slate-900">
        <div className="container mx-auto px-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} I.E.P Smart School. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
