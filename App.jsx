import React, { useState } from 'react';
import { 
  BookOpen, Calendar, FileText, Users, MessageSquare, 
  CheckCircle, FileSpreadsheet, ChevronDown, ChevronUp, 
  Plus, Edit3, MoreVertical, ClipboardList, Award, ShieldAlert,
  User, GraduationCap, LayoutDashboard, Send, Check, AlertCircle
} from 'lucide-react';

export default function ResidencyPortal() {
  // Controle de Perfil: 'professor' ou 'aluno'
  const [userRole, setUserRole] = useState('professor');
  // Se for aluno, qual aluno está logado (para simular a visão dele)
  const [selectedStudentId, setSelectedStudentId] = useState(1);
  
  const [activeTab, setActiveTab] = useState('curso');
  const [expandedSections, setExpandedSections] = useState({
    geral: true,
    mural: true,
    interacoes: false,
    materiais: true,
    atividades: true
  });

  // Estado dinâmico dos residentes para permitir edição em tempo real no painel do professor
  const [residentes, setResidentes] = useState([
    { id: 1, nome: "Ana Silva (Enfermagem)", faltas: 2, ga: 8.5, gb: 9.0, gc: "", status: "Aprovado", parecer: "Excelente desempenho nas atividades práticas de territorialização." },
    { id: 2, nome: "Bruno Costa (Odontologia)", faltas: 0, ga: 7.8, gb: 8.3, gc: "", status: "Aprovado", parecer: "Demonstra ótima integração com a equipe multiprofissional." },
    { id: 3, nome: "Carlos Souza (Psicologia)", faltas: 4, ga: 5.5, gb: 6.0, gc: 7.5, status: "Aprovado pelo Exame", parecer: "Necessita qualificar a entrega dos relatórios de campo." },
    { id: 4, nome: "Daniela Lima (Serviço Social)", faltas: 1, ga: 9.2, gb: 9.5, gc: "", status: "Aprovado", parecer: "Liderança destacada nas discussões de caso clínico." },
    { id: 5, nome: "Eduardo Reis (Nutrição)", faltas: 12, ga: 4.0, gb: 2.5, gc: 0, status: "Reprovado por Faltas", parecer: "Excedeu o limite de faltas permitido no edital da Coremu." },
  ]);

  // Simulação de entrega de arquivo pelo aluno
  const [fileSubmitted, setFileSubmitted] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Função para o professor atualizar notas em tempo real
  const handleNotaChange = (id, campo, valor) => {
    const numValor = valor === "" ? "" : parseFloat(valor) || 0;
    setResidentes(prev => prev.map(res => {
      if (res.id === id) {
        const updated = { ...res, [campo]: numValor };
        // Recalcula Nota Final e Status
        const ga = updated.ga || 0;
        const gb = updated.gb || 0;
        const gc = updated.gc !== "" ? updated.gc : null;
        
        let notaFinal = (ga + gb) / 2;
        if (gc !== null) notaFinal = (notaFinal + gc) / 2;
        
        updated.total = parseFloat(notaFinal.toFixed(2));
        
        if (updated.faltas > 10) {
          updated.status = "Reprovado por Faltas";
        } else if (gc !== null && notaFinal >= 7) {
          updated.status = "Aprovado pelo Exame";
        } else if (notaFinal >= 7) {
          updated.status = "Aprovado";
        } else {
          updated.status = "Em Exame (GC)";
        }
        return updated;
      }
      return res;
    }));
  };

  // Função para alternar presença no diário de classe
  const handlePresencaChange = (id, estavaPresente) => {
    setResidentes(prev => prev.map(res => {
      if (res.id === id) {
        const novasFaltas = estavaPresente ? Math.max(0, res.faltas - 1) : res.faltas + 1;
        return {
          ...res,
          faltas: novasFaltas,
          status: novasFaltas > 10 ? "Reprovado por Faltas" : res.status
        };
      }
      return res;
    }));
  };

  // Filtra os dados do aluno atualmente logado/selecionado
  const alunoLogado = residentes.find(r => r.id === selectedStudentId);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* SIMULADOR DE PERMISSÕES NO TOPO (Para fins de teste e apresentação) */}
      <div className="bg-slate-900 text-white px-6 py-2 flex flex-wrap items-center justify-between text-xs border-b border-slate-700">
        <div className="flex items-center space-x-2 font-medium">
          <ShieldAlert className="text-amber-500 w-4 h-4" />
          <span>Ambiente de Simulação de Níveis de Acesso:</span>
        </div>
        <div className="flex items-center space-x-4 my-1 sm:my-0">
          <div className="flex items-center space-x-2">
            <label className="font-semibold text-slate-300">Visualizar como:</label>
            <select 
              value={userRole} 
              onChange={(e) => { setUserRole(e.target.value); setActiveTab('curso'); }}
              className="bg-slate-800 text-white rounded px-2 py-1 border border-slate-600 focus:outline-none"
            >
              <option value="professor">👨‍🏫 Coordenador / Professor</option>
              <option value="aluno">🎓 Residente (Aluno)</option>
            </select>
          </div>

          {userRole === 'aluno' && (
            <div className="flex items-center space-x-2">
              <label className="font-semibold text-slate-300">Selecionar Aluno:</label>
              <select 
                value={selectedStudentId} 
                onChange={(e) => setSelectedStudentId(parseInt(e.target.value))}
                className="bg-slate-800 text-white rounded px-2 py-1 border border-slate-600 focus:outline-none"
              >
                {residentes.map(r => (
                  <option key={r.id} value={r.id}>{r.nome.split(' ')[0]}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Header Principal baseado no padrão Moinhos de Vento */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="bg-teal-700 text-white p-2 rounded-lg font-bold tracking-wider text-xs shadow-inner">
            COREMU
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Residência Multiprofissional em Atenção Básica</h1>
            <p className="text-[11px] text-slate-500">Saúde da Família e Comunidade • Ano Corrente 2026</p>
          </div>
        </div>
        <nav className="hidden md:flex space-x-6 text-xs font-medium text-slate-600">
          <button className="hover:text-teal-700 transition">Início</button>
          <button className="text-teal-700 border-b-2 border-teal-700 pb-1">Minhas Disciplinas</button>
        </nav>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-semibold text-xs">
            {userRole === 'professor' ? 'PROF' : 'RES'}
          </div>
          <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
            {userRole === 'professor' ? 'Coordenação/Docente' : 'Visão do Residente'}
          </span>
        </div>
      </header>

      {/* Sub-Header da Disciplina Atual */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 shadow-xs">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-between items-start gap-2">
            <div>
              <span className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-full">R1 / R2 Coremu</span>
              <h2 className="text-xl font-bold text-slate-900 mt-2">RMAB001 - Territorialização e Diagnóstico de Saúde da Comunidade</h2>
            </div>
            {userRole === 'aluno' && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                <p className="text-slate-500">Residente Autenticado:</p>
                <p className="font-bold text-slate-800">{alunoLogado?.nome}</p>
              </div>
            )}
          </div>
          
          {/* Navegação de Abas Internas (Estilo Moodle moderno) */}
          <div className="flex space-x-2 mt-6 border-b border-slate-200">
            <button
              onClick={() => setActiveTab('curso')}
              className={`px-4 py-2 font-medium text-xs transition-all rounded-t-lg -mb-px ${
                activeTab === 'curso' 
                  ? 'bg-slate-50 text-teal-700 border-t border-x border-slate-200 font-semibold' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              📚 Conteúdo do Módulo
            </button>
            
            {userRole === 'professor' ? (
              <>
                <button
                  onClick={() => setActiveTab('frequencia')}
                  className={`px-4 py-2 font-medium text-xs transition-all rounded-t-lg -mb-px ${
                    activeTab === 'frequencia' 
                      ? 'bg-slate-50 text-teal-700 border-t border-x border-slate-200 font-semibold' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  📅 Diário de Frequência (Geral)
                </button>
                <button
                  onClick={() => setActiveTab('notas')}
                  className={`px-4 py-2 font-medium text-xs transition-all rounded-t-lg -mb-px ${
                    activeTab === 'notas' 
                      ? 'bg-slate-50 text-teal-700 border-t border-x border-slate-200 font-semibold' 
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  📊 Central de Notas e Pareceres
                </button>
              </>
            ) : (
              <button
                onClick={() => setActiveTab('boletim-aluno')}
                className={`px-4 py-2 font-medium text-xs transition-all rounded-t-lg -mb-px ${
                  activeTab === 'boletim-aluno' 
                    ? 'bg-slate-50 text-teal-700 border-t border-x border-slate-200 font-semibold' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                📊 Meu Boletim & Frequência
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        
        {/* ABA 1: CONTEÚDO DO CURSO (Comum para ambos, mas com ações diferentes) */}
        {activeTab === 'curso' && (
          <div className="space-y-5">
            
            {/* Bloco Geral: Plano e Cronograma */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div 
                className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100"
                onClick={() => toggleSection('geral')}
              >
                <div className="flex items-center space-x-3">
                  <ClipboardList className="text-slate-500 w-4 h-4" />
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Documentos Norteadores e Cronogramas</h3>
                </div>
                {expandedSections.geral ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
              {expandedSections.geral && (
                <div className="p-4 space-y-3 text-xs text-slate-600 bg-white">
                  <p>Abaixo estão disponibilizados as referências técnicas obrigatórias para as atividades na Unidade Básica de Saúde (UBS) de atuação.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {['Plano de Ensino 2026.pdf', 'Cronograma de Rotações UBS.pdf', 'Diretrizes Coremu APS.pdf'].map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg bg-slate-50">
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="text-red-500 w-4 h-4 flex-shrink-0" />
                          <span className="truncate font-medium text-slate-700">{doc}</span>
                        </div>
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mural de Boas-Vindas */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div 
                className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100"
                onClick={() => toggleSection('mural')}
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="text-teal-600 w-4 h-4" />
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Mural de Avisos da Disciplina</h3>
                </div>
                {expandedSections.mural ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
              {expandedSections.mural && (
                <div className="p-5 text-xs text-slate-600 border-l-4 border-teal-600 bg-white space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-slate-900 text-sm">Mapeamento e Territorialização em Saúde</span>
                    {userRole === 'professor' && <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded font-medium">Postado por Você</span>}
                  </div>
                  <p>Prezados residentes, o objetivo central deste módulo consiste em analisar criticamente o território adscrito das suas respectivas UBS. Desenvolveremos competências sobre estimativa rápida, identificação de vulnerabilidades e levantamento de indicadores epidemiológicos locais.</p>
                </div>
              )}
            </div>

            {/* Materiais Didáticos */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div 
                className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100"
                onClick={() => toggleSection('materiais')}
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="text-blue-600 w-4 h-4" />
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Materiais Complementares de Campo</h3>
                </div>
                {expandedSections.materiais ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
              {expandedSections.materiais && (
                <div className="p-4 space-y-3 bg-white">
                  <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50 space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-semibold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Material de Apoio</span>
                        <h4 className="font-bold text-slate-900 mt-1">Metodologia de Estimativa Rápria para Diagnósticos de Saúde</h4>
                      </div>
                    </div>
                    <p className="text-slate-600">Texto base contendo os roteiros de entrevistas e análise de dados para o diagnóstico demográfico.</p>
                    <div className="inline-flex items-center space-x-2 p-1.5 bg-white rounded border border-slate-200 text-slate-700 font-medium">
                      <FileText className="text-red-500 w-3.5 h-3.5" />
                      <span>Manual_Estimativa_Rapida_APS.pdf</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Atividades Avaliativas / Entrega de Portfólio */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <div 
                className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100"
                onClick={() => toggleSection('atividades')}
              >
                <div className="flex items-center space-x-3">
                  <Award className="text-purple-600 w-4 h-4" />
                  <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">Atividades Práticas Obrigatórias</h3>
                </div>
                {expandedSections.atividades ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
              {expandedSections.atividades && (
                <div className="p-4 space-y-3 bg-white text-xs">
                  <div className="p-4 border border-purple-100 rounded-xl bg-purple-50/30 space-y-3">
                    <div className="flex flex-wrap justify-between items-start gap-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">GA 1 - Entrega do Projeto Terapêutico Singular (PTS)</h4>
                        <p className="text-slate-500 mt-0.5">Foco em família de alta vulnerabilidade social na comunidade.</p>
                      </div>
                      <span className="text-[10px] font-semibold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-full">Prazo Limite: 18/08/2026</span>
                    </div>

                    {/* Visão Dinâmica de Acordo com o Perfil logado */}
                    {userRole === 'aluno' ? (
                      <div className="bg-white p-3 border border-purple-100 rounded-lg mt-2">
                        <p className="font-semibold text-slate-700 mb-2">Área de Envio do Residente:</p>
                        {fileSubmitted ? (
                          <div className="flex items-center space-x-2 text-emerald-700 bg-emerald-50 p-2 rounded border border-emerald-200 font-medium">
                            <Check className="w-4 h-4" />
                            <span>Arquivo "PTS_Familia_Microarea3_Final.pdf" enviado com sucesso!</span>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-3">
                            <button 
                              onClick={() => setFileSubmitted(true)}
                              className="bg-purple-700 text-white px-3 py-1.5 rounded text-xs font-semibold hover:bg-purple-800 flex items-center space-x-1.5 transition"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Simular Upload de Arquivo</span>
                            </button>
                            <span className="text-slate-400 text-[11px]">Nenhum arquivo anexado ainda.</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-100 text-slate-700 p-2 rounded border border-slate-200 text-[11px] flex items-center space-x-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span><strong>Visão do Professor:</strong> Os residentes enviarão arquivos em PDF nesta seção. Você poderá gerenciar e atribuir notas na aba "Central de Notas".</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ABA 2 (PROFESSOR): DIÁRIO DE FREQUÊNCIA GERAL */}
        {activeTab === 'frequencia' && userRole === 'professor' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div className="flex flex-wrap justify-between items-center gap-2">
              <div>
                <h3 className="font-bold text-base text-slate-900">Diário de Presença Multiprofissional</h3>
                <p className="text-xs text-slate-500">Clique nos checkboxes para simular presenças/faltas e atualizar o diário imediatamente.</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-[11px] font-medium">
                Carga Horária Total: 60h
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="p-3">Nome do Residente</th>
                    <th className="p-3 text-center">Faltas Acumuladas</th>
                    <th className="p-3 text-center bg-teal-50 text-teal-900">Semana 1</th>
                    <th className="p-3 text-center bg-teal-50 text-teal-900">Semana 2</th>
                    <th className="p-3 text-center bg-slate-100 text-slate-900">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {residentes.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition">
                      <td className="p-3 font-medium text-slate-900">{res.nome}</td>
                      <td className="p-3 text-center font-bold text-amber-700 bg-amber-50/30">{res.faltas}</td>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          defaultChecked 
                          onChange={(e) => handlePresencaChange(res.id, e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4" 
                        />
                      </td>
                      <td className="p-3 text-center">
                        <input 
                          type="checkbox" 
                          defaultChecked={res.faltas === 0} 
                          onChange={(e) => handlePresencaChange(res.id, e.target.checked)}
                          className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4" 
                        />
                      </td>
                      <td className="p-3 text-center">
                        <span className="text-[10px] text-slate-400 font-medium">Atualizado automaticamente</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3 (PROFESSOR): CENTRAL DE NOTAS E PARECERES GERAL */}
        {activeTab === 'notas' && userRole === 'professor' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
            <div>
              <h3 className="font-bold text-base text-slate-900">Planilha de Avaliação por Competências</h3>
              <p className="text-xs text-slate-500">Modifique os valores dos campos numéricos para recalcular a média final e o parecer pedagógico.</p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="p-3">Residente</th>
                    <th className="p-3 text-center">Média GA</th>
                    <th className="p-3 text-center">Média <br/>GB</th>
                    <th className="p-3 text-center">Exame <br/>GC</th>
                    <th className="p-3 text-center font-bold bg-slate-100">Resultado Atual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {residentes.map((res) => {
                    const ga = res.ga || 0;
                    const gb = res.gb || 0;
                    const gc = res.gc !== "" ? res.gc : null;
                    let mFinal = (ga + gb) / 2;
                    if (gc !== null) mFinal = (mFinal + gc) / 2;

                    return (
                      <React.Fragment key={res.id}>
                        <tr className="bg-white font-medium text-slate-900">
                          <td className="p-3 border-t border-slate-100 font-semibold text-slate-900 bg-slate-50/40">{res.nome}</td>
                          <td className="p-3 text-center border-t border-slate-100">
                            <input 
                              type="number" 
                              step="0.1"
                              value={res.ga} 
                              onChange={(e) => handleNotaChange(res.id, 'ga', e.target.value)}
                              className="w-14 text-center border border-slate-200 rounded p-1 font-medium text-slate-800" 
                            />
                          </td>
                          <td className="p-3 text-center border-t border-slate-100">
                            <input 
                              type="number" 
                              step="0.1"
                              value={res.gb} 
                              onChange={(e) => handleNotaChange(res.id, 'gb', e.target.value)}
                              className="w-14 text-center border border-slate-200 rounded p-1 font-medium text-slate-800" 
                            />
                          </td>
                          <td className="p-3 text-center border-t border-slate-100">
                            <input 
                              type="number" 
                              step="0.1"
                              value={res.gc} 
                              placeholder="-"
                              onChange={(e) => handleNotaChange(res.id, 'gc', e.target.value)}
                              className="w-14 text-center border border-slate-200 rounded p-1 font-medium text-slate-800 bg-purple-50/50" 
                            />
                          </td>
                          <td className="p-3 text-center border-t border-slate-100 bg-slate-50 font-bold">
                            <div className="flex flex-col items-center space-y-1">
                              <span className="text-slate-900 text-xs">{mFinal.toFixed(1)}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                res.status.includes("Aprovado") ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                              }`}>
                                {res.status}
                              </span>
                            </div>
                          </td>
                        </tr>
                        {/* Linha expandida do Parecer Descritivo do Professor */}
                        <tr className="bg-white">
                          <td colSpan="5" className="p-2 px-4 pb-4 border-b border-slate-200 text-[11px] text-slate-500 bg-white">
                            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded border border-slate-100">
                              <span className="font-bold text-slate-700">Parecer da Coordenação:</span>
                              <span className="italic">"{res.parecer}"</span>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 4 (ALUNO): VISÃO DO MEU BOLETIM E FREQUÊNCIA PRIVADOS */}
        {activeTab === 'boletim-aluno' && userRole === 'aluno' && (
          <div className="space-y-6">
            
            {/* Resumo do Boletim Individual */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <GraduationCap className="text-teal-700 w-5 h-5" />
                  <h3 className="font-bold text-base text-slate-900">Meu Desempenho e Avaliações</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  alunoLogado?.status.includes("Aprovado") ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                }`}>
                  Status: {alunoLogado?.status}
                </span>
              </div>

              {/* Grid de Notas do Aluno Logado */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Média Módulo GA</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{alunoLogado?.ga || '-'}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Média Módulo GB</p>
                  <p className="text-xl font-bold text-slate-800 mt-1">{alunoLogado?.gb || '-'}</p>
                </div>
                <div className="p-3 bg-purple-50/50 border border-purple-100 rounded-lg">
                  <p className="text-[10px] uppercase font-semibold text-purple-700">Nota Exame GC</p>
                  <p className="text-xl font-bold text-purple-900 mt-1">{alunoLogado?.gc !== "" ? alunoLogado?.gc : 'Não Realizado'}</p>
                </div>
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-teal-800">Nota Final do Módulo</p>
                  <p className="text-xl font-bold text-teal-900 mt-1">
                    {(((alunoLogado?.ga || 0) + (alunoLogado?.gb || 0)) / 2).toFixed(1)}
                  </p>
                </div>
              </div>

              {/* Parecer Descritivo Visível apenas para o aluno correspondente */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <p className="font-bold text-slate-700 flex items-center space-x-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Feedback Pedagógico do Preceptor:</span>
                </p>
                <p className="italic text-slate-600 mt-1.5">"{alunoLogado?.parecer}"</p>
              </div>
            </div>

            {/* Controle de Frequência Individual */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Calendar className="text-blue-600 w-5 h-5" />
                <h3 className="font-bold text-base text-slate-900">Extrato de Frequência de Campo</h3>
              </div>
              
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-500">Total de faltas acumuladas neste componente:</p>
                  <p className="text-lg font-bold text-slate-900">
                    {alunoLogado?.faltas} <span className="text-xs font-normal text-slate-400">faltas registradas</span>
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-center min-w-[150px]">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase">Assiduidade</p>
                  <p className="text-lg font-bold text-emerald-700 mt-0.5">
                    {alunoLogado ? (100 - (alunoLogado.faltas * 2.5)).toFixed(1) : 100}%
                  </p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Exigido por lei: Mínimo 75%</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
