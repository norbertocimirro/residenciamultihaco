import React, { useState, useEffect } from 'react';
import { 
  Menu, Bell, Search, Home, Book, Calendar, BarChart, 
  ChevronDown, ChevronRight, Plus, FileText, 
  MessageSquare, Folder, CheckCircle, Upload, Download,
  ToggleLeft, ToggleRight, Layout, GripVertical, Trash2,
  Shield, UserPlus, CheckSquare, X, Link, Paperclip
} from 'lucide-react';

// ==========================================
// BANCO DE USUÁRIOS DO SISTEMA (SIMULAÇÃO)
// ==========================================
const SYSTEM_USERS = {
  'admin1': { id: 'admin1', nome: 'Gestão COREMU', role: 'admin', avatar: 'GC' },
  'prof1': { id: 'prof1', nome: '1º Ten Norberto Cimirro', role: 'professor', avatar: 'NC' },
  'prof2': { id: 'prof2', nome: 'Dra. Renata Gonçalves', role: 'professor', avatar: 'RG' },
  'stu1': { id: 'stu1', nome: 'Mariana Alves', role: 'aluno', avatar: 'MA' },
  'stu2': { id: 'stu2', nome: 'João Barcelos', role: 'aluno', avatar: 'JB' },
  'stu3': { id: 'stu3', nome: 'Carlos Bastos', role: 'aluno', avatar: 'CB' }
};

