import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { 
  Menu, Bell, Search, Home, Book, Calendar, BarChart, 
  ChevronDown, ChevronRight, Plus, FileText, 
  MessageSquare, Folder, CheckCircle, Upload, Download,
  ToggleLeft, ToggleRight, Layout, GripVertical, Trash2,
  Shield, UserPlus, CheckSquare, X, Link, Paperclip, Users, Edit2, Check
} from 'lucide-react';

// ==========================================
// CREDENCIAIS DO FIREBASE (PORTAL COREMU)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAwRjc9QUmF4quqYOvt-Z187Mlv5rQnHXE",
  authDomain: "residenciamultihaco.firebaseapp.com",
  projectId: "residenciamultihaco",
  storageBucket: "residenciamultihaco.firebasestorage.app",
  messagingSenderId: "1089100227489",
  appId: "1:1089100227489:web:3b0102e76b25f2c9e8a1e0"
};

let app;
let db;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
} catch (e) {
  console.error("Erro crítico na inicialização do Firebase", e);
}

// ==========================================
// ESCUDO CONTRA TELA BRANCA (ERROR BOUNDARY)
// ==========================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    this.setState({ info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 h-screen overflow-auto">
          <h1 className="text-2xl font-bold text-red-700 mb-4">🚨 Ocorreu um Erro no Sistema</h1>
          <p className="text-slate-700 mb-4">Tire um print do erro abaixo para correção:</p>
          <pre className="bg-white p-4 border border-red-200 rounded text-xs text-red-600 overflow-x-auto whitespace-pre-wrap">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==========================================
// HOOK BLINDADO DE SINCRONIZAÇÃO (NUVEM)
// ==========================================
const useFirestoreDB = (docName, initialValue) => {
  const [data, setData] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!db) { setIsLoaded(true); return; }
    try {
      const unsub = onSnapshot(doc(db, 'coremu_database', docName), 
        (docSnap) => {
          if (docSnap.exists()) {
            setData(docSnap.data().value || initialValue);
          } else {
            setDoc(doc(db, 'coremu_database', docName), { value: initialValue }).catch(e => console.error(e));
            setData(initialValue);
          }
          setIsLoaded(true);
        },
        (error) => {
          console.error(`Erro de leitura [${docName}]:`, error);
          setData(initialValue);
          setIsLoaded(true);
        }
      );
      return () => unsub();
    } catch (err) {
      setData(initialValue);
      setIsLoaded(true);
    }
  }, [docName]);

  const updateData = async (newValue) => {
    const valToSave = typeof newValue === 'function' ? newValue(data) : newValue;
    setData(valToSave); 
    if (db) {
      try { await setDoc(doc(db, 'coremu_database', docName), { value: valToSave }); } 
      catch (error) { console.error("Falha ao gravar:", error); }
    }
  };

  return [data, updateData, isLoaded];
};

