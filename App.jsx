import React, { useState } from 'react';
import { 
  BookOpen, Calendar, FileText, Users, MessageSquare, 
  CheckCircle, FileSpreadsheet, ChevronDown, ChevronUp, 
  Plus, Edit3, MoreVertical, ClipboardList, Award, ShieldAlert,
  User, GraduationCap, LayoutDashboard, Send, Check, AlertCircle,
  Briefcase, FolderPlus, Settings, Bell, Trash2, Layers, Archive, Lock, Unlock
} from 'lucide-react';

export default function EternalResidencyEnterprise() {
  // Controle de Autenticação / Papel no Sistema
  // 'gestor_coremu' -> Cria programas, ementas, turmas, gerencia ciclos e arquiva históricos.
  // 'preceptor_docente' -> Lança notas de competência (GA, GB, GC) e frequências na sua disciplina.
  // 'residente_aluno' -> Visão limpa e restrita ao seu boletim, portfólio e histórico individual.
  const [userRole, setUserRole] = useState('gestor_coremu');
  const [activeTab, setActiveTab] = useState('gestao-ciclos');

  // 1. BANCO DE DADOS PARAMETRIZADO: CICLOS ACADÊMICOS (Eternidade do Sistema)
  const [ciclos, setCiclos] = useState([
    { id: '2025_1', nome: 'Ciclo Letivo 2025/1', status: 'arquivado' },
    { id: '2025_2', nome: 'Ciclo Letivo 2025/2', status: 'arquivado' },
    { id: '2026_1', nome: 'Ciclo Letivo 2026/1', status: 'ativo' },
    { id: '2026_2', nome: 'Ciclo Letivo 2026/2', status: 'planejamento' },
  ]);
  const [selectedCiclo, setSelectedCiclo] = useState('2026_1');

  // 2. PROGRAMAS DE RESIDÊNCIA (Multi-residências vinculadas à COREMU)
  const [programas, setProgramas] = useState([
    { id: 'ab', nome: 'Residência Multiprofissional em Atenção Básica: Saúde da Família e Comunidade' },
    { id: 'sm', nome: 'Residência Multiprofissional em Saúde Mental e Coletiva' },
    { id: 'ue', nome: 'Residência em Urgência, Emergência e Intensivismo' }
  ]);
  const [selectedPrograma, setSelectedPrograma] = useState('ab');

  // 3. MATRIZ CURRICULAR (Ementário Geral gerenciado APENAS pelo Gestor)
  const [matrizDisciplinas, setMatrizDisciplinas] = useState([
    { id: 'm1', programaId: 'ab', codigo: 'RMAB001', titulo: 'Territorialização e Diagnóstico de Saúde Comunitária', ementa: 'Análise demográfica, epidemiológica e socioeconômica do território adscrito. Estimativa rápida e mapeamento de vulnerabilidades.' },
    { id: 'm2', programaId: 'ab', codigo: 'RMAB002', titulo: 'Clínica Ampliada e Projeto Terapêutico Singular (PTS)', ementa: 'Discussão de casos complexos, genograma, ecomapa e articulação de redes vivas de cuidado na Atenção Primária.' },
    { id: 'm3', programaId: 'sm', codigo: 'RMSM001', titulo: 'Rede de Atenção Psicossocial (RAPS)', ementa: 'Organização dos serviços de saúde mental, matriciamento e clínica da reforma psiquiátrica.' }
  ]);
  const [selectedDisciplina, setSelectedDisciplina] = useState('m1');

  // 4. DIÁRIO DE NOTAS, FREQUÊNCIA E HISTÓRICO VINCULADO AO CICLO SELECIONADO
  const [historicoNotas, setHistoricoNotas] = useState([
    // Ciclo Ativo (2026/1)
    { id: 'h1', cicloId: '2026_1', disciplinaId: 'm1', alunoId: 1, nome: "Ana Silva (Enfermagem)", ga: 8.5, gb: 9.0, gc: "", faltas: 2, parecer: "Excelente desempenho nas atividades práticas de campo." },
    { id: 'h2', cicloId: '2026_1', disciplinaId: 'm1', alunoId: 2, nome: "Bruno Costa (Odontologia)", ga: 7.8, gb: 8.3, gc: "", faltas: 0, parecer: "Demonstra ótima integração com a equipe multiprofissional." },
    { id: 'h3', cicloId: '2026_1', disciplinaId: 'm1', alunoId: 3, nome: "Carlos Souza (Psicologia)", ga: 5.5, gb: 6.0, gc: 7.5, faltas: 4, parecer: "Necessita qualificar a entrega dos relatórios finais." },
    // Registro Congelado / Arquivado (2025/1) para demonstração de histórico imutável
    { id: 'h4', cicloId: '2025_1', disciplinaId: 'm1', alunoId: 1, nome: "Ana Silva (Enfermagem)", ga: 9.0, gb: 9.5, gc: "", faltas: 1, parecer: "Aprovada com louvor no ciclo anterior." }
  ]);
  const [selectedStudentId, setSelectedStudentId] = useState(1);

  // Estados de Formulários de Gestão (Exclusivos do Gestor)
  const [newCicloNome, setNewCicloNome] = useState('');
  const [newProgNome, setNewProgNome] = useState('');
  const [newDiscCodigo, setNewDiscCodigo] = useState('');
  const [newDiscTitulo, setNewDiscTitulo] = useState('');
  const [newDiscEmenta, setNewDiscEmenta] = useState('');

  // Lógica do Gestor: Criar Ciclos e Arquivar
  const handleCriarCiclo = (e) => {
    e.preventDefault();
    if (!newCicloNome) return;
    const id = 'ciclo_' + Date.now();
    setCiclos([...ciclos, { id, nome: newCicloNome, status: 'planejamento' }]);
    setNewCicloNome('');
  };

  const handleAlternarStatusCiclo = (id, novoStatus) => {
    setCiclos(prev => prev.map(c => c.id === id ? { ...c, status: novoStatus } : c));
  };

  // Lógica do Gestor: Incluir Disciplina na Matriz
  const handleCriarDisciplina = (e) => {
    e.preventDefault();
    if (!newDiscCodigo || !newDiscTitulo) return;
    const id = 'm_' + Date.now();
    setMatrizDisciplinas([...matrizDisciplinas, {
      id, programaId: selectedPrograma, codigo: newDiscCodigo, titulo: newDiscTitulo, ementa: newDiscEmenta
    }]);
    setNewDiscCodigo(''); setNewDiscTitulo(''); setNewDiscEmenta('');
  };

  // Lógica do Preceptor: Modificar Notas (Apenas se o ciclo estiver 'ativo')
  const handlePreceptorNota = (id, campo, valor) => {
    const cicloIdAtual = ciclos.find(c => c.id === selectedCiclo);
    if (cicloIdAtual?.status === 'arquivado') {
      alert("⚠️ Erro de Segurança: Este ciclo está arquivado. Os registros históricos são imutáveis.");
      return;
    }
    const numValor = valor === "" ? "" : parseFloat(valor) || 0;
    setHistoricoNotas(prev => prev.map(item => item.id === id ? { ...item, [campo]: numValor } : item));
  };

  // Filtros de Contexto Baseado nas Seleções Activas
  const cicloAtivoObj = ciclos.find(c => c.id === selectedCiclo);
  const programaAtivoObj = programas.find(p => p.id === selectedPrograma);
  const disciplinasFiltradas = matrizDisciplinas.filter(m => m.programaId === selectedPrograma);
  const disciplinaAtivaObj = matrizDisciplinas.find(m => m.id === selectedDisciplina);
  const notasFiltradasPorCicloEDisciplina = historicoNotas.filter(h => h.cicloId === selectedCiclo && h.disciplinaId === selectedDisciplina);
  const meuBoletimAluno = historicoNotas.filter(h => h.alunoId === selectedStudentId && h.cicloId === selectedCiclo);

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      
      {/* SECURITY SIMULATOR BAR (Garante teste rápido de todos os cenários de uso) */}
      <div className="bg-slate-900 text-white px-6 py-2.5 flex flex-wrap items-center justify-between text-xs border-b border-slate-700 shadow-md">
        <div className="flex items-center space-x-2 font-medium">
          <ShieldAlert className="text-emerald-400 w-4 h-4" />
          <span>Autenticação de Sandbox (Simulação de Perfil):</span>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={userRole} 
            onChange={(e) => { 
              setUserRole(e.target.value); 
              setActiveTab(e.target.value === 'gestor_coremu' ? 'gestao-ciclos' : 'mural-modulo'); 
            }}
            className="bg-slate-800 text-white rounded px-2.5 py-1 border border-slate-600 focus:outline-none font-bold"
          >
            <option value="gestor_coremu">🏢 GESTOR / COORDENADOR COREMU</option>
            <option value="preceptor_docente">👨‍🏫 PRECEPTOR / DOCENTE</option>
            <option value="residente_aluno">🎓 RESIDENTE / ALUNO</option>
          </select>

          {userRole === 'residente_aluno' && (
            <select 
              value={selectedStudentId} 
              onChange={(e) => setSelectedStudentId(parseInt(e.target.value))}
              className="bg-slate-800 text-white rounded px-2 py-1 border border-slate-600 focus:outline-none"
            >
              <option value={1}>Ana Silva (Enfermagem)</option>
              <option value={2}>Bruno Costa (Odontologia)</option>
              <option value={3}>Carlos Souza (Psicologia)</option>
            </select>
          )}
        </div>
      </div>

      {/* HEADER PRINCIPAL INSTITUCIONAL */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap justify-between items-center gap-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-teal-800 to-teal-950 text-white p-2.5 rounded-xl font-black text-xs tracking-wider shadow-inner">
            HACO
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900">ERP Eterno • Sistema Integrado de Residências em Saúde</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hospital de Aeronáutica de Canoas / Subdivisão de Saúde</p>
          </div>
        </div>

        {/* CONTROLES DE ESCOPO GLOBAL (PROGRAMA E ANO/CICLO) */}
        <div className="flex items-center space-x-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div className="text-xs">
            <span className="block font-bold text-slate-500 text-[10px] uppercase">Ciclo de Gestão:</span>
            <select value={selectedCiclo} onChange={(e) => setSelectedCiclo(e.target.value)} className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer">
              {ciclos.map(c => <option key={c.id} value={c.id}>{c.nome} [{c.status.toUpperCase()}]</option>)}
            </select>
          </div>
          <div className="h-6 w-px bg-slate-300"></div>
          <div className="text-xs">
            <span className="block font-bold text-slate-500 text-[10px] uppercase">Programa Ativo:</span>
            <select value={selectedPrograma} onChange={(e) => { setSelectedPrograma(e.target.value); }} className="bg-transparent font-bold text-slate-900 focus:outline-none cursor-pointer">
              {programas.map(p => <option key={p.id} value={p.id}>{p.nome.split(':')[0]}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* ABAS DO SISTEMA ADAPTADAS AO PAPEL LOGADO */}
      <div className="bg-white border-b border-slate-200 px-6">
        <div className="max-w-7xl mx-auto flex space-x-2">
          {userRole === 'gestor_coremu' && (
            <>
              <button onClick={() => setActiveTab('gestao-ciclos')} className={`px-4 py-2.5 text-xs font-black rounded-t-xl border-t-2 transition ${activeTab === 'gestao-ciclos' ? 'bg-slate-100 text-teal-800 border-teal-700' : 'border-transparent text-slate-500'}`}>📅 Ciclos & Arquivamentos</button>
              <button onClick={() => setActiveTab('gestao-matriz')} className={`px-4 py-2.5 text-xs font-black rounded-t-xl border-t-2 transition ${activeTab === 'gestao-matriz' ? 'bg-slate-100 text-teal-800 border-teal-700' : 'border-transparent text-slate-500'}`}>📚 Matrizes de Ementas</button>
            </>
          )}
          {(userRole === 'preceptor_docente' || userRole === 'residente_aluno') && (
            <>
              <button onClick={() => setActiveTab('mural-modulo')} className={`px-4 py-2.5 text-xs font-black rounded-t-xl border-t-2 transition ${activeTab === 'mural-modulo' ? 'bg-slate-100 text-teal-800 border-teal-700' : 'border-transparent text-slate-500'}`}>📖 Mural Pedagógico</button>
              {userRole === 'preceptor_docente' && (
                <button onClick={() => setActiveTab('preceptor-notas')} className={`px-4 py-2.5 text-xs font-black rounded-t-xl border-t-2 transition ${activeTab === 'preceptor-notas' ? 'bg-slate-100 text-teal-800 border-teal-700' : 'border-transparent text-slate-500'}`}>📊 Diário & Lançamento de Notas</button>
              )}
              {userRole === 'residente_aluno' && (
                <button onClick={() => setActiveTab('aluno-boletim')} className={`px-4 py-2.5 text-xs font-black rounded-t-xl border-t-2 transition ${activeTab === 'aluno-boletim' ? 'bg-slate-100 text-teal-800 border-teal-700' : 'border-transparent text-slate-500'}`}>📈 Meu Painel de Notas de Campo</button>
              )}
            </>
          )}
        </div>
      </div>

      {/* CONTEÚDO DINÂMICO DE CADERNO */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* STATUS ALERT: CASO O CICLO ESTEJA ARQUIVADO (CONGELADO) */}
        {cicloAtivoObj?.status === 'arquivado' && (
          <div className="bg-amber-50 border-l-4 border-amber-600 p-3.5 rounded-r-xl flex items-center space-x-3 text-xs text-amber-900 font-semibold shadow-xs">
            <Archive className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Ciclo Histórico Arquivado Históricamente</p>
              <p className="font-normal text-amber-700">Este período letivo foi encerrado pela gestão. Todas as notas e frequências estão em modo de leitura imutável para auditorias.</p>
            </div>
          </div>
        )}

        {/* SELECTOR DE DISCIPLINA PARA PRECEPTORES E RESIDENTES */}
        {(userRole === 'preceptor_docente' || userRole === 'residente_aluno') && (
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap justify-between items-center gap-3">
            <div>
              <span className="text-[9px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded uppercase">Componente Curricular em Exibição:</span>
              <h2 className="text-sm font-black text-slate-900 mt-1">{disciplinaAtivaObj?.codigo} - {disciplinaAtivaObj?.titulo}</h2>
            </div>
            <select value={selectedDisciplina} onChange={(e) => setSelectedDisciplina(e.target.value)} className="text-xs font-bold bg-slate-50 border p-2 rounded-lg text-slate-700 focus:outline-none">
              {disciplinasFiltradas.map(d => <option key={d.id} value={d.id}>{d.titulo}</option>)}
            </select>
          </div>
        )}

        {/* 1. INTERFACE DO GESTOR: ARQUIVAMENTO E CRIAÇÃO DE CICLOS ANUAIS */}
        {activeTab === 'gestao-ciclos' && userRole === 'gestor_coremu' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 h-fit">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-500">Abrir Novo Ciclo Acadêmico</h3>
              <form onSubmit={handleCriarCiclo} className="space-y-3">
                <input type="text" value={newCicloNome} onChange={(e) => setNewCicloNome(e.target.value)} placeholder="Ex: Ciclo Letivo 2027/1" className="text-xs w-full border rounded-lg p-2.5 focus:ring-1 focus:ring-teal-700 focus:outline-none bg-slate-50" />
                <button type="submit" className="w-full bg-teal-800 text-white p-2 rounded-lg text-xs font-bold hover:bg-teal-900 transition flex items-center justify-center space-x-1"><Plus className="w-4 h-4"/><span>Inicializar Período</span></button>
              </form>
            </div>
            <div className="md:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-500">Mapeamento Eterno de Ciclos e Controle de Trava de Segurança</h3>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                {ciclos.map(c => (
                  <div key={c.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center space-x-2 font-bold text-slate-900">
                      <span>{c.nome}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-wider ${c.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : c.status === 'arquivado' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>{c.status}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {c.status === 'ativo' && (
                        <button onClick={() => handleAlternarStatusCiclo(c.id, 'arquivado')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold p-1 px-2 rounded flex items-center space-x-1 transition text-[10px]"><Lock className="w-3 h-3"/><span>Congelar e Arquivar</span></button>
                      )}
                      {c.status === 'arquivado' && (
                        <button onClick={() => handleAlternarStatusCiclo(c.id, 'ativo')} className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold p-1 px-2 rounded flex items-center space-x-1 transition text-[10px]"><Unlock className="w-3 h-3"/><span>Desarquivar</span></button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 2. INTERFACE DO GESTOR: MATRIZ CURRICULAR (EMENTÁRIO) */}
        {activeTab === 'gestao-matriz' && userRole === 'gestor_coremu' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-500 flex items-center space-x-1"><FolderPlus className="text-teal-700 w-4 h-4"/><span>Gerenciador de Ementas de Cursos</span></h3>
            <form onSubmit={handleCriarDisciplina} className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 max-w-4xl">
              <input type="text" value={newDiscCodigo} onChange={(e) => setNewDiscCodigo(e.target.value)} placeholder="Código (Ex: RMAB004)" className="text-xs p-2 rounded border bg-white" />
              <input type="text" value={newDiscTitulo} onChange={(e) => setNewDiscTitulo(e.target.value)} placeholder="Nome do Componente Curricular" className="text-xs p-2 rounded border bg-white sm:col-span-2" />
              <textarea value={newDiscEmenta} onChange={(e) => setNewDiscEmenta(e.target.value)} placeholder="Definição da Ementa Regulamentar..." className="text-xs p-2 rounded border bg-white sm:col-span-3 h-16" />
              <button type="submit" className="bg-teal-800 text-white p-2 rounded font-bold text-xs hover:bg-teal-900 transition sm:col-span-1">Adicionar na Matriz</button>
            </form>
            <div className="grid grid-cols-1 gap-3 pt-2 text-xs">
              {disciplinasFiltradas.map(d => (
                <div key={d.id} className="p-3.5 border border-slate-200 rounded-xl space-y-1 bg-slate-50/30">
                  <span className="font-black text-teal-800 text-xs">{d.codigo} — {d.titulo}</span>
                  <p className="text-slate-600 font-medium leading-relaxed">{d.ementa}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. INTERFACE COMPARTILHADA: MURAL PEDAGÓGICO */}
        {activeTab === 'mural-modulo' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">Diretrizes da Ementa Oficial do Componente</h3>
            <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed italic">"{disciplinaAtivaObj?.ementa}"</p>
          </div>
        )}

        {/* 4. INTERFACE DO PRECEPTOR: DIÁRIO DE NOTAS (COM TRAVA DE ARQUIVO HISTÓRICO) */}
        {activeTab === 'preceptor-notas' && userRole === 'preceptor_docente' && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-500">Caderneta Digital de Avaliação Somativa</h3>
              {cicloAtivoObj?.status === 'arquivado' && <span className="bg-red-100 text-red-800 text-[10px] p-1 px-2 rounded-md font-bold uppercase tracking-wider flex items-center gap-1"><Lock className="w-3 h-3"/>Leitura Histórica Bloqueada</span>}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 font-bold text-slate-700 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Residente Integrante</th>
                    <th className="p-3.5 text-center">Nota GA</th>
                    <th className="p-3.5 text-center">Nota BB</th>
                    <th className="p-3.5 text-center">Nota GC</th>
                    <th className="p-3.5 text-center">Faltas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {notasFiltradasPorCicloEDisciplina.map(n => (
                    <tr key={n.id} className="hover:bg-slate-50/50">
                      <td className="p-3.5 font-bold text-slate-950">{n.nome}</td>
                      <td className="p-3.5 text-center">
                        <input type="number" step="0.1" value={n.ga} disabled={cicloAtivoObj?.status === 'arquivado'} onChange={(e) => handlePreceptorNota(n.id, 'ga', e.target.value)} className="w-12 text-center p-1 border rounded focus:outline-none font-bold disabled:bg-slate-100" />
                      </td>
                      <td className="p-3.5 text-center">
                        <input type="number" step="0.1" value={n.gb} disabled={cicloAtivoObj?.status === 'arquivado'} onChange={(e) => handlePreceptorNota(n.id, 'gb', e.target.value)} className="w-12 text-center p-1 border rounded focus:outline-none font-bold disabled:bg-slate-100" />
                      </td>
                      <td className="p-3.5 text-center">
                        <input type="number" step="0.1" value={n.gc} disabled={cicloAtivoObj?.status === 'arquivado'} onChange={(e) => handlePreceptorNota(n.id, 'gc', e.target.value)} className="w-12 text-center p-1 border rounded focus:outline-none font-bold disabled:bg-slate-100" />
                      </td>
                      <td className="p-3.5 text-center font-bold text-amber-800 bg-amber-50/20">{n.faltas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 5. INTERFACE DO RESIDENTE: BOLETIM HISTÓRICO DA SUA JORNADA */}
        {activeTab === 'aluno-boletim' && userRole === 'residente_aluno' && (
          <div className="space-y-4">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-400">Meu Extrato Consolidado no Ciclo {cicloAtivoObj?.nome}</h3>
            {meuBoletimAluno.length === 0 ? <p className="text-xs italic text-slate-400">Nenhum registro de avaliação lançado para você neste ciclo e disciplina.</p> :
              meuBoletimAluno.map(b => (
                <div key={b.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-2">
                    <span className="text-[10px] font-bold text-teal-800 uppercase tracking-widest bg-teal-50 px-2 py-0.5 rounded">Componente Técnico</span>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-1">{disciplinaAtivaObj?.titulo}</h4>
                    <p className="text-slate-500 text-[11px] mt-1 italic">Parecer: "{b.parecer}"</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-3 rounded-xl border border-slate-100 md:col-span-2">
                    <div><span className="text-[9px] font-bold text-slate-400 uppercase">GA</span><p className="font-black text-sm text-slate-800 mt-0.5">{b.ga || '-'}</p></div>
                    <div><span className="text-[9px] font-bold text-slate-400 uppercase">GB</span><p className="font-black text-sm text-slate-800 mt-0.5">{b.gb || '-'}</p></div>
                    <div><span className="text-[9px] font-bold text-slate-400 uppercase">Média</span><p className="font-black text-sm text-teal-800 mt-0.5">{(((b.ga || 0) + (b.gb || 0)) / 2).toFixed(1)}</p></div>
                  </div>
                </div>
              ))
            }
          </div>
        )}

      </main>
    </div>
  );
}
