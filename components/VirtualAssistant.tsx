
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';

// Interface for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  type?: 'text' | 'options';
  options?: { label: string; action: string }[];
}

interface VirtualAssistantProps {
  onOpenLogin?: () => void;
  context?: 'public' | 'dashboard';
  userName?: string;
  userRole?: string;
  onNavigate?: (section: string) => void;
}

export const VirtualAssistant: React.FC<VirtualAssistantProps> = ({ 
  onOpenLogin, 
  context = 'public', 
  userName = 'Usuario',
  userRole,
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const getInitialMessage = (): Message => {
    if (context === 'dashboard') {
      if (userRole === 'admin') {
          return {
             id: 1,
             text: `Hola Administrador ${userName}. Selecciona una herramienta de gestión para comenzar:`,
             sender: 'bot',
             options: [
                { label: "Gestión Estudiantes", action: "AdminStudents" },
                { label: "Gestión Docentes", action: "AdminTeachers" },
                { label: "Cuentas", action: "AdminAccounts" },
                { label: "Control Horarios", action: "AdminSchedules" },
                { label: "Control Asistencia", action: "AdminAttendance" }
             ]
          };
      }

      return {
        id: 1,
        text: `Hola ${userName}, soy Robi. Estoy aquí para ayudarte con tu gestión escolar. ¿Qué deseas hacer?`,
        sender: 'bot',
        options: [
          { label: "Ver Horarios", action: "Navegar Horarios" },
          { label: "Asistencia Alumnos", action: "Navegar Asistencia" },
          { label: "Mensajes", action: "Navegar Mensajes" },
          { label: "Ayuda", action: "Ayuda Dashboard" }
        ]
      };
    }
    return {
      id: 1,
      text: "¡Hola! Soy Robi, tu asistente escolar virtual. ¿Necesitas ayuda?",
      sender: 'bot',
      options: [
        { label: "Soy Docente", action: "Soy Docente" },
        { label: "Soy Padre", action: "Soy Padre" },
        { label: "Soy Alumno", action: "Soy Alumno" },
        { label: "Ubicación", action: "Ubicación" },
        { label: "Servicios", action: "Servicios" }
      ]
    };
  };

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Voice State
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  // Store available voices
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Load voices asynchronously (Chrome requirement)
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
      }
    };

    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Enable continuous listening
      recognitionRef.current.interimResults = true; // Enable interim results for real-time text
      recognitionRef.current.lang = 'es-ES';

      recognitionRef.current.onstart = () => setIsListening(true);
      recognitionRef.current.onend = () => setIsListening(false);
      
      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
        }
        setInputValue(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        // Ignore common non-critical errors
        if (event.error === 'no-speech' || event.error === 'aborted') {
          setIsListening(false);
          return;
        }
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Text-to-Speech Helper
  const speakText = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    
    // Attempt to find a Spanish voice
    let spanishVoice = availableVoices.find(v => v.lang.toLowerCase().includes('es') && v.name.includes('Google'));
    if (!spanishVoice) {
        spanishVoice = availableVoices.find(v => v.lang.toLowerCase().includes('es'));
    }

    if (spanishVoice) {
        utterance.voice = spanishVoice;
    }

    utterance.rate = 1.0;
    utterance.pitch = 1.1; // Slightly higher pitch for "robot" feel

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Microphone
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Tu navegador no soporta reconocimiento de voz.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      // Stop speaking if listening starts
      window.speechSynthesis.cancel();
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("Error starting recognition:", e);
      }
    }
  };

  // Helper to process natural language logic
  const processMessage = (text: string): { response: string, options?: { label: string; action: string }[], command?: string } => {
    // Normalize text: lowercase and remove accents
    const lower = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // --- DASHBOARD SPECIFIC LOGIC ---
    if (context === 'dashboard') {
      // Navigation Intents using inclusive matching for plurals (horario vs horarios)
      if (lower.match(/horario|clase|curso|materia/)) {
        return {
          response: "Te llevo a la sección de Horarios. Aquí podrás ver las clases programadas por aula.",
          options: [],
          command: "NAV_SCHEDULES"
        };
      }
      if (lower.match(/asistencia|falta|tardanza|lista/)) {
        return {
          response: "Abriendo el registro de Asistencia de Alumnos. Recuerda guardar los cambios.",
          options: [],
          command: "NAV_ATTENDANCE"
        };
      }
      if (lower.match(/mensaje|chat|conversar|hablar|escribir/)) {
        return {
          response: "Abriendo el Chat Global para que te comuniques con tus colegas.",
          options: [],
          command: "NAV_MESSAGES"
        };
      }
      if (lower.match(/perfil|cuenta|clave|password|foto|usuario|configurar/)) {
        return {
          response: "Vamos a tu Perfil. Aquí puedes actualizar tu foto y contraseña.",
          options: [],
          command: "NAV_PROFILE"
        };
      }
      if (lower.match(/ayuda|soporte|hacer|instrucciones|guia|como/)) {
        return {
          response: "Desde el menú lateral puedes acceder a:\n• Ver Horarios: Consulta tu carga horaria.\n• Asistencia Alumnos: Marca presentes o faltas.\n• Mensajes: Chat con administración.\n• Perfil: Tus datos personales.",
          options: [
             { label: "Ir a Horarios", action: "Navegar Horarios" },
             { label: "Ir a Asistencia", action: "Navegar Asistencia" }
          ]
        };
      }
      
      // Greeting in dashboard
      if (lower.match(/hola|buenos|buenas/)) {
        return {
           response: `¡Hola de nuevo ${userName}! ¿En qué sección quieres trabajar hoy?`,
           options: [
              { label: "Horarios", action: "Navegar Horarios" },
              { label: "Asistencia", action: "Navegar Asistencia" },
              { label: "Mensajes", action: "Navegar Mensajes" }
           ]
        };
      }

      // Fallback Dashboard
      return {
        response: "Puedo llevarte a cualquier sección: Horarios, Asistencia, Mensajes o Perfil. ¿A dónde vamos?",
        options: [
          { label: "Horarios", action: "Navegar Horarios" },
          { label: "Asistencia", action: "Navegar Asistencia" },
          { label: "Mensajes", action: "Navegar Mensajes" }
        ]
      };
    }

    // --- PUBLIC (LANDING PAGE) LOGIC ---

    // Login Intent (Specific Command)
    if (lower.match(/ir (al|a) login|abrir login|iniciar sesion|quiero entrar/)) {
      return {
        response: "Entendido. Abriendo la ventana de inicio de sesión...",
        options: [],
        command: "OPEN_LOGIN"
      };
    }
    
    // General Login Questions
    if (lower.match(/login|entrar|ingresar|acceder|sistema|intranet|plataforma/)) {
      return {
        response: "El acceso al sistema SmartBoard está reservado para personal autorizado. ¿Deseas abrir el login?",
        options: [
            { label: "Sí, abrir Login", action: "OPEN_LOGIN_ACTION" }
        ]
      };
    }

    // Greetings
    if (lower.match(/hola|buenos|buenas|saludos|hey|que tal/)) {
      return {
        response: "¡Hola! ¿En qué puedo orientarte hoy? Puedo ayudarte con accesos, ubicación o información general.",
        options: [
             { label: "Soy Docente", action: "Soy Docente" },
             { label: "Soy Padre", action: "Soy Padre" },
             { label: "Ubicación", action: "Ubicación" },
        ]
      };
    }

    // Teacher / Staff (plurals included via loose matching)
    if (lower.match(/docente|profesor|maestro|tutor|miss|profe/)) {
      return {
        response: "¡Bienvenido Colega! Para acceder a tu panel de control, calificaciones y asistencia, debes iniciar sesión en el botón superior derecho 'Docentes'.",
        options: [
            { label: "Ir a Login", action: "Inicio de Sesión" },
            { label: "Olvidé mi clave", action: "Recuperar Clave" }
        ]
      };
    }

    // Student
    if (lower.match(/alumno|estudiante|escolar/) || lower.match(/(mis) (notas|clases|tareas)/)) {
      return {
        response: "Hola alumno. Si buscas tus horarios o materiales, estos suelen ser compartidos por tu tutor en clase. Si necesitas acceso al sistema, solicita tus credenciales a secretaría.",
        options: [
            { label: "Ver Horarios", action: "Horarios" },
            { label: "Servicios", action: "Servicios" }
        ]
      };
    }

    // Parents
    if (lower.match(/padre|madre|mama|papa|apoderado|familia/) || lower.match(/(mi) (hijo|hija)/)) {
      return {
        response: "¡Bienvenido a la familia Smart School! Estoy encantado de recibirle. Le invito a dar un recorrido por nuestra propuesta educativa, infraestructura moderna y servicios. ¿Por dónde desea empezar?",
        options: [
            { label: "Conócenos", action: "Conócenos" },
            { label: "Servicios", action: "Servicios" },
            { label: "Contacto", action: "Contactar" },
            { label: "Ubicación", action: "Ubicación" }
        ]
      };
    }

    // Forgot Password
    if (lower.match(/olvide|perdi|recuperar|no se|clave|contraseña|password|acceso/)) {
      return {
        response: "Si olvidaste tu contraseña, por seguridad debes solicitar el restablecimiento en la secretaría del colegio o contactando a soporte técnico.",
        options: [
            { label: "Ver Teléfono", action: "Contactar" },
            { label: "Ir a Login", action: "Inicio de Sesión" }
        ]
      };
    }

    // Location / Address
    if (lower.match(/donde|ubicacion|direccion|llegar|calle|mapa|queda/)) {
      document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
      return {
        response: "Nos encontramos en Jr. Las Palmeras 427, San Ramón. ¡Te esperamos!",
        options: [
            { label: "Contactar", action: "Contactar" },
            { label: "Ver Servicios", action: "Servicios" }
        ]
      };
    }

    // Contact / Phone / Email
    if (lower.match(/telefono|celular|correo|email|llamar|contacto|numero/)) {
      document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
      return {
        response: "Puedes comunicarte al teléfono 48841234 o al correo informes@smartschool.edu.pe. Atendemos de Lunes a Viernes.",
        options: [
            { label: "Ubicación", action: "Ubicación" },
            { label: "Horarios", action: "Horarios" }
        ]
      };
    }

    // Services / Infrastructure
    if (lower.match(/infraestructura|moderna|servicios|ofrecen|enseñan|talleres|metodologia|laboratorio|computo/)) {
      document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
      return {
        response: "Ofrecemos formación integral con infraestructura moderna, ambientes seguros, biblioteca virtual y talleres extracurriculares.",
        options: [
            { label: "Conócenos", action: "Conócenos" },
            { label: "Contactar", action: "Contactar" }
        ]
      };
    }

    // Schedules / Time
    if (lower.match(/horario|hora|entrada|salida|turno/)) {
      return {
        response: "El horario escolar regular es de 8:00 AM a 2:00 PM. Los horarios específicos por aula se ven en la Intranet.",
        options: [
            { label: "Soy Docente", action: "Soy Docente" },
            { label: "Soy Alumno", action: "Soy Alumno" }
        ]
      };
    }
    
    // Admissions / Enrolment
    if (lower.match(/matricula|costo|precio|vacante|inscripcion|nuevo|traslado/)) {
      return {
        response: "Para información sobre vacantes y costos de matrícula 2025, por favor contáctanos directamente o visítanos en el colegio.",
        options: [
            { label: "Ver Contacto", action: "Contactar" },
            { label: "Ubicación", action: "Ubicación" }
        ]
      };
    }

    // Fallback / Unrecognized
    return {
      response: "Disculpa, no estoy seguro de haber entendido. ¿Eres docente, alumno o padre de familia?",
      options: [
         { label: "Soy Docente", action: "Soy Docente" },
         { label: "Soy Padre", action: "Soy Padre" },
         { label: "Soy Alumno", action: "Soy Alumno" }
      ]
    };
  };

  const handleOptionClick = (label: string, action: string) => {
    // User creates a message by clicking logic
    // Display the LABEL (Spanish) as the user text instead of the Action Code
    const userMsg: Message = { id: Date.now(), text: label, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      let result;
      
      // Handle predefined actions
      switch(action) {
        // --- ADMIN DASHBOARD ACTIONS ---
        case "AdminStudents":
           if (onNavigate) onNavigate('manage-students');
           result = { 
             response: "Abriendo Gestión de Estudiantes. Aquí puedes matricular nuevos alumnos o editar la base de datos. ¿Necesitas ayuda con esta sección?", 
             options: [{label: "Sí, guíame", action: "HelpStudents"}, {label: "No, gracias", action: "CloseHelp"}]
           };
           break;
        case "AdminTeachers":
           if (onNavigate) onNavigate('manage-teachers');
           result = { 
             response: "Mostrando Gestión de Docentes. Puedes registrar profesores y asignarles aulas o cursos. ¿Deseas instrucciones?", 
             options: [{label: "Sí, instrucciones", action: "HelpTeachers"}, {label: "No, gracias", action: "CloseHelp"}]
           };
           break;
        case "AdminAccounts":
           if (onNavigate) onNavigate('manage-accounts');
           result = { 
             response: "Accediendo a Gestión de Cuentas. Aquí administras usuarios y contraseñas. ¿Necesitas ayuda?", 
             options: [{label: "Sí, explicar", action: "HelpAccounts"}, {label: "No, gracias", action: "CloseHelp"}]
           };
           break;
        case "AdminSchedules":
           if (onNavigate) onNavigate('schedule-control');
           result = { 
             response: "Esta es la sección de Control de Horarios. Define los cursos por día y hora. ¿Quieres saber cómo funciona?", 
             options: [{label: "Sí, dime cómo", action: "HelpSchedules"}, {label: "No, gracias", action: "CloseHelp"}]
           };
           break;
        case "AdminAttendance":
           if (onNavigate) onNavigate('attendance-control');
           result = { 
             response: "Panel de Control de Asistencias. Registra la puntualidad del personal docente. ¿Ayuda?", 
             options: [{label: "Sí, ayuda", action: "HelpAttendance"}, {label: "No, gracias", action: "CloseHelp"}]
           };
           break;
        
        // --- ADMIN HELP RESPONSES ---
        case "HelpStudents":
           result = {
             response: "Para registrar un alumno: 1. Completa el formulario de la izquierda con sus datos y padres. 2. Selecciona el Grado. 3. Presiona 'Registrar Alumno'. Para eliminar, usa el botón rojo en la lista de la derecha.",
             options: [{label: "Entendido", action: "CloseHelp"}]
           };
           break;
        case "HelpTeachers":
           result = {
             response: "Usa el formulario para crear docentes. IMPORTANTE: Define si es 'Tutor de Aula' (puede marcar asistencia) o 'Docente de Curso'. Asigna el aula correspondiente si es tutor.",
             options: [{label: "Entendido", action: "CloseHelp"}]
           };
           break;
        case "HelpAccounts":
           result = {
             response: "Aquí creas las credenciales de acceso (Usuario/Clave). El rol 'Admin' ve todo. El rol 'Docente' ve solo lo asignado. Si un docente olvida su clave, puedes borrar la cuenta y crearla de nuevo.",
             options: [{label: "Entendido", action: "CloseHelp"}]
           };
           break;
        case "HelpSchedules":
           result = {
             response: "Para agregar una clase: 1. Escribe el nombre del curso. 2. Elige Día, Grado y Docente. 3. Define Hora Inicio y Fin. 4. Clic en 'Agregar Curso'. Aparecerá en la tabla inferior.",
             options: [{label: "Entendido", action: "CloseHelp"}]
           };
           break;
        case "HelpAttendance":
           result = {
             response: "Busca al docente en la lista. Ingresa manualmente su hora de entrada y salida. Cambia el estado a Puntual, Tarde o Falta y presiona el icono de Guardar (Diskette).",
             options: [{label: "Entendido", action: "CloseHelp"}]
           };
           break;
        case "CloseHelp":
           result = { response: "Perfecto. Si necesitas algo más, aquí estaré.", options: [] };
           break;

        // --- TEACHER / GENERAL DASHBOARD ACTIONS ---
        case "Navegar Horarios":
           if (onNavigate) onNavigate('view-schedules');
           result = { response: "Listo, mostrando horarios.", options: [] };
           break;
        case "Navegar Asistencia":
           if (onNavigate) onNavigate('student-attendance');
           result = { response: "Sección de asistencia abierta.", options: [] };
           break;
        case "Navegar Mensajes":
           if (onNavigate) onNavigate('messages');
           result = { response: "Abriendo chat global.", options: [] };
           break;
        case "Navegar Perfil":
           if (onNavigate) onNavigate('profile');
           result = { response: "Mostrando tu perfil.", options: [] };
           break;
        case "Ayuda Dashboard":
           result = {
             response: "Usa los botones del menú lateral para navegar. Si eres tutor, puedes marcar asistencia. Si eres docente de curso, solo puedes verla.",
             options: []
           };
           break;

        // --- PUBLIC ACTIONS ---
        case "Inicio de Sesión":
          document.querySelector('nav')?.scrollIntoView({ behavior: 'smooth' });
          result = { 
             response: "He desplazado la pantalla hacia arriba. Haz clic en el botón 'Docentes' (icono de usuario) para ingresar.", 
             options: [{ label: "Abrir Ahora", action: "OPEN_LOGIN_ACTION" }] 
          };
          break;
        case "OPEN_LOGIN_ACTION":
          if (onOpenLogin) onOpenLogin();
          result = {
             response: "Abriendo ventana de inicio de sesión...",
             options: []
          };
          break;
        case "Conócenos":
          document.getElementById('nosotros')?.scrollIntoView({ behavior: 'smooth' });
          result = { 
            response: "Aquí puede conocer nuestra historia, valores y compromiso educativo.", 
            options: [
              { label: "Ver Servicios", action: "Servicios" },
              { label: "Contactar", action: "Contactar" },
              { label: "Volver al Inicio", action: "Inicio" }
            ] 
          };
          break;
        case "Ubicación":
          document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
          result = { 
            response: "Aquí tienes nuestra ubicación en el pie de página.", 
            options: [
              { label: "Contactar", action: "Contactar" },
              { label: "Horarios", action: "Horarios" },
              { label: "Volver al Inicio", action: "Inicio" }
            ] 
          };
          break;
        case "Servicios":
          document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' });
          result = { 
             response: "Explora nuestros servicios educativos e infraestructura aquí.", 
             options: [
               { label: "Ubicación", action: "Ubicación" },
               { label: "Sobre Nosotros", action: "Conócenos" },
               { label: "Contactar", action: "Contactar" }
             ] 
          };
          break;
        case "Contactar":
          document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' });
          result = { 
             response: "Aquí tienes nuestros canales de atención.", 
             options: [
               { label: "Ubicación", action: "Ubicación" },
               { label: "Horarios", action: "Horarios" },
               { label: "Volver al Inicio", action: "Inicio" }
             ] 
          };
          break;
        case "Recuperar Clave":
           result = { 
             response: "Por favor, acércate a la dirección o secretaría para restablecer tu contraseña de forma segura.", 
             options: [
               { label: "Ver Contacto", action: "Contactar" },
               { label: "Volver al Inicio", action: "Inicio" }
             ] 
           };
           break;
        case "Horarios":
           result = {
             response: "Los horarios generales son de 8:00 AM a 2:00 PM.",
             options: [
               { label: "Soy Docente", action: "Soy Docente" },
               { label: "Contactar", action: "Contactar" }
             ]
           }
           break;
        case "Inicio":
             window.scrollTo({ top: 0, behavior: 'smooth' });
             result = {
                 response: "¿En qué más puedo ayudarte?",
                 options: [
                     { label: "Soy Docente", action: "Soy Docente" },
                     { label: "Soy Padre", action: "Soy Padre" },
                     { label: "Soy Alumno", action: "Soy Alumno" }
                 ]
             };
             break;
        // For roles defined in processMessage fallback options
        case "Soy Docente":
        case "Soy Alumno":
        case "Soy Padre":
          result = processMessage(action);
          break;
        default:
          result = processMessage(action);
      }

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: result.response, 
        sender: 'bot',
        options: result.options 
      }]);
      
      // Speak the response
      speakText(result.response);
      setIsTyping(false);
    }, 800);
  };

  const handleSend = (e?: React.FormEvent, overrideText?: string) => {
    if (e) e.preventDefault();
    
    // Stop listening if user sends manually
    if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
    }

    const text = overrideText || inputValue;
    if (!text.trim()) return;

    setInputValue('');
    setMessages(prev => [...prev, { id: Date.now(), text, sender: 'user' }]);
    
    setIsTyping(true);

    // Intelligent processing with delay to simulate thinking
    setTimeout(() => {
      const result = processMessage(text);
      
      // Handle Action Commands
      if (result.command === 'OPEN_LOGIN' && onOpenLogin) {
        onOpenLogin();
      }
      if (result.command === 'NAV_SCHEDULES' && onNavigate) onNavigate('view-schedules');
      if (result.command === 'NAV_ATTENDANCE' && onNavigate) onNavigate('student-attendance');
      if (result.command === 'NAV_MESSAGES' && onNavigate) onNavigate('messages');
      if (result.command === 'NAV_PROFILE' && onNavigate) onNavigate('profile');

      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: result.response, 
        sender: 'bot',
        options: result.options
      }]);
      
      // Speak the response
      speakText(result.response);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden flex flex-col max-h-[500px]"
          >
            {/* Header */}
            <div className="bg-school-primary p-4 flex justify-between items-center text-white">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                     {/* Mini Robot Icon Head */}
                     <div className="relative w-6 h-6 bg-slate-200 rounded-md border-2 border-slate-300">
                        <div className={`absolute top-2 left-1 w-1 h-1 bg-school-secondary rounded-full ${isListening ? 'animate-ping bg-red-500' : 'animate-pulse'}`}></div>
                        <div className={`absolute top-2 right-1 w-1 h-1 bg-school-secondary rounded-full ${isListening ? 'animate-ping bg-red-500' : 'animate-pulse'}`}></div>
                        {/* Mouth animation when speaking */}
                        <div className={`absolute bottom-1 left-1.5 right-1.5 bg-slate-400 rounded-full transition-all duration-100 ${isSpeaking ? 'h-1.5' : 'h-0.5'}`}></div>
                     </div>
                  </div>
                  <div>
                     <h3 className="font-bold text-sm">Asistente Smart {context === 'dashboard' ? '(Interno)' : ''}</h3>
                     <p className="text-xs text-white/80 flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-green-400'}`}></span> 
                        {isListening ? 'Escuchando...' : 'En línea'}
                     </p>
                  </div>
               </div>
               <div className="flex items-center gap-1">
                  <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors" title={voiceEnabled ? "Silenciar" : "Activar Voz"}>
                     {voiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                  <button onClick={() => { setIsOpen(false); window.speechSynthesis.cancel(); }} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                      <X size={18} />
                  </button>
               </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
               {messages.map((msg) => (
                 <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                       msg.sender === 'user' 
                       ? 'bg-school-primary text-white rounded-br-none' 
                       : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'
                    }`}>
                       {msg.text}
                    </div>
                    
                    {/* Options Chips */}
                    {msg.options && (
                       <div className="flex flex-wrap gap-2 mt-2 max-w-[90%]">
                          {msg.options.map((opt, idx) => (
                             <button 
                               key={idx}
                               onClick={() => handleOptionClick(opt.label, opt.action)}
                               className="text-xs bg-white border border-school-primary/30 text-school-primary px-3 py-1.5 rounded-full hover:bg-school-primary hover:text-white transition-colors shadow-sm font-medium"
                             >
                                {opt.label}
                             </button>
                          ))}
                       </div>
                    )}
                 </div>
               ))}
               {isTyping && (
                  <div className="flex items-center gap-1 ml-2">
                     <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                     <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                     <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
               )}
               <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={(e) => handleSend(e)} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
               <button 
                 type="button"
                 onClick={toggleListening}
                 className={`p-2 rounded-xl transition-all ${isListening ? 'bg-red-50 text-red-500 ring-2 ring-red-500 ring-offset-2 scale-110' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                 title="Hablar con Robi"
               >
                 {isListening ? <MicOff size={18} /> : <Mic size={18} />}
               </button>
               <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={isListening ? "Escuchando..." : "Escribe o habla..."}
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-school-primary transition-colors"
               />
               <button 
                  type="submit" 
                  disabled={!inputValue.trim()}
                  className="bg-school-primary text-white p-2 rounded-xl hover:bg-school-dark transition-colors shadow-md disabled:opacity-50"
               >
                  <Send size={18} />
               </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Robot Button */}
      <motion.button
        onClick={() => {
             if (!isOpen) {
                // Reset to initial greeting when opening with correct context
                setMessages([getInitialMessage()]);
             } else {
                window.speechSynthesis.cancel(); // Stop speaking if closing
             }
             setIsOpen(!isOpen);
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 group"
      >
         {/* The Robot Visual (CSS Construction) */}
         <div className="relative w-20 h-24 flex flex-col items-center justify-end drop-shadow-2xl filter">
            
            {/* Speech Bubble (Only when closed) */}
            {!isOpen && (
               <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                  className="absolute -top-12 right-0 bg-white text-school-dark text-xs font-bold px-3 py-2 rounded-xl rounded-br-none shadow-lg whitespace-nowrap border border-slate-100"
               >
                  {context === 'dashboard' ? '¿Ayuda con tu gestión?' : '¿Necesitas ayuda?'}
               </motion.div>
            )}

            {/* Head */}
            <div className="w-12 h-10 bg-slate-200 rounded-xl border-2 border-slate-300 relative z-20 flex items-center justify-center shadow-md group-hover:-translate-y-1 transition-transform">
               {/* Eyes */}
               <div className="flex gap-2">
                  <div className={`w-2 h-2 bg-sky-400 rounded-full shadow-[0_0_5px_#38bdf8] ${isListening ? 'bg-red-500 animate-ping' : 'animate-pulse'}`}></div>
                  <div className={`w-2 h-2 bg-sky-400 rounded-full shadow-[0_0_5px_#38bdf8] ${isListening ? 'bg-red-500 animate-ping' : 'animate-pulse'}`}></div>
               </div>
               {/* Antenna */}
               <div className="absolute -top-3 w-1 h-3 bg-slate-400"></div>
               <div className="absolute -top-4 w-2 h-2 bg-red-400 rounded-full animate-ping opacity-75"></div>
               <div className="absolute -top-4 w-2 h-2 bg-red-400 rounded-full"></div>
            </div>

            {/* Neck */}
            <div className="w-4 h-2 bg-slate-400 z-10"></div>

            {/* Torso (Light Blue Shirt) */}
            <div className="w-14 h-12 bg-sky-300 rounded-t-xl relative z-20 shadow-inner flex justify-center border-x border-t border-sky-400">
               {/* Collar */}
               <div className="w-6 h-2 bg-white rounded-b-full mt-0.5 opacity-80"></div>
               {/* Arms */}
               <div className="absolute -left-3 top-2 w-3 h-8 bg-sky-300 rounded-l-full border border-sky-400 origin-top-right group-hover:rotate-12 transition-transform"></div>
               <div className="absolute -right-3 top-2 w-3 h-8 bg-sky-300 rounded-r-full border border-sky-400 origin-top-left group-hover:-rotate-12 transition-transform"></div>
            </div>

            {/* Belt */}
            <div className="w-14 h-2 bg-slate-700 z-20"></div>

            {/* Legs (Beige Pants) */}
            <div className="flex gap-1 z-10">
               <div className="w-6 h-8 bg-[#d4c4a8] rounded-b-lg border border-[#c2b296]"></div>
               <div className="w-6 h-8 bg-[#d4c4a8] rounded-b-lg border border-[#c2b296]"></div>
            </div>
         </div>
      </motion.button>
    </>
  );
};