export default function LmsEnterprisePortal() {
  const [activeUserId, setActiveUserId] = useState('admin1');
  const currentUser = SYSTEM_USERS[activeUserId];
  const role = currentUser.role;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('admin_dashboard'); 
  const [editMode, setEditMode] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(null);

  const canEdit = editMode && (role === 'admin' || role === 'professor');

  const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      } catch (error) {
        return initialValue;
      }
    });
    useEffect(() => {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    }, [key, storedValue]);
    return [storedValue, setStoredValue];
  };

  const [courses, setCourses] = useLocalStorage('lms_v4_courses', [
    { id: 'c1', codigo: '001/003/07A', nome: 'Enfermagem Forense e Saúde da Família', professorId: 'prof1' },
    { id: 'c2', codigo: 'RMAB001', nome: 'Territorialização e Diagnóstico de Saúde', professorId: 'prof2' }
  ]);

  const defaultModules = [
    {
      id: 'boas_vindas', title: 'Mural de Boas-vindas', bgColor: 'bg-blue-50/50', borderColor: 'border-blue-100',
      items: [{ id: 'i1', title: 'Plano de Ensino', type: 'FileText', color: 'text-red-500' }]
    },
    {
      id: 'atividades', title: 'Atividades Avaliativas', bgColor: 'bg-emerald-50/50', borderColor: 'border-emerald-100',
      items: [{ id: 'i2', title: 'Envio de Relatório Técnico', type: 'Upload', color: 'text-teal-600' }]
    }
  ];

  const [courseContents, setCourseContents] = useLocalStorage('lms_v4_contents', {
    'c1': defaultModules,
    'c2': defaultModules
  });

  const [courseStudents, setCourseStudents] = useLocalStorage('lms_v4_students', {
    'c1': [
      { studentId: 'stu1', ga: 8.6, gb: 7.4, gc: 0, faltas: [false, false, false], feedback: "Ótimo desempenho." },
      { studentId: 'stu2', ga: 2.9, gb: 5.8, gc: 0, faltas: [true, true, true], feedback: "Atenção às faltas." }
    ],
    'c2': [
      { studentId: 'stu1', ga: 9.0, gb: 8.5, gc: 0, faltas: [false, false, false], feedback: "" },
      { studentId: 'stu3', ga: 7.5, gb: 8.0, gc: 0, faltas: [false, false, true], feedback: "Participativo." }
    ]
  });

  const [expandedModules, setExpandedModules] = useState({});

  // ==========================================
  // ESTADOS DO MODAL DE RECURSOS 
  // ==========================================
  const [activeSectionForNewItem, setActiveSectionForNewItem] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('FileText');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newFile, setNewFile] = useState(null); // Estado para guardar o arquivo real selecionado

  const visibleCourses = courses.filter(c => {
    if (role === 'admin') return true;
    if (role === 'professor') return c.professorId === currentUser.id;
    if (role === 'aluno') {
      const enrolled = courseStudents[c.id] || [];
      return enrolled.some(enrollment => enrollment.studentId === currentUser.id);
    }
    return false;
  });

  const switchUser = (userId) => {
    setActiveUserId(userId);
    setEditMode(false);
    
    const newRole = SYSTEM_USERS[userId].role;
    const newVisibleCourses = courses.filter(c => {
      if (newRole === 'admin') return true;
      if (newRole === 'professor') return c.professorId === userId;
      if (newRole === 'aluno') return (courseStudents[c.id] || []).some(e => e.studentId === userId);
      return false;
    });

    if (newRole === 'admin') {
      setCurrentView('admin_dashboard');
      setActiveCourseId(null);
    } else {
      if (newVisibleCourses.length > 0) {
        setActiveCourseId(newVisibleCourses[0].id);
        setCurrentView('course_home');
      } else {
        setActiveCourseId(null);
        setCurrentView('empty_state');
      }
    }
  };

  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseProfId, setNewCourseProfId] = useState('');
  const [newStudentId, setNewStudentId] = useState('');

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName || !newCourseProfId) return;
    const newId = `c_${Date.now()}`;
    
    setCourses([...courses, { id: newId, codigo: newCourseCode, nome: newCourseName, professorId: newCourseProfId }]);
    setCourseContents({ ...courseContents, [newId]: defaultModules });
    setCourseStudents({ ...courseStudents, [newId]: [] });
    
    setNewCourseCode(''); setNewCourseName(''); setNewCourseProfId('');
    alert('Disciplina criada e atribuída com sucesso!');
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm('Atenção: Excluir esta disciplina apagará todo o conteúdo, notas e alunos. Confirmar?')) {
      setCourses(courses.filter(c => c.id !== id));
      if (activeCourseId === id) {
        setActiveCourseId(null);
        setCurrentView('admin_dashboard');
      }
    }
  };

  const handleEnrollStudent = (e, courseId) => {
    e.preventDefault();
    if (!newStudentId) return;
    const newStudentData = {
      studentId: newStudentId, ga: 0, gb: 0, gc: 0, faltas: [false, false, false], feedback: ""
    };
    setCourseStudents({ ...courseStudents, [courseId]: [...(courseStudents[courseId] || []), newStudentData] });
    setNewStudentId('');
  };

  const activeContent = courseContents[activeCourseId] || [];
  const rawActiveStudents = courseStudents[activeCourseId] || [];
  const activeCourseObj = courses.find(c => c.id === activeCourseId);

  const studentsInCourse = rawActiveStudents.map(enrollment => ({
    ...enrollment,
    nome: SYSTEM_USERS[enrollment.studentId]?.nome || 'Usuário Desconhecido'
  }));

  const visibleGradesAndAttendance = role === 'aluno' 
    ? studentsInCourse.filter(s => s.studentId === currentUser.id) 
    : studentsInCourse;

  const availableStudentsForEnrollment = Object.values(SYSTEM_USERS).filter(u => 
    u.role === 'aluno' && !rawActiveStudents.some(s => s.studentId === u.id)
  );

  const toggleModule = (id) => setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));

  const updateContent = (newContent) => setCourseContents({ ...courseContents, [activeCourseId]: newContent });

  const addSection = () => {
    const newSection = { id: `sec_${Date.now()}`, title: 'Novo Tópico / Módulo', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', items: [] };
    updateContent([...activeContent, newSection]);
    setExpandedModules(prev => ({ ...prev, [newSection.id]: true }));
  };

  const updateSectionTitle = (id, newTitle) => updateContent(activeContent.map(sec => sec.id === id ? { ...sec, title: newTitle } : sec));

  const deleteSection = (id) => {
    if (window.confirm('Excluir este módulo e todos os seus arquivos?')) updateContent(activeContent.filter(sec => sec.id !== id));
  };

  const updateItemTitle = (sectionId, itemId, newTitle) => {
    updateContent(activeContent.map(sec => sec.id === sectionId ? { ...sec, items: sec.items.map(item => item.id === itemId ? { ...item, title: newTitle } : item) } : sec));
  };

  const deleteItem = (sectionId, itemId) => updateContent(activeContent.map(sec => sec.id === sectionId ? { ...sec, items: sec.items.filter(item => item.id !== itemId) } : sec));

  // ==========================================
  // LÓGICA DO MODAL COM UPLOAD REAL
  // ==========================================
  const handleOpenAddItemModal = (sectionId) => {
    setActiveSectionForNewItem(sectionId);
    setNewItemTitle('');
    setNewItemType('FileText');
    setNewItemUrl('');
    setNewFile(null); // Reseta o arquivo ao abrir o modal
  };

  const handleConfirmAddItem = (e) => {
    e.preventDefault();
    if (!newItemTitle) return;

    let color = 'text-slate-500';
    if (newItemType === 'FileText') color = 'text-red-500';
    else if (newItemType === 'Link') color = 'text-blue-500';
    else if (newItemType === 'MessageSquare') color = 'text-purple-600';
    else if (newItemType === 'Upload') color = 'text-teal-600';

    updateContent(activeContent.map(sec => {
      if (sec.id === activeSectionForNewItem) {
        return {
          ...sec,
          items: [...sec.items, { 
            id: `item_${Date.now()}`, 
            title: newItemTitle, 
            type: newItemType, 
            color: color,
            url: newItemUrl || null,
            fileName: newFile ? newFile.name : null // Salva o nome do arquivo enviado
          }]
        };
      }
      return sec;
    }));
    setActiveSectionForNewItem(null); 
  };

  const updateGrade = (studentId, field, value) => {
    setCourseStudents({ ...courseStudents, [activeCourseId]: rawActiveStudents.map(s => s.studentId === studentId ? { ...s, [field]: parseFloat(value) || 0 } : s) });
  };

  const updateFeedback = (studentId, value) => {
    setCourseStudents({ ...courseStudents, [activeCourseId]: rawActiveStudents.map(s => s.studentId === studentId ? { ...s, feedback: value } : s) });
  };

  const toggleAttendance = (studentId, index) => {
    setCourseStudents({ ...courseStudents, [activeCourseId]: rawActiveStudents.map(s => {
        if (s.studentId === studentId) {
          const newFaltas = [...s.faltas];
          newFaltas[index] = !newFaltas[index]; 
          return { ...s, faltas: newFaltas };
        }
        return s;
    })});
  };

  const deleteStudent = (studentId) => {
    if (window.confirm('Remover a matrícula deste aluno?')) {
      setCourseStudents({ ...courseStudents, [activeCourseId]: rawActiveStudents.filter(s => s.studentId !== studentId) });
    }
  };

  const getIconComponent = (type) => {
    switch (type) {
      case 'FileText': return FileText;
      case 'MessageSquare': return MessageSquare;
      case 'Folder': return Folder;
      case 'Upload': return Upload;
      case 'CheckCircle': return CheckCircle;
      case 'Link': return Link;
      default: return FileText;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col flex-shrink-0 shadow-2xl z-20 relative`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {sidebarOpen && <span className="font-black text-white text-sm tracking-tight leading-tight">Portal <span className="text-teal-400">COREMU</span><br/>HACO</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
          <nav className="space-y-1 px-2">
            
            {role === 'admin' && (
              <>
                <button onClick={() => {setCurrentView('admin_dashboard'); setActiveCourseId(null); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors ${currentView === 'admin_dashboard' || currentView === 'admin_students' ? 'bg-teal-900/40 text-teal-400 border-l-4 border-teal-500' : 'hover:bg-slate-800 text-slate-400'}`}>
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Gestão COREMU</span>}
                </button>
                <div className="my-4 border-t border-slate-800 mx-2"></div>
              </>
            )}

            {(role === 'professor' || role === 'aluno') && (
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-sm transition-colors text-slate-400">
                <Home className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>Página Inicial</span>}
              </button>
            )}

            {sidebarOpen && <div className="mt-8 mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Disciplinas Ativas</div>}
            
            {visibleCourses.length === 0 ? (
              <div className="px-4 text-xs text-slate-600 italic mt-2">Nenhuma disciplina.</div>
            ) : (
              visibleCourses.map(c => (
                <div key={c.id}>
                  <button onClick={() => {setActiveCourseId(c.id); setCurrentView('course_home'); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${activeCourseId === c.id && currentView !== 'admin_dashboard' && currentView !== 'admin_students' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
                    <Book className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="truncate">{c.codigo}</span>}
                  </button>
                  
                  {activeCourseId === c.id && sidebarOpen && currentView !== 'admin_dashboard' && currentView !== 'admin_students' && (
                    <div className="ml-4 pl-4 border-l border-slate-700 mt-1 space-y-1">
                      <button onClick={() => setCurrentView('grades')} className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${currentView === 'grades' ? 'text-teal-400' : 'hover:bg-slate-800 text-slate-400'}`}>
                        <BarChart className="w-4 h-4 flex-shrink-0" /> Notas e Parecer
                      </button>
                      <button onClick={() => setCurrentView('attendance')} className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${currentView === 'attendance' ? 'text-teal-400' : 'hover:bg-slate-800 text-slate-400'}`}>
                        <CheckSquare className="w-4 h-4 flex-shrink-0" /> Diário de Frequência
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </nav>
        </div>

        {/* Simulador Avançado de Perfis */}
        {sidebarOpen && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 z-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Simular Login de Usuário</p>
            <select value={activeUserId} onChange={(e) => switchUser(e.target.value)} className="w-full bg-slate-800 text-xs font-bold text-slate-300 p-2 rounded border border-slate-700 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
              <optgroup label="Administração">
                <option value="admin1">Gestão COREMU (Admin)</option>
              </optgroup>
              <optgroup label="Docentes / Preceptores">
                <option value="prof1">1º Ten Norberto (Prof)</option>
                <option value="prof2">Dra. Renata (Prof)</option>
              </optgroup>
              <optgroup label="Residentes / Alunos">
                <option value="stu1">Mariana Alves (R1)</option>
                <option value="stu2">João Barcelos (R1)</option>
                <option value="stu3">Carlos Bastos (R1)</option>
              </optgroup>
            </select>
          </div>
        )}
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden sm:flex items-center text-sm font-semibold text-slate-600 gap-6">
              <span className="text-teal-800 font-bold py-5">Portal COREMU HACO</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 p-1.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{currentUser.nome}</p>
                <p className="text-[10px] text-slate-500 uppercase">{role === 'aluno' ? 'Residente' : role === 'professor' ? 'Docente/Preceptor' : 'Administração'}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-800 text-white flex items-center justify-center text-xs font-bold shadow-md border-2 border-teal-100">
                {currentUser.avatar}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f8f9fa]">
          <div className="max-w-5xl mx-auto">
            
            {currentView === 'admin_dashboard' && renderAdminDashboard()}
            {currentView === 'admin_students' && renderAdminStudents()}
            {currentView === 'empty_state' && renderEmptyState()}

            {activeCourseId && currentView !== 'admin_dashboard' && currentView !== 'admin_students' && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                      {activeCourseObj?.nome}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">{activeCourseObj?.codigo} • Professor Titular: {SYSTEM_USERS[activeCourseObj?.professorId]?.nome}</p>
                  </div>
                  
                  {(role === 'professor' || role === 'admin') && (
                    <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm">
                      <span className="text-xs font-bold text-slate-600 px-2 hidden sm:inline">Modo de Edição</span>
                      <button onClick={() => setEditMode(!editMode)} className={`flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition-all ${editMode ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        {editMode ? <ToggleRight className="w-4 h-4 mr-1"/> : <ToggleLeft className="w-4 h-4 mr-1"/>}
                        {editMode ? 'Ativo' : 'Inativo'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center text-xs text-slate-500 mb-6 bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                  <span className="hover:text-slate-800">Portal COREMU</span>
                  <ChevronRight className="w-3 h-3 mx-2" />
                  <span className="font-bold text-teal-700">{activeCourseObj?.codigo}</span>
                  <ChevronRight className="w-3 h-3 mx-2" />
                  <span className="text-slate-700 font-bold">{
                    currentView === 'course_home' ? 'Mural da Disciplina' : 
                    currentView === 'grades' ? 'Boletim de Notas' : 'Diário de Classe'
                  }</span>
                </div>

                {/* ========================================================================= */}
                {/* INÍCIO DO COURSE_HOME E MODAL */}
                {/* ========================================================================= */}
                {currentView === 'course_home' && (
                  <div className="animate-fade-in relative">
                    
                    {/* MODAL DE ADICIONAR RECURSOS COM UPLOAD REAL */}
                    {activeSectionForNewItem && (
                      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
                          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-black text-slate-800">Adicionar uma atividade ou recurso</h3>
                            <button onClick={() => setActiveSectionForNewItem(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
                          </div>
                          <form onSubmit={handleConfirmAddItem} className="p-6 space-y-5">
                            <div>
                              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Nome do Recurso</label>
                              <input type="text" required value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} placeholder="Ex: Aula 01 - Fundamentos" className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                            </div>
                            
                            <div>
                              <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Tipo de Material</label>
                              <div className="grid grid-cols-2 gap-3">
                                <div onClick={() => setNewItemType('FileText')} className={`cursor-pointer border p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${newItemType === 'FileText' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                  <FileText className="w-6 h-6"/><span className="text-xs font-bold">Arquivo/PDF</span>
                                </div>
                                <div onClick={() => setNewItemType('Link')} className={`cursor-pointer border p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${newItemType === 'Link' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                  <Link className="w-6 h-6"/><span className="text-xs font-bold">Vídeo/Link</span>
                                </div>
                                <div onClick={() => setNewItemType('MessageSquare')} className={`cursor-pointer border p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${newItemType === 'MessageSquare' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                  <MessageSquare className="w-6 h-6"/><span className="text-xs font-bold">Fórum</span>
                                </div>
                                <div onClick={() => setNewItemType('Upload')} className={`cursor-pointer border p-3 rounded-lg flex flex-col items-center gap-2 transition-all ${newItemType === 'Upload' ? 'border-teal-500 bg-teal-50 text-teal-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                                  <Upload className="w-6 h-6"/><span className="text-xs font-bold">Tarefa (Envio)</span>
                                </div>
                              </div>
                            </div>

                            {/* CAMPOS DE UPLOAD E LINK */}
                            {(newItemType === 'Link' || newItemType === 'FileText') && (
                              <div className="animate-fade-in border-t pt-4">
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                                  {newItemType === 'Link' ? 'URL do Link Externo' : 'Anexar Arquivo'}
                                </label>
                                {newItemType === 'Link' ? (
                                  <input type="url" value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} placeholder="https://..." className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                                ) : (
                                  <input 
                                    type="file" 
                                    onChange={(e) => setNewFile(e.target.files[0])} 
                                    className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer text-slate-500" 
                                  />
                                )}
                              </div>
                            )}

                            <div className="pt-2">
                              <button type="submit" className="w-full bg-teal-800 text-white font-bold p-3 rounded-lg hover:bg-teal-900 transition shadow-md">
                                Salvar e Adicionar ao Curso
                              </button>
                            </div>
                          </form>
                        </div>
                      </div>
                    )}

                    {canEdit && (
                      <div onClick={addSection} className="mb-6 border border-dashed border-teal-400 rounded-lg p-4 text-center bg-teal-50/50 hover:bg-teal-100 cursor-pointer transition text-teal-700 font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
                        <Plus className="w-5 h-5"/> Adicionar novo Tópico / Módulo
                      </div>
                    )}

                    {activeContent.length === 0 && (
                      <div className="text-center p-12 bg-white rounded-xl border border-slate-200 text-slate-500">
                        <Book className="w-12 h-12 mx-auto mb-3 text-slate-300"/>
                        <p className="font-bold text-lg text-slate-700">O professor ainda não publicou conteúdos.</p>
                      </div>
                    )}

                    {activeContent.map(section => (
                      <div key={section.id} className={`mb-6 rounded-lg border ${section.borderColor} overflow-hidden shadow-sm bg-white`}>
                        <div className={`flex items-center justify-between p-3 ${section.bgColor} border-b ${section.borderColor}`}>
                          <div className="flex items-center gap-3 w-full">
                            <button onClick={() => toggleModule(section.id)} className="p-1 hover:bg-slate-200 rounded">
                              {expandedModules[section.id] !== false ? <ChevronDown className="w-5 h-5 text-slate-500"/> : <ChevronRight className="w-5 h-5 text-slate-500"/>}
                            </button>
                            {canEdit ? (
                              <input type="text" value={section.title} onChange={(e) => updateSectionTitle(section.id, e.target.value)} className="bg-white border border-slate-300 rounded px-2 py-1 text-base font-bold text-slate-800 w-full max-w-md focus:ring-2 focus:ring-teal-500 outline-none" />
                            ) : (
                              <h3 className="text-base font-bold text-slate-800 cursor-pointer" onClick={() => toggleModule(section.id)}>{section.title}</h3>
                            )}
                          </div>
                          {canEdit && (
                            <button onClick={() => deleteSection(section.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>

                        {expandedModules[section.id] !== false && (
                          <div className="p-0">
                            {section.items.map(item => {
                              const IconComponent = getIconComponent(item.type);
                              return (
                                <div key={item.id} className="flex items-start justify-between p-4 border-b border-slate-100 hover:bg-slate-50 group">
                                  <div className="flex items-start gap-3 w-full">
                                    {canEdit && <GripVertical className="w-4 h-4 text-slate-300 cursor-move mt-1" />}
                                    <IconComponent className={`w-5 h-5 ${item.color} flex-shrink-0 mt-0.5`} />
                                    <div className="flex-1">
                                      {canEdit ? (
                                        <input type="text" value={item.title} onChange={(e) => updateItemTitle(section.id, item.id, e.target.value)} className="bg-white border border-slate-300 rounded px-2 py-1 text-sm font-semibold text-slate-800 w-full max-w-md focus:ring-2 focus:ring-teal-500 outline-none" />
                                      ) : (
                                        <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                                      )}
                                      
                                      {/* Mostra indicação visual do arquivo/link se existir */}
                                      {!canEdit && item.fileName && (
                                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mt-1 bg-slate-100 w-fit px-2 py-0.5 rounded border border-slate-200">
                                          <Paperclip className="w-3 h-3"/> {item.fileName}
                                        </div>
                                      )}
                                      {!canEdit && item.url && (
                                        <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline mt-1 bg-blue-50 w-fit px-2 py-0.5 rounded border border-blue-100">
                                          <Link className="w-3 h-3"/> Acessar Link Externo
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                  {canEdit && (
                                    <button onClick={() => deleteItem(section.id, item.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors ml-2"><Trash2 className="w-4 h-4" /></button>
                                  )}
                                </div>
                              );
                            })}
                            {canEdit && (
                              <div className="p-3 border-t border-dashed border-slate-300 bg-slate-50 flex justify-end">
                                <button onClick={() => handleOpenAddItemModal(section.id)} className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-md border border-teal-100 shadow-sm transition hover:shadow-md">
                                  <Plus className="w-4 h-4"/> Adicionar material ou recurso
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* ========================================================================= */}
                {/* FIM DO COURSE_HOME E MODAL */}
                {/* ========================================================================= */}

                {currentView === 'grades' && renderGradebook()}
                {currentView === 'attendance' && renderAttendance()}
              </>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
