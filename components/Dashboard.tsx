/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import { 
  Layout, LogOut, Users, Calendar, BookOpen, 
  Settings, Search, Plus, Trash2, 
  CheckCircle, XCircle, Clock, 
  CalendarRange, Timer, ClipboardCheck, Save,
  ArrowLeft, AlertCircle, MessageSquare, FileText, Send, UserCheck, Edit3, UserCog, Palette, School, X, ChevronRight, Upload, Bell
} from 'lucide-react';
import { VirtualAssistant } from './VirtualAssistant';
import { Student, Teacher, ScheduleItem, TeacherAttendance, ChatMessage, UserAccount } from '../types';

interface DashboardProps {
  user: { name: string; role: string; username?: string; profileColor?: string; teacherType?: 'tutor' | 'course' };
  onLogout: () => void;
  onUpdateUser: (data: { name?: string; username?: string; profileColor?: string; newPassword?: string }) => void;
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
  schedules: ScheduleItem[];
  setSchedules: React.Dispatch<React.SetStateAction<ScheduleItem[]>>;
  teacherAttendance: TeacherAttendance[];
  setTeacherAttendance: React.Dispatch<React.SetStateAction<TeacherAttendance[]>>;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  accounts: UserAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<UserAccount[]>>;
}

// Define the classroom categories
const CLASSROOMS = [
  "Inicial",
  "1ro y 2do Grado",
  "3ro Grado",
  "4to y 5to Grado",
  "6to Grado",
  "1ro y 2do Secundaria",
  "3ro Secundaria",
  "4to Secundaria"
];

