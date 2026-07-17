import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, updateDoc, onSnapshot } from 'firebase/firestore';

import { 
  BookOpen, Calendar, Users, MessageSquare, Award, ShieldAlert, User, 
  GraduationCap, FolderPlus, Bell, Lock, LogOut, CloudLightning, Activity, 
  TrendingUp, Target, UploadCloud, CheckCircle, Clock, AlertTriangle, ChevronRight
} from 'lucide-react';

// ==========================================
// ⚠️ INSIRA AS SUAS CREDENCIAIS DO FIREBASE AQUI:
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAwRjc9QUmF4quqYOvt-Z187Mlv5rQnHXE",
  authDomain: "residenciamultihaco.firebaseapp.com",
  projectId: "residenciamultihaco",
  storageBucket: "residenciamultihaco.firebasestorage.app",
  messagingSenderId: "1089100227489",
  appId: "1:1089100227489:web:3b0102e76b25f2c9e8a1e0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default function WorldClassResidencyPlatform() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('residente_aluno');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  const [ciclos, setCiclos] = useState([]);
  const [matrizDisciplinas, setMatrizDisciplinas] = useState([]);
  const [historicoNotas, setHistoricoNotas] = useState([]);

  const [selectedCiclo, setSelectedCiclo] = useState('2026_1');
  const [selectedDisciplina, setSelectedDisciplina] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  const [newCicloNome, setNewCicloNome] = useState('');
  const [newDiscCodigo, setNewDiscCodigo] = useState('');
  const [newDiscTitulo, setNewDiscTitulo] = useState('');
  const [newDiscEmenta, setNewDiscEmenta] = useState('');

  // 1. ESCUTA DE SESSÃO DO USUÁRIO
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.email.startsWith('gestor')) setUserRole('gestor_coremu');
        else if (currentUser.email.startsWith('preceptor')) setUserRole('preceptor_docente');
        else setUserRole('residente_aluno');
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. SINCRONIZAÇÃO EM TEMPO REAL FIRESTORE
  useEffect(() => {
    if (!user) return;
    const unsubCiclos = onSnapshot(collection(db, "ciclos"), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCiclos(lista.length ? lista : [{ id: '2026_1', nome: 'Ciclo Letivo 2026/1', status: 'ativo' }]);
    });
    const unsubMatriz = onSnapshot(collection(db, "disciplinas"), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMatrizDisciplinas(lista);
      if (lista.length > 0 && !selectedDisciplina) setSelectedDisciplina(lista[0].id);
    });
    const unsubNotas = onSnapshot(collection(db, "historico_notas"), (snapshot) => {
      setHistoricoNotas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubCiclos(); unsubMatriz(); unsubNotas(); };
  }, [user]);

  // LOGIN SYSTEM
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (email.startsWith('gestor')) setActiveTab('gestao-ciclos');
      else setActiveTab('dashboard');
    } catch (err) {
      setLoginError('Credenciais inválidas. Verifique seu e-mail e senha.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  // OPERAÇÕES DO BANCO
  const handleCriarCiclo = async (e) => {
    e.preventDefault();
    if (!newCicloNome) return;
    await setDoc(doc(db, "ciclos", 'c_' + Date.now()), { nome: newCicloNome, status: 'ativo' });
    setNewCicloNome('');
  };

  const handleAlternarStatusCiclo = async (id, novoStatus) => {
    await updateDoc(doc(db, "ciclos", id), { status: novoStatus });
  };

  const handleCriarDisciplina = async (e) => {
    e.preventDefault();
    if (!newDiscCodigo || !newDiscTitulo) return;
    await setDoc(doc(db, "disciplinas", 'm_' + Date.now()), { codigo: newDiscCodigo, titulo: newDiscTitulo, ementa: newDiscEmenta });
    setNewDiscCodigo(''); setNewDiscTitulo(''); setNewDiscEmenta('');
  };

  const handlePreceptorNota = async (id, campo, valor) => {
    const cicloAtivo = ciclos.find(c => c.id === selectedCiclo);
    if (cicloAtivo?.status === 'arquivado') return alert("Ciclo arquivado. Edição bloqueada.");
    await updateDoc(doc(db, "historico_notas", id), { [campo]: valor === "" ? "" : parseFloat(valor) || 0 });
  };

  const handlePreceptorFeedback = async (id, parecer) => {
    await updateDoc(doc(db, "historico_notas", id), { parecer });
  };

  // VARIÁVEIS DERIVADAS PARA UI
  const cicloAtivoObj = ciclos.find(c => c.id === selectedCiclo);
  const disciplinaAtivaObj = matrizDisciplinas.find(m => m.id === selectedDisciplina);
  const notasFiltradas = historicoNotas.filter(h => h.cicloId === selectedCiclo && h.disciplinaId === selectedDisciplina);
  const meuBoletimAluno = historicoNotas.filter(h => h.alunoEmail === user?.email && h.cicloId === selectedCiclo);

  // CÁLCULOS ANALÍTICOS DO ALUNO
  const totalNotas = meuBoletimAluno.reduce((acc, curr) => acc + (((curr.ga || 0) + (curr.gb || 0)) / 2), 0);
  const mediaGeralAluno = meuBoletimAluno.length ? (totalNotas / meuBoletimAluno.length).toFixed(1) : 0;
  const totalFaltasAluno = meuBoletimAluno.reduce((acc, curr) => acc + (curr.faltas || 0), 0);
  const percentualAssiduidade = Math.max(0, 100 - (totalFaltasAluno * 1.5)).toFixed(1);

  // COMPONENTE: TELA DE LOGIN PREMIUM
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Elementos Decorativos de Fundo */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl max-w-sm w-full space-y-6 border border-white/50 relative z-10">
          <div className="text-center space-y-2">
            <div className="bg-gradient-to-br from-teal-700 to-teal-900 text-white w-14 h-14 rounded-2xl font-black text-sm flex items-center justify-center mx-auto shadow-lg shadow-teal-900/20">
              HACO
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Portal COREMU</h2>
            <p className="text-xs text-slate-500 font-medium px-4">Subdivisão de Saúde Operacional</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Identificação</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail institucional" className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600/50 focus:border-teal-600 outline-none transition-all" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600/50 focus:border-teal-600 outline-none transition-all" />
              </div>
            </div>
            {loginError && <div className="text-red-600 text-[11px] bg-red-50 p-3 rounded-lg font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4"/>{loginError}</div>}
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl text-sm font-bold hover:bg-teal-800 transition-all shadow-lg shadow-slate-900/20 flex justify-center items-center gap-2">
              {loading ? <span className="animate-pulse">Conectando...</span> : <>Acessar Plataforma <ChevronRight className="w-4 h-4"/></>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // DASHBOARD PRINCIPAL DA APLICAÇÃO
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 flex flex-col">
      {/* HEADER PREMIUM */}
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-tr from-teal-800 to-teal-900 text-white w-10 h-10 rounded-xl font-black text-xs flex items-center justify-center shadow-md">
                HACO
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm font-bold text-slate-900 leading-tight">Workspace Educacional</h1>
                <p className="text-[10px] font-semibold text-teal-700 uppercase tracking-wider">COREMU Avançado</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100/50 py-1.5 px-3 rounded-full border border-slate-200">
                <Calendar className="w-3.5 h-3.5" />
                <select value={selectedCiclo} onChange={(e) => setSelectedCiclo(e.target.value)} className="bg-transparent focus:outline-none cursor-pointer font-bold text-slate-700">
                  {ciclos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900">{userRole.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</p>
                  <p className="text-[10px] text-slate-500">{user.email}</p>
                </div>
                <button onClick={handleLogout} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* NAVEGAÇÃO DE ABAS REFINADA */}
      <div className="bg-white border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8 overflow-x-auto no-scrollbar">
          {userRole === 'gestor_coremu' && (
            <>
              <button onClick={() => setActiveTab('gestao-ciclos')} className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'gestao-ciclos' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Administração de Ciclos</button>
              <button onClick={() => setActiveTab('gestao-matriz')} className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${activeTab === 'gestao-matriz' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>Matriz Curricular</button>
            </>
          )}
          {(userRole === 'preceptor_docente' || userRole === 'residente_aluno') && (
            <>
              <button onClick={() => setActiveTab('dashboard')} className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'dashboard' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <LayoutDashboard className="w-4 h-4"/> Overview
              </button>
              <button onClick={() => setActiveTab('mural-modulo')} className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'mural-modulo' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                <BookOpen className="w-4 h-4"/> Sala de Aula
              </button>
              {userRole === 'preceptor_docente' && (
                <button onClick={() => setActiveTab('preceptor-notas')} className={`py-4 text-sm font-bold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${activeTab === 'preceptor-notas' ? 'border-teal-600 text-teal-700' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                  <ClipboardList className="w-4 h-4"/> Lançamentos e Avaliações
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* BANNER DE AVISO: CICLO ARQUIVADO */}
        {cicloAtivoObj?.status === 'arquivado' && (
          <div className="bg-amber-50/80 backdrop-blur border border-amber-200 p-4 rounded-2xl flex items-center gap-4 text-amber-900 shadow-sm">
            <div className="bg-amber-100 p-2 rounded-full"><Lock className="w-5 h-5 text-amber-700" /></div>
            <div>
              <p className="font-bold text-sm">Auditoria Histórica Ativada</p>
              <p className="text-xs text-amber-700/80 mt-0.5">As avaliações referentes ao {cicloAtivoObj.nome} foram consolidadas. Edições estão desabilitadas para garantir a integridade dos dados.</p>
            </div>
          </div>
        )}

        {/* SELECTOR GLOBAL DE COMPONENTE (Para Professor e Aluno) */}
        {(userRole === 'preceptor_docente' || userRole === 'residente_aluno') && matrizDisciplinas.length > 0 && (
          <div className="bg-white p-2 rounded-2xl border border-slate-200/60 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 max-w-2xl">
            <div className="px-3 py-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Módulo Selecionado</span>
              <h2 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Target className="w-4 h-4 text-teal-600"/> {disciplinaAtivaObj?.codigo}
              </h2>
            </div>
            <select value={selectedDisciplina} onChange={(e) => setSelectedDisciplina(e.target.value)} className="bg-slate-50 border border-slate-200 w-full sm:w-auto p-2.5 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none">
              {matrizDisciplinas.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
            </select>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 🚀 DASHBOARD ANALÍTICO PREMIUM DO RESIDENTE */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && userRole === 'residente_aluno' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header de Boas-Vindas */}
            <div className="bg-gradient-to-r from-slate-900 to-teal-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest backdrop-blur-sm border border-white/10">Residente R1</span>
                  <h2 className="text-3xl font-black mt-3 mb-1">Olá, {user.email.split('@')[0]}</h2>
                  <p className="text-teal-100 text-sm max-w-md">Acompanhe seu desenvolvimento técnico e prático no {cicloAtivoObj?.nome}. Continue focado nos seus objetivos do semestre!</p>
                </div>
                {/* Gráfico de Progresso Circular Customizado em CSS */}
                <div className="flex items-center gap-6 bg-black/20 p-4 rounded-2xl backdrop-blur-md border border-white/10">
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-teal-200 tracking-wider mb-1">Assiduidade</p>
                    <p className="text-2xl font-black text-white">{percentualAssiduidade}%</p>
                  </div>
                  <div className="w-px h-10 bg-white/20"></div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase font-bold text-teal-200 tracking-wider mb-1">Média Global</p>
                    <p className="text-2xl font-black text-emerald-400">{mediaGeralAluno}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid de Métricas do Componente Atual */}
            <h3 className="font-black text-lg text-slate-800 mt-8 mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-teal-600"/> Desempenho em {disciplinaAtivaObj?.codigo}</h3>
            
            {meuBoletimAluno.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 border-dashed text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><Clock className="w-6 h-6 text-slate-400"/></div>
                <p className="text-slate-500 font-medium">As avaliações para este componente ainda não foram lançadas pelo preceptor.</p>
              </div>
            ) : (
              meuBoletimAluno.map(b => (
                <div key={b.id} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-blue-50 text-blue-700 p-2 rounded-xl"><FileText className="w-5 h-5"/></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Teórico</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500">Grau A (GA)</p>
                    <p className="text-4xl font-black text-slate-800 mt-1">{b.ga || '-'}</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-amber-50 text-amber-700 p-2 rounded-xl"><Users className="w-5 h-5"/></div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Prático</span>
                    </div>
                    <p className="text-sm font-bold text-slate-500">Grau B (GB)</p>
                    <p className="text-4xl font-black text-slate-800 mt-1">{b.gb || '-'}</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-3xl border border-teal-100 shadow-sm flex flex-col justify-center">
                    <p className="text-xs font-bold text-teal-800 uppercase tracking-widest mb-2">Conceito Final</p>
                    <div className="flex items-end gap-2">
                      <p className="text-5xl font-black text-teal-900">{(((b.ga || 0) + (b.gb || 0)) / 2).toFixed(1)}</p>
                      <p className="text-sm font-bold text-teal-600 mb-1">/ 10.0</p>
                    </div>
                    <div className="mt-4 w-full bg-white/60 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-full rounded-full" style={{ width: `${(((b.ga || 0) + (b.gb || 0)) / 2) * 10}%` }}></div>
                    </div>
                  </div>
                  
                  {/* Feedback do Preceptor tipo "Chat Card" */}
                  <div className="md:col-span-3 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4"/> Feedback Contínuo do Preceptor</h4>
                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl relative">
                      <div className="absolute -left-2 top-6 w-4 h-4 bg-slate-50 border-t border-l border-slate-100 transform -rotate-45"></div>
                      <p className="text-sm text-slate-700 font-medium leading-relaxed italic relative z-10">
                        "{b.parecer || 'Nenhum feedback registrado até o momento.'}"
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* DASHBOARD GESTOR (ADMINISTRATION) */}
        {/* ========================================================================= */}
        {activeTab === 'gestao-ciclos' && userRole === 'gestor_coremu' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm h-fit">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4"><Calendar className="w-6 h-6"/></div>
              <h3 className="font-black text-lg text-slate-800 mb-1">Abertura de Ciclo</h3>
              <p className="text-xs text-slate-500 mb-6">Inicie um novo período letivo no sistema institucional.</p>
              
              <form onSubmit={handleCriarCiclo} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Nome do Ciclo</label>
                  <input type="text" value={newCicloNome} onChange={(e) => setNewCicloNome(e.target.value)} placeholder="Ex: Semestre Letivo 2027/1" className="w-full mt-1 border border-slate-200 text-sm p-3 rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition-all" />
                </div>
                <button type="submit" className="w-full bg-slate-900 text-white p-3.5 rounded-xl text-sm font-bold hover:bg-teal-800 transition-all">Ativar Ciclo</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
              <h3 className="font-black text-lg text-slate-800 mb-6">Governança Histórica e Auditoria</h3>
              <div className="grid gap-4">
                {ciclos.map(c => (
                  <div key={c.id} className="group border border-slate-100 p-4 rounded-2xl flex justify-between items-center hover:border-teal-200 hover:shadow-md transition-all bg-white">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-10 rounded-full ${c.status === 'ativo' ? 'bg-emerald-400' : 'bg-amber-400'}`}></div>
                      <div>
                        <span className="font-black text-slate-800 text-base block">{c.nome}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 block ${c.status === 'ativo' ? 'text-emerald-600' : 'text-amber-600'}`}>Status: {c.status}</span>
                      </div>
                    </div>
                    {c.status === 'ativo' ? (
                      <button onClick={() => handleAlternarStatusCiclo(c.id, 'arquivado')} className="opacity-0 group-hover:opacity-100 bg-white border border-amber-200 text-amber-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-amber-50 hover:border-amber-300 transition-all flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5"/> Congelar Notas
                      </button>
                    ) : (
                      <button onClick={() => handleAlternarStatusCiclo(c.id, 'ativo')} className="opacity-0 group-hover:opacity-100 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2">
                        <Unlock className="w-3.5 h-3.5"/> Reabrir Ciclo
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* PRECEPTOR: CADERNETA MODERNA */}
        {/* ========================================================================= */}
        {activeTab === 'preceptor-notas' && userRole === 'preceptor_docente' && (
          <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="font-black text-lg text-slate-800">Planilha de Avaliação Somativa</h3>
                <p className="text-xs text-slate-500 font-medium">As alterações são sincronizadas automaticamente com o banco de dados e com os residentes.</p>
              </div>
              <div className="bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4"/> Auto-save ativado
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-white font-bold text-slate-400 uppercase tracking-widest text-[10px] border-b border-slate-100">
                  <tr>
                    <th className="p-4 pl-6">Residente Avaliado</th>
                    <th className="p-4 text-center">Teórica (GA)</th>
                    <th className="p-4 text-center">Prática (GB)</th>
                    <th className="p-4 text-center">Faltas Computadas</th>
                    <th className="p-4">Parecer Qualitativo Rápido</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                  {notasFiltradas.length === 0 ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-400">Aguardando cadastro de alunos pela coordenação neste módulo.</td></tr>
                  ) : (
                    notasFiltradas.map(n => (
                      <tr key={n.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-4 pl-6 font-bold text-slate-900 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-black text-slate-500">{n.nome?.charAt(0)}</div>
                          {n.nome}
                        </td>
                        <td className="p-4 text-center">
                          <input type="number" step="0.1" value={n.ga} disabled={cicloAtivoObj?.status === 'arquivado'} onChange={(e) => handlePreceptorNota(n.id, 'ga', e.target.value)} className="w-16 text-center border border-slate-200 bg-white p-2 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none disabled:bg-slate-50 transition-all" />
                        </td>
                        <td className="p-4 text-center">
                          <input type="number" step="0.1" value={n.gb} disabled={cicloAtivoObj?.status === 'arquivado'} onChange={(e) => handlePreceptorNota(n.id, 'gb', e.target.value)} className="w-16 text-center border border-slate-200 bg-white p-2 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none disabled:bg-slate-50 transition-all" />
                        </td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center justify-center w-12 h-10 bg-amber-50 text-amber-700 rounded-lg font-black border border-amber-100">
                            {n.faltas || 0}
                          </div>
                        </td>
                        <td className="p-4 pr-6">
                          <input type="text" value={n.parecer || ''} disabled={cicloAtivoObj?.status === 'arquivado'} onChange={(e) => handlePreceptorFeedback(n.id, e.target.value)} placeholder="Adicionar feedback..." className="w-full text-xs border border-transparent bg-transparent hover:bg-white hover:border-slate-200 p-2 rounded-lg focus:bg-white focus:border-teal-500 outline-none transition-all" />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
