import React, { useState } from 'react';
import { 
  Menu, Bell, Search, Home, Book, Calendar, Users, BarChart, 
  ChevronDown, ChevronRight, Edit2, Plus, MoreVertical, FileText, 
  MessageSquare, FileBox, CheckSquare, Upload, Download,
  ToggleLeft, ToggleRight, Layout, GripVertical
} from 'lucide-react';

export default function LmsEnterprisePortal() {
  const [role, setRole] = useState('professor');
  const [editMode, setEditMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('course_home');

  const [expandedModules, setExpandedModules] = useState({
    boas_vindas: true,
    interacoes: true,
    materiais: true,
    atividades: true
  });

  const toggleModule = (mod) => setExpandedModules(prev => ({ ...prev, [mod]: !prev[mod] }));

  // Dados adaptados para a sua gestão
  const currentUser = {
    nome: role === 'aluno' ? 'Ana Silva' : (role === 'professor' ? 'Norberto Cimirro' : 'Gestão COREMU'),
    avatar: role === 'aluno' ? 'AS' : (role === 'professor' ? 'NC' : 'GC'),
  };

  const course = {
    codigo: '001/003/07A',
    nome: 'Enfermagem Forense e Saúde da Família - 2026/1',
    progresso: 45
  };

  const students = [
    { id: 1, nome: "ALVES DE CASTRO, Mariana", ra: "2026001", status: "Ativo", ga: 8.6, gb: 7.4, gc: 9.8, faltas: [false, false, false] },
    { id: 2, nome: "BARCELOS DE OLIVEIRA, João", ra: "2026002", status: "Risco", ga: 2.9, gb: 5.8, gc: 0, faltas: [true, true, true] },
    { id: 3, nome: "BASTOS MARQUES, Carlos", ra: "2026003", status: "Ativo", ga: 7.7, gb: 7.1, gc: 8.3, faltas: [false, false, true] },
    { id: 4, nome: "CIMIRRO, Norberto de Sousa", ra: "2026004", status: "Ativo", ga: 9.2, gb: 8.5, gc: 9.0, faltas: [false, false, false] },
  ];

  const renderBreadcrumbs = () => (
    <div className="flex items-center text-xs text-slate-500 mb-4 bg-white p-3 rounded-md border border-slate-200">
      <span className="hover:text-slate-800 cursor-pointer">Painel</span>
      <ChevronRight className="w-3 h-3 mx-2" />
      <span className="hover:text-slate-800 cursor-pointer">Minhas Disciplinas</span>
      <ChevronRight className="w-3 h-3 mx-2" />
      <span className="font-bold text-teal-700">{course.codigo}</span>
      <ChevronRight className="w-3 h-3 mx-2" />
      <span className="text-slate-700">{
        currentView === 'course_home' ? 'Conteúdo' : 
        currentView === 'grades' ? 'Relatório de Notas' : 
        currentView === 'attendance' ? 'Diário de Frequência' : 'Participantes'
      }</span>
    </div>
  );

  const renderSectionBlock = (id, title, Icon, children, bgColor = "bg-slate-100/50", borderColor = "border-slate-200") => (
    <div className={`mb-6 rounded-lg border ${borderColor} overflow-hidden shadow-sm bg-white`}>
      <div 
        className={`flex items-center justify-between p-3 cursor-pointer ${bgColor} border-b ${borderColor} hover:bg-slate-100 transition-colors`}
        onClick={() => toggleModule(id)}
      >
        <div className="flex items-center gap-3">
          {expandedModules[id] ? <ChevronDown className="w-5 h-5 text-slate-500"/> : <ChevronRight className="w-5 h-5 text-slate-500"/>}
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-slate-700" />
            <h3 className="text-base font-bold text-slate-800">{title}</h3>
            {editMode && <Edit2 className="w-3.5 h-3.5 text-slate-400 hover:text-teal-600 ml-2" />}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editMode && <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">Ocultar / Editar</div>}
          <MoreVertical className="w-5 h-5 text-slate-400 hover:text-slate-700" />
        </div>
      </div>
      {expandedModules[id] && (
        <div className="p-0">
          {children}
          {editMode && (
            <div className="p-3 border-t border-dashed border-slate-300 bg-slate-50 flex justify-end">
              <button className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800">
                <Plus className="w-4 h-4"/> Adicionar uma atividade ou recurso
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderResourceItem = (Icon, title, desc, typeIconColor = "text-blue-600") => (
    <div className="flex items-start justify-between p-4 border-b border-slate-100 hover:bg-slate-50 group">
      <div className="flex items-start gap-3">
        {editMode && <GripVertical className="w-4 h-4 text-slate-300 cursor-move mt-0.5 opacity-0 group-hover:opacity-100" />}
        <Icon className={`w-5 h-5 ${typeIconColor} flex-shrink-0 mt-0.5`} />
        <div>
          <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            {title}
            {editMode && <Edit2 className="w-3 h-3 text-slate-400 hover:text-teal-600 cursor-pointer" />}
          </h4>
          {desc && <div className="text-xs text-slate-600 mt-1 leading-relaxed">{desc}</div>}
        </div>
      </div>
      {editMode && <span className="text-slate-400 hover:text-slate-800 cursor-pointer">Editar ▾</span>}
    </div>
  );

  const renderCourseHome = () => (
    <div className="animate-fade-in">
      {editMode && (
        <div className="mb-4 border border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition text-slate-500 font-bold text-xs flex items-center justify-center gap-2">
          <Plus className="w-4 h-4"/> Adicionar novo tópico
        </div>
      )}

      {renderSectionBlock("boas_vindas", "Mural de Boas-vindas", Layout, (
        <>
          <div className="p-6 text-sm text-slate-700 leading-relaxed space-y-4 font-medium">
            <p>Queridos(as), estudantes.</p>
            <p>Sejam muito bem-vindos ao primeiro semestre do ano letivo (2026/1). É uma alegria iniciarmos juntos a disciplina dedicada à compreensão da atuação do enfermeiro em situações de violência, trauma e morte — contextos que exigem preparo técnico, sensibilidade no cuidado e responsabilidade ética e legal.</p>
            <p>Que seja um semestre de aprendizado consistente, reflexão madura e crescimento profissional. Estarei ao lado de vocês nessa construção.</p>
            <p className="pt-2">Com estima,<br/><strong>Prof.ª Dra. Renata Casagrande Gonçalves</strong></p>
          </div>
          <div className="border-t border-slate-100">
            {renderResourceItem(FileText, "Plano de Ensino da disciplina", null, "text-red-500")}
            {renderResourceItem(FileText, "Cronograma do semestre", null, "text-red-500")}
            {renderResourceItem(FileText, "Contrato Pedagógico", null, "text-red-500")}
          </div>
        </>
      ), "bg-blue-50/50", "border-blue-100")}

      {renderSectionBlock("interacoes", "Interações", MessageSquare, (
        <>
          {renderResourceItem(MessageSquare, "Fórum Geral de Notícias e Avisos", (
            <div className="bg-slate-800 text-white p-3 rounded mt-2 border-l-4 border-purple-500">
              <h5 className="font-bold mb-1">Visita Técnica</h5>
              <p className="text-[11px] text-slate-300">A disciplina aborda os fundamentos teóricos... Visita técnica ao Departamento Médico-Legal (DML).</p>
              <div className="mt-2 text-[10px] bg-slate-700 inline-block px-2 py-1 rounded">📅 Data: 09/06/2026</div>
            </div>
          ), "text-purple-600")}
          {renderResourceItem(MessageSquare, "Fórum de Dúvidas", null, "text-amber-500")}
        </>
      ), "bg-purple-50/50", "border-purple-100")}

      {renderSectionBlock("materiais", "Materiais didáticos", Book, (
        <>
          {renderResourceItem(FileBox, "Materiais Complementares (Pasta)", null, "text-slate-400")}
          {renderResourceItem(FileText, "Aula 2 - 03/03/26", null, "text-red-500")}
          {renderResourceItem(FileText, "Aula 3 - World Café_debate estruturado e rotativo 10/3/26", (
            <div className="space-y-2 mt-1">
              <p>Prezados(as), alunos(as).</p>
              <p>Encaminho, em anexo, o riquíssimo material elaborado pelo Dr. Pietro, que servirá de base para nossa roda de conversa, a ser realizada no dia <strong>10/03, às 7h30</strong>.</p>
              <p>Após a leitura minuciosa, peço que cada aluno elabore uma pergunta pertinente ao tema.</p>
            </div>
          ), "text-red-500")}
        </>
      ), "bg-emerald-50/50", "border-emerald-100")}

      {renderSectionBlock("atividades", "Atividades Avaliativas", CheckSquare, (
        <>
          {renderResourceItem(Upload, "Avaliação GA", null, "text-rose-500")}
          {renderResourceItem(Upload, "Avaliação GB", null, "text-rose-500")}
          {renderResourceItem(Upload, "GA 1 - Atividade: 'Debate estruturado e rotativo'", (
            <div className="bg-slate-50 p-3 rounded border border-slate-200 mt-2 text-xs">
              <p className="font-bold text-rose-800 mb-1 flex items-center gap-1">📌 ATIVIDADE - Debate estruturado (Individual)</p>
              <p><strong>Tema principal:</strong> Fundamentos da Enfermagem Forense e Interface com o Sistema de Justiça</p>
              <p className="mt-1"><strong>Subtema:</strong> Noções integradas de Direito Penal aplicadas à Enfermagem Forense.</p>
              <p className="mt-2 font-bold">Data de Entrega: 10/03/2026</p>
            </div>
          ), "text-rose-500")}
        </>
      ), "bg-rose-50/50", "border-rose-100")}
    </div>
  );

  const renderGradebook = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Relatório de Notas (Gradebook)</h3>
          <p className="text-xs text-slate-500">Planilha geral de avaliações do semestre letivo.</p>
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
              <th className="p-3 font-semibold border-x border-slate-600 text-center">Status</th>
              <th className="p-3 font-semibold border-x border-slate-600 text-center">Nota GA</th>
              <th className="p-3 font-semibold border-x border-slate-600 text-center">Nota GB</th>
              <th className="p-3 font-semibold border-x border-slate-600 text-center">Nota GC</th>
              <th className="p-3 font-semibold bg-teal-800 text-center">TotalNotas</th>
              <th className="p-3 font-semibold">Comentário / Feedback</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {students.map((aluno, idx) => {
              const total = (((aluno.ga || 0) + (aluno.gb || 0) + (aluno.gc || 0))).toFixed(2);
              return (
                <tr key={aluno.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="p-3 font-bold text-slate-700 border-r border-slate-200">{aluno.nome}</td>
                  <td className="p-3 border-r border-slate-200 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${aluno.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                      {aluno.status === 'Ativo' ? 'Aprovado' : 'Reprovado'}
                    </span>
                  </td>
                  <td className="p-3 border-r border-slate-200 text-center">
                    {editMode ? <input type="number" step="0.1" defaultValue={aluno.ga} className="w-12 text-center border p-1 rounded" /> : aluno.ga}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-center">
                    {editMode ? <input type="number" step="0.1" defaultValue={aluno.gb} className="w-12 text-center border p-1 rounded" /> : aluno.gb}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-center">
                    {editMode ? <input type="number" step="0.1" defaultValue={aluno.gc} className="w-12 text-center border p-1 rounded" /> : aluno.gc}
                  </td>
                  <td className="p-3 border-r border-slate-200 text-center font-black bg-slate-100">{total}</td>
                  <td className="p-3 text-slate-500 italic">
                    {editMode ? <input type="text" placeholder="Adicionar feedback..." className="w-full border p-1 rounded" /> : "Desempenho satisfatório."}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h3 className="font-bold text-lg text-slate-800">Diário de Classe Eletrônico</h3>
        <p className="text-xs text-slate-500">Mapeamento de Presenças (✔) e Faltas (X). Data Limite: 18/07/2026</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-200 text-slate-700">
              <th rowSpan="2" className="p-2 border border-slate-300 font-bold w-1/3">Estudante</th>
              <th rowSpan="2" className="p-2 border border-slate-300 font-bold text-center">Situação</th>
              <th rowSpan="2" className="p-2 border border-slate-300 font-bold text-center">Faltas</th>
              <th colSpan="3" className="p-2 border border-slate-300 font-bold text-center bg-slate-300">07/07</th>
            </tr>
            <tr className="bg-slate-100 text-slate-700 text-center text-[10px]">
              <th className="p-1 border border-slate-300">07:30 - 08:20</th>
              <th className="p-1 border border-slate-300">08:20 - 09:10</th>
              <th className="p-1 border border-slate-300">09:10 - 10:00</th>
            </tr>
          </thead>
          <tbody>
            {students.map((aluno) => (
              <tr key={aluno.id} className="hover:bg-slate-50">
                <td className="p-2 border border-slate-200 font-medium text-slate-800">{aluno.nome}</td>
                <td className="p-2 border border-slate-200 text-center">{aluno.status === 'Ativo' ? 'Aprovado' : 'Reprovado por Faltas'}</td>
                <td className="p-2 border border-slate-200 text-center font-bold">{aluno.faltas.filter(f => f).length * 2}</td>
                {aluno.faltas.map((falta, i) => (
                  <td key={i} className={`p-2 border border-slate-200 text-center ${falta ? 'bg-slate-800' : 'bg-emerald-700'}`}>
                    <input type="checkbox" defaultChecked={!falta} disabled={!editMode} className="w-4 h-4 rounded text-white" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

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
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-sm transition-colors text-slate-400">
              <Calendar className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Calendário Institucional</span>}
            </button>
            <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 text-sm transition-colors text-slate-400">
              <FileBox className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span>Arquivos Privados</span>}
            </button>
            
            {sidebarOpen && <div className="mt-8 mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Meus Cursos</div>}
            
            <button onClick={() => setCurrentView('course_home')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${currentView === 'course_home' ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
              <Book className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{course.codigo}</span>}
            </button>
            <button onClick={() => setCurrentView('participants')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors pl-8 ${currentView === 'participants' ? 'text-teal-400' : 'hover:bg-slate-800 text-slate-400'}`}>
              <Users className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span>Participantes</span>}
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
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden sm:flex items-center text-sm font-semibold text-slate-600 gap-6">
              <span className="hover:text-teal-700 cursor-pointer border-b-2 border-teal-700 text-teal-700 py-5">Painel</span>
              <span className="hover:text-teal-700 cursor-pointer py-5">Meus Cursos</span>
              <span className="hover:text-teal-700 cursor-pointer py-5">Catálogo</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Pesquisar cursos..." className="pl-9 pr-4 py-1.5 bg-slate-100 border-transparent rounded-full text-xs focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all w-48" />
            </div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {course.nome}
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-medium">{course.codigo} • Curso de Especialização / Residência</p>
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

            {renderBreadcrumbs()}

            {role === 'aluno' && currentView === 'course_home' && (
              <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6 flex items-center justify-between shadow-sm">
                <div className="flex-1 mr-6">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-700">Progresso do Curso</span>
                    <span className="font-bold text-teal-700">{course.progresso}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div className="bg-teal-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${course.progresso}%` }}></div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 text-right">
                  <strong>4</strong> de <strong>9</strong> atividades concluídas
                </div>
              </div>
            )}

            {currentView === 'course_home' && renderCourseHome()}
            {currentView === 'grades' && renderGradebook()}
            {currentView === 'attendance' && renderAttendance()}
            {currentView === 'participants' && (
              <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-slate-300"/>
                <h3 className="text-lg font-bold text-slate-700">Lista de Participantes</h3>
                <p className="text-sm">Módulo em desenvolvimento. Aqui você verá todos os alunos matriculados.</p>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
