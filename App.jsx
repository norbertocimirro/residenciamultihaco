import React, { useState, useEffect } from 'react';
import { 
  Menu, Bell, Search, Home, Book, Calendar, BarChart, 
  ChevronDown, ChevronRight, Plus, FileText, 
  MessageSquare, Archive, CheckSquare, Upload, Download,
  ToggleLeft, ToggleRight, Layout, GripVertical, Trash2
} from 'lucide-react';

export default function LmsEnterprisePortal() {
  const [role, setRole] = useState('professor');
  const [editMode, setEditMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('course_home');
  const [expandedModules, setExpandedModules] = useState({});

  // ==========================================
  // ESTADOS FUNCIONAIS (BANCO DE DADOS LOCAL)
  // ==========================================
  
  const [course] = useState({
    codigo: '001/003/07A',
    nome: 'Enfermagem Forense e Saúde da Família - 2026/1',
    progresso: 45
  });

  const [sections, setSections] = useState(() => {
    const saved = localStorage.getItem('lms_sections');
    if (saved) return JSON.parse(saved);
    return [
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
          { id: 'i3', title: 'Fórum Geral de Notícias e Avisos', type: 'MessageSquare', color: 'text-purple-600' },
          { id: 'i4', title: 'Fórum de Dúvidas', type: 'MessageSquare', color: 'text-amber-500' }
        ]
      },
      {
        id: 'materiais', title: 'Materiais didáticos', bgColor: 'bg-emerald-50/50', borderColor: 'border-emerald-100',
        items: [
          { id: 'i5', title: 'Aula 2 - Material de Apoio', type: 'Archive', color: 'text-slate-400' }
        ]
      }
    ];
  });

  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('lms_students');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, nome: "ALVES DE CASTRO, Mariana", ga: 8.6, gb: 7.4, gc: 0, faltas: [false, false, false], feedback: "Ótimo desempenho." },
      { id: 2, nome: "BARCELOS DE OLIVEIRA, João", ga: 2.9, gb: 5.8, gc: 0, faltas: [true, true, true], feedback: "Atenção às faltas." },
      { id: 3, nome: "BASTOS MARQUES, Carlos", ga: 7.7, gb: 7.1, gc: 8.3, faltas: [false, false, true], feedback: "" },
      { id: 4, nome: "CIMIRRO, Norberto de Sousa", ga: 9.2, gb: 8.5, gc: 0, faltas: [false, false, false], feedback: "Excelente!" },
    ];
  });

  // Salvar automaticamente no LocalStorage
  useEffect(() => { localStorage.setItem('lms_sections', JSON.stringify(sections)); }, [sections]);
  useEffect(() => { localStorage.setItem('lms_students', JSON.stringify(students)); }, [students]);

  // ==========================================
  // FUNÇÕES DE INTERATIVIDADE (CRUD)
  // ==========================================

  const toggleModule = (id) => setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));

  // Funções de Conteúdo (Course Home)
  const addSection = () => {
    const newSection = {
      id: `sec_${Date.now()}`,
      title: 'Novo Tópico / Módulo',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      items: []
    };
    setSections([...sections, newSection]);
    setExpandedModules(prev => ({ ...prev, [newSection.id]: true }));
  };

  const updateSectionTitle = (id, newTitle) => {
    setSections(sections.map(sec => sec.id === id ? { ...sec, title: newTitle } : sec));
  };

  const deleteSection = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este módulo inteiro?')) {
      setSections(sections.filter(sec => sec.id !== id));
    }
  };

  const addItem = (sectionId) => {
    setSections(sections.map(sec => {
      if (sec.id === sectionId) {
        return {
          ...sec,
          items: [...sec.items, { id: `item_${Date.now()}`, title: 'Novo Arquivo ou Atividade', type: 'FileText', color: 'text-blue-500' }]
        };
      }
      return sec;
    }));
  };

  const updateItemTitle = (sectionId, itemId, newTitle) => {
    setSections(sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, items: sec.items.map(item => item.id === itemId ? { ...item, title: newTitle } : item) };
      }
      return sec;
    }));
  };

  const deleteItem = (sectionId, itemId) => {
    setSections(sections.map(sec => {
      if (sec.id === sectionId) {
        return { ...sec, items: sec.items.filter(item => item.id !== itemId) };
      }
      return sec;
    }));
  };

  // Funções de Notas e Frequência
  const updateGrade = (studentId, field, value) => {
    setStudents(students.map(s => s.id === studentId ? { ...s, [field]: parseFloat(value) || 0 } : s));
  };

  const updateFeedback = (studentId, value) => {
    setStudents(students.map(s => s.id === studentId ? { ...s, feedback: value } : s));
  };

  const toggleAttendance = (studentId, index) => {
    setStudents(students.map(s => {
      if (s.id === studentId) {
        const newFaltas = [...s.faltas];
        newFaltas[index] = !newFaltas[index]; // true = falta, false = presença
        return { ...s, faltas: newFaltas };
      }
      return s;
    }));
  };

  // ==========================================
  // RENDERIZAÇÃO DOS ÍCONES DINÂMICOS
  // ==========================================
  const getIconComponent = (type) => {
    switch (type) {
      case 'FileText': return FileText;
      case 'MessageSquare': return MessageSquare;
      case 'Archive': return Archive;
      case 'Upload': return Upload;
      case 'CheckSquare': return CheckSquare;
      default: return FileText;
    }
  };

  const currentUser = {
    nome: role === 'aluno' ? 'Ana Silva' : (role === 'professor' ? '1º Ten Norberto Cimirro' : 'Gestão COREMU'),
    avatar: role === 'aluno' ? 'AS' : (role === 'professor' ? 'NC' : 'GC'),
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col flex-shrink-0 shadow-2xl z-20`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {sidebarOpen && <span className="font-black text-white text-lg tracking-tight">LMS<span className="text-teal-500">Portal</span></span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 no-scrollbar">
          <nav className="space-y-1 px-2">
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-sm transition-colors text-slate-400">
              <Home className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Página Inicial</span>}
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-teal-900/40 text-teal-400 font-bold text-sm transition-colors border-l-4 border-teal-500">
              <Layout className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Painel (Dashboard)</span>}
            </button>
            
            {sidebarOpen && <div className="mt-8 mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Meus Cursos</div>}
            
            <button onClick={() => setCurrentView('course_home')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${currentView === 'course_home' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
              <Book className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{course.codigo}</span>}
            </button>
            <button onClick={() => setCurrentView('grades')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors pl-8 ${currentView === 'grades' ? 'text-teal-400' : 'hover:bg-slate-800 text-slate-400'}`}>
              <BarChart className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>Notas</span>}
            </button>
            {(role === 'professor' || role === 'admin') && (
              <button onClick={() => setCurrentView('attendance')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors pl-8 ${currentView === 'attendance' ? 'text-teal-400' : 'hover:bg-slate-800 text-slate-400'}`}>
                <CheckSquare className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && <span>Frequência</span>}
              </button>
            )}
          </nav>
        </div>

        {sidebarOpen && (
          <div className="p-4 bg-slate-950 border-t border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Simulador de Acesso</p>
            <select value={role} onChange={(e) => { setRole(e.target.value); setEditMode(false); }} className="w-full bg-slate-800 text-xs text-slate-300 p-2 rounded border border-slate-700 outline-none">
              <option value="admin">Administrador (TI)</option>
              <option value="professor">Professor / Gestor</option>
              <option value="aluno">Aluno / Residente</option>
            </select>
          </div>
        )}
      </aside>

      {/* ÁREA PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden sm:flex items-center text-sm font-semibold text-slate-600 gap-6">
              <span className="hover:text-teal-700 cursor-pointer border-b-2 border-teal-700 text-teal-700 py-5">Painel</span>
              <span className="hover:text-teal-700 cursor-pointer py-5">Meus Cursos</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Pesquisar cursos..." className="pl-9 pr-4 py-1.5 bg-slate-100 border-transparent rounded-full text-xs focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all w-48" />
            </div>
            
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
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

        {/* CONTEÚDO */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            
            {/* Título e Botão de Edição */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {course.nome}
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">{course.codigo} • Curso de Especialização / Residência Multiprofissional</p>
              </div>
              
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

            {/* VIEWS */}
            {currentView === 'course_home' && (
              <div className="animate-fade-in">
                
                {/* Botão de adicionar nova seção */}
                {editMode && (
                  <div onClick={addSection} className="mb-6 border border-dashed border-teal-400 rounded-lg p-4 text-center bg-teal-50/50 hover:bg-teal-100 cursor-pointer transition text-teal-700 font-bold text-sm flex items-center justify-center gap-2 shadow-sm">
                    <Plus className="w-5 h-5"/> Adicionar novo Tópico / Módulo
                  </div>
                )}

                {/* Renderização Dinâmica das Seções e Itens */}
                {sections.map(section => (
                  <div key={section.id} className={`mb-6 rounded-lg border ${section.borderColor} overflow-hidden shadow-sm bg-white`}>
                    
                    {/* Cabeçalho da Seção */}
                    <div className={`flex items-center justify-between p-3 ${section.bgColor} border-b ${section.borderColor}`}>
                      <div className="flex items-center gap-3 w-full">
                        <button onClick={() => toggleModule(section.id)} className="p-1 hover:bg-slate-200 rounded">
                          {expandedModules[section.id] !== false ? <ChevronDown className="w-5 h-5 text-slate-500"/> : <ChevronRight className="w-5 h-5 text-slate-500"/>}
                        </button>
                        
                        {/* Input de Edição */}
                        {editMode ? (
                          <input 
                            type="text" 
                            value={section.title} 
                            onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                            className="bg-white border border-slate-300 rounded px-2 py-1 text-base font-bold text-slate-800 w-full max-w-md focus:ring-2 focus:ring-teal-500 outline-none"
                          />
                        ) : (
                          <h3 className="text-base font-bold text-slate-800 cursor-pointer" onClick={() => toggleModule(section.id)}>{section.title}</h3>
                        )}
                      </div>
                      
                      {/* Excluir seção */}
                      {editMode && (
                        <button onClick={() => deleteSection(section.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Itens da Seção */}
                    {expandedModules[section.id] !== false && (
                      <div className="p-0">
                        {section.items.map(item => {
                          const IconComponent = getIconComponent(item.type);
                          return (
                            <div key={item.id} className="flex items-start justify-between p-4 border-b border-slate-100 hover:bg-slate-50 group">
                              <div className="flex items-center gap-3 w-full">
                                {editMode && <GripVertical className="w-4 h-4 text-slate-300 cursor-move" />}
                                <IconComponent className={`w-5 h-5 ${item.color} flex-shrink-0`} />
                                
                                {/* Input de Edição de Item */}
                                {editMode ? (
                                  <input 
                                    type="text" 
                                    value={item.title} 
                                    onChange={(e) => updateItemTitle(section.id, item.id, e.target.value)}
                                    className="bg-white border border-slate-300 rounded px-2 py-1 text-sm font-semibold text-slate-800 w-full max-w-md focus:ring-2 focus:ring-teal-500 outline-none"
                                  />
                                ) : (
                                  <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                                )}
                              </div>
                              
                              {/* Excluir item */}
                              {editMode && (
                                <button onClick={() => deleteItem(section.id, item.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors ml-2">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                        
                        {/* Botão de adicionar item */}
                        {editMode && (
                          <div className="p-3 border-t border-dashed border-slate-300 bg-slate-50 flex justify-end">
                            <button onClick={() => addItem(section.id)} className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-md border border-teal-100">
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

            {currentView === 'grades' && (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800">Relatório de Notas Ativo</h3>
                    <p className="text-xs text-slate-500">As notas digitadas aqui são calculadas automaticamente e salvas em tempo real.</p>
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
                        <th className="p-3 font-semibold border-x border-slate-600 text-center">Nota GA</th>
                        <th className="p-3 font-semibold border-x border-slate-600 text-center">Nota GB</th>
                        <th className="p-3 font-semibold border-x border-slate-600 text-center">Nota GC</th>
                        <th className="p-3 font-semibold bg-teal-800 text-center">Total</th>
                        <th className="p-3 font-semibold border-x border-slate-600 text-center">Status</th>
                        <th className="p-3 font-semibold">Feedback Contínuo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {students.map((aluno, idx) => {
                        const total = (aluno.ga + aluno.gb + aluno.gc).toFixed(2);
                        const isApproved = total >= 14 || (aluno.gc > 0 && total >= 15);

                        return (
                          <tr key={aluno.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <td className="p-3 font-bold text-slate-700 border-r border-slate-200">{aluno.nome}</td>
                            
                            <td className="p-2 border-r border-slate-200 text-center">
                              <input type="number" step="0.1" value={aluno.ga} disabled={!editMode} onChange={(e) => updateGrade(aluno.id, 'ga', e.target.value)} className="w-14 text-center border p-1.5 rounded font-bold bg-white disabled:bg-slate-100 focus:ring-2 focus:ring-teal-500 outline-none" />
                            </td>
                            <td className="p-2 border-r border-slate-200 text-center">
                              <input type="number" step="0.1" value={aluno.gb} disabled={!editMode} onChange={(e) => updateGrade(aluno.id, 'gb', e.target.value)} className="w-14 text-center border p-1.5 rounded font-bold bg-white disabled:bg-slate-100 focus:ring-2 focus:ring-teal-500 outline-none" />
                            </td>
                            <td className="p-2 border-r border-slate-200 text-center">
                              <input type="number" step="0.1" value={aluno.gc} disabled={!editMode} onChange={(e) => updateGrade(aluno.id, 'gc', e.target.value)} className="w-14 text-center border p-1.5 rounded font-bold bg-white disabled:bg-slate-100 focus:ring-2 focus:ring-teal-500 outline-none" />
                            </td>
                            
                            <td className="p-3 border-r border-slate-200 text-center font-black bg-slate-100">{total}</td>
                            
                            <td className="p-3 border-r border-slate-200 text-center">
                              <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                {isApproved ? 'Aprovado' : 'Em Exame'}
                              </span>
                            </td>
                            
                            <td className="p-2">
                              <input type="text" value={aluno.feedback} disabled={!editMode} onChange={(e) => updateFeedback(aluno.id, e.target.value)} placeholder="Parecer..." className="w-full border p-1.5 rounded text-xs bg-white disabled:bg-slate-100 disabled:italic focus:ring-2 focus:ring-teal-500 outline-none" />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentView === 'attendance' && (
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-slate-200 bg-slate-50">
                  <h3 className="font-bold text-lg text-slate-800">Diário de Classe Interativo</h3>
                  <p className="text-xs text-slate-500">Clique nas caixinhas para alternar entre Presença (Verde) e Falta (Preto). O total atualiza sozinho.</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-200 text-slate-700">
                        <th rowSpan="2" className="p-2 border border-slate-300 font-bold w-1/3">Estudante</th>
                        <th rowSpan="2" className="p-2 border border-slate-300 font-bold text-center">Faltas Totais</th>
                        <th colSpan="3" className="p-2 border border-slate-300 font-bold text-center bg-slate-300">Aulas do dia 07/07</th>
                      </tr>
                      <tr className="bg-slate-100 text-slate-700 text-center text-[10px]">
                        <th className="p-1 border border-slate-300">07:30 - 08:20</th>
                        <th className="p-1 border border-slate-300">08:20 - 09:10</th>
                        <th className="p-1 border border-slate-300">09:10 - 10:00</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((aluno) => {
                        const qtdeFaltas = aluno.faltas.filter(f => f).length;
                        return (
                          <tr key={aluno.id} className="hover:bg-slate-50">
                            <td className="p-2 border border-slate-200 font-medium text-slate-800">{aluno.nome}</td>
                            <td className="p-2 border border-slate-200 text-center">
                              <span className={`font-black text-sm ${qtdeFaltas > 1 ? 'text-red-600' : 'text-slate-700'}`}>{qtdeFaltas}</span>
                            </td>
                            {aluno.faltas.map((falta, i) => (
                              <td key={i} className={`p-2 border border-slate-200 text-center transition-colors cursor-pointer ${falta ? 'bg-slate-800' : 'bg-emerald-700'}`} onClick={() => editMode && toggleAttendance(aluno.id, i)}>
                                <input type="checkbox" checked={!falta} readOnly className="w-4 h-4 rounded text-white cursor-pointer" />
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
