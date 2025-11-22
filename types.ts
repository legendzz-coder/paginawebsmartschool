
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';

export interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export interface Laureate {
  name: string;
  image: string; // placeholder url
  role: string;
  desc: string;
}

export interface Student {
  id: string;
  name: string;
  grade: string;
  attendance?: 'present' | 'absent' | 'late' | 'none';
  // Biography fields
  fatherName?: string;
  motherName?: string;
  dni?: string;
  birthDate?: string;
  originSchool?: string;
}

export interface Teacher {
  id: string;
  name: string;
  specialty: string;
  email: string;
  assignedGrade: string; // The classroom assigned to the teacher
  teacherType: 'tutor' | 'course'; // 'tutor' (Classroom Teacher) or 'course' (Course Teacher)
}

export interface ScheduleItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  subject: string;
  grade: string;
  teacherName?: string; // Assigned teacher for this schedule slot
}

export interface TeacherAttendance {
  id: string;
  teacherName: string;
  date: string;
  entryTime: string;
  exitTime: string;
  status: 'Puntual' | 'Tarde' | 'Falta';
}

export interface ChatMessage {
  id: string;
  sender: string;
  role: string;
  content: string;
  timestamp: string;
}

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'docente';
  teacherType?: 'tutor' | 'course';
  photoUrl?: string;
}
