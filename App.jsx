import React, { useState, useEffect } from 'react';
// Inicialização do Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, updateDoc, onSnapshot } from 'firebase/firestore';

import { 
  BookOpen, Calendar, FileText, Users, MessageSquare, 
  Award, ShieldAlert, User, GraduationCap, ClipboardList,
  FolderPlus, Settings, Bell, Layers, Lock, Unlock, LogOut, CloudLightning
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

export default function EternalFirebaseResidency() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('residente_aluno');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);

  // Estados dos dados em tempo real vindos da nuvem
  const [ciclos, setCiclos] = useState([]);
  const [matrizDisciplinas, setMatrizDisciplinas] = useState([]);
  const [historicoNotas, setHistoricoNotas] = useState([]);

  // Seletores activos
  const [selectedCiclo, setSelectedCiclo] = useState('2026_1');
  const [selectedDisciplina, setSelectedDisciplina] = useState('m1');
  const [activeTab, setActiveTab] = useState('mural-modulo');

  // Form
  const [newCicloNome, setNewCicloNome] = useState('');
  const [newDiscCodigo, setNewDiscCodigo] = useState('');
  const [newDiscTitulo, setNewDiscTitulo] = useState('');
  const [newDiscEmenta, setNewDiscEmenta] = useState('');

  // 1. ESCUTA DE SESSÃO DO USUÁRIO (Auth Real)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Definição de perfis baseada no prefixo do email para facilitar gerenciamento inicial
        if (currentUser.email.startsWith('gestor')) setUserRole('gestor_coremu');
        else if (currentUser.email.startsWith('preceptor')) setUserRole('preceptor_docente');
        else setUserRole('residente_aluno');
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. SINCRONIZAÇÃO EM TEMPO REAL COM O CLOUD FIRESTORE
  useEffect(() => {
    if (!user) return;

    // Escuta reativa da tabela de ciclos
    const unsubCiclos = onSnapshot(collection(db, "ciclos"), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCiclos(lista.length ? lista : [{ id: '2026_1', nome: 'Ciclo Letivo 2026/1', status: 'ativo' }]);
    });

    // Escuta reativa da tabela de disciplinas
    const unsubMatriz = onSnapshot(collection(db, "disciplinas"), (snapshot) => {
      setMatrizDisciplinas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Escuta reativa do livro de notas e faltas
    const unsubNotas = onSnapshot(collection(db, "historico_notas"), (snapshot) => {
      setHistoricoNotas(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubCiclos(); unsubMatriz(); unsubNotas(); };
  }, [user]);

  // LOGIN REQUISITANDO O BACKEND DO FIREBASE
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (email.startsWith('gestor')) setActiveTab('gestao-ciclos');
      else setActiveTab('mural-modulo');
    } catch (err) {
      setLoginError('Falha na autenticação: Verifique se o e-mail está cadastrado no console do Firebase.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  // OPERAÇÕES DO GESTOR NA NUVEM
  const handleCriarCiclo = async (e) => {
    e.preventDefault();
    if (!newCicloNome) return;
    const id = 'c_' + Date.now();
    await setDoc(doc(db, "ciclos", id), { nome: newCicloNome, status: 'planejamento' });
    setNewCicloNome('');
  };

  const handleAlternarStatusCiclo = async (id, novoStatus) => {
    await updateDoc(doc(db, "ciclos", id), { status: novoStatus });
  };

  const handleCriarDisciplina = async (e) => {
    e.preventDefault();
    if (!newDiscCodigo || !newDiscTitulo) return;
    const id = 'm_' + Date.now();
    await setDoc(doc(db, "disciplinas", id), { codigo: newDiscCodigo, titulo: newDiscTitulo, ementa: newDiscEmenta });
    setNewDiscCodigo(''); setNewDiscTitulo(''); setNewDiscEmenta('');
  };

  // OPERAÇÕES DO PRECEPTOR NA NUVEM (Salva e sincroniza em tempo real para todos)
  const handlePreceptorNota = async (id, campo, valor) => {
    const cicloIdAtual = ciclos.find(c => c.id === selectedCiclo);
    if (cicloIdAtual?.status === 'arquivado') {
      alert("⚠️ Registro Histórico Protegido: Ciclos arquivados não permitem edições de nota.");
      return;
    }
    await updateDoc(doc(db, "historico_notas", id), { [campo]: valor === "" ? "" : parseFloat(valor) || 0 });
  };

  // RESOLUÇÃO DE FILTROS DE INTERFACE
  const cicloAtivoObj = ciclos.find(c => c.id === selectedCiclo);
  const disciplinaAtivaObj = matrizDisciplinas.find(m => m.id === selectedDisciplina);
  const notasFiltradas = historicoNotas.filter(h => h.cicloId === selectedCiclo && h.disciplinaId === selectedDisciplina);
  const meuBoletimAluno = historicoNotas.filter(h => h.alunoEmail === user?.email && h.cicloId === selectedCiclo);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full space-y-5 border-t-4 border-teal-700">
          <div className="text-center">
            <div className="bg-teal-800 text-white w-12 h-12 rounded-xl font-black text-xs flex items-center justify-center mx-auto shadow-md">COREMU</div>
            <h2 className="text-xl font-black text-slate-900 mt-2">Portal da Residência</h2>
            <p className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1"><CloudLightning className="w-3 h-3 text-amber-500"/>Conectado ao Firebase Cloud</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">E-mail Institucional</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@coremu.org" className="w-full mt-1 border text-xs p-2.5 rounded-lg bg-slate-50 focus:outline-none focus:border-teal-700" />
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Senha Secreta</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full mt-1 border text-xs p-2.5 rounded-lg bg-slate-50 focus:outline-none focus:border-teal-700" />
            </div>
            {loginError && <div className="text-red-600 text-[10px] bg-red-50 p-2 rounded font-semibold">{loginError}</div>}
            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition">
              {loading ? 'Autenticando na Nuvem...' : 'Entrar no Painel'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      <header className="bg-white border-b px-6 py-3.5 flex flex-wrap justify-between items-center gap-4 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="bg-teal-800 text-white p-2 rounded-xl font-bold text-xs">HACO</div>
          <div>
            <h1 className="text-xs font-black text-slate-900 uppercase">Ambiente de Gestão Permanente de Residências</h1>
            <p className="text-[10px] font-bold text-slate-400">Usuário: {user.email} [{userRole.toUpperCase()}]</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select value={selectedCiclo} onChange={(e) => setSelectedCiclo(e.target.value)} className="bg-slate-100 text-xs font-bold p-1.5 rounded border focus:outline-none">
            {ciclos.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <button onClick={handleLogout} className="text-red-600 bg-red-50 hover:bg-red-100 p-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition"><LogOut className="w-3.5 h-3.5"/><span>Sair</span></button>
        </div>
      </header>

      <div className="bg-white border-b px-6 pt-2">
        <div className="max-w-7xl mx-auto flex space-x-2">
          {userRole === 'gestor_coremu' && (
            <>
              <button onClick={() => setActiveTab('gestao-ciclos')} className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 ${activeTab === 'gestao-ciclos' ? 'border-teal-700 text-teal-700 bg-slate-50' : 'border-transparent text-slate-500'}`}>📅 Ciclos & Arquivamento</button>
              <button onClick={() => setActiveTab('gestao-matriz')} className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 ${activeTab === 'gestao-matriz' ? 'border-teal-700 text-teal-700 bg-slate-50' : 'border-transparent text-slate-500'}`}>🏢 Matriz de Ementas</button>
            </>
          )}
          {(userRole === 'preceptor_docente' || userRole === 'residente_aluno') && (
            <>
              <button onClick={() => setActiveTab('mural-modulo')} className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 ${activeTab === 'mural-modulo' ? 'border-teal-700 text-teal-700 bg-slate-50' : 'border-transparent text-slate-500'}`}>📖 Mural Pedagógico</button>
              {userRole === 'preceptor_docente' && <button onClick={() => setActiveTab('preceptor-notas')} className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 ${activeTab === 'preceptor-notas' ? 'border-teal-700 text-teal-700 bg-slate-50' : 'border-transparent text-slate-500'}`}>📊 Caderneta de Lançamentos</button>}
              {userRole === 'residente_aluno' && <button onClick={() => setActiveTab('aluno-boletim')} className={`px-4 py-2 text-xs font-bold rounded-t-lg border-b-2 ${activeTab === 'aluno-boletim' ? 'border-teal-700 text-teal-700 bg-slate-50' : 'border-transparent text-slate-500'}`}>📈 Meu Boletim de Campo</button>}
            </>
          )}
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-4">
        {cicloAtivoObj?.status === 'arquivado' && (
          <div className="bg-amber-50 border-l-4 border-amber-600 p-3 rounded-r-xl text-xs text-amber-900 font-bold flex items-center space-x-2">
            <Lock className="w-4 h-4 text-amber-700" />
            <span>Ciclo Histórico Fechado. Todas as notas estão protegidas em modo leitura permanente.</span>
          </div>
        )}

        {(userRole === 'preceptor_docente' || userRole === 'residente_aluno') && (
          <div className="bg-white p-3 rounded-xl border flex justify-between items-center text-xs">
            <span className="font-black text-slate-800">{disciplinaAtivaObj?.codigo || 'RMAB'} — {disciplinaAtivaObj?.titulo || 'Selecione o componente'}</span>
            <select value={selectedDisciplina} onChange={(e) => setSelectedDisciplina(e.target.value)} className="bg-slate-50 p-1 border rounded text-xs font-semibold">
              {matrizDisciplinas.map(m => <option key={m.id} value={m.id}>{m.titulo}</option>)}
            </select>
          </div>
        )}

        {activeTab === 'gestao-ciclos' && userRole === 'gestor_coremu' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border space-y-3 h-fit">
              <h3 className="font-bold text-xs uppercase text-slate-400">Criar Novo Ciclo Letivo</h3>
              <form onSubmit={handleCriarCiclo} className="space-y-2">
                <input type="text" value={newCicloNome} onChange={(e) => setNewCicloNome(e.target.value)} placeholder="Ex: Ciclo Letivo 2027/1" className="text-xs w-full border rounded p-2 focus:outline-none" />
                <button type="submit" className="w-full bg-slate-900 text-white p-2 rounded text-xs font-bold hover:bg-slate-800">Inicializar Período</button>
              </form>
            </div>
            <div className="md:col-span-2 bg-white p-4 rounded-xl border space-y-3">
              <h3 className="font-bold text-xs uppercase text-slate-400">Histórico de Períodos e Arquivamentos</h3>
              <div className="border rounded-lg divide-y text-xs">
                {ciclos.map(c => (
                  <div key={c.id} className="p-3 flex justify-between items-center">
                    <span className="font-bold text-slate-900">{c.nome} (<span className="text-teal-700 uppercase font-black">{c.status}</span>)</span>
                    {c.status === 'ativo' ? (
                      <button onClick={() => handleAlternarStatusCiclo(c.id, 'arquivado')} className="bg-amber-600 text-white p-1 px-2 rounded font-bold text-[10px] hover:bg-amber-700">Arquivar e Travar</button>
                    ) : (
                      <button onClick={() => handleAlternarStatusCiclo(c.id, 'ativo')} className="bg-slate-200 text-slate-700 p-1 px-2 rounded font-bold text-[10px] hover:bg-slate-300">Reabrir Ciclo</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'gestao-matriz' && userRole === 'gestor_coremu' && (
          <div className="bg-white p-5 rounded-xl border space-y-4">
            <h3 className="font-bold text-xs uppercase text-slate-400">Inserir Componente Curricular na Nuvem</h3>
            <form onSubmit={handleCriarDisciplina} className="space-y-3 max-w-xl">
              <div className="grid grid-cols-3 gap-2">
                <input type="text" value={newDiscCodigo} onChange={(e) => setNewDiscCodigo(e.target.value)} placeholder="Código" className="text-xs p-2 border rounded" />
                <input type="text" value={newDiscTitulo} onChange={(e) => setNewDiscTitulo(e.target.value)} placeholder="Nome do Componente" className="text-xs p-2 border rounded col-span-2" />
              </div>
              <textarea value={newDiscEmenta} onChange={(e) => setNewDiscEmenta(e.target.value)} placeholder="Ementa institucional..." className="text-xs p-2 border rounded w-full h-16" />
              <button type="submit" className="bg-teal-800 text-white px-4 py-2 rounded text-xs font-bold hover:bg-teal-900">Gravar Matriz Permanente</button>
            </form>
          </div>
        )}

        {activeTab === 'mural-modulo' && (
          <div className="bg-white p-4 rounded-xl border text-xs space-y-2">
            <h3 className="font-bold uppercase text-slate-400">Objetivo Pedagógico da Ementa</h3>
            <p className="bg-slate-50 p-3 rounded-lg border italic text-slate-600">"{disciplinaAtivaObj?.ementa || 'Nenhuma ementa cadastrada para este componente.'}"</p>
          </div>
        )}

        {activeTab === 'preceptor-notas' && userRole === 'preceptor_docente' && (
          <div className="bg-white p-4 rounded-xl border space-y-3">
            <h3 className="font-bold text-xs uppercase text-slate-400">Lançamento de Avaliações em Tempo Real</h3>
            <div className="overflow-x-auto border rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 font-bold border-b text-slate-600">
                  <tr>
                    <th className="p-3">Residente</th>
                    <th className="p-3 text-center">GA</th>
                    <th className="p-3 text-center">GB</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-medium text-slate-800">
                  {notasFiltradas.map(n => (
                    <tr key={n.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-slate-900">{n.nome}</td>
                      <td className="p-3 text-center">
                        <input type="number" step="0.1" value={n.ga} disabled={cicloAtivoObj?.status === 'arquivado'} onChange={(e) => handlePreceptorNota(n.id, 'ga', e.target.value)} className="w-12 text-center border p-1 rounded font-bold" />
                      </td>
                      <td className="p-3 text-center">
                        <input type="number" step="0.1" value={n.gb} disabled={cicloAtivoObj?.status === 'arquivado'} onChange={(e) => handlePreceptorNota(n.id, 'gb', e.target.value)} className="w-12 text-center border p-1 rounded font-bold" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'aluno-boletim' && userRole === 'residente_aluno' && (
          <div className="bg-white p-5 rounded-xl border space-y-4">
            <h3 className="font-bold text-xs uppercase text-slate-400">Meu Boletim em Tempo Real</h3>
            {meuBoletimAluno.map(b => (
              <div key={b.id} className="p-4 border bg-slate-50 rounded-xl flex justify-between items-center text-xs">
                <div className="font-bold text-slate-800">{disciplinaAtivaObj?.titulo}</div>
                <div className="font-black text-teal-800 text-sm">Média: {(((b.ga || 0) + (b.gb || 0)) / 2).toFixed(1)}</div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