const PROFILE_COLORS = [
    '#0EA5E9', // Blue
    '#EAB308', // Yellow/Gold
    '#EF4444', // Red
    '#22C55E', // Green
    '#A855F7', // Purple
    '#EC4899', // Pink
    '#64748B', // Slate
    '#F97316'  // Orange
];

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, onLogout, onUpdateUser,
  students, setStudents, 
  teachers, setTeachers,
  schedules, setSchedules,
  teacherAttendance, setTeacherAttendance,
  messages, setMessages,
  accounts, setAccounts
}) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  
  // Logout Modal State
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  // Search States
  const [studentSearch, setStudentSearch] = useState('');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [accountSearch, setAccountSearch] = useState('');
  
  // View/Filter States
  const [viewGrade, setViewGrade] = useState('4to y 5to Grado');
  
  // State for viewing attendance by grade (for Student Attendance section)
  const [selectedAttendanceGrade, setSelectedAttendanceGrade] = useState(CLASSROOMS[0]);

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    username: user.username || user.name.split(' ')[0],
    profileColor: user.profileColor || '#0EA5E9',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // New Student Form State - Updated with biography fields
  const [newStudent, setNewStudent] = useState<Partial<Student>>({ 
    name: '', 
    grade: '',
    fatherName: '',
    motherName: '',
    dni: '',
    birthDate: '',
    originSchool: ''
  });
  
  // New Teacher Form State
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({ name: '', specialty: '', email: '', assignedGrade: '', teacherType: 'course' });

  // New Schedule Form State
  const [newSchedule, setNewSchedule] = useState<Omit<ScheduleItem, 'id'>>({
    day: 'Lunes',
    startTime: '',
    endTime: '',
    subject: '',
    grade: '4to y 5to Grado',
    teacherName: ''
  });

  // Schedule Control States
  const [editingScheduleGrade, setEditingScheduleGrade] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleSuccessMsg, setScheduleSuccessMsg] = useState('');
  
  // Form state for Adding/Editing a specific schedule item
  const [scheduleForm, setScheduleForm] = useState<Partial<ScheduleItem>>({
    day: 'Lunes',
    startTime: '',
    endTime: '',
    subject: '',
    teacherName: ''
  });
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null); // Null means adding new

  // New Account Form State
  const [newAccount, setNewAccount] = useState<Partial<UserAccount>>({
    name: '',
    username: '',
    password: '',
    role: 'docente',
    teacherType: 'course'
  });

  // Chat Input State
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  // Temporary state for managing teacher attendance changes
  const [tempTeacherAttendance, setTempTeacherAttendance] = useState<Record<string, Partial<TeacherAttendance>>>({});

  // Detect if the logged in user is a teacher and find their profile
  const currentTeacherProfile = teachers.find(t => t.name === user.name);

  // Effect to set default attendance grade based on logged in teacher
  useEffect(() => {
    if (user.role === 'docente' && currentTeacherProfile) {
      setSelectedAttendanceGrade(currentTeacherProfile.assignedGrade);
    }
  }, [user, currentTeacherProfile]);

  // Effect to scroll chat to bottom
  useEffect(() => {
    if (activeSection === 'messages') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeSection]);

  // Notification Logic: Check for new messages
  useEffect(() => {
    const lastReadCount = parseInt(localStorage.getItem(`smartschool_last_read_${user.username}`) || '0');
    if (messages.length > lastReadCount) {
      setUnreadMessagesCount(messages.length - lastReadCount);
    } else {
      setUnreadMessagesCount(0);
    }
  }, [messages, user.username]);

  // Mark messages as read when entering the section
  useEffect(() => {
    if (activeSection === 'messages') {
      setUnreadMessagesCount(0);
      localStorage.setItem(`smartschool_last_read_${user.username}`, messages.length.toString());
    }
  }, [activeSection, messages.length, user.username]);

  // Reset Profile form when user changes (or on entry)
  useEffect(() => {
    setProfileForm({
      name: user.name,
      username: user.username || user.name.split(' ')[0],
      profileColor: user.profileColor || '#0EA5E9',
      newPassword: '',
      confirmPassword: ''
    });
  }, [user]);

  const menuSections: { title: string; items: { id: string; label: string; icon: React.ReactNode; desc: string; role?: string; badge?: number }[] }[] = [
    {
      title: 'General',
      items: [
        { id: 'dashboard', label: 'Inicio', icon: <Layout size={20} />, desc: 'Vista general del sistema' },
        { id: 'view-schedules', label: 'Ver Horarios', icon: <CalendarRange size={20} />, desc: 'Consulta los horarios de clase' },
        { id: 'my-attendance', label: 'Mi Asistencia', icon: <Timer size={20} />, desc: 'Registro de entrada y salida' },
        { id: 'student-attendance', label: 'Asistencia Alumnos', icon: <ClipboardCheck size={20} />, desc: 'Registro de asistencia estudiantil' },
        { id: 'school-profiles', label: 'Perfiles Escolares', icon: <FileText size={20} />, desc: 'Biografía y datos de alumnos' },
        { id: 'messages', label: 'Mensajes', icon: <MessageSquare size={20} />, desc: 'Chat global del personal', badge: unreadMessagesCount },
        { id: 'profile', label: 'Perfil', icon: <Settings size={20} />, desc: 'Configuración de cuenta' },
      ]
    },
    {
      title: 'Administración',
      items: [
        { id: 'manage-students', label: 'Gestión Estudiantes', icon: <Users size={20} />, role: 'admin', desc: 'Administrar base de datos de alumnos' },
        { id: 'manage-teachers', label: 'Gestión Docentes', icon: <BookOpen size={20} />, role: 'admin', desc: 'Administrar plana docente' },
        { id: 'manage-accounts', label: 'Cuentas', icon: <UserCog size={20} />, role: 'admin', desc: 'Crear y modificar cuentas de usuario' },
        { id: 'attendance-control', label: 'Control de Asistencias', icon: <Calendar size={20} />, role: 'admin', desc: 'Registro de asistencia docente' },
        { id: 'schedule-control', label: 'Control de Horarios', icon: <Clock size={20} />, role: 'admin', desc: 'Gestión de horarios escolares' },
      ]
    }
  ];

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudent.name && newStudent.grade) {
      const studentData: Student = {
        id: Date.now().toString(),
        name: newStudent.name,
        grade: newStudent.grade,
        attendance: 'none',
        fatherName: newStudent.fatherName,
        motherName: newStudent.motherName,
        dni: newStudent.dni,
        birthDate: newStudent.birthDate,
        originSchool: newStudent.originSchool
      };
      setStudents([...students, studentData]);
      setNewStudent({ 
        name: '', grade: '', 
        fatherName: '', motherName: '', 
        dni: '', birthDate: '', originSchool: '' 
      });
    }
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeacher.name && newTeacher.specialty && newTeacher.assignedGrade) {
      setTeachers([...teachers, { 
        id: Date.now().toString(),
        name: newTeacher.name!,
        specialty: newTeacher.specialty!,
        email: newTeacher.email || '',
        assignedGrade: newTeacher.assignedGrade!,
        teacherType: newTeacher.teacherType || 'course'
      }]);
      setNewTeacher({ name: '', specialty: '', email: '', assignedGrade: '', teacherType: 'course' });
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAccount.username && newAccount.password && newAccount.name) {
      const account: UserAccount = {
        id: Date.now().toString(),
        name: newAccount.name!,
        username: newAccount.username!,
        password: newAccount.password!,
        role: newAccount.role as 'admin' | 'docente' || 'docente',
        teacherType: newAccount.role === 'docente' ? (newAccount.teacherType as 'tutor' | 'course' || 'course') : undefined,
        profileColor: '#0EA5E9'
      };
      setAccounts([...accounts, account]);
      setNewAccount({ name: '', username: '', password: '', role: 'docente', teacherType: 'course' });
    }
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSchedule.subject && newSchedule.startTime && newSchedule.endTime) {
      setSchedules([...schedules, { ...newSchedule, id: Date.now().toString() }]);
      setNewSchedule({ ...newSchedule, subject: '', startTime: '', endTime: '', teacherName: '' });
    }
  };

  // --- SCHEDULE CONTROL HANDLERS ---
  const openAddScheduleModal = () => {
    setEditingScheduleId(null);
    setScheduleForm({
        day: 'Lunes',
        startTime: '08:00',
        endTime: '08:45',
        subject: '',
        teacherName: ''
    });
    setIsScheduleModalOpen(true);
  };

  const openEditScheduleModal = (item: ScheduleItem) => {
    setEditingScheduleId(item.id);
    setScheduleForm({
        day: item.day,
        startTime: item.startTime,
        endTime: item.endTime,
        subject: item.subject,
        teacherName: item.teacherName
    });
    setIsScheduleModalOpen(true);
  };

  const handleSaveScheduleItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheduleGrade || !scheduleForm.subject || !scheduleForm.startTime) return;

    if (editingScheduleId) {
        // Update existing
        setSchedules(prev => prev.map(s => s.id === editingScheduleId ? { 
            ...s, 
            ...scheduleForm as ScheduleItem, 
            grade: editingScheduleGrade 
        } : s));
    } else {
        // Add new
        const newItem: ScheduleItem = {
            id: Date.now().toString(),
            grade: editingScheduleGrade,
            day: scheduleForm.day || 'Lunes',
            startTime: scheduleForm.startTime || '',
            endTime: scheduleForm.endTime || '',
            subject: scheduleForm.subject || '',
            teacherName: scheduleForm.teacherName
        };
        setSchedules(prev => [...prev, newItem]);
    }
    setIsScheduleModalOpen(false);
  };

  const handlePublishSchedules = () => {
    // Visual feedback simulation
    setScheduleSuccessMsg(`¡Horario de ${editingScheduleGrade} publicado exitosamente!`);
    setTimeout(() => setScheduleSuccessMsg(''), 3000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: user.name,
      role: user.role,
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setChatInput('');
    
    // Update my own read count immediately so I don't notify myself
    localStorage.setItem(`smartschool_last_read_${user.username}`, (messages.length + 1).toString());
  };

  const handleDeleteMessage = (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este mensaje?")) {
      setMessages(messages.filter(m => m.id !== id));
    }
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers(teachers.filter(t => t.id !== id));
  };
  
  const handleDeleteAccount = (id: string) => {
    setAccounts(accounts.filter(a => a.id !== id));
  };

  const updateAttendance = (id: string, status: 'present' | 'absent' | 'late') => {
    setStudents(students.map(s => s.id === id ? { ...s, attendance: status } : s));
  };

  // Save Profile Changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate Passwords
    if (profileForm.newPassword && profileForm.newPassword !== profileForm.confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    // Call parent update with new password if provided
    onUpdateUser({
      name: profileForm.name,
      username: profileForm.username,
      profileColor: profileForm.profileColor,
      newPassword: profileForm.newPassword ? profileForm.newPassword : undefined
    });

    setProfileSuccessMsg('Perfil y credenciales actualizados correctamente');
    setIsEditingProfile(false);
    
    // Clear password fields
    setProfileForm(prev => ({...prev, newPassword: '', confirmPassword: ''}));

    setTimeout(() => setProfileSuccessMsg(''), 3000);
  };

  // Helper to update temporary teacher attendance state
  const handleTeacherAttendanceChange = (teacherId: string, field: keyof TeacherAttendance, value: string) => {
    setTempTeacherAttendance(prev => ({
      ...prev,
      [teacherId]: { ...prev[teacherId], [field]: value }
    }));
  };

  // Save Teacher Attendance
  const saveTeacherAttendance = (teacher: Teacher) => {
    const temp = tempTeacherAttendance[teacher.id];
    const today = new Date().toISOString().split('T')[0];
    
    const newRecord: TeacherAttendance = {
      id: Date.now().toString(),
      teacherName: teacher.name,
      date: today,
      entryTime: (temp?.entryTime as string) || '--:--',
      exitTime: (temp?.exitTime as string) || '--:--',
      status: (temp?.status as any) || 'Puntual'
    };

    // Remove existing record for today if exists, then add new
    const others = teacherAttendance.filter(r => !(r.teacherName === teacher.name && r.date === today));
    setTeacherAttendance([...others, newRecord]);
    
    // Clear temp state for this teacher
    const newTemp = { ...tempTeacherAttendance };
    delete newTemp[teacher.id];
    setTempTeacherAttendance(newTemp);
  };

  // Filtering logic
  const filteredStudents = students.filter(s => 
    (s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
    s.grade.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
    t.specialty.toLowerCase().includes(teacherSearch.toLowerCase())
  );

  const filteredAccounts = accounts.filter(a => 
    a.name.toLowerCase().includes(accountSearch.toLowerCase()) ||
    a.username.toLowerCase().includes(accountSearch.toLowerCase())
  );

  // Filter students for attendance view (strictly by grade)
  const attendanceStudents = students.filter(s => 
    s.grade === selectedAttendanceGrade &&
    s.name.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-display font-bold text-school-dark mb-2">Bienvenido {user.name}</h2>
              <p className="text-slate-600">Este entorno virtual permite la gestión de asistencias, administración escolar, horarios y perfiles. Todo en un solo lugar.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {menuSections.flatMap(s => s.items.map(i => ({...i, sectionTitle: s.title}))).filter(item => {
                  // If admin, show everything with 'admin' or no role
                  if (user.role === 'admin') return !item.role || item.role === 'admin';
                  
                  // If teacher (any type), show items with no role (General section)
                  return !item.role;
              }).map((item) => {
                 const isAdminItem = item.sectionTitle === 'Administración';
                 return (
                   <button 
                     key={item.id}
                     onClick={() => setActiveSection(item.id)}
                     className={`bg-white p-6 rounded-2xl shadow-sm border transition-all text-left group h-full flex flex-col ${
                        isAdminItem 
                          ? 'border-amber-200 hover:shadow-md hover:border-school-accent/50' 
                          : 'border-slate-100 hover:shadow-md hover:border-school-primary/30'
                     }`}
                   >
                     <div className="flex justify-between items-start w-full">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                            isAdminItem ? 'bg-amber-50 text-school-accent' : 'bg-school-light text-school-primary'
                        }`}>
                          {item.icon}
                        </div>
                        {/* Notification Badge in Grid */}
                        {item.badge ? (
                           <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm animate-pulse">
                              {item.badge} nuevos
                           </span>
                        ) : null}
                     </div>
                     <h3 className={`font-bold mb-1 ${isAdminItem ? 'text-amber-600' : 'text-school-dark'}`}>{item.label}</h3>
                     <p className="text-xs text-slate-500">{item.desc}</p>
                   </button>
                 );
              })}
            </div>
          </div>
        );

      case 'school-profiles':
        return (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-display font-bold text-school-dark">Perfiles Escolares</h2>
                <p className="text-slate-500 text-sm">Información biográfica detallada de los estudiantes</p>
             </div>

             <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                      type="text" 
                      placeholder="Buscar alumno por nombre..." 
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-school-primary"
                    />
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map(student => (
                  <div key={student.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow">
                     <div className="h-20 bg-gradient-to-r from-school-primary to-school-secondary"></div>
                     <div className="px-6 pb-6 -mt-10">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white mb-3 mx-auto text-school-primary">
                           <Users size={32} />
                        </div>
                        <div className="text-center mb-4">
                           <h3 className="font-bold text-school-dark text-lg">{student.name}</h3>
                           <span className="bg-school-light text-school-primary text-xs font-bold px-2 py-1 rounded-full">{student.grade}</span>
                        </div>
                        <div className="space-y-3 text-sm">
                           <div className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Datos Personales</p>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                 <div>
                                   <span className="block text-slate-500">DNI</span>
                                   <span className="font-medium">{student.dni || 'No registrado'}</span>
                                 </div>
                                 <div>
                                   <span className="block text-slate-500">Nacimiento</span>
                                   <span className="font-medium">{student.birthDate || 'No registrado'}</span>
                                 </div>
                              </div>
                           </div>
                           <div className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Padres</p>
                              <div className="space-y-1 text-xs">
                                 <p><span className="text-slate-500">Padre:</span> <span className="font-medium">{student.fatherName || 'No registrado'}</span></p>
                                 <p><span className="text-slate-500">Madre:</span> <span className="font-medium">{student.motherName || 'No registrado'}</span></p>
                              </div>
                           </div>
                           <div className="p-3 bg-slate-50 rounded-lg">
                              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Origen</p>
                              <p className="text-xs font-medium">{student.originSchool || 'Institución no especificada'}</p>
                           </div>
                        </div>
                     </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && (
                   <div className="col-span-full text-center py-10 text-slate-400 italic">
                      No se encontraron perfiles.
                   </div>
                )}
             </div>
          </div>
        );

      case 'messages':
        return (
           <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-white flex justify-between items-center">
                 <div>
                    <h2 className="text-xl font-display font-bold text-school-dark flex items-center gap-2">
                        <MessageSquare className="text-school-primary" />
                        Chat Global del Personal
                    </h2>
                    <p className="text-slate-500 text-sm">Comunicación interna para docentes y administrativos</p>
                 </div>
                 {/* Simple indicator for live status */}
                 <div className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    En línea
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                 {messages.map((msg) => {
                    const isMe = msg.sender === user.name;
                    // Find account to get color
                    const senderAccount = accounts.find(acc => acc.name === msg.sender);
                    // Logic: If me, use my current session color. If other, use account color. If not found, gray.
                    const avatarBg = isMe 
                        ? (user.profileColor || '#0EA5E9') 
                        : (senderAccount?.profileColor || '#64748b');

                    return (
                       <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                             <div 
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-sm"
                                style={{ backgroundColor: avatarBg }}
                             >
                                {msg.sender.charAt(0)}
                             </div>
                             <div className={`p-4 rounded-2xl text-sm relative group ${isMe ? 'bg-school-primary text-white rounded-br-none' : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none shadow-sm'}`}>
                                {!isMe && <p className="text-xs font-bold text-school-secondary mb-1">{msg.sender} <span className="text-slate-400 font-normal opacity-75">- {msg.role}</span></p>}
                                <p>{msg.content}</p>
                                
                                {/* ADMIN DELETE ACTION */}
                                {user.role === 'admin' && (
                                   <button 
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="absolute -top-2 -right-2 bg-white text-red-500 p-1 rounded-full shadow-md border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                      title="Eliminar mensaje"
                                   >
                                      <Trash2 size={12} />
                                   </button>
                                )}
                             </div>
                          </div>
                          <span className="text-[10px] text-slate-400 mt-1 px-2">
                             {msg.timestamp}
                          </span>
                       </div>
                    );
                 })}
                 <div ref={chatEndRef} />
              </div>

              <div className="p-4 bg-white border-t border-slate-100">
                 <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input 
                      type="text" 
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder="Escribe un mensaje..." 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-school-primary focus:ring-2 focus:ring-school-primary/10 transition-all"
                    />
                    <button 
                      type="submit" 
                      disabled={!chatInput.trim()}
                      className="bg-school-primary text-white p-3 rounded-xl hover:bg-school-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                       <Send size={20} />
                    </button>
                 </form>
              </div>
           </div>
        );

      case 'view-schedules':
        // Filter schedules for display
        const displaySchedules = schedules.filter(s => s.grade === viewGrade);
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h2 className="text-xl font-display font-bold text-school-dark">Horarios de Clase</h2>
               <p className="text-slate-500 text-sm">Selecciona un aula para ver el horario</p>
            </div>

            {/* Replaced Select with Grid View */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CLASSROOMS.map(classroom => {
                const isSelected = viewGrade === classroom;
                const count = schedules.filter(s => s.grade === classroom).length;
                return (
                  <button
                    key={classroom}
                    onClick={() => setViewGrade(classroom)}
                    className={`p-4 rounded-xl border transition-all text-left relative group ${
                      isSelected 
                        ? 'bg-school-primary text-white border-school-dark shadow-md ring-2 ring-school-secondary ring-offset-2' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-school-primary hover:shadow-sm'
                    }`}
                  >
                    <div className={`mb-3 w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-slate-100 text-slate-400 group-hover:text-school-primary group-hover:bg-school-light'}`}>
                       <School size={20} />
                    </div>
                    <span className="block font-bold text-sm mb-1">{classroom}</span>
                    <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                       {count} clases registradas
                    </span>
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                         <CheckCircle size={16} className="text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
              {days.map(day => (
                <div key={day} className="space-y-3">
                  <div className="bg-school-primary text-white text-center py-2 rounded-lg font-bold text-sm shadow-sm">
                    {day}
                  </div>
                  <div className="space-y-2">
                    {displaySchedules
                      .filter(s => s.day === day)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map(session => (
                      <div key={session.id} className="bg-white p-3 rounded-xl border-l-4 border-school-accent shadow-sm hover:shadow-md transition-all group">
                        <p className="font-bold text-school-dark text-sm">{session.subject}</p>
                        <div className="flex items-center gap-1 text-xs text-school-primary font-medium mt-1">
                           <UserCheck size={12} />
                           <span>{session.teacherName || 'Sin docente'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                          <Clock size={12} />
                          <span>{session.startTime} - {session.endTime}</span>
                        </div>
                      </div>
                    ))}
                    {displaySchedules.filter(s => s.day === day).length === 0 && (
                      <div className="text-center py-8 text-slate-400 text-xs italic bg-slate-50 rounded-lg border border-dashed border-slate-200">
                        Sin clases
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'my-attendance':
        // Real data from global state, filtered by logged-in user
        const myRecords = teacherAttendance.filter(r => r.teacherName === user.name);

        return (
           <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <h2 className="text-xl font-display font-bold text-school-dark">Mi Historial de Asistencia</h2>
               <p className="text-slate-500 text-sm">Registro de entradas y salidas de {user.name}</p>
             </div>

             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-school-light text-school-dark font-semibold text-sm">
                    <tr>
                      <th className="p-4">Fecha</th>
                      <th className="p-4">Hora Entrada</th>
                      <th className="p-4">Hora Salida</th>
                      <th className="p-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                    {myRecords.length > 0 ? (
                      myRecords.map((log, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-medium">{log.date}</td>
                          <td className="p-4">{log.entryTime}</td>
                          <td className="p-4">{log.exitTime}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              log.status === 'Puntual' ? 'bg-green-100 text-green-600' :
                              log.status === 'Tarde' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-red-100 text-red-600'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                          No hay registros de asistencia disponibles.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
           </div>
        );
      
      case 'student-attendance':
        // Logic: Admin and "Tutors" (Classroom Teachers) can edit. "Course Teachers" can only view.
        const canMarkAttendance = user.role === 'admin' || user.teacherType === 'tutor';

        return (
           <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
               <div>
                  <h2 className="text-xl font-display font-bold text-school-dark">Asistencia de Alumnos</h2>
                  <p className="text-slate-500 text-sm">
                    {user.role === 'docente' 
                      ? `Aula asignada: ${selectedAttendanceGrade} (${user.teacherType === 'tutor' ? 'Control Total' : 'Solo Lectura'})` 
                      : 'Seleccione aula para gestionar asistencia'}
                  </p>
               </div>
               
               {user.role === 'admin' && (
                  <select 
                    value={selectedAttendanceGrade} 
                    onChange={e => setSelectedAttendanceGrade(e.target.value)} 
                    className="bg-school-light border-none rounded-lg px-4 py-2 text-sm font-semibold text-school-dark outline-none focus:ring-2 focus:ring-school-primary w-full md:w-auto"
                  >
                    {CLASSROOMS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
               )}
               {user.role === 'docente' && (
                  <div className="bg-school-light px-4 py-2 rounded-lg text-sm font-bold text-school-primary">
                    {selectedAttendanceGrade}
                  </div>
               )}
             </div>
             
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
                   <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Buscar alumno en esta aula..." 
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-school-primary"
                      />
                   </div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-white text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Alumno</th>
                      <th className="p-4">Grado</th>
                      <th className="p-4">Estado</th>
                      {canMarkAttendance && <th className="p-4 text-right">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {attendanceStudents.length > 0 ? (
                      attendanceStudents.map(student => (
                        <tr key={student.id} className="hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-700">{student.name}</td>
                          <td className="p-4 text-slate-500">{student.grade}</td>
                          <td className="p-4">
                            {student.attendance === 'present' && <span className="bg-green-100 text-green-600 px-2 py-1 rounded text-xs font-bold">Presente</span>}
                            {student.attendance === 'absent' && <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-bold">Falta</span>}
                            {student.attendance === 'late' && <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded text-xs font-bold">Tarde</span>}
                            {student.attendance === 'none' && <span className="text-slate-400 text-xs">--</span>}
                          </td>
                          {canMarkAttendance && (
                            <td className="p-4 text-right space-x-2">
                              <button onClick={() => updateAttendance(student.id, 'present')} title="Presente" className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:scale-110 transition-all"><CheckCircle size={18}/></button>
                              <button onClick={() => updateAttendance(student.id, 'late')} title="Tarde" className="p-2 rounded-lg bg-yellow-50 text-yellow-600 hover:bg-yellow-100 hover:scale-110 transition-all"><Clock size={18}/></button>
                              <button onClick={() => updateAttendance(student.id, 'absent')} title="Falta" className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all"><XCircle size={18}/></button>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={canMarkAttendance ? 4 : 3} className="p-8 text-center text-slate-400 italic">
                          No hay alumnos registrados en este grado o que coincidan con la búsqueda.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
           </div>
        );

      case 'profile':
         return (
            <div className="max-w-2xl mx-auto space-y-6">
               {profileSuccessMsg && (
                  <div className="bg-green-100 text-green-700 p-4 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle size={20} />
                    {profileSuccessMsg}
                  </div>
               )}

               <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center relative">
                  {!isEditingProfile && (
                    <button 
                      onClick={() => setIsEditingProfile(true)}
                      className="absolute top-6 right-6 text-slate-400 hover:text-school-primary transition-colors p-2 bg-slate-50 rounded-full"
                      title="Editar Perfil"
                    >
                      <Edit3 size={20} />
                    </button>
                  )}

                  {/* Avatar Display */}
                  <div className="relative w-24 h-24 mx-auto mb-4">
                     <div 
                        className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg ring-4 ring-school-light"
                        style={{ backgroundColor: user.profileColor || '#0EA5E9' }}
                     >
                        {user.name.charAt(0)}
                     </div>
                  </div>

                  {isEditingProfile ? (
                     /* EDIT MODE */
                     <form onSubmit={handleSaveProfile} className="text-left space-y-5 mt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                              <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Nombre Completo</label>
                              <input 
                                type="text" 
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-school-primary"
                              />
                           </div>
                           <div>
                              <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Usuario</label>
                              <input 
                                type="text" 
                                value={profileForm.username}
                                onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-school-primary"
                              />
                           </div>
                        </div>

                        <div>
                           <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Color de Perfil</label>
                           <div className="flex flex-wrap gap-3">
                              {PROFILE_COLORS.map(color => (
                                 <button
                                   key={color}
                                   type="button"
                                   onClick={() => setProfileForm({...profileForm, profileColor: color})}
                                   className={`w-10 h-10 rounded-full border-2 transition-all ${
                                      profileForm.profileColor === color ? 'border-slate-800 scale-110' : 'border-transparent hover:scale-105'
                                   }`}
                                   style={{ backgroundColor: color }}
                                 />
                              ))}
                           </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4">
                          <p className="text-sm font-bold text-slate-700 mb-3">Cambiar Contraseña</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Nueva Contraseña</label>
                                <input 
                                  type="password" 
                                  value={profileForm.newPassword}
                                  onChange={(e) => setProfileForm({...profileForm, newPassword: e.target.value})}
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-school-primary"
                                  placeholder="••••••••"
                                />
                             </div>
                             <div>
                                <label className="text-xs text-slate-400 uppercase font-bold mb-1 block">Confirmar</label>
                                <input 
                                  type="password" 
                                  value={profileForm.confirmPassword}
                                  onChange={(e) => setProfileForm({...profileForm, confirmPassword: e.target.value})}
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-school-primary"
                                  placeholder="••••••••"
                                />
                             </div>
                          </div>
                        </div>

                        <div className="flex gap-3 pt-4">
                           <button 
                             type="button" 
                             onClick={() => setIsEditingProfile(false)}
                             className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                           >
                             Cancelar
                           </button>
                           <button 
                             type="submit" 
                             className="flex-1 py-3 rounded-xl bg-school-primary text-white font-bold shadow-md hover:bg-school-dark transition-colors flex items-center justify-center gap-2"
                           >
                             <Save size={18} />
                             Guardar Cambios
                           </button>
                        </div>
                     </form>
                  ) : (
                     /* VIEW MODE */
                     <>
                        <h2 className="text-2xl font-display font-bold text-school-dark">{user.name}</h2>
                        <div className="flex justify-center gap-2 mt-2">
                           <span className="text-school-primary font-medium bg-school-light px-4 py-1 rounded-full text-sm capitalize">{user.role}</span>
                           {user.role === 'docente' && (
                              <span className="text-white font-medium bg-school-accent px-4 py-1 rounded-full text-sm capitalize">
                                {user.teacherType === 'tutor' ? 'Docente de Aula' : 'Docente de Curso'}
                              </span>
                           )}
                        </div>
                        
                        <div className="mt-8 grid grid-cols-2 gap-4 text-left">
                           <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Usuario</p>
                              <p className="font-medium text-slate-700">{user.username || user.name.split(' ')[0]}</p>
                           </div>
                           <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Institución</p>
                              <p className="font-medium text-slate-700">Smart School</p>
                           </div>
                           <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Email</p>
                              <p className="font-medium text-slate-700">{user.name.replace(' ', '.').toLowerCase()}@smartschool.edu.pe</p>
                           </div>
                           {user.role === 'docente' && currentTeacherProfile && (
                             <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs text-slate-400 uppercase font-bold mb-1">Aula Asignada</p>
                                <p className="font-medium text-slate-700">{currentTeacherProfile.assignedGrade}</p>
                             </div>
                           )}
                           <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                              <p className="text-xs text-slate-400 uppercase font-bold mb-1">Contraseña</p>
                              <p className="font-medium text-slate-700">••••••••</p>
                           </div>
                        </div>
                     </>
                  )}
               </div>
            </div>
         );

      case 'attendance-control':
        // Administration -> Teacher Attendance Only
        return (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center">
                <div>
                   <h2 className="text-xl font-display font-bold text-school-dark">Control de Asistencias</h2>
                   <p className="text-slate-500 text-sm">Gestión de asistencia docente</p>
                </div>
             </div>
             
             <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50 flex gap-4">
                   <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Buscar docente..." 
                        value={teacherSearch}
                        onChange={(e) => setTeacherSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-school-primary"
                      />
                   </div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-white text-slate-500 font-semibold text-xs uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Docente</th>
                      <th className="p-4">Entrada</th>
                      <th className="p-4">Salida</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredTeachers.map(teacher => {
                      // Find existing record for today
                      const today = new Date().toISOString().split('T')[0];
                      const existingRecord = teacherAttendance.find(r => r.teacherName === teacher.name && r.date === today);
                      const tempRecord = tempTeacherAttendance[teacher.id];

                      const entryVal = tempRecord?.entryTime !== undefined ? tempRecord.entryTime : (existingRecord?.entryTime || '');
                      const exitVal = tempRecord?.exitTime !== undefined ? tempRecord.exitTime : (existingRecord?.exitTime || '');
                      const statusVal = tempRecord?.status !== undefined ? tempRecord.status : (existingRecord?.status || 'Puntual');

                      return (
                        <tr key={teacher.id} className="hover:bg-slate-50">
                          <td className="p-4 font-medium text-slate-700">{teacher.name}</td>
                          <td className="p-4">
                            <input 
                              type="time" 
                              className="bg-slate-100 border-none rounded px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-school-primary"
                              value={entryVal}
                              onChange={(e) => handleTeacherAttendanceChange(teacher.id, 'entryTime', e.target.value)}
                            />
                          </td>
                          <td className="p-4">
                            <input 
                              type="time" 
                              className="bg-slate-100 border-none rounded px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-school-primary"
                              value={exitVal}
                              onChange={(e) => handleTeacherAttendanceChange(teacher.id, 'exitTime', e.target.value)}
                            />
                          </td>
                          <td className="p-4">
                            <select
                              className="bg-slate-100 border-none rounded px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-school-primary"
                              value={statusVal}
                              onChange={(e) => handleTeacherAttendanceChange(teacher.id, 'status', e.target.value)}
                            >
                              <option value="Puntual">Puntual</option>
                              <option value="Tarde">Tarde</option>
                              <option value="Falta">Falta</option>
                            </select>
                          </td>
                          <td className="p-4 text-right">
                            <button 
                              onClick={() => saveTeacherAttendance(teacher)}
                              className="text-school-primary hover:text-school-dark p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Guardar"
                            >
                              <Save size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
             </div>
          </div>
        );

      case 'schedule-control':
        const adminDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        const editingSchedules = schedules.filter(s => s.grade === editingScheduleGrade);
        
        // If no grade selected, show selection grid (similar to View Schedules)
        if (!editingScheduleGrade) {
            return (
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-xl font-display font-bold text-amber-600">Gestión de Horarios</h2>
                        <p className="text-slate-500 text-sm">Selecciona un aula para editar o crear su horario.</p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {CLASSROOMS.map(classroom => {
                            const count = schedules.filter(s => s.grade === classroom).length;
                            return (
                                <button
                                    key={classroom}
                                    onClick={() => setEditingScheduleGrade(classroom)}
                                    className="p-6 rounded-xl border border-amber-100 bg-white hover:border-school-accent hover:shadow-md transition-all text-left relative group flex flex-col items-center justify-center gap-3"
                                >
                                    <div className="w-12 h-12 rounded-full bg-amber-50 text-school-accent flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                                        <Edit3 size={24} />
                                    </div>
                                    <span className="font-bold text-school-dark text-center">{classroom}</span>
                                    <span className="text-xs text-slate-400">{count} clases configuradas</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            );
        }

        // If grade selected, show visual editor
        return (
            <div className="space-y-6">
                {/* Success Toast */}
                {scheduleSuccessMsg && (
                   <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-5 z-50">
                       <CheckCircle size={20} />
                       {scheduleSuccessMsg}
                   </div>
                )}

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button 
                           onClick={() => setEditingScheduleGrade(null)} 
                           className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                        >
                           <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-display font-bold text-school-dark">Editando: {editingScheduleGrade}</h2>
                            <p className="text-slate-500 text-sm">Organiza las clases para este grado</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={openAddScheduleModal} 
                            className="bg-school-light text-school-primary border border-school-primary/20 px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-school-primary hover:text-white transition-all"
                        >
                            <Plus size={18} />
                            Agregar Clase
                        </button>
                        <button 
                            onClick={handlePublishSchedules} 
                            className="bg-amber-500 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:bg-amber-600 transition-colors flex items-center gap-2"
                        >
                            <Upload size={18} />
                            Publicar Cambios
                        </button>
                    </div>
                </div>

                {/* Visual Grid Editor */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {adminDays.map(day => (
                        <div key={day} className="space-y-3">
                            <div className="bg-school-dark text-white text-center py-3 rounded-xl font-bold text-sm shadow-sm sticky top-0 z-10">
                                {day}
                            </div>
                            <div className="space-y-2 min-h-[200px] bg-slate-50/50 p-2 rounded-xl border border-dashed border-slate-200">
                                {editingSchedules
                                    .filter(s => s.day === day)
                                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                                    .map(session => (
                                    <div key={session.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-school-dark text-sm truncate pr-4">{session.subject}</span>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => openEditScheduleModal(session)} className="text-school-primary hover:bg-blue-50 p-1 rounded">
                                                    <Edit3 size={14} />
                                                </button>
                                                <button onClick={() => handleDeleteSchedule(session.id)} className="text-red-400 hover:bg-red-50 p-1 rounded">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-school-secondary font-medium mt-1">
                                            <UserCheck size={12} />
                                            <span>{session.teacherName || 'Sin docente'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                            <Clock size={12} />
                                            <span>{session.startTime} - {session.endTime}</span>
                                        </div>
                                    </div>
                                ))}
                                {editingSchedules.filter(s => s.day === day).length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full text-slate-300 py-4">
                                        <span className="text-xs italic">Sin clases</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* ADD/EDIT MODAL */}
                {isScheduleModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-school-dark/50 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-school-dark">
                                    {editingScheduleId ? 'Editar Clase' : 'Nueva Clase'}
                                </h3>
                                <button onClick={() => setIsScheduleModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>
                            
                            <form onSubmit={handleSaveScheduleItem} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 mb-1 block">Curso / Materia</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej. Matemáticas"
                                        className="w-full p-3 bg-school-light border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-school-primary"
                                        value={scheduleForm.subject}
                                        onChange={e => setScheduleForm({...scheduleForm, subject: e.target.value})}
                                        required
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Día</label>
                                        <select 
                                            className="w-full p-3 bg-school-light border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-school-primary"
                                            value={scheduleForm.day}
                                            onChange={e => setScheduleForm({...scheduleForm, day: e.target.value})}
                                        >
                                            {adminDays.map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Docente</label>
                                        <select 
                                            className="w-full p-3 bg-school-light border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-school-primary"
                                            value={scheduleForm.teacherName}
                                            onChange={e => setScheduleForm({...scheduleForm, teacherName: e.target.value})}
                                        >
                                            <option value="">Seleccionar</option>
                                            {teachers.map(t => (
                                                <option key={t.id} value={t.name}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Hora Inicio</label>
                                        <input 
                                            type="time" 
                                            className="w-full p-3 bg-school-light border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-school-primary"
                                            value={scheduleForm.startTime}
                                            onChange={e => setScheduleForm({...scheduleForm, startTime: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 mb-1 block">Hora Fin</label>
                                        <input 
                                            type="time" 
                                            className="w-full p-3 bg-school-light border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-school-primary"
                                            value={scheduleForm.endTime}
                                            onChange={e => setScheduleForm({...scheduleForm, endTime: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsScheduleModalOpen(false)}
                                        className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 py-3 bg-school-primary text-white rounded-xl font-bold shadow-lg hover:bg-school-dark transition-colors"
                                    >
                                        {editingScheduleId ? 'Guardar Cambios' : 'Agregar Clase'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );

      case 'manage-accounts':
        return (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-display font-bold text-school-dark">Gestión de Cuentas</h2>
                <p className="text-slate-500 text-sm">Crear, modificar o eliminar usuarios del sistema</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                   <h3 className="font-bold text-slate-700 mb-4">Nueva Cuenta</h3>
                   <form onSubmit={handleAddAccount} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Nombre y Apellido</label>
                        <input 
                          type="text" 
                          value={newAccount.name}
                          onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                          placeholder="Nombre completo"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Usuario</label>
                        <input 
                          type="text" 
                          value={newAccount.username}
                          onChange={(e) => setNewAccount({...newAccount, username: e.target.value})}
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                          placeholder="Usuario de acceso"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Contraseña</label>
                        <input 
                          type="password" 
                          value={newAccount.password}
                          onChange={(e) => setNewAccount({...newAccount, password: e.target.value})}
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                          placeholder="••••••••"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Rol</label>
                        <select 
                           value={newAccount.role}
                           onChange={(e) => setNewAccount({...newAccount, role: e.target.value as 'admin' | 'docente'})}
                           className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                        >
                           <option value="docente">Docente</option>
                           <option value="admin">Administrador</option>
                        </select>
                      </div>
                      
                      {newAccount.role === 'docente' && (
                        <div>
                          <label className="text-xs font-bold text-slate-500 mb-1 block">Tipo Docente</label>
                          <select 
                             value={newAccount.teacherType}
                             onChange={(e) => setNewAccount({...newAccount, teacherType: e.target.value as 'tutor' | 'course'})}
                             className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                          >
                             <option value="course">Docente de Curso</option>
                             <option value="tutor">Docente de Aula (Tutor)</option>
                          </select>
                          <p className="text-xs text-slate-400 mt-1">
                            {newAccount.teacherType === 'tutor' 
                              ? '* Puede marcar asistencia en su aula' 
                              : '* Solo puede ver información'}
                          </p>
                        </div>
                      )}

                      <button type="submit" className="w-full py-3 bg-school-primary text-white rounded-xl font-bold shadow-md hover:bg-school-dark transition-colors">
                        Crear Cuenta
                      </button>
                   </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                       <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="Buscar cuenta..." 
                            value={accountSearch}
                            onChange={e => setAccountSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-school-primary"
                          />
                       </div>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="bg-white text-slate-500 font-semibold text-xs uppercase sticky top-0 shadow-sm">
                          <tr>
                            <th className="p-4 bg-slate-50">Usuario</th>
                            <th className="p-4 bg-slate-50">Nombre</th>
                            <th className="p-4 bg-slate-50">Rol</th>
                            <th className="p-4 bg-slate-50 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {filteredAccounts.map(acc => (
                            <tr key={acc.id} className="hover:bg-slate-50">
                              <td className="p-4 font-bold text-school-primary flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{backgroundColor: acc.profileColor || '#0EA5E9'}}>
                                    {acc.name.charAt(0)}
                                </div>
                                {acc.username}
                              </td>
                              <td className="p-4 text-slate-700">{acc.name}</td>
                              <td className="p-4">
                                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${acc.role === 'admin' ? 'bg-school-dark text-white' : 'bg-blue-100 text-blue-600'}`}>
                                    {acc.role === 'admin' ? 'ADMIN' : 'DOCENTE'}
                                 </span>
                                 {acc.role === 'docente' && (
                                   <div className="text-xs text-slate-400 mt-1 capitalize">
                                      {acc.teacherType === 'tutor' ? 'Tutor' : 'Curso'}
                                   </div>
                                 )}
                              </td>
                              <td className="p-4 text-right">
                                <button onClick={() => handleDeleteAccount(acc.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
             </div>
          </div>
        );

      case 'manage-students':
        return (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-display font-bold text-school-dark">Gestión de Estudiantes</h2>
                <p className="text-slate-500 text-sm">Agregar nuevos alumnos a la base de datos</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
               {/* Add Form */}
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                  <h3 className="font-bold text-slate-700 mb-4">Agregar Alumno</h3>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Nombre Completo</label>
                        <input 
                          type="text" 
                          value={newStudent.name}
                          onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                          placeholder="Ej. Juan Perez"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                       <div>
                          <label className="text-xs font-bold text-slate-500 mb-1 block">DNI</label>
                          <input 
                            type="text" 
                            value={newStudent.dni || ''}
                            onChange={(e) => setNewStudent({...newStudent, dni: e.target.value})}
                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                            placeholder="00000000"
                          />
                       </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 mb-1 block">Nacimiento</label>
                          <input 
                            type="date" 
                            value={newStudent.birthDate || ''}
                            onChange={(e) => setNewStudent({...newStudent, birthDate: e.target.value})}
                            className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                          />
                       </div>
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Nombre del Padre</label>
                        <input 
                          type="text" 
                          value={newStudent.fatherName || ''}
                          onChange={(e) => setNewStudent({...newStudent, fatherName: e.target.value})}
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                          placeholder="Nombre del padre"
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Nombre de la Madre</label>
                        <input 
                          type="text" 
                          value={newStudent.motherName || ''}
                          onChange={(e) => setNewStudent({...newStudent, motherName: e.target.value})}
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                          placeholder="Nombre de la madre"
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Institución de Origen</label>
                        <input 
                          type="text" 
                          value={newStudent.originSchool || ''}
                          onChange={(e) => setNewStudent({...newStudent, originSchool: e.target.value})}
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                          placeholder="Colegio anterior"
                        />
                     </div>
                     <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Grado</label>
                        <select 
                          value={newStudent.grade}
                          onChange={(e) => setNewStudent({...newStudent, grade: e.target.value})}
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                        >
                          <option value="">Seleccionar</option>
                          {CLASSROOMS.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                     </div>
                     <button type="submit" className="w-full py-3 bg-school-primary text-white rounded-xl font-bold shadow-md hover:bg-school-dark transition-colors">
                        Registrar Alumno
                     </button>
                  </form>
               </div>

               {/* List */}
               <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 bg-slate-50">
                     <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text" 
                          placeholder="Buscar por nombre..." 
                          value={studentSearch}
                          onChange={e => setStudentSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-school-primary"
                        />
                     </div>
                  </div>
                  <div className="max-h-[700px] overflow-y-auto">
                    <table className="w-full text-left">
                      <thead className="bg-white text-slate-500 font-semibold text-xs uppercase sticky top-0 shadow-sm">
                        <tr>
                          <th className="p-4 bg-slate-50">Nombre</th>
                          <th className="p-4 bg-slate-50">DNI</th>
                          <th className="p-4 bg-slate-50">Grado</th>
                          <th className="p-4 bg-slate-50 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredStudents.map(student => (
                          <tr key={student.id} className="hover:bg-slate-50">
                            <td className="p-4 font-medium text-slate-700">{student.name}</td>
                            <td className="p-4 text-slate-500">{student.dni || '-'}</td>
                            <td className="p-4 text-slate-500">{student.grade}</td>
                            <td className="p-4 text-right">
                              <button onClick={() => handleDeleteStudent(student.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
            </div>
          </div>
        );

      case 'manage-teachers':
        return (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <h2 className="text-xl font-display font-bold text-school-dark">Gestión de Docentes</h2>
                <p className="text-slate-500 text-sm">Administrar plana docente</p>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                   <h3 className="font-bold text-slate-700 mb-4">Agregar Docente</h3>
                   <form onSubmit={handleAddTeacher} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Nombre</label>
                        <input 
                          type="text" 
                          value={newTeacher.name}
                          onChange={(e) => setNewTeacher({...newTeacher, name: e.target.value})}
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                          placeholder="Nombre del docente"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Especialidad</label>
                        <input 
                          type="text" 
                          value={newTeacher.specialty}
                          onChange={(e) => setNewTeacher({...newTeacher, specialty: e.target.value})}
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                          placeholder="Ej. Matemáticas"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                         <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Tipo Docente</label>
                           <select 
                              value={newTeacher.teacherType}
                              onChange={(e) => setNewTeacher({...newTeacher, teacherType: e.target.value as any})}
                              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                           >
                              <option value="course">Curso</option>
                              <option value="tutor">Aula (Tutor)</option>
                           </select>
                         </div>
                         <div>
                           <label className="text-xs font-bold text-slate-500 mb-1 block">Aula Asignada</label>
                           <select 
                              value={newTeacher.assignedGrade}
                              onChange={(e) => setNewTeacher({...newTeacher, assignedGrade: e.target.value})}
                              className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                           >
                              <option value="">Seleccionar</option>
                              {CLASSROOMS.map(c => (
                                 <option key={c} value={c}>{c}</option>
                              ))}
                           </select>
                         </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 mb-1 block">Email</label>
                        <input 
                          type="email" 
                          value={newTeacher.email}
                          onChange={(e) => setNewTeacher({...newTeacher, email: e.target.value})}
                          className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:border-school-primary"
                          placeholder="correo@smartschool.edu.pe"
                        />
                      </div>
                      <button type="submit" className="w-full py-3 bg-school-primary text-white rounded-xl font-bold shadow-md hover:bg-school-dark transition-colors">
                        Registrar Docente
                      </button>
                   </form>
                </div>

                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50">
                       <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <input 
                            type="text" 
                            placeholder="Buscar docente..." 
                            value={teacherSearch}
                            onChange={e => setTeacherSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-school-primary"
                          />
                       </div>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      <table className="w-full text-left">
                        <thead className="bg-white text-slate-500 font-semibold text-xs uppercase sticky top-0 shadow-sm">
                          <tr>
                            <th className="p-4 bg-slate-50">Docente</th>
                            <th className="p-4 bg-slate-50">Rol</th>
                            <th className="p-4 bg-slate-50">Aula Asignada</th>
                            <th className="p-4 bg-slate-50 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {filteredTeachers.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50">
                              <td className="p-4">
                                <div className="font-medium text-slate-700">{t.name}</div>
                                <div className="text-xs text-slate-400">{t.email}</div>
                              </td>
                              <td className="p-4">
                                 <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.teacherType === 'tutor' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {t.teacherType === 'tutor' ? 'Tutor Aula' : 'Docente Curso'}
                                 </span>
                                 <div className="text-xs text-slate-400 mt-1">{t.specialty}</div>
                              </td>
                              <td className="p-4 text-slate-500">{t.assignedGrade || 'Sin asignar'}</td>
                              <td className="p-4 text-right">
                                <button onClick={() => handleDeleteTeacher(t.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                </div>
             </div>
          </div>
        );

      default:
        return <div className="p-8 text-center text-slate-500">Sección en construcción</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* VIRTUAL ASSISTANT FOR DASHBOARD */}
      <VirtualAssistant 
        context="dashboard" 
        userName={user.name}
        userRole={user.role} // Pass role for specific help logic 
        onNavigate={(section) => setActiveSection(section)}
      />

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full hidden lg:flex flex-col z-20">
        <div className="p-6 border-b border-slate-100">
          <h1 className="font-display font-bold text-xl text-school-primary tracking-tight">SmartBoard</h1>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          {menuSections.map((section, idx) => {
             const filteredItems = section.items.filter(item => {
                if (user.role === 'admin') return true;
                return !item.role;
             });

             if (filteredItems.length === 0) return null;

             return (
                <div key={idx}>
                  <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 px-2 ${section.title === 'Administración' ? 'text-school-accent' : 'text-school-primary'}`}>{section.title}</h3>
                  <div className="space-y-1">
                    {filteredItems.map((item) => {
                      const isAdminItem = section.title === 'Administración';
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveSection(item.id)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeSection === item.id 
                              ? (isAdminItem ? 'bg-amber-50 text-school-accent' : 'bg-school-light text-school-primary')
                              : (isAdminItem ? 'text-amber-600 hover:bg-amber-50 hover:text-amber-700' : 'text-slate-600 hover:bg-slate-50 hover:text-school-dark')
                          }`}
                        >
                          <div className="flex items-center gap-3">
                             {item.icon}
                             {item.label}
                          </div>
                          
                          {/* Notification Dot for Sidebar */}
                          {item.badge && item.badge > 0 && (
                             <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
             );
          })}
        </div>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setLogoutConfirm(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8">
         <header className="flex justify-between items-center mb-8 lg:hidden">
            <h1 className="font-display font-bold text-xl text-school-primary">SmartBoard</h1>
            <button onClick={() => setLogoutConfirm(true)} className="p-2 text-red-500 bg-red-50 rounded-lg"><LogOut size={20}/></button>
         </header>

         {/* Back Button - Show only when not on main dashboard */}
         {activeSection !== 'dashboard' && (
            <button 
              onClick={() => setActiveSection('dashboard')} 
              className="mb-6 flex items-center gap-2 text-slate-500 hover:text-school-primary transition-colors font-semibold group"
            >
               <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
               <span>Volver al Inicio</span>
            </button>
         )}

         {renderContent()}
      </main>

      {/* Logout Confirmation Modal */}
      {logoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-school-dark/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center space-y-4 animate-in fade-in zoom-in duration-200">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <AlertCircle size={24} />
                </div>
                <div>
                   <h3 className="text-lg font-bold text-slate-800">¿Cerrar Sesión?</h3>
                   <p className="text-slate-500 text-sm mt-1">¿Estás seguro de que deseas salir del sistema?</p>
                </div>
                <div className="flex gap-3 pt-2">
                    <button
                        onClick={() => setLogoutConfirm(false)}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => { setLogoutConfirm(false); onLogout(); }}
                        className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 shadow-md shadow-red-200 transition-colors"
                    >
                        Sí, salir
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};