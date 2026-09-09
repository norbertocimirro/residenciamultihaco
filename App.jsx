import React, { useState, useEffect } from 'react';
import { 
  Menu, Bell, Search, Home, Book, Calendar, BarChart, 
  ChevronDown, ChevronRight, Plus, FileText, 
  MessageSquare, Folder, CheckCircle, Upload, Download,
  ToggleLeft, ToggleRight, Layout, GripVertical, Trash2,
  Settings, Users, Shield, UserPlus, CheckSquare, GraduationCap
} from 'lucide-react';

export default function LmsEnterprisePortal() {
  // ==========================================
  // ESTADOS GLOBAIS DE NAVEGAÇÃO E PERFIL
  // ==========================================
  const [role, setRole] = useState('admin'); // 'admin', 'professor', 'aluno'
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('admin_dashboard'); 
  const [editMode, setEditMode] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(null);

  // ==========================================
  // HOOK CUSTOMIZADO PARA LOCALSTORAGE RELACIONAL
  // ==========================================
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

  // ==========================================
  // BANCO DE DADOS LOCAL (TABELAS)
  // ==========================================
  
  // 1. Tabela de Cursos / Disciplinas
  const [courses, setCourses] = useLocalStorage('lms_courses', [
    { id: 'c1', codigo: '001/003/07A', nome: 'Enfermagem Forense e Saúde da Família - 2026/1' }
  ]);

  // 2. Tabela de Conteúdos por Curso (Módulos/Tópicos)
  const defaultModules = [
    {
      id: 'boas_vindas', title: 'Mural de Boas-vindas', bgColor: 'bg-blue-50/50', borderColor: 'border-blue-100',
      items: [
        { id: 'i1', title: 'Plano de Ensino da disciplina', type: 'FileText', color: 'text-red-500' },
        { id: 'i2', title: 'Cronograma do semestre', type: 'FileText', color: 'text-red-500' }
      ]
    },
    {
      id: 'interacoes', title: 'Interações', bgColor: 'bg-purple-50/50', borderColor: 'border-purple-100',
      items: [
        { id: 'i3', title: 'Fórum Geral de Notícias e Avisos', type: 'MessageSquare', color: 'text-purple-600' }
      ]
    }
  ];

  const [courseContents, setCourseContents] = useLocalStorage('lms_contents', {
    'c1': defaultModules
  });

  // 3. Tabela de Alunos Matriculados por Curso (Notas e Faltas)
  const [courseStudents, setCourseStudents] = useLocalStorage('lms_students', {
    'c1': [
      { id: 's1', nome: "ALVES DE CASTRO, Mariana", ga: 8.6, gb: 7.4, gc: 0, faltas: [false, false, false], feedback: "Ótimo desempenho." },
      { id: 's2', nome: "BARCELOS DE OLIVEIRA, João", ga: 2.9, gb: 5.8, gc: 0, faltas: [true, true, true], feedback: "Atenção às faltas." }
    ]
  });

  // Estado auxiliar para colapsar/expandir módulos
  const [expandedModules, setExpandedModules] = useState({});

  // ==========================================
  // FUNÇÕES DE ADMINISTRAÇÃO (GESTOR)
  // ==========================================
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newStudentName, setNewStudentName] = useState('');

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName) return;
    const newId = `c_${Date.now()}`;
    
    setCourses([...courses, { id: newId, codigo: newCourseCode, nome: newCourseName }]);
    setCourseContents({ ...courseContents, [newId]: defaultModules });
    setCourseStudents({ ...courseStudents, [newId]: [] });
    
    setNewCourseCode('');
    setNewCourseName('');
    alert('Disciplina criada com sucesso!');
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
    if (!newStudentName) return;
    const newStudent = {
      id: `s_${Date.now()}`,
      nome: newStudentName,
      ga: 0, gb: 0, gc: 0,
      faltas: [false, false, false],
      feedback: ""
    };
    setCourseStudents({
      ...courseStudents,
      [courseId]: [...(courseStudents[courseId] || []), newStudent]
    });
    setNewStudentName('');
  };

  // ==========================================
  // FUNÇÕES DE PROFESSOR (CONTEÚDO E NOTAS)
  // ==========================================
  const toggleModule = (id) => setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));

  const activeContent = courseContents[activeCourseId] || [];
  const activeStudents = courseStudents[activeCourseId] || [];
  const activeCourseObj = courses.find(c => c.id === activeCourseId);

  const updateContent = (newContent) => {
    setCourseContents({ ...courseContents, [activeCourseId]: newContent });
  };

  const addSection = () => {
    const newSection = {
      id: `sec_${Date.now()}`, title: 'Novo Tópico / Módulo', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', items: []
    };
    updateContent([...activeContent, newSection]);
    setExpandedModules(prev => ({ ...prev, [newSection.id]: true }));
  };

  const updateSectionTitle = (id, newTitle) => {
    updateContent(activeContent.map(sec => sec.id === id ? { ...sec, title: newTitle } : sec));
  };

  const deleteSection = (id) => {
    if (window.confirm('Excluir este módulo e todos os seus arquivos?')) {
      updateContent(activeContent.filter(sec => sec.id !== id));
    }
  };

  const addItem = (sectionId) => {
    updateContent(activeContent.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, items: [...sec.items, { id: `item_${Date.now()}`, title: 'Novo Arquivo', type: 'FileText', color: 'text-blue-500' }] };
      }
      return sec;
    }));
  };

  const updateItemTitle = (sectionId, itemId, newTitle) => {
    updateContent(activeContent.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, items: sec.items.map(item => item.id === itemId ? { ...item, title: newTitle } : item) };
      }
      return sec;
    }));
  };

  const deleteItem = (sectionId, itemId) => {
    updateContent(activeContent.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, items: sec.items.filter(item => item.id !== itemId) };
      }
      return sec;
    }));
  };

  const updateGrade = (studentId, field, value) => {
    setCourseStudents({
      ...courseStudents,
      [activeCourseId]: activeStudents.map(s => s.id === studentId ? { ...s, [field]: parseFloat(value) || 0 } : s)
    });
  };

  const updateFeedback = (studentId, value) => {
    setCourseStudents({
      ...courseStudents,
      [activeCourseId]: activeStudents.map(s => s.id === studentId ? { ...s, feedback: value } : s)
    });
  };

  const toggleAttendance = (studentId, index) => {
    setCourseStudents({
      ...courseStudents,
      [activeCourseId]: activeStudents.map(s => {
        if (s.id === studentId) {
          const newFaltas = [...s.faltas];
          newFaltas[index] = !newFaltas[index]; 
          return { ...s, faltas: newFaltas };
        }
        return s;
      })
    });
  };

  const deleteStudent = (studentId) => {
    if (window.confirm('Remover a matrícula deste aluno?')) {
      setCourseStudents({
        ...courseStudents,
        [activeCourseId]: activeStudents.filter(s => s.id !== studentId)
      });
    }
  };

  // ==========================================
  // HELPERS DE INTERFACE
  // ==========================================
  const getIconComponent = (type) => {
    switch (type) {
      case 'FileText': return FileText;
      case 'MessageSquare': return MessageSquare;
      case 'Folder': return Folder;
      case 'Upload': return Upload;
      case 'CheckCircle': return CheckCircle;
      default: return FileText;
    }
  };

  const currentUser = {
    nome: role === 'aluno' ? 'Ana Silva' : (role === 'professor' ? 'Norberto Cimirro' : 'Coordenação Geral'),
    avatar: role === 'aluno' ? 'AS' : (role === 'professor' ? 'NC' : 'CG'),
  };

  const handleNavigateToCourse = (courseId, view) => {
    setActiveCourseId(courseId);
    setCurrentView(view);
    setEditMode(false);
  };

  // Mudar a view inicial baseada na troca de Role
  useEffect(() => {
    if (role === 'admin') {
      setCurrentView('admin_dashboard');
      setActiveCourseId(null);
    } else if (courses.length > 0) {
      setActiveCourseId(courses[0].id);
      setCurrentView('course_home');
    }
  }, [role, courses]);


  // ==========================================
  // VIEWS (TELAS)
  // ==========================================

  const renderAdminDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-teal-50 text-teal-700 rounded-xl"><Shield className="w-8 h-8"/></div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Painel de Governança Acadêmica</h2>
          <p className="text-sm text-slate-500 mt-1">Crie disciplinas, gerencie matrizes e matricule residentes no sistema.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário de Nova Disciplina */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Book className="w-5 h-5 text-teal-600"/> Abrir Nova Disciplina</h3>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Código</label>
              <input type="text" required value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} placeholder="Ex: RMAB001" className="w-full mt-1 border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo do Módulo</label>
              <input type="text" required value={newCourseName} onChange={e => setNewCourseName(e.target.value)} placeholder="Ex: Saúde da Família e Comunidade" className="w-full mt-1 border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <button type="submit" className="w-full bg-teal-800 text-white font-bold p-3 rounded-lg hover:bg-teal-900 transition flex items-center justify-center gap-2">
              <Plus className="w-4 h-4"/> Criar Estrutura Virtual
            </button>
          </form>
        </div>

        {/* Lista de Disciplinas Ativas */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Layout className="w-5 h-5 text-blue-600"/> Matriz Curricular Ativa</h3>
          {courses.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-xl bg-slate-50 text-slate-500">Nenhuma disciplina cadastrada no sistema.</div>
          ) : (
            <div className="space-y-3">
              {courses.map(c => (
                <div key={c.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">{c.codigo}</span>
                    <h4 className="font-bold text-slate-800 mt-1">{c.nome}</h4>
                    <p className="text-xs text-slate-500 mt-1">{(courseStudents[c.id] || []).length} aluno(s) matriculado(s)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleNavigateToCourse(c.id, 'admin_students')} className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 flex items-center gap-2">
                      <UserPlus className="w-3.5 h-3.5"/> Alunos
                    </button>
                    <button onClick={() => handleDeleteCourse(c.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100">
                      Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAdminStudents = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setCurrentView('admin_dashboard')} className="text-slate-500 hover:text-slate-800 font-bold text-sm flex items-center">
          <ChevronRight className="w-4 h-4 rotate-180 mr-1"/> Voltar ao Painel
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-black text-slate-800">Gestão de Matrículas</h2>
        <p className="text-sm text-slate-500 mt-1">Disciplina: <strong className="text-teal-700">{activeCourseObj?.codigo}</strong> - {activeCourseObj?.nome}</p>
        
        <form onSubmit={(e) => handleEnrollStudent(e, activeCourseId)} className="mt-6 flex gap-3 max-w-lg">
          <input type="text" required value={newStudentName} onChange={e => setNewStudentName(e.target.value)} placeholder="Nome completo do residente" className="flex-1 border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
          <button type="submit" className="bg-teal-800 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-teal-900 transition flex items-center gap-2">
            <Plus className="w-4 h-4"/> Matricular
          </button>
        </form>

        <div className="mt-8 border rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600 font-bold border-b">
              <tr>
                <th className="p-3">Nome do Aluno</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {activeStudents.length === 0 ? (
                <tr><td colSpan="3" className="p-6 text-center text-slate-500">Nenhum aluno matriculado nesta disciplina.</td></tr>
              ) : (
                activeStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{s.nome}</td>
                    <td className="p-3 text-center"><span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-1 rounded font-bold uppercase">Ativo</span></td>
                    <td className="p-3 text-right">
                      <button onClick={() => deleteStudent(s.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4 inline"/></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderCourseHome = () => (
    <div className="animate-fade-in">
      {editMode && (
        <div onClick={addSection} className="mb-6 border border-dashed border-teal-400 rounded-lg p-4 text-center bg-teal-50/50 hover:bg-teal-100 cursor-pointer transition text-teal-700 font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
          <Plus className="w-5 h-5"/> Adicionar novo Tópico / Módulo
        </div>
      )}

      {activeContent.length === 0 && !editMode && (
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
              {editMode ? (
                <input type="text" value={section.title} onChange={(e) => updateSectionTitle(section.id, e.target.value)} className="bg-white border border-slate-300 rounded px-2 py-1 text-base font-bold text-slate-800 w-full max-w-md focus:ring-2 focus:ring-teal-500 outline-none" />
              ) : (
                <h3 className="text-base font-bold text-slate-800 cursor-pointer" onClick={() => toggleModule(section.id)}>{section.title}</h3>
              )}
            </div>
            {editMode && (
              <button onClick={() => deleteSection(section.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2"><Trash2 className="w-4 h-4" /></button>
            )}
          </div>

          {expandedModules[section.id] !== false && (
            <div className="p-0">
              {section.items.map(item => {
                const IconComponent = getIconComponent(item.type);
                return (
                  <div key={item.id} className="flex items-start justify-between p-4 border-b border-slate-100 hover:bg-slate-50 group">
                    <div className="flex items-center gap-3 w-full">
                      {editMode && <GripVertical className="w-4 h-4 text-slate-300 cursor-move" />}
                      <IconComponent className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                      {editMode ? (
                        <input type="text" value={item.title} onChange={(e) => updateItemTitle(section.id, item.id, e.target.value)} className="bg-white border border-slate-300 rounded px-2 py-1 text-sm font-semibold text-slate-800 w-full max-w-md focus:ring-2 focus:ring-teal-500 outline-none" />
                      ) : (
                        <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                      )}
                    </div>
                    {editMode && (
                      <button onClick={() => deleteItem(section.id, item.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors ml-2"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                );
              })}
              {editMode && (
                <div className="p-3 border-t border-dashed border-slate-300 bg-slate-50 flex justify-end">
                  <button onClick={() => addItem(section.id)} className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-md border border-teal-100">
                    <Plus className="w-4 h-4"/> Adicionar material
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderGradebook = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Relatório de Notas</h3>
          <p className="text-xs text-slate-500">Cálculo e consolidação em tempo real.</p>
        </div>
        <button className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 hover:bg-slate-300">
          <Download className="w-4 h-4"/> Exportar CSV
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white border-b border-slate-300">
              <th className="p-3 font-semibold w-1/4">Estudante</th>
              {role !== 'aluno' && (
                <>
                  <th className="p-3 font-semibold border-x border-slate-600 text-center">GA</th>
                  <th className="p-3 font-semibold border-x border-slate-600 text-center">GB</th>
                  <th className="p-3 font-semibold border-x border-slate-600 text-center">GC</th>
                </>
              )}
              <th className="p-3 font-semibold bg-teal-800 text-center">Total</th>
              <th className="p-3 font-semibold border-x border-slate-600 text-center">Status</th>
              <th className="p-3 font-semibold">Feedback Contínuo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {activeStudents.length === 0 ? (
              <tr><td colSpan="7" className="p-6 text-center text-slate-500 font-medium">Nenhum aluno matriculado nesta disciplina. O Gestor precisa realizar a matrícula.</td></tr>
            ) : (
              activeStudents.map((aluno, idx) => {
                // Se for aluno, mostra apenas a linha dele
                if (role === 'aluno' && idx !== 0) return null; 

                const total = (aluno.ga + aluno.gb + aluno.gc).toFixed(2);
                const isApproved = total >= 14 || (aluno.gc > 0 && total >= 15);

                return (
                  <tr key={aluno.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-3 font-bold text-slate-700 border-r border-slate-200">{aluno.nome}</td>
                    
                    {role !== 'aluno' && (
                      <>
                        <td className="p-2 border-r border-slate-200 text-center">
                          <input type="number" step="0.1" value={aluno.ga} disabled={!editMode} onChange={(e) => updateGrade(aluno.id, 'ga', e.target.value)} className="w-14 text-center border p-1.5 rounded font-bold bg-white disabled:bg-transparent focus:ring-2 focus:ring-teal-500 outline-none" />
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center">
                          <input type="number" step="0.1" value={aluno.gb} disabled={!editMode} onChange={(e) => updateGrade(aluno.id, 'gb', e.target.value)} className="w-14 text-center border p-1.5 rounded font-bold bg-white disabled:bg-transparent focus:ring-2 focus:ring-teal-500 outline-none" />
                        </td>
                        <td className="p-2 border-r border-slate-200 text-center">
                          <input type="number" step="0.1" value={aluno.gc} disabled={!editMode} onChange={(e) => updateGrade(aluno.id, 'gc', e.target.value)} className="w-14 text-center border p-1.5 rounded font-bold bg-white disabled:bg-transparent focus:ring-2 focus:ring-teal-500 outline-none" />
                        </td>
                      </>
                    )}
                    
                    <td className="p-3 border-r border-slate-200 text-center font-black bg-slate-100 text-base">{total}</td>
                    
                    <td className="p-3 border-r border-slate-200 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {isApproved ? 'Aprovado' : 'Em Exame'}
                      </span>
                    </td>
                    
                    <td className="p-2">
                      <input type="text" value={aluno.feedback} disabled={!editMode} onChange={(e) => updateFeedback(aluno.id, e.target.value)} placeholder="Parecer..." className="w-full border p-1.5 rounded text-xs bg-white disabled:bg-transparent disabled:italic focus:ring-2 focus:ring-teal-500 outline-none" />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-bold text-lg text-slate-800">Diário de Classe Eletrônico</h3>
        <p className="text-xs text-slate-500">Mapeamento de presença. Verde = Presente | Preto = Falta.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-200 text-slate-700">
              <th rowSpan="2" className="p-2 border border-slate-300 font-bold w-1/3">Estudante</th>
              <th rowSpan="2" className="p-2 border border-slate-300 font-bold text-center">Faltas</th>
              <th colSpan="3" className="p-2 border border-slate-300 font-bold text-center bg-slate-300">Aulas Registradas</th>
            </tr>
            <tr className="bg-slate-100 text-slate-700 text-center text-[10px]">
              <th className="p-1 border border-slate-300">Turno 1</th>
              <th className="p-1 border border-slate-300">Turno 2</th>
              <th className="p-1 border border-slate-300">Turno 3</th>
            </tr>
          </thead>
          <tbody>
            {activeStudents.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center text-slate-500 font-medium">Nenhum aluno matriculado.</td></tr>
            ) : (
              activeStudents.map((aluno) => {
                const qtdeFaltas = aluno.faltas.filter(f => f).length;
                return (
                  <tr key={aluno.id} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-200 font-medium text-slate-800">{aluno.nome}</td>
                    <td className="p-2 border border-slate-200 text-center">
                      <span className={`font-black text-sm ${qtdeFaltas > 1 ? 'text-red-600' : 'text-slate-700'}`}>{qtdeFaltas}</span>
                    </td>
                    {aluno.faltas.map((falta, i) => (
                      <td key={i} className={`p-2 border border-slate-200 text-center transition-colors ${editMode ? 'cursor-pointer' : ''} ${falta ? 'bg-slate-800' : 'bg-emerald-700'}`} onClick={() => editMode && toggleAttendance(aluno.id, i)}>
                        <input type="checkbox" checked={!falta} readOnly className="w-4 h-4 rounded text-white cursor-pointer pointer-events-none" />
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // ==========================================
  // ESTRUTURA PRINCIPAL (SHELL DO LMS)
  // ==========================================

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-slate-800 overflow-hidden">
      
      {/* 1. SIDEBAR (MENU LATERAL FIXO) */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col flex-shrink-0 shadow-2xl z-20`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {sidebarOpen && <span className="font-black text-white text-lg tracking-tight">LMS<span className="text-teal-500">Portal</span></span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
          <nav className="space-y-1 px-2">
            
            {/* Menu Admin */}
            {role === 'admin' && (
              <>
                <button onClick={() => setCurrentView('admin_dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors ${currentView === 'admin_dashboard' ? 'bg-teal-900/40 text-teal-400 border-l-4 border-teal-500' : 'hover:bg-slate-800 text-slate-400'}`}>
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Gestão COREMU</span>}
                </button>
                <div className="my-4 border-t border-slate-800"></div>
              </>
            )}

            {/* Menus Comuns */}
            {(role === 'professor' || role === 'aluno') && (
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-sm transition-colors text-slate-400">
                <Home className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>Página Inicial</span>}
              </button>
            )}

            {/* Lista Dinâmica de Cursos */}
            {sidebarOpen && <div className="mt-6 mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Minhas Disciplinas</div>}
            
            {courses.length === 0 ? (
              <div className="px-4 text-xs text-slate-600 italic">Nenhum curso ativo.</div>
            ) : (
              courses.map(c => (
                <div key={c.id}>
                  <button onClick={() => handleNavigateToCourse(c.id, 'course_home')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${activeCourseId === c.id && currentView !== 'admin_dashboard' && currentView !== 'admin_students' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
                    <Book className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="truncate">{c.codigo}</span>}
                  </button>
                  
                  {/* Submenus se o curso estiver selecionado */}
                  {activeCourseId === c.id && sidebarOpen && currentView !== 'admin_dashboard' && currentView !== 'admin_students' && (
                    <div className="ml-4 pl-4 border-l border-slate-700 mt-1 space-y-1">
                      <button onClick={() => setCurrentView('grades')} className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${currentView === 'grades' ? 'text-teal-400' : 'hover:bg-slate-800 text-slate-400'}`}>
                        <BarChart className="w-4 h-4 flex-shrink-0" /> Notas
                      </button>
                      {(role === 'professor' || role === 'admin') && (
                        <button onClick={() => setCurrentView('attendance')} className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${currentView === 'attendance' ? 'text-teal-400' : 'hover:bg-slate-800 text-slate-400'}`}>
                          <CheckSquare className="w-4 h-4 flex-shrink-0" /> Frequência
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </nav>
        </div>

        {/* Simulador de Acesso no final da Sidebar */}
        {sidebarOpen && (
          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Simulador de Perfil</p>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-800 text-xs font-bold text-slate-300 p-2 rounded border border-slate-700 outline-none">
              <option value="admin">Administrador (Gestão)</option>
              <option value="professor">Professor (Docente)</option>
              <option value="aluno">Aluno (Residente)</option>
            </select>
          </div>
        )}
      </aside>

      {/* 2. ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER SUPERIOR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden sm:flex items-center text-sm font-semibold text-slate-600 gap-6">
              <span className="hover:text-teal-700 cursor-pointer border-b-2 border-teal-700 text-teal-700 py-5">Portal de Residência - Moinhos de Vento / HACO</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Pesquisar..." className="pl-9 pr-4 py-1.5 bg-slate-100 border-transparent rounded-full text-xs focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all w-48" />
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            
            <div className="flex items-center gap-3 p-1.5">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800">{currentUser.nome}</p>
                <p className="text-[10px] text-slate-500 uppercase">{role}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-bold">
                {currentUser.avatar}
              </div>
            </div>
          </div>
        </header>

        {/* CONTEÚDO DA PÁGINA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            
            {/* Renderização Condicional da Visão do Admin Dashboard */}
            {currentView === 'admin_dashboard' && renderAdminDashboard()}
            {currentView === 'admin_students' && renderAdminStudents()}

            {/* Cabeçalho da Disciplina (Se um curso estiver ativo e não for tela de dashboard) */}
            {activeCourseId && currentView !== 'admin_dashboard' && currentView !== 'admin_students' && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                      {activeCourseObj?.nome}
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 font-medium">{activeCourseObj?.codigo} • Curso de Especialização / Residência</p>
                  </div>
                  
                  {/* BOTÃO "MODO DE EDIÇÃO" */}
                  {(role === 'professor' || role === 'admin') && (
                    <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm">
                      <span className="text-xs font-bold text-slate-600 px-2 hidden sm:inline">Modo de edição</span>
                      <button 
                        onClick={() => setEditMode(!editMode)} 
                        className={`flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition-all ${editMode ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {editMode ? <ToggleRight className="w-4 h-4 mr-1"/> : <ToggleLeft className="w-4 h-4 mr-1"/>}
                        {editMode ? 'Ativo' : 'Inativo'}
                      </button>
                    </div>
                  )}
                </div>

                {/* BREADCRUMBS */}
                <div className="flex items-center text-xs text-slate-500 mb-6 bg-white p-3 rounded-md border border-slate-200 shadow-sm">
                  <span className="hover:text-slate-800 cursor-pointer">Painel</span>
                  <ChevronRight className="w-3 h-3 mx-2" />
                  <span className="hover:text-slate-800 cursor-pointer">Minhas Disciplinas</span>
                  <ChevronRight className="w-3 h-3 mx-2" />
                  <span className="font-bold text-teal-700">{activeCourseObj?.codigo}</span>
                  <ChevronRight className="w-3 h-3 mx-2" />
                  <span className="text-slate-700">{
                    currentView === 'course_home' ? 'Conteúdo Programático' : 
                    currentView === 'grades' ? 'Relatório de Notas' : 'Diário de Frequência'
                  }</span>
                </div>

                {/* RENDERIZAÇÃO DAS VIEWS DE DISCIPLINA */}
                {currentView === 'course_home' && renderCourseHome()}
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
