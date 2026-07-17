import React, { useState } from 'react';
import { 
  BookOpen, Calendar, FileText, Users, MessageSquare, 
  CheckCircle, FileSpreadsheet, ChevronDown, ChevronUp, 
  Plus, Edit3, MoreVertical, ClipboardList, Award, ShieldAlert,
  User, GraduationCap, LayoutDashboard, Send, Check, AlertCircle,
  Briefcase, FolderPlus, Settings, Bell, Trash2, Layers
} from 'lucide-react';

export default function UniversalResidencyPortal() {
  // Controle Geral de Nível de Acesso: 'admin' | 'professor' | 'aluno'
  const [userRole, setUserRole] = useState('admin');
  const [activeTab, setActiveTab] = useState('config-residencia');
  
  // Estado das Residências Cadastradas (Multi-Residências)
  const [residencias, setResidencias] = useState([
    { id: 'ab', nome: "Atenção Básica: Saúde da Família e Comunidade" },
    { id: 'sm', nome: "Saúde Mental e Coletiva" },
    { id: 'ue', nome: "Urgência, Emergência e Intensivismo" }
  ]);
  const [selectedResidencia, setSelectedResidencia] = useState('ab');

  // Estado Global de Disciplinas/Módulos
  const [disciplinas, setDisciplinas] = useState([
    { id: 'rm001', residenciaId: 'ab', codigo: 'RMAB001', titulo: 'Territorialização e Diagnóstico de Saúde', ementa: 'Análise demográfica, epidemiológica e socioeconômica do território adscrito. Estimativa rápida e mapeamento de vulnerabilidades.' },
    { id: 'rm002', residenciaId: 'ab', codigo: 'RMAB002', titulo: 'Clínica Ampliada e Projeto Terapêutico Singular', ementa: 'Discussão de casos complexos, genograma, ecomapa e articulação de redes vivas de cuidado na Atenção Primária.' },
    { id: 'rm003', residenciaId: 'sm', codigo: 'RMSM001', titulo: 'Rede de Atenção Psicossocial (RAPS)', ementa: 'Organização dos serviços de saúde mental, matriciamento e clínica da reforma psiquiátrica.' }
  ]);
  const [selectedDisciplina, setSelectedDisciplina] = useState('rm001');

  // Estado Global de Avisos/Mural
  const [avisos, setAvisos] = useState([
    { id: 1, disciplinaId: 'rm001', titulo: 'Mapeamento e Territorialização em Saúde', data: '17/07/2026', autor: 'Prof.ª Dra. Renata Gonçalves', conteudo: 'Prezados residentes, o objetivo central deste módulo consiste em analisar criticamente o território das suas respectivas UBS de atuação.' }
  ]);

  // Estado dos Alunos, Notas e Faltas (Unificado)
  const [residentes, setResidentes] = useState([
    { id: 1, residenciaId: 'ab', disciplinaId: 'rm001', nome: "Ana Silva (Enfermagem)", faltas: 2, ga: 8.5, gb: 9.0, gc: "", status: "Aprovado", parecer: "Excelente desempenho nas atividades práticas de territorialização." },
    { id: 2, residenciaId: 'ab', disciplinaId: 'rm001', nome: "Bruno Costa (Odontologia)", faltas: 0, ga: 7.8, gb: 8.3, gc: "", status: "Aprovado", parecer: "Demonstra ótima integração com a equipe multiprofissional." },
    { id: 3, residenciaId: 'ab', disciplinaId: 'rm001', nome: "Carlos Souza (Psicologia)", faltas: 4, ga: 5.5, gb: 6.0, gc: 7.5, status: "Aprovado pelo Exame", parecer: "Necessita qualificar a entrega dos relatórios de campo." },
    { id: 4, residenciaId: 'ab', disciplinaId: 'rm001', nome: "Daniela Lima (Serviço Social)", faltas: 1, ga: 9.2, gb: 9.5, gc: "", status: "Aprovado", parecer: "Liderança destacada nas discussões de caso clínico." },
    { id: 5, residenciaId: 'ab', disciplinaId: 'rm001', nome: "Eduardo Reis (Nutrição)", faltas: 12, ga: 4.0, gb: 2.5, gc: 0, status: "Reprovado por Faltas", parecer: "Excedeu o limite de faltas permitido no edital da Coremu." },
  ]);
  const [selectedStudentId, setSelectedStudentId] = useState(1);

  // Estados de Formulário (Inclusão de Dados)
  const [newResidenciaNome, setNewResidenciaNome] = useState('');
  const [newDiscCodigo, setNewDiscCodigo] = useState('');
  const [newDiscTitulo, setNewDiscTitulo] = useState('');
  const [newDiscEmenta, setNewDiscEmenta] = useState('');
  const [newAvisoTitulo, setNewAvisoTitulo] = useState('');
  const [newAvisoConteudo, setNewAvisoConteudo] = useState('');

  // Handlers do Administrador
  const addResidencia = (e) => {
    e.preventDefault();
    if (!newResidenciaNome) return;
    const id = Math.random().toString(36).substr(2, 2);
    setResidencias([...residencias, { id, nome: newResidenciaNome }]);
    setNewResidenciaNome('');
  };

  const addDisciplina = (e) => {
    e.preventDefault();
    if (!newDiscCodigo || !newDiscTitulo) return;
    const id = Math.random().toString(36).substr(2, 5);
    setDisciplinas([...disciplinas, {
      id, residenciaId: selectedResidencia, codigo: newDiscCodigo, titulo: newDiscTitulo, ementa: newDiscEmenta
    }]);
    setNewDiscCodigo(''); setNewDiscTitulo(''); setNewDiscEmenta('');
  };

  const addAviso = (e) => {
    e.preventDefault();
    if (!newAvisoTitulo || !newAvisoConteudo) return;
    setAvisos([...avisos, {
      id: Date.now(), disciplinaId: selectedDisciplina, titulo: newAvisoTitulo, data: '17/07/2026', autor: 'Coordenação Acadêmica', conteudo: newAvisoConteudo
    }]);
    setNewAvisoTitulo(''); setNewAvisoConteudo('');
  };

  // Handlers de Notas e Frequência (Professor)
  const handleNotaChange = (id, campo, valor) => {
    const numValor = valor === "" ? "" : parseFloat(valor) || 0;
    setResidentes(prev => prev.map(res => {
      if (res.id === id) {
        const updated = { ...res, [campo]: numValor };
        const ga = updated.ga || 0; const gb = updated.gb || 0; const gc = updated.gc !== "" ? updated.gc : null;
        let notaFinal = (ga + gb) / 2;
        if (gc !== null) notaFinal = (notaFinal + gc) / 2;
        updated.total = parseFloat(notaFinal.toFixed(2));
        updated.status = updated.faltas > 10 ? "Reprovado por Faltas" : (notaFinal >= 7 ? "Aprovado" : "Em Exame (GC)");
        return updated;
      }
      return res;
    }));
  };

  const handlePresencaChange = (id, estavaPresente) => {
    setResidentes(prev => prev.map(res => {
      if (res.id === id) {
        const novasFaltas = estavaPresente ? Math.max(0, res.faltas - 1) : res.faltas + 1;
        return { ...res, faltas: novasFaltas, status: novasFaltas > 10 ? "Reprovado por Faltas" : res.status };
      }
      return res;
    }));
  };

  // Seleções Atuais de Contexto
  const currentResidenciaObj = residencias.find(r => r.id === selectedResidencia);
  const currentDisciplinaObj = disciplinas.find(d => d.id === selectedDisciplina);
  const filtradasDisciplinas = disciplinas.filter(d => d.residenciaId === selectedResidencia);
  const filtradosResidentes = residentes.filter(r => r.disciplinaId === selectedDisciplina);
  const filtradosAvisos = avisos.filter(a => a.disciplinaId === selectedDisciplina);
  const alunoLogado = residentes.find(r => r.id === selectedStudentId);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      
      {/* CONTROLADOR DE AMBIENTE / ROLES */}
      <div className="bg-slate-900 text-white px-6 py-2.5 flex flex-wrap items-center justify-between text-xs border-b border-slate-700 shadow-md">
        <div className="flex items-center space-x-2 font-medium">
          <ShieldAlert className="text-teal-400 w-4 h-4" />
          <span>Seletor de Perfil Institucional:</span>
        </div>
        <div className="flex items-center space-x-4 my-1 sm:my-0">
          <select 
            value={userRole} 
            onChange={(e) => { 
              setUserRole(e.target.value); 
              setActiveTab(e.target.value === 'admin' ? 'config-residencia' : 'visao-modulo'); 
            }}
            className="bg-slate-800 text-white rounded px-3 py-1 border border-slate-600 focus:outline-none font-semibold text-xs"
          >
            <option value="admin">⚙️ SUPER ADMIN / COREMU</option>
            <option value="professor">👨‍🏫 PRECEPTOR / PROFESSOR</option>
            <option value="aluno">🎓 RESIDENTE / ALUNO</option>
          </select>

          {userRole === 'aluno' && (
            <select 
              value={selectedStudentId} 
              onChange={(e) => setSelectedStudentId(parseInt(e.target.value))}
              className="bg-slate-800 text-white rounded px-2 py-1 border border-slate-600 focus:outline-none"
            >
              {residentes.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* HEADER DE MARCA INSTITUCIONAL */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex justify-between items-center shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white p-2 rounded-xl font-black text-xs tracking-wider shadow-sm">
            COREMU
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-slate-900">Plataforma Unificada de Residências em Saúde</h1>
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Hospital de Clínicas & Unidades Adscritas</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold block text-slate-800">Seletor de Programa:</span>
            <select 
              value={selectedResidencia}
              onChange={(e) => { setSelectedResidencia(e.target.value); }}
              className="text-xs bg-slate-100 text-slate-700 font-medium p-1 rounded border border-slate-200 mt-0.5 focus:outline-none"
            >
              {residencias.map(r => <option key={r.id} value={r.id}>{r.nome}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* NAVEGAÇÃO DINÂMICA DE ACORDO COM O PERFIL */}
      <div className="bg-white border-b border-slate-200 px-6 pt-2">
        <div className="max-w-7xl mx-auto flex space-x-2 overflow-x-auto">
          {userRole === 'admin' && (
            <>
              <button onClick={() => setActiveTab('config-residencia')} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition ${activeTab === 'config-residencia' ? 'bg-slate-50 text-teal-700 border-t border-x border-slate-200' : 'text-slate-500'}`}>🏢 Estruturar Residências</button>
              <button onClick={() => setActiveTab('config-disciplinas')} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition ${activeTab === 'config-disciplinas' ? 'bg-slate-50 text-teal-700 border-t border-x border-slate-200' : 'text-slate-500'}`}>📚 Nova Disciplina / Ementa</button>
              <button onClick={() => setActiveTab('config-avisos')} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition ${activeTab === 'config-avisos' ? 'bg-slate-50 text-teal-700 border-t border-x border-slate-200' : 'text-slate-500'}`}>📢 Lançar Avisos Globais</button>
            </>
          )}
          {(userRole === 'professor' || userRole === 'aluno') && (
            <>
              <button onClick={() => setActiveTab('visao-modulo')} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition ${activeTab === 'visao-modulo' ? 'bg-slate-50 text-teal-700 border-t border-x border-slate-200' : 'text-slate-500'}`}>📖 Mural e Ementas</button>
              {userRole === 'professor' && (
                <>
                  <button onClick={() => setActiveTab('prof-frequencia')} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition ${activeTab === 'prof-frequencia' ? 'bg-slate-50 text-teal-700 border-t border-x border-slate-200' : 'text-slate-500'}`}>📅 Diário de Frequência</button>
                  <button onClick={() => setActiveTab('prof-notas')} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition ${activeTab === 'prof-notas' ? 'bg-slate-50 text-teal-700 border-t border-x border-slate-200' : 'text-slate-500'}`}>📊 Caderneta de Notas</button>
                </>
              )}
              {userRole === 'aluno' && (
                <button onClick={() => setActiveTab('aluno-boletim')} className={`px-4 py-2 text-xs font-bold rounded-t-lg transition ${activeTab === 'aluno-boletim' ? 'bg-slate-50 text-teal-700 border-t border-x border-slate-200' : 'text-slate-500'}`}>📈 Meu Boletim Individual</button>
              )}
            </>
          )}
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL DO WORKSPACE */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* SELECTOR DE COMPONENTE CURRICULAR ATIVO */}
        {(userRole === 'professor' || userRole === 'aluno') && (
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 p-4 rounded-xl border border-teal-100 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[9px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded uppercase">Componente Curricular em Foco:</span>
              <h2 className="text-base font-black text-slate-900 mt-1">{currentDisciplinaObj?.codigo} - {currentDisciplinaObj?.titulo}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-600">Alternar Disciplina:</label>
              <select 
                value={selectedDisciplina} 
                onChange={(e) => setSelectedDisciplina(e.target.value)}
                className="text-xs bg-white text-slate-800 p-1.5 rounded-lg border border-slate-200 font-medium focus:outline-none shadow-xs"
              >
                {filtradasDisciplinas.map(d => <option key={d.id} value={d.id}>{d.titulo}</option>)}
              </select>
            </div>
          </div>
        )}

        {/* ==================== TABS DO SUPER ADMIN ==================== */}
        {activeTab === 'config-residencia' && userRole === 'admin' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5"><Layers className="w-4 h-4 text-teal-700"/><span>Criação de Novos Programas de Residência</span></h3>
            <form onSubmit={addResidencia} className="flex gap-2 max-w-md">
              <input type="text" value={newResidenciaNome} onChange={(e) => setNewResidenciaNome(e.target.value)} placeholder="Ex: Urgência e Emergência" className="text-xs flex-1 border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-teal-500 focus:outline-none" />
              <button type="submit" className="bg-teal-700 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-teal-800 flex items-center space-x-1"><Plus className="w-3.5 h-3.5"/><span>Cadastrar</span></button>
            </form>
            <div className="border border-slate-100 rounded-lg divide-y divide-slate-100 text-xs">
              {residencias.map(r => (
                <div key={r.id} className="p-3 flex justify-between items-center hover:bg-slate-50 font-medium text-slate-800">
                  <span>🎓 Componente Coremu: <strong>{r.nome}</strong></span>
                  <span className="text-[10px] font-bold text-slate-400">ID unificado: {r.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'config-disciplinas' && userRole === 'admin' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5"><FolderPlus className="w-4 h-4 text-blue-600"/><span>Inclusão de Disciplinas e Matrizes de Ementa</span></h3>
            <form onSubmit={addDisciplina} className="space-y-3 max-w-xl bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-3 gap-2">
                <input type="text" value={newDiscCodigo} onChange={(e) => setNewDiscCodigo(e.target.value)} placeholder="Código (Ex: RMAB003)" className="text-xs border border-slate-300 rounded p-2 bg-white" />
                <input type="text" value={newDiscTitulo} onChange={(e) => setNewDiscTitulo(e.target.value)} placeholder="Nome do Componente" className="text-xs col-span-2 border border-slate-300 rounded p-2 bg-white" />
              </div>
              <textarea value={newDiscEmenta} onChange={(e) => setNewDiscEmenta(e.target.value)} placeholder="Descrição da ementa programática..." className="text-xs w-full border border-slate-300 rounded p-2 bg-white h-20" />
              <button type="submit" className="bg-teal-700 text-white px-4 py-2 rounded text-xs font-bold hover:bg-teal-800">Salvar na Residência Atual</button>
            </form>
          </div>
        )}

        {activeTab === 'config-avisos' && userRole === 'admin' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5"><Bell className="w-4 h-4 text-amber-500"/><span>Mural Geral de Avisos e Comunicação</span></h3>
            <form onSubmit={addAviso} className="space-y-3 max-w-xl">
              <input type="text" value={newAvisoTitulo} onChange={(e) => setNewAvisoTitulo(e.target.value)} placeholder="Título do Comunicado Importante" className="text-xs w-full border border-slate-300 rounded p-2" />
              <textarea value={newAvisoConteudo} onChange={(e) => setNewAvisoConteudo(e.target.value)} placeholder="Texto completo do aviso..." className="text-xs w-full border border-slate-300 rounded p-2 h-24" />
              <button type="submit" className="bg-amber-600 text-white px-4 py-2 rounded text-xs font-bold hover:bg-amber-700">Publicar Aviso no Mural</button>
            </form>
          </div>
        )}

        {/* ==================== VISION COMPARTILHADA: MURAL E EMENTAS ==================== */}
        {activeTab === 'visao-modulo' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Ementa do Componente</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3.5 rounded-xl border border-slate-100">{currentDisciplinaObj?.ementa}</p>
              </div>
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Mural de Avisos Integrados</h3>
                {filtradosAvisos.length === 0 ? <p className="text-xs italic text-slate-400">Nenhum aviso vigente para este módulo.</p> : 
                  filtradosAvisos.map(a => (
                    <div key={a.id} className="p-4 border-l-4 border-teal-600 bg-teal-50/20 rounded-r-xl space-y-1.5 text-xs">
                      <div className="flex justify-between font-bold text-slate-900">
                        <span>{a.titulo}</span>
                        <span className="text-[10px] text-slate-400">{a.data}</span>
                      </div>
                      <p className="text-slate-600">{a.conteudo}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">— Emitido por: {a.autor}</p>
                    </div>
                  ))
                }
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Materiais Complementares</h3>
                <div className="p-2.5 border border-slate-100 bg-slate-50 rounded-lg text-xs font-medium flex items-center justify-between">
                  <span className="truncate">Projeto_Politico_Pedagogico.pdf</span>
                  <FileText className="text-red-500 w-4 h-4 flex-shrink-0" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== PAINEL DO PROFESSOR: FREQUÊNCIA ==================== */}
        {activeTab === 'prof-frequencia' && userRole === 'professor' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Controle Diário de Frequência das Atividades Coletivas</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nome do Residente</th>
                    <th className="p-3 text-center">Faltas Computadas</th>
                    <th className="p-3 text-center">Encontro 1 (Presença)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filtradosResidentes.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-3 text-slate-900">{r.nome}</td>
                      <td className="p-3 text-center font-bold text-amber-700">{r.faltas}</td>
                      <td className="p-3 text-center">
                        <input type="checkbox" defaultChecked onChange={(e) => handlePresencaChange(r.id, e.target.checked)} className="rounded text-teal-700 focus:ring-teal-500 w-4 h-4" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== PAINEL DO PROFESSOR: CENTRAL DE NOTAS ==================== */}
        {activeTab === 'prof-notas' && userRole === 'professor' && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Lançamento de Avaliações Somativas & Pareceres</h3>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Residente</th>
                    <th className="p-3 text-center">GA</th>
                    <th className="p-3 text-center">GB</th>
                    <th className="p-3 text-center">GC</th>
                    <th className="p-3 text-center">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filtradosResidentes.map(r => (
                    <tr key={r.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold text-slate-900">{r.nome}</td>
                      <td className="p-3 text-center"><input type="number" step="0.1" value={r.ga} onChange={(e) => handleNotaChange(r.id, 'ga', e.target.value)} className="w-12 text-center p-1 border border-slate-200 rounded" /></td>
                      <td className="p-3 text-center"><input type="number" step="0.1" value={r.gb} onChange={(e) => handleNotaChange(r.id, 'gb', e.target.value)} className="w-12 text-center p-1 border border-slate-200 rounded" /></td>
                      <td className="p-3 text-center"><input type="number" step="0.1" value={r.gc} placeholder="-" onChange={(e) => handleNotaChange(r.id, 'gc', e.target.value)} className="w-12 text-center p-1 border border-slate-200 rounded" /></td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${r.status === 'Aprovado' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================== PAINEL DO ALUNO: BOLETIM PRIVADO ==================== */}
        {activeTab === 'aluno-boletim' && userRole === 'aluno' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-1.5"><GraduationCap className="text-teal-700 w-5 h-5"/><span>Extrato de Avaliações e Notas Individuais</span></h3>
                <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full uppercase tracking-wider">Módulo Corrente</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200"><p className="text-[10px] uppercase font-bold text-slate-400">Avaliação GA</p><p className="text-xl font-black text-slate-800 mt-1">{alunoLogado?.ga || '-'}</p></div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200"><p className="text-[10px] uppercase font-bold text-slate-400">Avaliação GB</p><p className="text-xl font-black text-slate-800 mt-1">{alunoLogado?.gb || '-'}</p></div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200"><p className="text-[10px] uppercase font-bold text-slate-400">Exame GC</p><p className="text-xl font-black text-slate-800 mt-1">{alunoLogado?.gc || 'N/A'}</p></div>
                <div className="p-3 bg-teal-50 rounded-xl border border-teal-200"><p className="text-[10px] uppercase font-bold text-teal-800">Resultado Final</p><p className="text-xl font-black text-teal-900 mt-1">{alunoLogado?.status}</p></div>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs leading-relaxed">
                <span className="font-bold block text-slate-800">Feedback Qualitativo do Preceptor Responsável:</span>
                <p className="italic text-slate-600 mt-1">"{alunoLogado?.parecer}"</p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
