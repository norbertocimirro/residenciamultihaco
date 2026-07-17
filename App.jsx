import React, { useState } from 'react';
import { 
  BookOpen, Calendar, FileText, Users, MessageSquare, 
  CheckCircle, FileSpreadsheet, ChevronDown, ChevronUp, 
  Plus, Edit3, MoreVertical, ClipboardList, Award, MapPin 
} from 'lucide-react';

export default function ResidencyPortal() {
  const [activeTab, setActiveTab] = useState('curso');
  const [expandedSections, setExpandedSections] = useState({
    geral: true,
    mural: true,
    interacoes: false,
    materiais: true,
    atividades: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Mock Data adaptada para Atenção Básica / Saúde da Família
  const residentes = [
    { id: 1, nome: "Ana Silva (Enfermagem)", faltas: 2, ga: 8.5, gb: 9.0, gc: "", total: 17.5, status: "Aprovado" },
    { id: 2, nome: "Bruno Costa (Odontologia)", faltas: 0, ga: 7.8, gb: 8.3, gc: "", total: 16.1, status: "Aprovado" },
    { id: 3, nome: "Carlos Souza (Psicologia)", faltas: 5, ga: 5.5, gb: 6.0, gc: 7.5, total: 13.5, status: "Aprovado pelo Exame" },
    { id: 4, nome: "Daniela Lima (Serviço Social)", faltas: 1, ga: 9.2, gb: 9.5, gc: "", total: 18.7, status: "Aprovado" },
    { id: 5, nome: "Eduardo Reis (Nutrição)", faltas: 12, ga: 4.0, gb: 2.5, gc: 0, total: 6.5, status: "Reprovado por Faltas" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Header Principal baseado no padrão institucional */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="bg-teal-700 text-white p-2 rounded-lg font-bold tracking-wider text-sm shadow-inner">
            COREMU
          </div>
          <div>
            <h1 className="text-md font-bold text-slate-900">Residência Multiprofissional em Atenção Básica</h1>
            <p className="text-xs text-slate-500">Saúde da Família e Comunidade • 2026/1</p>
          </div>
        </div>
        <nav className="flex space-x-6 text-sm font-medium text-slate-600">
          <button className="hover:text-teal-700 transition">Início</button>
          <button className="text-teal-700 border-b-2 border-teal-700 pb-1">Minhas Disciplinas</button>
        </nav>
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-semibold text-sm">
            RM
          </div>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">Modo de Edição</span>
        </div>
      </header>

      {/* Sub-Header da Disciplina Atual */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shadow-xs">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs font-semibold text-teal-700 uppercase tracking-wider bg-teal-50 px-2.5 py-1 rounded-full">R1 / R2 Coremu</span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">RMAB001 - Territorialização e Diagnóstico de Saúde da Comunidade</h2>
          
          {/* Navegação de Abas Internas (Estilo Moodle moderno) */}
          <div className="flex space-x-2 mt-6 border-b border-slate-200">
            {['curso', 'frequencia', 'notas'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 font-medium text-sm transition-all rounded-t-lg -mb-px ${
                  activeTab === tab 
                    ? 'bg-slate-50 text-teal-700 border-t border-x border-slate-200 font-semibold' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {tab === 'curso' && '📚 Conteúdo do Curso'}
                {tab === 'frequencia' && '📅 Diário de Frequência'}
                {tab === 'notas' && '📊 Planilha de Notas'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* ABA 1: CONTEÚDO DO CURSO */}
        {activeTab === 'curso' && (
          <div className="space-y-6">
            
            {/* Bloco Geral: Plano e Cronograma */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div 
                className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100"
                onClick={() => toggleSection('geral')}
              >
                <div className="flex items-center space-x-3">
                  <ClipboardList className="text-slate-500 w-5 h-5" />
                  <h3 className="font-bold text-slate-800">Documentos Norteadores e Contrato Pedagógico</h3>
                </div>
                {expandedSections.geral ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {expandedSections.geral && (
                <div className="p-5 space-y-4 text-sm text-slate-600 bg-white">
                  <p>Prezados residentes, segue abaixo o material de alinhamento estratégico para as atividades práticas em Unidade Básica de Saúde (UBS) e comunidade.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                    {['Plano de Ensino - Territorialização 2026_1.pdf', 'Cronograma de Rotações UBS.pdf', 'Contrato Pedagógico e Deontologia.pdf'].map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg bg-slate-50 hover:border-teal-300 transition group">
                        <div className="flex items-center space-x-2 truncate">
                          <FileText className="text-red-500 w-4 h-4 flex-shrink-0" />
                          <span className="truncate font-medium text-slate-700 text-xs">{doc}</span>
                        </div>
                        <MoreVertical className="w-4 h-4 text-slate-400 cursor-pointer" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mural de Boas-Vindas */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div 
                className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100"
                onClick={() => toggleSection('mural')}
              >
                <div className="flex items-center space-x-3">
                  <MessageSquare className="text-teal-600 w-5 h-5" />
                  <h3 className="font-bold text-slate-800">Mural de Boas-vindas</h3>
                </div>
                {expandedSections.mural ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {expandedSections.mural && (
                <div className="p-6 space-y-3 text-sm text-slate-600 border-l-4 border-teal-600">
                  <p className="font-semibold text-slate-900">Sejam muito bem-vindos ao primeiro semestre letivo da Residência Multiprofissional!</p>
                  <p>Este módulo é dedicado à compreensão da prática territorial na Atenção Primária à Saúde (APS). Desenvolveremos competências essenciais relacionadas ao diagnóstico de saúde comunitário, análise epidemiológica de indicadores e articulação de redes vivas no território.</p>
                  <p className="text-xs text-slate-400 mt-4">Coordenação de Coremu • Atualizado recentemente</p>
                </div>
              )}
            </div>

            {/* Materiais Didáticos */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div 
                className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100"
                onClick={() => toggleSection('materiais')}
              >
                <div className="flex items-center space-x-3">
                  <BookOpen className="text-blue-600 w-5 h-5" />
                  <h3 className="font-bold text-slate-800">Materiais Didáticos & Cadernos de Atenção Básica</h3>
                </div>
                {expandedSections.materiais ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {expandedSections.materiais && (
                <div className="p-5 space-y-3">
                  <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-semibold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">Aula 1</span>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">Método de Estimativa Rápida e Territorialização</h4>
                      </div>
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-xs text-slate-600">Encaminho em anexo a base teórica sobre mapeamento de vulnerabilidades sociais e econômicas no microterritório de saúde.</p>
                    <div className="flex items-center space-x-2 mt-2 p-2 bg-white rounded border border-slate-100 w-fit text-xs text-slate-700 font-medium cursor-pointer">
                      <FileText className="text-red-500 w-4 h-4" />
                      <span>Diretrizes_Mapeamento_APS_2026.pdf</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Atividades Avaliativas */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div 
                className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100"
                onClick={() => toggleSection('atividades')}
              >
                <div className="flex items-center space-x-3">
                  <Award className="text-purple-600 w-5 h-5" />
                  <h3 className="font-bold text-slate-800">Atividades Avaliativas Integradas</h3>
                </div>
                {expandedSections.atividades ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
              {expandedSections.atividades && (
                <div className="p-5 space-y-3">
                  <div className="p-4 border border-purple-100 rounded-xl bg-purple-50/40 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="text-purple-600 w-4 h-4" />
                        <h4 className="font-bold text-slate-900 text-sm">GA 1 - Atividade Prática: Entrega do Projeto Terapêutico Singular (PTS)</h4>
                      </div>
                      <span className="text-xs font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded">Prazo: 18/08/2026</span>
                    </div>
                    <p className="text-xs text-slate-600 pl-6">**Atividade Multiprofissional Coletiva**: Construção de PTS focado em família de alta vulnerabilidade cadastrada na microárea de abrangência.</p>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ABA 2: DIÁRIO DE FREQUÊNCIA */}
        {activeTab === 'frequencia' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Controle de Frequência - Seminários Integrados</h3>
                <p className="text-xs text-slate-500">Carga Horária Registrada: 60 horas</p>
              </div>
              <button className="bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-teal-800 transition shadow-sm">
                Liberar Frequência da Semana
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="p-3">Nome do Residente</th>
                    <th className="p-3 text-center">Faltas</th>
                    <th className="p-3 text-center bg-emerald-50 text-emerald-800">10/07<br/>07:30</th>
                    <th className="p-3 text-center bg-emerald-50 text-emerald-800">10/07<br/>09:10</th>
                    <th className="p-3 text-center bg-teal-50 text-teal-800">17/07<br/>07:30</th>
                    <th className="p-3 text-center bg-teal-50 text-teal-800">17/07<br/>09:10</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {residentes.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-medium text-slate-900">{res.nome}</td>
                      <td className="p-3 text-center font-bold text-amber-700">{res.faltas}</td>
                      <td className="p-3 text-center"><input type="checkbox" defaultChecked className="rounded text-teal-600 focus:ring-teal-500" /></td>
                      <td className="p-3 text-center"><input type="checkbox" defaultChecked className="rounded text-teal-600 focus:ring-teal-500" /></td>
                      <td className="p-3 text-center"><input type="checkbox" defaultChecked={res.faltas < 10} className="rounded text-teal-600 focus:ring-teal-500" /></td>
                      <td className="p-3 text-center"><input type="checkbox" defaultChecked={res.faltas === 0} className="rounded text-teal-600 focus:ring-teal-500" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ABA 3: PLANILHA DE NOTAS */}
        {activeTab === 'notas' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-900">Notas de Avaliação Multiprofissional</h3>
                <p className="text-xs text-slate-500">Média ponderada baseada em competências teóricas e de campo.</p>
              </div>
              <div className="text-xs text-slate-400">Data Limite de Digitação: 18/08/2026</div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                    <th className="p-3">Nome do Residente</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-center">Média GA</th>
                    <th className="p-3 text-center">Média GB</th>
                    <th className="p-3 text-center">Exame GC</th>
                    <th className="p-3 text-center font-bold bg-slate-100">Nota Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-600">
                  {residentes.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 font-medium text-slate-900">{res.nome}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          res.status.includes("Aprovado") ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        }`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="p-3 text-center"><input type="text" defaultValue={res.ga} className="w-12 text-center border border-slate-200 rounded p-1" /></td>
                      <td className="p-3 text-center"><input type="text" defaultValue={res.gb} className="w-12 text-center border border-slate-200 rounded p-1" /></td>
                      <td className="p-3 text-center"><input type="text" defaultValue={res.gc} placeholder="-" className="w-12 text-center border border-slate-200 rounded p-1" /></td>
                      <td className="p-3 text-center font-bold bg-slate-50/50 text-slate-900">{res.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