// ==========================================
// COMPONENTE PRINCIPAL DO PORTAL
// ==========================================
function LmsEnterprisePortal() {
  
  // 1. DADOS DO BANCO
  const [dbUsers, setDbUsers, usersLoaded] = useFirestoreDB('tb_users', {
    'admin1': { id: 'admin1', nome: 'Gestão COREMU', role: 'admin', avatar: 'GC' },
    'prof1': { id: 'prof1', nome: '1º Ten Norberto Cimirro', role: 'professor', avatar: 'NC' },
    'prof2': { id: 'prof2', nome: 'Dra. Renata Gonçalves', role: 'professor', avatar: 'RG' },
    'stu1': { id: 'stu1', nome: 'Mariana Alves', role: 'aluno', avatar: 'MA' },
    'stu2': { id: 'stu2', nome: 'João Barcelos', role: 'aluno', avatar: 'JB' }
  });

  const [dbCourses, setDbCourses, coursesLoaded] = useFirestoreDB('tb_courses', [
    { id: 'c1', codigo: '001/003/07A', nome: 'Enfermagem Forense e Saúde da Família', professorId: 'prof1' }
  ]);

  const defaultModules = [
    {
      id: 'boas_vindas', title: 'Mural de Boas-vindas', bgColor: 'bg-blue-50/50', borderColor: 'border-blue-100',
      items: [{ id: 'i1', title: 'Plano de Ensino', type: 'FileText', color: 'text-red-500', fileName: 'Plano_de_Ensino_2026.pdf' }]
    }
  ];
  const [dbContents, setDbContents, contentsLoaded] = useFirestoreDB('tb_contents', { 'c1': defaultModules });

  const [dbStudents, setDbStudents, studentsLoaded] = useFirestoreDB('tb_enrollments', {
    'c1': [{ studentId: 'stu1', ga: 8.6, gb: 7.4, gc: 0, faltas: [false, false, false], feedback: "Ótimo desempenho." }]
  });

  // Tratamento de Segurança das Variáveis
  const systemUsers = typeof dbUsers === 'object' && dbUsers !== null ? dbUsers : {};
  const courses = Array.isArray(dbCourses) ? dbCourses : [];
  const courseContents = typeof dbContents === 'object' && dbContents !== null ? dbContents : {};
  const courseStudents = typeof dbStudents === 'object' && dbStudents !== null ? dbStudents : {};

  // 2. ESTADOS DA INTERFACE
  const [activeUserId, setActiveUserId] = useState('admin1');
  const currentUser = systemUsers[activeUserId] || systemUsers['admin1'] || { id: 'admin1', nome: 'Gestão COREMU', role: 'admin', avatar: 'GC' };
  const role = currentUser?.role || 'admin';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('admin_dashboard'); 
  const [editMode, setEditMode] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  const canEdit = editMode && (role === 'admin' || role === 'professor');

  // 3. ESTADOS DOS MODAIS E FORMULÁRIOS
  const [activeSectionForNewItem, setActiveSectionForNewItem] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('FileText');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newFile, setNewFile] = useState(null);

  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('aluno');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserName, setEditingUserName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseProfId, setNewCourseProfId] = useState('');
  const [newStudentId, setNewStudentId] = useState('');

  // Tela de Loading enquanto o Firebase Baixa os Dados
  const isDbReady = usersLoaded && coursesLoaded && contentsLoaded && studentsLoaded;
  if (!isDbReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 flex-col">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-black text-slate-800">Sincronizando com a Nuvem</h2>
        <p className="text-sm text-slate-500 mt-2">Conectando ao banco de dados do Portal COREMU...</p>
      </div>
    );
  }

  // Lógica de Visão de Cursos
  const visibleCourses = courses.filter(c => {
    if (!c) return false;
    if (role === 'admin') return true;
    if (role === 'professor') return c.professorId === currentUser.id;
    if (role === 'aluno') {
      const enrolled = courseStudents[c.id] || [];
      return Array.isArray(enrolled) && enrolled.some(enrollment => enrollment?.studentId === currentUser.id);
    }
    return false;
  });

  const switchUser = (userId) => {
    setActiveUserId(userId);
    setEditMode(false);
    
    const newRole = systemUsers[userId]?.role || 'aluno';
    if (newRole === 'admin') {
      setCurrentView('admin_dashboard');
      setActiveCourseId(null);
    } else {
      setCurrentView('user_home'); // Vai direto para o novo Dashboard!
      setActiveCourseId(null);
    }
  };

  // Funções de Gestão de Usuários
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName) return;
    const newId = `usr_${Date.now()}`;
    const initials = newUserName.substring(0, 2).toUpperCase();
    setDbUsers({ ...systemUsers, [newId]: { id: newId, nome: newUserName, role: newUserRole, avatar: initials } });
    setNewUserName('');
    alert('Usuário cadastrado com sucesso!');
  };

  const handleDeleteUser = (id) => {
    if (id === 'admin1') return alert('O Administrador principal não pode ser apagado.');
    if (window.confirm('Excluir este usuário permanentemente?')) {
      const updatedUsers = { ...systemUsers };
      delete updatedUsers[id];
      setDbUsers(updatedUsers);
    }
  };

  const handleStartEditUser = (user) => {
    if (!user) return;
    setEditingUserId(user.id);
    setEditingUserName(user.nome);
  };

  const handleSaveEditedUser = (id) => {
    if (!editingUserName.trim()) return alert("O nome não pode ficar em branco.");
    const updatedUsers = { ...systemUsers };
    if(updatedUsers[id]) {
      updatedUsers[id].nome = editingUserName;
      updatedUsers[id].avatar = editingUserName.substring(0, 2).toUpperCase();
      setDbUsers(updatedUsers);
    }
    setEditingUserId(null);
    setEditingUserName('');
  };

  // Funções de Gestão de Disciplinas
  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName || !newCourseProfId) return;
    const newId = `c_${Date.now()}`;
    setDbCourses([...courses, { id: newId, codigo: newCourseCode, nome: newCourseName, professorId: newCourseProfId }]);
    setDbContents({ ...courseContents, [newId]: defaultModules });
    setDbStudents({ ...courseStudents, [newId]: [] });
    setNewCourseCode(''); setNewCourseName(''); setNewCourseProfId('');
    alert('Disciplina criada com sucesso!');
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm('Atenção: Excluir esta disciplina apagará todo o conteúdo. Confirmar?')) {
      setDbCourses(courses.filter(c => c && c.id !== id));
      if (activeCourseId === id) {
        setActiveCourseId(null);
        setCurrentView('admin_dashboard');
      }
    }
  };

  const updateCourseDetails = (field, value) => {
    setDbCourses(courses.map(c => c?.id === activeCourseId ? { ...c, [field]: value } : c));
  };

  // Funções de Matrícula (Admin e Professor)
  const handleEnrollStudent = (e, courseId) => {
    e.preventDefault();
    if (!newStudentId) return;
    const newStudentData = { studentId: newStudentId, ga: 0, gb: 0, gc: 0, faltas: [false, false, false], feedback: "" };
    const currentEnrolled = Array.isArray(courseStudents[courseId]) ? courseStudents[courseId] : [];
    setDbStudents({ ...courseStudents, [courseId]: [...currentEnrolled, newStudentData] });
    setNewStudentId('');
  };

  const deleteStudent = (studentId) => {
    if (window.confirm('Remover a matrícula deste residente?')) {
      setDbStudents({ ...courseStudents, [activeCourseId]: rawActiveStudents.filter(s => s?.studentId !== studentId) });
    }
  };

  const activeContent = Array.isArray(courseContents[activeCourseId]) ? courseContents[activeCourseId] : [];
  const rawActiveStudents = Array.isArray(courseStudents[activeCourseId]) ? courseStudents[activeCourseId] : [];
  const activeCourseObj = courses.find(c => c && c.id === activeCourseId) || {};

  const studentsInCourse = rawActiveStudents.map(enrollment => ({
    ...enrollment,
    nome: systemUsers[enrollment?.studentId]?.nome || 'Usuário Excluído'
  }));

  const visibleGradesAndAttendance = role === 'aluno' 
    ? studentsInCourse.filter(s => s.studentId === currentUser.id) 
    : studentsInCourse;

  const availableStudentsForEnrollment = Object.values(systemUsers).filter(u => 
    u && u.role === 'aluno' && !rawActiveStudents.some(s => s?.studentId === u.id)
  );

  // Funções de Edição de Módulos e Anexos
  const toggleModule = (id) => setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  const updateContent = (newContent) => setDbContents({ ...courseContents, [activeCourseId]: newContent });

  const addSection = () => {
    const newSection = { id: `sec_${Date.now()}`, title: 'Novo Tópico / Módulo', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', items: [] };
    updateContent([...activeContent, newSection]);
    setExpandedModules(prev => ({ ...prev, [newSection.id]: true }));
  };

  const updateSectionTitle = (id, newTitle) => updateContent(activeContent.map(sec => sec?.id === id ? { ...sec, title: newTitle } : sec));
  const deleteSection = (id) => { if (window.confirm('Excluir este módulo?')) updateContent(activeContent.filter(sec => sec?.id !== id)); };
  const updateItemTitle = (sectionId, itemId, newTitle) => updateContent(activeContent.map(sec => sec?.id === sectionId ? { ...sec, items: (sec.items || []).map(item => item?.id === itemId ? { ...item, title: newTitle } : item) } : sec));
  const deleteItem = (sectionId, itemId) => updateContent(activeContent.map(sec => sec?.id === sectionId ? { ...sec, items: (sec.items || []).filter(item => item?.id !== itemId) } : sec));

  const handleConfirmAddItem = (e) => {
    e.preventDefault();
    if (!newItemTitle) return;
    let color = 'text-slate-500';
    if (newItemType === 'FileText') color = 'text-red-500';
    else if (newItemType === 'Link') color = 'text-blue-500';
    else if (newItemType === 'MessageSquare') color = 'text-purple-600';
    else if (newItemType === 'Upload') color = 'text-teal-600';

    updateContent(activeContent.map(sec => {
      if (sec?.id === activeSectionForNewItem) {
        return {
          ...sec,
          items: [...(sec.items || []), { 
            id: `item_${Date.now()}`, title: newItemTitle, type: newItemType, color: color, url: newItemUrl || null, fileName: newFile ? newFile.name : null 
          }]
        };
      }
      return sec;
    });
    setActiveSectionForNewItem(null); 
  };

  // Funções de Notas e Presença
  const updateGrade = (studentId, field, value) => {
    setDbStudents({ ...courseStudents, [activeCourseId]: rawActiveStudents.map(s => s?.studentId === studentId ? { ...s, [field]: parseFloat(value) || 0 } : s) });
  };
  const updateFeedback = (studentId, value) => {
    setDbStudents({ ...courseStudents, [activeCourseId]: rawActiveStudents.map(s => s?.studentId === studentId ? { ...s, feedback: value } : s) });
  };
  const toggleAttendance = (studentId, index) => {
    setDbStudents({ ...courseStudents, [activeCourseId]: rawActiveStudents.map(s => {
        if (s?.studentId === studentId) {
          const newFaltas = [...(s.faltas || [])];
          newFaltas[index] = !newFaltas[index]; 
          return { ...s, faltas: newFaltas };
        }
        return s;
    })});
  };

  const getIconComponent = (type) => {
    switch (type) {
      case 'FileText': return FileText || (() => <span>FT</span>);
      case 'MessageSquare': return MessageSquare || (() => <span>MS</span>);
      case 'Folder': return Folder || (() => <span>FD</span>);
      case 'Upload': return Upload || (() => <span>UP</span>);
      case 'CheckCircle': return CheckCircle || (() => <span>CC</span>);
      case 'Link': return Link || (() => <span>LK</span>);
      default: return FileText || (() => <span>FT</span>);
    }
  };

  // ==========================================
  // RENDERIZAÇÃO DAS TELAS SECUNDÁRIAS
  // ==========================================

  // O NOVO DASHBOARD DO PROFESSOR E RESIDENTE
  const renderUserHome = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-teal-50 text-teal-700 rounded-xl"><Home className="w-8 h-8"/></div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Olá, {currentUser.nome}</h2>
          <p className="text-sm text-slate-500 mt-1">Bem-vindo ao Portal COREMU. Selecione uma disciplina abaixo para acessar a sala de aula virtual.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCourses.length === 0 ? (
          <div className="col-span-full text-center p-12 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-500">
            <Book className="w-12 h-12 mx-auto mb-3 text-slate-300"/>
            <p className="font-bold text-lg text-slate-700">Nenhuma disciplina vinculada</p>
            <p className="text-sm mt-1">Você ainda não possui turmas ou matriculas no semestre atual.</p>
          </div>
        ) : (
          visibleCourses.map(c => {
            if(!c) return null;
            return (
            <div key={c.id} onClick={() => {setActiveCourseId(c.id); setCurrentView('course_home');}} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition cursor-pointer flex flex-col justify-between h-full group">
              <div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">{c.codigo}</span>
                <h3 className="font-bold text-slate-800 mt-3 group-hover:text-teal-700 transition leading-tight">{c.nome}</h3>
                <p className="text-xs text-slate-500 mt-2">Professor Titular: {systemUsers[c.professorId]?.nome || 'Não definido'}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-teal-700 text-sm font-bold">
                Acessar Sala <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );

  const renderAdminUsers = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-purple-50 text-purple-700 rounded-xl"><Users className="w-8 h-8"/></div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Gestão de Usuários</h2>
          <p className="text-sm text-slate-500 mt-1">Cadastre, edite ou remova residentes e preceptores do sistema.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5 text-purple-600"/> Novo Usuário</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
              <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Ex: Dra. Ana Costa" className="w-full mt-1 border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Perfil de Acesso</label>
              <select required value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full mt-1 border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                <option value="aluno">Aluno / Residente</option>
                <option value="professor">Professor / Preceptor</option>
                <option value="admin">Administrador (Gestão)</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-purple-800 text-white font-bold p-3 rounded-lg hover:bg-purple-900 transition flex items-center justify-center gap-2">
              <Plus className="w-4 h-4"/> Salvar na Nuvem
            </button>
          </form>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-slate-600"/> Usuários Ativos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                <tr>
                  <th className="p-3">Nome</th>
                  <th className="p-3 text-center">Perfil</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.values(systemUsers).map(u => {
                  if(!u) return null;
                  return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                          {u.avatar}
                        </div>
                        {editingUserId === u.id ? (
                          <input type="text" value={editingUserName} onChange={e => setEditingUserName(e.target.value)} className="border border-purple-300 px-2 py-1 rounded focus:ring-2 focus:ring-purple-500 outline-none w-full max-w-xs" autoFocus />
                        ) : (
                          <span>{u.nome}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] px-2 py-1 rounded font-bold uppercase ${u.role === 'admin' ? 'bg-slate-800 text-white' : u.role === 'professor' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      {editingUserId === u.id ? (
                        <>
                          <button onClick={() => handleSaveEditedUser(u.id)} className="text-emerald-600 hover:text-emerald-800 p-2" title="Salvar"><Check className="w-4 h-4 inline"/></button>
                          <button onClick={handleCancelEditUser} className="text-slate-400 hover:text-slate-600 p-2" title="Cancelar"><X className="w-4 h-4 inline"/></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleStartEditUser(u)} className="text-slate-400 hover:text-purple-600 p-2" title="Editar Nome"><Edit2 className="w-4 h-4 inline"/></button>
                          {u.id !== 'admin1' && (
                            <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 p-2" title="Excluir"><Trash2 className="w-4 h-4 inline"/></button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-teal-50 text-teal-700 rounded-xl"><Shield className="w-8 h-8"/></div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Governança Acadêmica - COREMU</h2>
          <p className="text-sm text-slate-500 mt-1">Crie disciplinas e gerencie as matrizes ativas na Nuvem.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Book className="w-5 h-5 text-teal-600"/> Abrir Nova Disciplina</h3>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Código</label>
              <input type="text" required value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} placeholder="Ex: RMAB001" className="w-full mt-1 border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nome da Disciplina</label>
              <input type="text" required value={newCourseName} onChange={e => setNewCourseName(e.target.value)} placeholder="Ex: Saúde Coletiva" className="w-full mt-1 border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Professor Titular / Preceptor</label>
              <select required value={newCourseProfId} onChange={e => setNewCourseProfId(e.target.value)} className="w-full mt-1 border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
                <option value="">Selecione...</option>
                {Object.values(systemUsers).filter(u => u && u.role === 'professor').map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full bg-teal-800 text-white font-bold p-3 rounded-lg hover:bg-teal-900 transition flex items-center justify-center gap-2">
              <Plus className="w-4 h-4"/> Salvar Disciplina
            </button>
          </form>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Layout className="w-5 h-5 text-blue-600"/> Matriz Curricular Global</h3>
          {courses.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-xl bg-slate-50 text-slate-500">Nenhuma disciplina ativa no sistema.</div>
          ) : (
            <div className="space-y-3">
              {courses.map(c => {
                if(!c) return null;
                return (
                <div key={c.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">{c.codigo}</span>
                    <h4 className="font-bold text-slate-800 mt-1">{c.nome}</h4>
                    <p className="text-xs text-slate-500 mt-1">Professor: <strong>{systemUsers[c.professorId]?.nome || 'Não definido'}</strong></p>
                    <p className="text-xs text-slate-400">{Array.isArray(courseStudents[c.id]) ? courseStudents[c.id].length : 0} aluno(s) matriculado(s)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setActiveCourseId(c.id); setCurrentView('participants'); }} className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 flex items-center gap-2">
                      <Layout className="w-3.5 h-3.5"/> Abrir Disciplina
                    </button>
                    <button onClick={() => handleDeleteCourse(c.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100">
                      Excluir
                    </button>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderParticipants = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-blue-50 text-blue-700 rounded-xl"><Users className="w-8 h-8"/></div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Participantes da Disciplina</h2>
          <p className="text-sm text-slate-500 mt-1">Visualize e gerencie os residentes matriculados nesta turma.</p>
        </div>
      </div>

      {canEdit && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5 text-teal-600"/> Matricular Novo Residente</h3>
          <form onSubmit={(e) => handleEnrollStudent(e, activeCourseId)} className="flex gap-3 max-w-lg">
            <select required value={newStudentId} onChange={e => setNewStudentId(e.target.value)} className="flex-1 border p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white">
              <option value="">Selecione um residente cadastrado no sistema...</option>
              {availableStudentsForEnrollment.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
            <button type="submit" className="bg-teal-800 text-white font-bold px-4 py-2.5 rounded-lg hover:bg-teal-900 transition flex items-center gap-2">
              <Plus className="w-4 h-4"/> Matricular
            </button>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100 text-slate-600 font-bold border-b">
            <tr>
              <th className="p-4">Nome do Aluno</th>
              <th className="p-4 text-center">Status</th>
              {canEdit && <th className="p-4 text-right">Ação</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {studentsInCourse.length === 0 ? (
              <tr><td colSpan={canEdit ? 3 : 2} className="p-6 text-center text-slate-500">Nenhum aluno matriculado nesta disciplina.</td></tr>
            ) : (
              studentsInCourse.map(s => {
                if(!s) return null;
                return (
                <tr key={s.studentId} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {systemUsers[s.studentId]?.avatar || '??'}
                    </div>
                    {s.nome}
                  </td>
                  <td className="p-4 text-center"><span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-1 rounded font-bold uppercase">Matriculado</span></td>
                  {canEdit && (
                    <td className="p-4 text-right">
                      <button onClick={() => deleteStudent(s.studentId)} className="text-red-500 hover:text-red-700 p-2"><Trash2 className="w-4 h-4 inline"/></button>
                    </td>
                  )}
                </tr>
              )})
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCourseHome = () => (
    <div className="animate-fade-in relative">
      
      {activeSectionForNewItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-black text-slate-800">Adicionar atividade ou recurso</h3>
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

              {(newItemType === 'Link' || newItemType === 'FileText') && (
                <div className="animate-fade-in border-t pt-4">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">
                    {newItemType === 'Link' ? 'URL do Link Externo' : 'Anexar Arquivo do Computador'}
                  </label>
                  {newItemType === 'Link' ? (
                    <input type="url" value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} placeholder="https://..." className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                  ) : (
                    <input type="file" onChange={(e) => setNewFile(e.target.files[0])} className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer text-slate-500" />
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
          <p className="font-bold text-lg text-slate-700">Ainda não há conteúdos publicados.</p>
        </div>
      )}

      {activeContent.map(section => {
        if(!section) return null;
        return(
        <div key={section.id} className={`mb-6 rounded-lg border ${section.borderColor || 'border-slate-200'} overflow-hidden shadow-sm bg-white`}>
          <div className={`flex items-center justify-between p-3 ${section.bgColor || 'bg-slate-50'} border-b ${section.borderColor || 'border-slate-200'}`}>
            <div className="flex items-center gap-3 w-full">
              <button onClick={() => toggleModule(section.id)} className="p-1 hover:bg-slate-200 rounded">
                {expandedModules[section.id] !== false ? <ChevronDown className="w-5 h-5 text-slate-500"/> : <ChevronRight className="w-5 h-5 text-slate-500"/>}
              </button>
              {canEdit ? (
                <input type="text" value={section.title || ''} onChange={(e) => updateSectionTitle(section.id, e.target.value)} className="bg-white border border-slate-300 rounded px-2 py-1 text-base font-bold text-slate-800 w-full max-w-md focus:ring-2 focus:ring-teal-500 outline-none" />
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
              {(section.items || []).map(item => {
                if(!item) return null;
                const IconComponent = getIconComponent(item.type);
                return (
                  <div key={item.id} className="flex items-start justify-between p-4 border-b border-slate-100 hover:bg-slate-50 group">
                    <div className="flex items-start gap-3 w-full">
                      {canEdit && <GripVertical className="w-4 h-4 text-slate-300 cursor-move mt-1" />}
                      <IconComponent className={`w-5 h-5 ${item.color || 'text-slate-500'} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        {canEdit ? (
                          <input type="text" value={item.title || ''} onChange={(e) => updateItemTitle(section.id, item.id, e.target.value)} className="bg-white border border-slate-300 rounded px-2 py-1 text-sm font-semibold text-slate-800 w-full max-w-md focus:ring-2 focus:ring-teal-500 outline-none" />
                        ) : (
                          <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                        )}
                        
                        {item.fileName && (
                          <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 mt-1 bg-slate-100 w-fit px-2 py-0.5 rounded border border-slate-200">
                            <Paperclip className="w-3 h-3"/> {item.fileName}
                          </div>
                        )}
                        {item.url && !canEdit && (
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
      )})}
    </div>
  );

  const renderGradebook = () => (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <div>
          <h3 className="font-bold text-lg text-slate-800">Relatório de Notas</h3>
          <p className="text-xs text-slate-500">Cálculo e consolidação do boletim.</p>
        </div>
        {(role === 'professor' || role === 'admin') && (
          <button className="bg-slate-200 text-slate-700 px-3 py-1.5 rounded text-xs font-bold flex items-center gap-2 hover:bg-slate-300">
            <Download className="w-4 h-4"/> Exportar Excel
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-800 text-white border-b border-slate-300">
              <th className="p-3 font-semibold w-1/4">Estudante</th>
              <th className="p-3 font-semibold border-x border-slate-600 text-center">GA</th>
              <th className="p-3 font-semibold border-x border-slate-600 text-center">GB</th>
              <th className="p-3 font-semibold border-x border-slate-600 text-center">GC</th>
              <th className="p-3 font-semibold bg-teal-800 text-center">Total</th>
              <th className="p-3 font-semibold border-x border-slate-600 text-center">Status</th>
              <th className="p-3 font-semibold">Feedback Contínuo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {visibleGradesAndAttendance.length === 0 ? (
              <tr><td colSpan="7" className="p-6 text-center text-slate-500 font-medium">Turma vazia ou sem acesso às notas.</td></tr>
            ) : (
              visibleGradesAndAttendance.map((aluno, idx) => {
                if(!aluno) return null;
                const total = ((aluno.ga||0) + (aluno.gb||0) + (aluno.gc||0)).toFixed(2);
                const isApproved = total >= 14 || (aluno.gc > 0 && total >= 15);

                return (
                  <tr key={aluno.studentId} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    <td className="p-3 font-bold text-slate-700 border-r border-slate-200">{aluno.nome}</td>
                    <td className="p-2 border-r border-slate-200 text-center">
                      {canEdit ? <input type="number" step="0.1" value={aluno.ga||''} onChange={(e) => updateGrade(aluno.studentId, 'ga', e.target.value)} className="w-14 text-center border p-1.5 rounded font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white" /> : <span className="font-bold text-slate-700">{aluno.ga}</span>}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center">
                      {canEdit ? <input type="number" step="0.1" value={aluno.gb||''} onChange={(e) => updateGrade(aluno.studentId, 'gb', e.target.value)} className="w-14 text-center border p-1.5 rounded font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white" /> : <span className="font-bold text-slate-700">{aluno.gb}</span>}
                    </td>
                    <td className="p-2 border-r border-slate-200 text-center">
                      {canEdit ? <input type="number" step="0.1" value={aluno.gc||''} onChange={(e) => updateGrade(aluno.studentId, 'gc', e.target.value)} className="w-14 text-center border p-1.5 rounded font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-white" /> : <span className="font-bold text-slate-700">{aluno.gc}</span>}
                    </td>
                    <td className="p-3 border-r border-slate-200 text-center font-black bg-slate-100 text-base">{total}</td>
                    <td className="p-3 border-r border-slate-200 text-center">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                        {isApproved ? 'Aprovado' : 'Em Exame'}
                      </span>
                    </td>
                    <td className="p-2">
                      {canEdit ? <input type="text" value={aluno.feedback||''} onChange={(e) => updateFeedback(aluno.studentId, e.target.value)} placeholder="Parecer..." className="w-full border p-1.5 rounded text-xs focus:ring-2 focus:ring-teal-500 outline-none bg-white" /> : <span className="text-xs text-slate-500 italic">{aluno.feedback || "Sem feedback no momento."}</span>}
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
        <h3 className="font-bold text-lg text-slate-800">Diário de Classe - Frequência</h3>
        <p className="text-xs text-slate-500">Verde = Presente | Preto = Falta. Somente docentes podem alterar as faltas.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-200 text-slate-700">
              <th rowSpan="2" className="p-2 border border-slate-300 font-bold w-1/3">Estudante</th>
              <th rowSpan="2" className="p-2 border border-slate-300 font-bold text-center">Faltas Computadas</th>
              <th colSpan="3" className="p-2 border border-slate-300 font-bold text-center bg-slate-300">Aulas do Dia</th>
            </tr>
            <tr className="bg-slate-100 text-slate-700 text-center text-[10px]">
              <th className="p-1 border border-slate-300">07:30 - 08:20</th>
              <th className="p-1 border border-slate-300">08:20 - 09:10</th>
              <th className="p-1 border border-slate-300">09:10 - 10:00</th>
            </tr>
          </thead>
          <tbody>
            {visibleGradesAndAttendance.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center text-slate-500 font-medium">Turma vazia ou sem acesso ao diário.</td></tr>
            ) : (
              visibleGradesAndAttendance.map((aluno) => {
                if(!aluno) return null;
                const qtdeFaltas = (aluno.faltas || []).filter(f => f).length;
                return (
                  <tr key={aluno.studentId} className="hover:bg-slate-50">
                    <td className="p-2 border border-slate-200 font-medium text-slate-800">{aluno.nome}</td>
                    <td className="p-2 border border-slate-200 text-center">
                      <span className={`font-black text-sm ${qtdeFaltas > 1 ? 'text-red-600' : 'text-slate-700'}`}>{qtdeFaltas}</span>
                    </td>
                    {(aluno.faltas || []).map((falta, i) => (
                      <td key={i} className={`p-2 border border-slate-200 text-center transition-colors ${canEdit ? 'cursor-pointer hover:opacity-80' : ''} ${falta ? 'bg-slate-800' : 'bg-emerald-700'}`} onClick={() => canEdit && toggleAttendance(aluno.studentId, i)}>
                        <input type="checkbox" checked={!falta} readOnly className="w-4 h-4 rounded text-white pointer-events-none" />
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

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-slate-800 overflow-hidden">
      
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
                <button onClick={() => {setCurrentView('admin_dashboard'); setActiveCourseId(null); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors ${currentView === 'admin_dashboard' ? 'bg-teal-900/40 text-teal-400 border-l-4 border-teal-500' : 'hover:bg-slate-800 text-slate-400'}`}>
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Gestão COREMU</span>}
                </button>
                <button onClick={() => {setCurrentView('admin_users'); setActiveCourseId(null); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors ${currentView === 'admin_users' ? 'bg-teal-900/40 text-teal-400 border-l-4 border-teal-500' : 'hover:bg-slate-800 text-slate-400'}`}>
                  <Users className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Gestão de Usuários</span>}
                </button>
                <div className="my-4 border-t border-slate-800 mx-2"></div>
              </>
            )}

            {/* BOTÃO PÁGINA INICIAL COM O ONCLICK ATIVADO E DIRECIONANDO PARA O DASHBOARD */}
            {(role === 'professor' || role === 'aluno') && (
              <button 
                onClick={() => {setCurrentView('user_home'); setActiveCourseId(null); setEditMode(false);}} 
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors ${currentView === 'user_home' ? 'bg-teal-900/40 text-teal-400 border-l-4 border-teal-500' : 'hover:bg-slate-800 text-slate-400'}`}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>Página Inicial</span>}
              </button>
            )}

            {sidebarOpen && <div className="mt-8 mb-2 px-3 text-[10px] font-black uppercase tracking-widest text-slate-500">Disciplinas Ativas</div>}
            
            {visibleCourses.length === 0 ? (
              <div className="px-4 text-xs text-slate-600 italic mt-2">Nenhuma disciplina.</div>
            ) : (
              visibleCourses.map(c => {
                if(!c) return null;
                const isCourseActive = activeCourseId === c.id && ['course_home', 'participants', 'grades', 'attendance'].includes(currentView);
                return (
                <div key={c.id}>
                  <button onClick={() => {setActiveCourseId(c.id); setCurrentView('course_home'); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${isCourseActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'}`}>
                    <Book className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="truncate">{c.codigo}</span>}
                  </button>
                  
                  {isCourseActive && sidebarOpen && (
                    <div className="ml-4 pl-4 border-l border-slate-700 mt-1 space-y-1">
                      <button onClick={() => setCurrentView('course_home')} className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${currentView === 'course_home' ? 'text-teal-400 bg-slate-800' : 'hover:bg-slate-800 text-slate-400'}`}>
                        <Layout className="w-4 h-4 flex-shrink-0" /> Mural e Módulos
                      </button>
                      <button onClick={() => setCurrentView('participants')} className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${currentView === 'participants' ? 'text-teal-400 bg-slate-800' : 'hover:bg-slate-800 text-slate-400'}`}>
                        <Users className="w-4 h-4 flex-shrink-0" /> Participantes
                      </button>
                      <button onClick={() => setCurrentView('grades')} className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${currentView === 'grades' ? 'text-teal-400 bg-slate-800' : 'hover:bg-slate-800 text-slate-400'}`}>
                        <BarChart className="w-4 h-4 flex-shrink-0" /> Notas e Parecer
                      </button>
                      <button onClick={() => setCurrentView('attendance')} className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs transition-colors ${currentView === 'attendance' ? 'text-teal-400 bg-slate-800' : 'hover:bg-slate-800 text-slate-400'}`}>
                        <CheckSquare className="w-4 h-4 flex-shrink-0" /> Diário de Frequência
                      </button>
                    </div>
                  )}
                </div>
              )})
            )}
          </nav>
        </div>

        {sidebarOpen && (
          <div className="p-4 bg-slate-950 border-t border-slate-800 z-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Simular Login de Usuário</p>
            <select value={activeUserId} onChange={(e) => switchUser(e.target.value)} className="w-full bg-slate-800 text-xs font-bold text-slate-300 p-2 rounded border border-slate-700 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
              {Object.values(systemUsers).map(u => {
                if(!u) return null;
                return (<option key={u.id} value={u.id}>{u.nome} ({u.role})</option>)
              })}
            </select>
          </div>
        )}
      </aside>

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
            
            {currentView === 'user_home' && renderUserHome()}
            {currentView === 'admin_dashboard' && renderAdminDashboard()}
            {currentView === 'admin_users' && renderAdminUsers()}
            {currentView === 'empty_state' && renderEmptyState()}

            {activeCourseId && ['course_home', 'participants', 'grades', 'attendance'].includes(currentView) && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                  <div className="flex-1">
                    {canEdit ? (
                      <input type="text" value={activeCourseObj?.nome || ''} onChange={(e) => updateCourseDetails('nome', e.target.value)} placeholder="Nome da Disciplina" className="w-full text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight bg-transparent border-b-2 border-dashed border-slate-300 focus:border-teal-500 focus:outline-none mb-1 pb-1" />
                    ) : (
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">{activeCourseObj?.nome}</h1>
                    )}
                    
                    {canEdit ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input type="text" value={activeCourseObj?.codigo || ''} onChange={(e) => updateCourseDetails('codigo', e.target.value)} placeholder="Código" className="w-32 text-sm text-slate-500 font-medium bg-transparent border-b-2 border-dashed border-slate-300 focus:border-teal-500 focus:outline-none" />
                        <span className="text-sm text-slate-500 font-medium">• Professor: {systemUsers[activeCourseObj?.professorId]?.nome}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 mt-1 font-medium">{activeCourseObj?.codigo} • Professor Titular: {systemUsers[activeCourseObj?.professorId]?.nome}</p>
                    )}
                  </div>
                  
                  {canEdit && (
                    <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm shrink-0">
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
                    currentView === 'course_home' ? 'Mural e Módulos' : 
                    currentView === 'grades' ? 'Boletim de Notas' : 
                    currentView === 'participants' ? 'Participantes' : 'Diário de Classe'
                  }</span>
                </div>

                {currentView === 'course_home' && renderCourseHome()}
                {currentView === 'participants' && renderParticipants()}
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

export default function App() {
  return (
    <ErrorBoundary>
      <LmsEnterprisePortal />
    </ErrorBoundary>
  );
}
