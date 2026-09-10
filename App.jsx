import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import {
  Menu,
  Bell,
  Search,
  Home,
  Book,
  Calendar,
  BarChart,
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  MessageSquare,
  Folder,
  CheckCircle,
  Upload,
  Download,
  ToggleLeft,
  ToggleRight,
  Layout,
  GripVertical,
  Trash2,
  Shield,
  UserPlus,
  CheckSquare,
  X,
  Link,
  Paperclip,
  Users,
  Edit2,
  Check,
  Loader2,
  Printer,
  AlignLeft,
  ClipboardList,
  Send,
  MessageCircle,
  Info,
  Phone,
  Mail,
  Lock,
  Key,
} from 'lucide-react';

// ============================================================================
// 1. CONFIGURAÇÃO DE SEGURANÇA E CONEXÃO COM A NUVEM (FIREBASE)
// ============================================================================
const firebaseConfig = {
  apiKey: "AIzaSyAwRjc9QUmF4quqYOvt-Z187Mlv5rQnHXE",
  authDomain: "residenciamultihaco.firebaseapp.com",
  projectId: "residenciamultihaco",
  storageBucket: "residenciamultihaco.firebasestorage.app",
  messagingSenderId: "1089100227489",
  appId: "1:1089100227489:web:3b0102e76b25f2c9e8a1e0",
};

let app, db, storage, auth;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  storage = getStorage(app);
  auth = getAuth(app);
} catch (e) {
  console.error("Erro crítico na inicialização da arquitetura Firebase:", e);
}

// ============================================================================
// 2. ESCUDO DE INTERCEPTAÇÃO DE FALHAS (ERROR BOUNDARY)
// ============================================================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Erro interceptado pelo Boundary:", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-slate-50 h-screen overflow-auto font-sans flex flex-col items-center justify-center">
          <div className="bg-white p-10 rounded-2xl shadow-2xl border-t-8 border-red-600 max-w-3xl w-full">
            <h1 className="text-3xl font-black text-slate-800 mb-4 flex items-center gap-3">
              <Shield className="w-10 h-10 text-red-600" />
              SISTEMA DE SEGURANÇA ATIVADO
            </h1>
            <p className="text-slate-600 mb-6 text-lg">
              Ocorreu um erro no processamento da interface. O sistema evitou o colapso total da aplicação. Detalhes técnicos:
            </p>
            <pre className="bg-slate-100 p-6 border border-slate-200 rounded-xl text-sm text-red-700 overflow-x-auto whitespace-pre-wrap shadow-inner font-mono">
              {this.state.error?.toString()}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ============================================================================
// 3. ENGINE DE SINCRONIZAÇÃO EM TEMPO REAL (HOOK FIRESTORE)
// ============================================================================
const useFirestoreDB = (docName, initialValue) => {
  const [data, setData] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!db) {
      setIsLoaded(true);
      return;
    }

    const unsub = onSnapshot(
      doc(db, 'coremu_database', docName),
      (docSnap) => {
        if (docSnap.exists()) {
          setData(docSnap.data().value || initialValue);
        } else {
          setDoc(doc(db, 'coremu_database', docName), { value: initialValue }).catch((err) => {
            console.error("Falha ao criar o documento raiz:", err);
          });
          setData(initialValue);
        }
        setIsLoaded(true);
      },
      (error) => {
        console.error(`Falha no listener de tempo real [${docName}]:`, error);
        setData(initialValue);
        setIsLoaded(true);
      }
    );

    return () => unsub();
  }, [docName]);

  const updateData = async (newValue) => {
    const valToSave = typeof newValue === 'function' ? newValue(data) : newValue;
    setData(valToSave);
    if (db) {
      try {
        await setDoc(doc(db, 'coremu_database', docName), { value: valToSave });
      } catch (error) {
        console.error("Falha ao despachar atualização para a nuvem:", error);
      }
    }
  };

  return [data, updateData, isLoaded];
};

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    ['link', 'image', 'video'],
    ['clean'],
  ],
};

// ============================================================================
// 4. COMPONENTE PRINCIPAL MESTRE: PORTAL COREMU
// ============================================================================
function LmsEnterprisePortal() {
  
  // --------------------------------------------------------------------------
  // BANCO DE DADOS: COLEÇÕES E ESTADOS DE SINCRONIZAÇÃO
  // --------------------------------------------------------------------------
  const [dbUsers, setDbUsers, usersLoaded] = useFirestoreDB('tb_users_v2', {
    'admin1': { 
      id: 'admin1', 
      nome: 'Gestão COREMU', 
      role: 'admin', 
      avatar: 'GC', 
      email: 'gestao@haco.mil.br', 
      phone: '(51) 3333-4444', 
      bio: 'Gestão Geral do Programa de Residência Multiprofissional em Saúde.', 
      showContactPublicly: true 
    },
    'prof1': { 
      id: 'prof1', 
      nome: '1º Ten Norberto Cimirro', 
      role: 'professor', 
      avatar: 'NC', 
      email: 'norberto@haco.mil.br', 
      phone: '(51) 99999-9999', 
      bio: 'Enfermeiro da Força Aérea Brasileira. Pós-graduado em Gestão de Saúde, Auditoria e Enfermagem Aeroespacial.', 
      showContactPublicly: true 
    },
    'stu1': { 
      id: 'stu1', 
      nome: 'Mariana Alves', 
      role: 'aluno', 
      avatar: 'MA', 
      email: 'mariana@teste.com', 
      phone: '(51) 98888-8888', 
      bio: 'Residente R1 de Enfermagem do HACO.', 
      showContactPublicly: false 
    }
  });
  
  const [dbCourses, setDbCourses, coursesLoaded] = useFirestoreDB('tb_courses', [
    { 
      id: 'c1', 
      codigo: '001/003/07A', 
      nome: 'Enfermagem Forense e Saúde da Família', 
      professorId: 'prof1' 
    }
  ]);
  
  const defaultModules = [
    {
      id: 'boas_vindas', 
      title: 'Mural de Boas-vindas e Orientações', 
      bgColor: 'bg-blue-50/50', 
      borderColor: 'border-blue-100',
      items: [
        { 
          id: 'i1', 
          title: 'Plano de Ensino 2026 Oficial', 
          type: 'FileText', 
          color: 'text-red-500', 
          fileName: 'Plano_de_Ensino_2026.pdf', 
          url: null 
        }
      ]
    }
  ];
  
  const [dbContents, setDbContents, contentsLoaded] = useFirestoreDB('tb_contents', { 'c1': defaultModules });
  
  const [dbStudents, setDbStudents, studentsLoaded] = useFirestoreDB('tb_enrollments', { 
    'c1': [
      { 
        studentId: 'stu1', 
        ga: 8.6, 
        gb: 7.4, 
        gc: 0, 
        faltas: [], 
        feedback: "Ótimo desempenho clínico durante a simulação." 
      }
    ] 
  });
  
  const [dbAttendanceCols, setDbAttendanceCols, colsLoaded] = useFirestoreDB('tb_attendance_cols', { 'c1': [] });
  const [dbForums, setDbForums, forumsLoaded] = useFirestoreDB('tb_forums_v3', {});
  const [dbExams, setDbExams, examsLoaded] = useFirestoreDB('tb_exams_v1', {});

  // PREVENÇÃO E BLINDAGEM CONTRA FALHAS DE TIPAGEM DO FIREBASE
  const systemUsers = typeof dbUsers === 'object' && dbUsers !== null ? dbUsers : {};
  const courses = Array.isArray(dbCourses) ? dbCourses : [];
  const courseContents = typeof dbContents === 'object' && dbContents !== null ? dbContents : {};
  const courseStudents = typeof dbStudents === 'object' && dbStudents !== null ? dbStudents : {};
  const attendanceCols = typeof dbAttendanceCols === 'object' && dbAttendanceCols !== null ? dbAttendanceCols : {};
  const forums = typeof dbForums === 'object' && dbForums !== null ? dbForums : {};
  const exams = typeof dbExams === 'object' && dbExams !== null ? dbExams : {};

  // --------------------------------------------------------------------------
  // ESTADOS DE GERENCIAMENTO DE SESSÃO E LOGIN AUTH
  // --------------------------------------------------------------------------
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [loginEmailInput, setLoginEmailInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  
  const [activeUserId, setActiveUserId] = useState(null);
  
  const currentUser = systemUsers[activeUserId] || {};
  const role = currentUser?.role || 'aluno';

  // --------------------------------------------------------------------------
  // ESTADOS DA INTERFACE DO USUÁRIO E MODO EDITOR
  // --------------------------------------------------------------------------
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('user_home'); 
  const [editMode, setEditMode] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  const hasEditPermission = role === 'admin' || role === 'professor';
  const isEditing = editMode && hasEditPermission;

  // --------------------------------------------------------------------------
  // ESTADOS DE FORMULÁRIOS DE CRIAÇÃO (ADMIN E PROFESSOR)
  // --------------------------------------------------------------------------
  const [activeSectionForNewItem, setActiveSectionForNewItem] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('FileText');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemTextContent, setNewItemTextContent] = useState(''); 
  const [newFile, setNewFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('aluno');
  
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserName, setEditingUserName] = useState('');
  
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseProfId, setNewCourseProfId] = useState('');
  const [newStudentId, setNewStudentId] = useState('');

  // --------------------------------------------------------------------------
  // ESTADOS DE EXECUÇÃO DE COMPONENTES INTERATIVOS
  // --------------------------------------------------------------------------
  const [readingItem, setReadingItem] = useState(null); 
  const [activeForumItem, setActiveForumItem] = useState(null); 
  const [activeTopicId, setActiveTopicId] = useState(null); 
  const [activeExamItem, setActiveExamItem] = useState(null); 
  const [localQuestions, setLocalQuestions] = useState([]);
  
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [editProfileData, setEditProfileData] = useState(null);

  const chatEndRef = useRef(null); 

  // ============================================================================
  // PRELOADER GLOBAL DA PLATAFORMA
  // ============================================================================
  const isDbReady = usersLoaded && coursesLoaded && contentsLoaded && studentsLoaded && colsLoaded && forumsLoaded && examsLoaded;
  
  if (!isDbReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 flex-col font-sans">
        <Loader2 className="w-20 h-20 text-teal-600 animate-spin mb-8" />
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Sincronizando Sistema</h2>
        <p className="text-lg text-slate-500 mt-2">Buscando banco de dados COREMU HACO...</p>
      </div>
    );
  }

  // ============================================================================
  // MOTOR DE AUTENTICAÇÃO E LOGIN (FIREBASE AUTH)
  // ============================================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        loginEmailInput.trim(), 
        loginPasswordInput
      );
      
      const loggedEmail = userCredential.user.email;

      const userFound = Object.values(systemUsers).find(
        (u) => u?.email?.toLowerCase() === loggedEmail.toLowerCase()
      );
      
      if (userFound) {
        setActiveUserId(userFound.id);
        setIsLoggedIn(true);
        if (userFound.role === 'admin') {
          setCurrentView('admin_dashboard');
        } else {
          setCurrentView('user_home');
        }
      } else {
        alert("Sua senha está correta, porém seu e-mail não possui perfil na Gestão da COREMU.");
        await signOut(auth);
      }
    } catch (error) {
      console.error("Falha ao tentar autenticar:", error);
      alert("Acesso Negado: E-mail não encontrado ou Senha incorreta.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setActiveUserId(null);
      setActiveCourseId(null);
      setLoginEmailInput('');
      setLoginPasswordInput('');
    } catch(error) {
      console.error("Erro ao encerrar a sessão:", error);
    }
  };

  // --------------------------------------------------------------------------
  // TELA DE LOGIN SEGURA
  // --------------------------------------------------------------------------
  if (!isLoggedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 font-sans p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>

        <div className="bg-white p-10 md:p-14 rounded-[2rem] shadow-2xl w-full max-w-md relative z-10 animate-fade-in border border-slate-100">
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-teal-50 rounded-3xl flex items-center justify-center border border-teal-100 shadow-inner">
              <Shield className="w-12 h-12 text-teal-700"/>
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-800 text-center tracking-tight mb-2">Portal COREMU</h1>
          <p className="text-base text-slate-500 text-center mb-10 font-medium">Acesso Seguro ao Ambiente Acadêmico</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">E-mail Institucional Oficial</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  value={loginEmailInput} 
                  onChange={e => setLoginEmailInput(e.target.value)} 
                  placeholder="nome.sobrenome@haco.mil.br" 
                  className="w-full border border-slate-300 p-5 pl-14 rounded-2xl text-base focus:ring-2 focus:ring-teal-500 outline-none transition-shadow bg-slate-50 focus:bg-white font-medium text-slate-800" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Sua Senha de Acesso</label>
              <div className="relative">
                <Key className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  value={loginPasswordInput} 
                  onChange={e => setLoginPasswordInput(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full border border-slate-300 p-5 pl-14 rounded-2xl text-base focus:ring-2 focus:ring-teal-500 outline-none transition-shadow bg-slate-50 focus:bg-white font-medium text-slate-800" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isAuthenticating} 
              className="w-full bg-teal-800 text-white font-black p-5 rounded-2xl hover:bg-teal-900 transition-all shadow-xl hover:shadow-teal-900/30 text-lg flex items-center justify-center gap-3 mt-8 disabled:bg-slate-400"
            >
              {isAuthenticating ? (
                <><Loader2 className="w-6 h-6 animate-spin"/> Validando Credenciais...</>
              ) : (
                <><Lock className="w-5 h-5"/> Autenticar Acesso no Sistema</>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // FUNÇÕES DE LÓGICA E SERVIÇO (APÓS LOGIN)
  // ============================================================================

  const visibleCourses = courses.filter((c) => {
    if (!c) return false;
    if (role === 'admin') return true;
    if (role === 'professor') return c.professorId === currentUser.id;
    if (role === 'aluno') {
      const enrolled = courseStudents[c.id] || [];
      return Array.isArray(enrolled) && enrolled.some((enrollment) => enrollment?.studentId === currentUser.id);
    }
    return false;
  });

  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    
    const emailExists = Object.values(systemUsers).some(
      (u) => u?.email?.toLowerCase() === newUserEmail.toLowerCase().trim()
    );
    
    if (emailExists) return alert("Operação Bloqueada: Este e-mail já está sendo utilizado no sistema.");

    const newId = `usr_${Date.now()}`;
    const initials = newUserName.substring(0, 2).toUpperCase();
    
    const newUserObject = { 
      id: newId, 
      nome: newUserName, 
      role: newUserRole, 
      avatar: initials, 
      email: newUserEmail.toLowerCase().trim(), 
      phone: '', 
      bio: '', 
      showContactPublicly: false 
    };

    setDbUsers({ ...systemUsers, [newId]: newUserObject });
    setNewUserName('');
    setNewUserEmail('');
    alert('Ficha Acadêmica criada! Para finalizar a segurança, vá no Firebase Authentication e crie a senha equivalente para este e-mail.');
  };

  const handleDeleteUser = (id) => {
    if (id === 'admin1' || id === currentUser.id) return alert('Medida de Segurança: Você não pode excluir a si mesmo ou a raiz Administrativa.');
    if (window.confirm('Você tem absoluta certeza? Esta ação removerá o acesso do usuário permanentemente.')) {
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
    if (!editingUserName.trim()) return alert("Erro de Validação: O nome não pode ser nulo.");
    const updatedUsers = { ...systemUsers };
    if (updatedUsers[id]) {
      updatedUsers[id].nome = editingUserName;
      updatedUsers[id].avatar = editingUserName.substring(0, 2).toUpperCase();
      setDbUsers(updatedUsers);
    }
    setEditingUserId(null);
    setEditingUserName('');
  };

  const handleCancelEditUser = () => {
    setEditingUserId(null);
    setEditingUserName('');
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName || !newCourseProfId) return;
    const newId = `c_${Date.now()}`;
    const newCourseObj = { id: newId, codigo: newCourseCode, nome: newCourseName, professorId: newCourseProfId };
    
    setDbCourses([...courses, newCourseObj]);
    setDbContents({ ...courseContents, [newId]: defaultModules });
    setDbStudents({ ...courseStudents, [newId]: [] });
    setDbAttendanceCols({ ...attendanceCols, [newId]: [] }); 
    
    setNewCourseCode(''); setNewCourseName(''); setNewCourseProfId('');
    alert('Matriz Curricular atualizada: Disciplina instanciada com sucesso.');
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm('Atenção Crítica: A exclusão da disciplina destruirá fóruns, notas, arquivos e provas permanentemente. Proceder?')) {
      setDbCourses(courses.filter((c) => c && c.id !== id));
      if (activeCourseId === id) { setActiveCourseId(null); setCurrentView('admin_dashboard'); }
    }
  };

  const updateCourseDetails = (field, value) => {
    setDbCourses(courses.map((c) => c?.id === activeCourseId ? { ...c, [field]: value } : c));
  };

  const handleEnrollStudent = (e, courseId) => {
    e.preventDefault();
    if (!newStudentId) return;
    const currentColsLength = (attendanceCols[courseId] || []).length;
    const newStudentData = { studentId: newStudentId, ga: 0, gb: 0, gc: 0, faltas: new Array(currentColsLength).fill(false), feedback: "" };
    const currentEnrolled = Array.isArray(courseStudents[courseId]) ? courseStudents[courseId] : [];
    
    setDbStudents({ ...courseStudents, [courseId]: [...currentEnrolled, newStudentData] });
    setNewStudentId('');
  };

  const deleteStudent = (studentId) => {
    if (window.confirm('Cessar o vínculo deste residente com a disciplina atual?')) {
      const filteredStudents = (courseStudents[activeCourseId] || []).filter((s) => s?.studentId !== studentId);
      setDbStudents({ ...courseStudents, [activeCourseId]: filteredStudents });
    }
  };

  const toggleModule = (id) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateContent = (newContent) => {
    setDbContents({ ...courseContents, [activeCourseId]: newContent });
  };

  const addSection = () => {
    const newSection = { id: `sec_${Date.now()}`, title: 'Configuração Inicial: Novo Módulo Temático', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', items: [] };
    updateContent([...activeContent, newSection]);
    setExpandedModules((prev) => ({ ...prev, [newSection.id]: true }));
  };

  const updateSectionTitle = (id, newTitle) => {
    updateContent(activeContent.map((sec) => sec?.id === id ? { ...sec, title: newTitle } : sec));
  };

  const deleteSection = (id) => {
    if (window.confirm('Exclusão Lógica: Apagar este bloco e todos os recursos aninhados nele?')) {
      updateContent(activeContent.filter((sec) => sec?.id !== id));
    }
  };

  const updateItemTitle = (sectionId, itemId, newTitle) => {
    updateContent(activeContent.map((sec) => {
      if (sec?.id === sectionId) return { ...sec, items: (sec.items || []).map((item) => item?.id === itemId ? { ...item, title: newTitle } : item) };
      return sec;
    }));
  };

  const deleteItem = (sectionId, itemId) => {
    if (window.confirm('Apagar este material da visualização do aluno?')) {
      updateContent(activeContent.map((sec) => {
        if (sec?.id === sectionId) return { ...sec, items: (sec.items || []).filter((item) => item?.id !== itemId) };
        return sec;
      }));
    }
  };

  const handleOpenAddItemModal = (sectionId) => {
    setActiveSectionForNewItem(sectionId); setNewItemTitle(''); setNewItemType('FileText'); setNewItemUrl(''); setNewItemTextContent(''); setNewFile(null);
  };

  const handleConfirmAddItem = async (e) => {
    e.preventDefault();
    if (!newItemTitle) return;

    let color = 'text-slate-500';
    if (newItemType === 'FileText') color = 'text-red-500';
    else if (newItemType === 'Link') color = 'text-blue-500';
    else if (newItemType === 'MessageSquare') color = 'text-purple-600';
    else if (newItemType === 'Upload') color = 'text-teal-600';
    else if (newItemType === 'TextContent') color = 'text-amber-600';
    else if (newItemType === 'NativeExam') color = 'text-rose-600';

    let finalUrl = newItemUrl || null;
    let finalFileName = newFile ? newFile.name : null;
    const finalItemId = `item_${Date.now()}`;

    if ((newItemType === 'FileText' || newItemType === 'Upload') && newFile) {
      setIsUploading(true);
      try {
        const fileRef = ref(storage, `arquivos_coremu/${Date.now()}_${newFile.name}`);
        await uploadBytes(fileRef, newFile);
        finalUrl = await getDownloadURL(fileRef);
      } catch (err) {
        console.error("Transaction Error (Storage):", err);
        alert("Falha Crítica no Upload. Verifique as regras no Firebase Storage.");
        setIsUploading(false); return;
      }
      setIsUploading(false);
    }

    if (newItemType === 'MessageSquare') setDbForums({ ...forums, [finalItemId]: [] }); 
    if (newItemType === 'NativeExam') setDbExams({ ...exams, [finalItemId]: { questions: [], submissions: {} } }); 

    updateContent(activeContent.map((sec) => {
      if (sec?.id === activeSectionForNewItem) {
        return { ...sec, items: [...(sec.items || []), { id: finalItemId, title: newItemTitle, type: newItemType, color: color, url: finalUrl, fileName: finalFileName, textContent: newItemType === 'TextContent' ? newItemTextContent : null }] };
      }
      return sec;
    }));
    setActiveSectionForNewItem(null); 
  };

  const updateGrade = (studentId, field, value) => {
    const updatedStudents = (courseStudents[activeCourseId] || []).map((s) => {
      if (s?.studentId === studentId) return { ...s, [field]: parseFloat(value) || 0 };
      return s;
    });
    setDbStudents({ ...courseStudents, [activeCourseId]: updatedStudents });
  };

  const updateFeedback = (studentId, value) => {
    const updatedStudents = (courseStudents[activeCourseId] || []).map((s) => {
      if (s?.studentId === studentId) return { ...s, feedback: value };
      return s;
    });
    setDbStudents({ ...courseStudents, [activeCourseId]: updatedStudents });
  };

  const toggleAttendance = (studentId, index) => {
    const updatedStudents = (courseStudents[activeCourseId] || []).map((s) => {
      if (s?.studentId === studentId) {
        const newFaltas = [...(s.faltas || [])];
        newFaltas[index] = !newFaltas[index]; 
        return { ...s, faltas: newFaltas };
      }
      return s;
    });
    setDbStudents({ ...courseStudents, [activeCourseId]: updatedStudents });
  };

  const handleAddAttendanceCol = () => {
    const label = prompt("Para controle, digite a data e horário da aula (Ex: 15/09 - 08:00):");
    if (!label) return;
    const currentCols = attendanceCols[activeCourseId] || [];
    const newCols = [...currentCols, { id: `col_${Date.now()}`, label }];
    setDbAttendanceCols({ ...attendanceCols, [activeCourseId]: newCols });
    const updatedStudents = (courseStudents[activeCourseId] || []).map((s) => ({ ...s, faltas: [...(s.faltas || []), false] }));
    setDbStudents({ ...courseStudents, [activeCourseId]: updatedStudents });
  };

  const handleRemoveAttendanceCol = (colIndex) => {
    if (!window.confirm('Apagar a coluna de frequência desta aula? O histórico será perdido.')) return;
    const currentCols = attendanceCols[activeCourseId] || [];
    const newCols = currentCols.filter((_, i) => i !== colIndex);
    setDbAttendanceCols({ ...attendanceCols, [activeCourseId]: newCols });
    const updatedStudents = (courseStudents[activeCourseId] || []).map((s) => {
      const newFaltas = [...(s.faltas || [])];
      newFaltas.splice(colIndex, 1);
      return { ...s, faltas: newFaltas };
    });
    setDbStudents({ ...courseStudents, [activeCourseId]: updatedStudents });
  };

  const getIconComponent = (type) => {
    switch (type) {
      case 'FileText': return FileText;
      case 'MessageSquare': return MessageSquare;
      case 'Folder': return Folder;
      case 'Upload': return Upload;
      case 'CheckCircle': return CheckCircle;
      case 'Link': return Link;
      case 'TextContent': return AlignLeft;
      case 'NativeExam': return ClipboardList;
      default: return FileText;
    }
  };

  const activeContent = Array.isArray(courseContents[activeCourseId]) ? courseContents[activeCourseId] : [];
  const rawActiveStudents = Array.isArray(courseStudents[activeCourseId]) ? courseStudents[activeCourseId] : [];
  const currentAttendanceCols = attendanceCols[activeCourseId] || [];
  const activeCourseObj = courses.find((c) => c && c.id === activeCourseId) || {};

  const studentsInCourse = rawActiveStudents.map((enrollment) => ({
    ...enrollment, 
    nome: systemUsers[enrollment?.studentId]?.nome || 'Usuário Excluído ou Inativo'
  }));

  const visibleGradesAndAttendance = role === 'aluno' 
    ? studentsInCourse.filter((s) => s.studentId === currentUser.id) 
    : studentsInCourse;

  const availableStudentsForEnrollment = Object.values(systemUsers).filter((u) => 
    u && u.role === 'aluno' && !rawActiveStudents.some((s) => s?.studentId === u.id)
  );

  // ============================================================================
  // FUNÇÕES DE RENDERIZAÇÃO COMPLEXAS (MODAIS E VISÕES DE PRODUTO)
  // ============================================================================

  const renderProfileModal = () => {
    const profileUser = systemUsers[viewingProfileId];
    if (!profileUser) return null;

    const isMe = viewingProfileId === currentUser.id;
    const canSeePrivate = isMe || role === 'admin' || role === 'professor' || profileUser.showContactPublicly;

    const startEditingProfile = () => {
      setEditProfileData({ bio: profileUser.bio || '', phone: profileUser.phone || '', email: profileUser.email || '', showContactPublicly: profileUser.showContactPublicly || false });
    };

    const saveProfile = (e) => {
      e.preventDefault();
      setDbUsers({ ...systemUsers, [viewingProfileId]: { ...profileUser, ...editProfileData } });
      setEditProfileData(null);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 print:hidden">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
          <div className="bg-gradient-to-r from-teal-800 to-teal-600 p-10 text-white relative flex flex-col items-center shrink-0 shadow-inner">
            <button onClick={() => {setViewingProfileId(null); setEditProfileData(null);}} className="absolute top-5 right-5 p-2.5 bg-white/20 hover:bg-white/30 rounded-full transition-colors"><X className="w-6 h-6"/></button>
            <div className="w-28 h-28 bg-white text-teal-800 rounded-full flex items-center justify-center text-5xl font-black shadow-xl border-4 border-white/20 mb-5">{profileUser.avatar}</div>
            <h2 className="text-3xl font-black text-center tracking-tight">{profileUser.nome}</h2>
            <span className="bg-teal-900/50 px-5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mt-3 border border-teal-500/30">{profileUser.role === 'aluno' ? 'Residente COREMU' : profileUser.role === 'professor' ? 'Docente / Preceptor' : 'Corpo de Gestão'}</span>
          </div>
          <div className="p-8 md:p-10 overflow-y-auto flex-1 bg-slate-50">
            {editProfileData ? (
              <form onSubmit={saveProfile} className="space-y-8">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Formação Acadêmica / Biografia Curta</label>
                  <textarea value={editProfileData.bio} onChange={e => setEditProfileData({...editProfileData, bio: e.target.value})} placeholder="Escreva sobre suas especialidades, histórico e função atual..." className="w-full border border-slate-300 p-4 rounded-xl text-base focus:ring-2 focus:ring-teal-500 outline-none resize-none h-32 bg-white transition-shadow shadow-sm"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">E-mail de Contato Comercial</label>
                    <input type="email" value={editProfileData.email} onChange={e => setEditProfileData({...editProfileData, email: e.target.value})} placeholder="seu.email@haco.mil.br" className="w-full border border-slate-300 p-4 rounded-xl text-base focus:ring-2 focus:ring-teal-500 outline-none bg-white transition-shadow shadow-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Telefone Celular / WhatsApp</label>
                    <input type="text" value={editProfileData.phone} onChange={e => setEditProfileData({...editProfileData, phone: e.target.value})} placeholder="(XX) XXXXX-XXXX" className="w-full border border-slate-300 p-4 rounded-xl text-base focus:ring-2 focus:ring-teal-500 outline-none bg-white transition-shadow shadow-sm" />
                  </div>
                </div>
                <div className="bg-teal-50 border border-teal-200 p-6 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="pr-4">
                    <strong className="block text-base text-teal-900 mb-1">Visibilidade Pública de Contatos</strong>
                    <span className="text-sm text-teal-700 block leading-tight">Se ativada, os alunos da plataforma poderão visualizar diretamente o seu e-mail e telefone de contato na sua ficha.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input type="checkbox" checked={editProfileData.showContactPublicly} onChange={e => setEditProfileData({...editProfileData, showContactPublicly: e.target.checked})} className="sr-only peer" />
                    <div className="w-14 h-8 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
                <div className="flex gap-4 justify-end pt-6 border-t border-slate-200 mt-8">
                  <button type="button" onClick={() => setEditProfileData(null)} className="px-8 py-3 rounded-xl text-base font-bold text-slate-600 hover:bg-slate-200 transition">Cancelar Operação</button>
                  <button type="submit" className="bg-teal-800 text-white font-black px-10 py-3 rounded-xl hover:bg-teal-900 transition shadow-lg hover:shadow-teal-900/30 flex items-center gap-3 text-lg"><Check className="w-5 h-5"/> Gravar Perfil </button>
                </div>
              </form>
            ) : (
              <div className="space-y-10">
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-3"><Info className="w-5 h-5"/> Sobre o Profissional</h3>
                  <p className="text-slate-800 text-lg leading-relaxed whitespace-pre-wrap bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">{profileUser.bio || <span className="italic text-slate-400 font-medium">O usuário ainda não cadastrou informações bibliográficas na plataforma.</span>}</p>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-3"><Users className="w-5 h-5"/> Informações de Contato Autorizado</h3>
                  {canSeePrivate ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center gap-5 hover:border-teal-300 transition cursor-default">
                        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Mail className="w-6 h-6"/></div>
                        <div className="overflow-hidden"><span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-0.5">E-mail Institucional</span><span className="font-bold text-slate-800 text-base truncate block">{profileUser.email || 'Não informado'}</span></div>
                      </div>
                      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex items-center gap-5 hover:border-teal-300 transition cursor-default">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Phone className="w-6 h-6"/></div>
                        <div className="overflow-hidden"><span className="block text-[11px] font-black text-slate-400 uppercase tracking-wider mb-0.5">Telefone Comercial</span><span className="font-bold text-slate-800 text-base truncate block">{profileUser.phone || 'Não informado'}</span></div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-200 text-slate-600 p-6 rounded-2xl text-center text-base border border-slate-300 font-bold shadow-inner">🔒 O usuário definiu em suas configurações que prefere manter seus dados de contato como estritamente confidenciais.</div>
                  )}
                </div>
                {isMe && (
                  <div className="pt-8 border-t border-slate-200 flex justify-center mt-10">
                    <button onClick={startEditingProfile} className="bg-slate-800 text-white font-black px-12 py-4 rounded-2xl hover:bg-slate-900 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 text-lg"><Edit2 className="w-6 h-6"/> Atualizar Minha Ficha Cadastral</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderReadingModal = () => {
    if (!readingItem) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-8 print:hidden">
        <div className="bg-white md:rounded-[2rem] shadow-2xl w-full h-full md:h-[95vh] max-w-5xl overflow-hidden animate-fade-in flex flex-col border border-slate-200">
          <div className="p-6 md:p-8 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 shadow-sm z-10 relative">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl hidden sm:flex items-center justify-center border border-amber-100 shadow-inner"><AlignLeft className="w-7 h-7"/></div>
              <div><h2 className="font-black text-3xl text-slate-800 tracking-tight leading-none mb-2">{readingItem.title}</h2><p className="text-xs text-amber-600 font-bold uppercase tracking-widest">Leitura Orientada Oficial</p></div>
            </div>
            <button onClick={() => setReadingItem(null)} className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-full transition-colors"><X className="w-7 h-7"/></button>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12 relative">
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white to-transparent pointer-events-none opacity-50"></div>
            <div className="max-w-4xl mx-auto bg-white p-8 md:p-20 rounded-3xl shadow-xl border border-slate-200 relative z-10">
              <div className="prose prose-slate prose-lg md:prose-xl max-w-none text-slate-800 leading-relaxed font-serif" dangerouslySetInnerHTML={{ __html: readingItem.textContent }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderForumModal = () => {
    const forumData = forums[activeForumItem.id] || []; 
    const currentTopicData = forumData.find((t) => t.id === activeTopicId);

    const handleCreateTopic = (e) => {
      e.preventDefault();
      const title = e.target.elements.title.value;
      const desc = e.target.elements.desc.value;
      if(!title) return;
      const newTopic = { id: `topic_${Date.now()}`, title: title, description: desc, authorId: currentUser.id, authorName: currentUser.nome, avatar: currentUser.avatar, createdAt: new Date().toISOString(), replies: [] };
      setDbForums({ ...forums, [activeForumItem.id]: [...forumData, newTopic] });
      e.target.reset();
    };

    const handleReplyTopic = (e) => {
      e.preventDefault();
      const text = e.target.elements.reply.value;
      if(!text) return;
      const newReply = { id: `rep_${Date.now()}`, text: text, authorId: currentUser.id, authorName: currentUser.nome, avatar: currentUser.avatar, createdAt: new Date().toISOString() };
      const updatedTopics = forumData.map((t) => { if (t.id === activeTopicId) return { ...t, replies: [...(t.replies || []), newReply] }; return t; });
      setDbForums({ ...forums, [activeForumItem.id]: updatedTopics });
      e.target.reset(); setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 print:hidden">
        <div className="bg-slate-50 rounded-[2rem] shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden animate-fade-in flex flex-col border border-slate-200">
          <div className="p-6 border-b border-purple-800 flex justify-between items-center bg-purple-900 text-white shrink-0 shadow-lg relative z-20">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-800 rounded-xl flex items-center justify-center border border-purple-700 shadow-inner"><MessageCircle className="w-7 h-7 text-purple-200"/></div>
              <div><h2 className="font-black text-2xl leading-none mb-1">{activeForumItem.title}</h2><p className="text-xs text-purple-300 uppercase tracking-widest font-bold">Conselho Acadêmico e Debates - AVA</p></div>
            </div>
            <button onClick={() => { setActiveForumItem(null); setActiveTopicId(null); }} className="p-3 text-purple-200 hover:bg-purple-800 hover:text-white rounded-full transition-colors"><X className="w-7 h-7"/></button>
          </div>
          <div className="flex-1 flex overflow-hidden">
            {!activeTopicId ? (
              <div className="flex-1 p-8 overflow-y-auto space-y-10 relative">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
                  <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 text-xl"><MessageSquare className="w-6 h-6 text-purple-600"/> Abertura de Novo Tópico</h3>
                  <form onSubmit={handleCreateTopic} className="space-y-5">
                    <input name="title" required placeholder="Qual a sua dúvida principal? Tente ser específico..." className="w-full border border-slate-300 p-4 rounded-xl text-base font-bold focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
                    <textarea name="desc" required placeholder="Forneça os detalhes e contexto completo para que os colegas e professores possam debater e colaborar..." className="w-full border border-slate-300 p-4 rounded-xl text-base focus:ring-2 focus:ring-purple-500 outline-none resize-none h-32 bg-slate-50 focus:bg-white transition-colors"></textarea>
                    <button type="submit" className="bg-purple-700 text-white font-black px-10 py-4 rounded-xl hover:bg-purple-800 transition shadow-lg hover:shadow-purple-900/30 text-lg flex items-center gap-3"><Plus className="w-5 h-5"/> Enviar ao Fórum</button>
                  </form>
                </div>
                <div className="space-y-5">
                  <h3 className="font-black text-slate-400 uppercase tracking-widest text-sm mb-6 border-b border-slate-200 pb-3">Histórico de Debates</h3>
                  {forumData.length === 0 ? (
                    <div className="text-center p-16 text-slate-400 font-medium bg-white rounded-3xl border border-dashed border-slate-300 text-lg"><MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-200"/>A sala está vazia. Seja o primeiro a trazer uma discussão à tona!</div>
                  ) : (
                    forumData.map((topic) => (
                      <div key={topic.id} onClick={() => setActiveTopicId(topic.id)} className="bg-white p-6 border border-slate-200 rounded-2xl hover:border-purple-400 hover:shadow-lg cursor-pointer transition-all flex items-center gap-6 group">
                        <div onClick={(e) => {e.stopPropagation(); setViewingProfileId(topic.authorId)}} className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xl font-black shrink-0 border border-slate-200 hover:border-purple-500 hover:text-purple-700 transition cursor-pointer shadow-sm">{topic.avatar}</div>
                        <div className="flex-1"><h4 className="font-black text-slate-800 text-xl group-hover:text-purple-700 transition mb-1 leading-tight">{topic.title}</h4><p className="text-sm text-slate-500 font-medium">Tópico aberto por <strong className="text-slate-700 hover:text-purple-700 cursor-pointer transition" onClick={(e) => {e.stopPropagation(); setViewingProfileId(topic.authorId)}}>{topic.authorName}</strong> em {new Date(topic.createdAt).toLocaleString()}</p></div>
                        <div className="text-center shrink-0 bg-purple-50 px-6 py-3 rounded-xl border border-purple-100 group-hover:bg-purple-100 transition"><span className="block font-black text-purple-800 text-2xl leading-none mb-1">{(topic.replies || []).length}</span><span className="text-[10px] uppercase font-black text-purple-400 tracking-wider">Respostas</span></div>
                        <div className="shrink-0 pl-2"><ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-purple-500 transition group-hover:translate-x-1"/></div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full bg-slate-100 relative">
                <div className="p-5 border-b border-slate-200 bg-white shrink-0 flex items-center gap-5 shadow-sm z-10">
                  <button onClick={() => setActiveTopicId(null)} className="p-2.5 bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-800 rounded-xl font-black transition flex items-center gap-2 text-sm"><ChevronRight className="w-4 h-4 rotate-180"/> Voltar à Lista</button>
                  <h3 className="font-black text-2xl text-slate-800 truncate pr-4">{currentTopicData?.title}</h3>
                </div>
                <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 relative">
                  <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-md relative overflow-hidden"><div className="absolute top-0 left-0 w-2 h-full bg-purple-600"></div><div className="flex items-center gap-5 mb-6 border-b border-slate-100 pb-6"><div onClick={() => setViewingProfileId(currentTopicData?.authorId)} className="cursor-pointer w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-lg font-black border border-slate-200 hover:border-purple-500 hover:text-purple-800 transition shadow-sm">{currentTopicData?.avatar}</div><div><p onClick={() => setViewingProfileId(currentTopicData?.authorId)} className="font-black text-slate-900 text-xl cursor-pointer hover:text-purple-700 transition">{currentTopicData?.authorName}</p><p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Postado oficialmente em: {new Date(currentTopicData?.createdAt).toLocaleString()}</p></div></div><p className="text-slate-800 text-lg whitespace-pre-wrap leading-relaxed font-serif pl-2">{currentTopicData?.description}</p></div>
                  <div className="space-y-6 pl-4 md:pl-16 border-l-4 border-slate-200 ml-4 md:ml-10">
                    {(currentTopicData?.replies || []).map((reply, idx) => (
                      <div key={reply.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative hover:border-slate-300 transition">
                        <div className="absolute -left-12 md:-left-20 top-8 w-12 md:w-20 border-t-4 border-slate-200"></div>
                        <div className="flex justify-between items-start mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100"><div className="flex items-center gap-4"><div onClick={() => setViewingProfileId(reply.authorId)} className="cursor-pointer w-10 h-10 rounded-full bg-white text-slate-600 flex items-center justify-center text-sm font-black border border-slate-200 hover:border-purple-500 transition shadow-sm">{reply.avatar}</div><div><p onClick={() => setViewingProfileId(reply.authorId)} className="font-black text-slate-800 text-sm cursor-pointer hover:text-purple-700 transition">{reply.authorName}</p><p className="text-[11px] font-bold text-slate-400 mt-0.5">{new Date(reply.createdAt).toLocaleString()}</p></div></div><span className="text-[10px] font-black text-slate-300 bg-white px-3 py-1 rounded-full border border-slate-100 shadow-inner">RESPOSTA #{idx + 1}</span></div>
                        <p className="text-slate-700 text-base whitespace-pre-wrap leading-relaxed pl-2">{reply.text}</p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </div>
                <div className="p-6 md:p-8 bg-white border-t border-slate-200 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
                  <form onSubmit={handleReplyTopic} className="flex flex-col sm:flex-row gap-4 max-w-6xl mx-auto"><textarea name="reply" required placeholder="Redigir uma contribuição científica ou acadêmica para o debate em andamento..." className="flex-1 border border-slate-300 p-5 rounded-2xl text-base font-medium focus:ring-2 focus:ring-purple-500 outline-none resize-none h-24 bg-slate-50 focus:bg-white transition-shadow shadow-inner"></textarea><button type="submit" className="bg-purple-700 text-white font-black px-10 rounded-2xl hover:bg-purple-800 transition shadow-lg hover:shadow-purple-900/30 flex items-center justify-center gap-3 text-lg h-24 shrink-0 sm:w-auto w-full"><Send className="w-6 h-6"/> Registrar</button></form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderExamModal = () => {
    const examData = exams[activeExamItem.id] || { questions: [], submissions: {} };
    
    const handleAddQuestion = () => {
      const newQuestion = { id: `q_${Date.now()}_${Math.random()}`, title: 'Formule sua pergunta de avaliação aqui...', options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'], correctIndex: 0 };
      setLocalQuestions([...localQuestions, newQuestion]);
    };
    const handleUpdateQuestion = (idx, field, val) => { const updatedQs = [...localQuestions]; updatedQs[idx] = { ...updatedQs[idx], [field]: val }; setLocalQuestions(updatedQs); };
    const handleUpdateOption = (qIdx, oIdx, val) => { const updatedQs = [...localQuestions]; const newOptions = [...updatedQs[qIdx].options]; newOptions[oIdx] = val; updatedQs[qIdx] = { ...updatedQs[qIdx], options: newOptions }; setLocalQuestions(updatedQs); };
    const handleSaveExam = () => { setDbExams({ ...exams, [activeExamItem.id]: { ...examData, questions: localQuestions } }); setActiveExamItem(null); setLocalQuestions([]); alert("Aviso do Sistema: Estrutura da Avaliação Oficial atualizada e disponibilizada com sucesso na nuvem!"); };
    const handleCloseExam = () => { setActiveExamItem(null); setLocalQuestions([]); };

    const isInstructor = role === 'admin' || role === 'professor';

    if (isEditing && isInstructor) {
      return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 print:hidden">
          <div className="bg-slate-50 rounded-[2rem] shadow-2xl w-full max-w-5xl h-[95vh] overflow-hidden animate-fade-in flex flex-col border border-slate-200">
            <div className="p-6 border-b border-rose-800 flex justify-between items-center bg-rose-700 text-white shrink-0 shadow-md relative z-10"><div className="flex items-center gap-5"><div className="w-14 h-14 bg-rose-600 rounded-xl flex items-center justify-center shadow-inner border border-rose-500"><ClipboardList className="w-7 h-7 text-white"/></div><div><h2 className="font-black text-2xl leading-none mb-1">Painel Mestre: {activeExamItem.title}</h2><p className="text-xs text-rose-200 uppercase tracking-widest font-bold">Gestão Avançada de Provas - COREMU HACO</p></div></div><button onClick={handleCloseExam} className="p-3 hover:bg-rose-800 rounded-full transition-colors bg-rose-600 border border-rose-500 shadow-sm" title="Descartar mudanças e fechar"><X className="w-6 h-6"/></button></div>
            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-10 relative bg-slate-100">
              <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl flex items-center gap-4 text-rose-800 shadow-sm"><Info className="w-8 h-8 shrink-0 text-rose-500" /><p className="text-sm font-medium">As questões definidas abaixo serão imediatamente disponibilizadas aos alunos que acessarem esta matriz. Confirme cuidadosamente os gabaritos marcados antes de processar a gravação.</p></div>
              {localQuestions.map((q, qIndex) => (
                <div key={q.id} className="bg-white p-8 md:p-10 border border-slate-200 rounded-3xl shadow-sm relative group hover:border-rose-300 transition-colors">
                  <button onClick={() => setLocalQuestions(localQuestions.filter((_, i) => i !== qIndex))} className="absolute top-8 right-8 text-slate-300 hover:text-white hover:bg-red-500 p-2 rounded-lg transition-all" title="Excluir Questão Permanente"><Trash2 className="w-6 h-6"/></button>
                  <div className="flex items-center gap-4 mb-6"><span className="w-10 h-10 bg-slate-100 text-slate-500 flex items-center justify-center rounded-full font-black border border-slate-200 text-lg">{qIndex + 1}</span><label className="text-sm font-black text-rose-700 uppercase tracking-widest block">Estrutura do Enunciado</label></div>
                  <input type="text" value={q.title} onChange={e => handleUpdateQuestion(qIndex, 'title', e.target.value)} placeholder="Elabore de forma clara a pergunta ou estudo de caso..." className="w-full border border-slate-200 p-5 rounded-xl text-xl font-black text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none mb-8 transition-shadow bg-slate-50 focus:bg-white shadow-inner" />
                  <div className="space-y-4 pl-4 md:pl-14">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-4">Alternativas e Marcação de Gabarito Certo</label>
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className={`flex items-center gap-5 p-4 rounded-2xl border-2 transition-all ${q.correctIndex === oIndex ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-300'}`}>
                        <div className="flex flex-col items-center justify-center pl-2 w-20"><input type="radio" name={`correct_${q.id}`} checked={q.correctIndex === oIndex} onChange={() => handleUpdateQuestion(qIndex, 'correctIndex', oIndex)} className="w-6 h-6 text-emerald-600 focus:ring-emerald-500 cursor-pointer"/><span className={`text-[10px] font-black uppercase tracking-wider mt-2 transition-opacity ${q.correctIndex === oIndex ? 'text-emerald-700 opacity-100' : 'opacity-0'}`}>Gabarito</span></div>
                        <input type="text" value={opt} onChange={e => handleUpdateOption(qIndex, oIndex, e.target.value)} className={`flex-1 bg-transparent p-3 text-base outline-none font-bold rounded-xl transition-colors ${q.correctIndex === oIndex ? 'text-emerald-900 bg-emerald-100/50' : 'text-slate-600 bg-slate-50 focus:bg-slate-100'}`} placeholder={`Elabore a opção correspondente à letra ${String.fromCharCode(65 + oIndex)}...`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button onClick={handleAddQuestion} className="w-full border-4 border-dashed border-rose-300 text-rose-700 font-black p-8 rounded-3xl hover:bg-rose-50 transition-all flex items-center justify-center gap-4 text-xl shadow-sm hover:shadow-md"><Plus className="w-8 h-8"/> Instanciar Novo Bloco de Questão</button>
              <div className="mt-16 border-t-4 border-slate-200 pt-12">
                <h3 className="font-black text-2xl text-slate-800 mb-8 flex items-center gap-4"><BarChart className="w-8 h-8 text-rose-600"/> Apuração Eletrônica de Resultados</h3>
                {Object.keys(examData.submissions || {}).length === 0 ? (
                  <div className="text-center bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-lg font-medium text-slate-500">Aguardando submissões. Nenhuma avaliação foi resolvida pelos residentes na plataforma até o presente momento.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(examData.submissions).map(([studentId, sub]) => (
                      <div key={studentId} className="flex justify-between items-center bg-white border border-slate-200 p-6 rounded-2xl shadow-md hover:border-teal-300 transition cursor-default">
                        <div className="flex items-center gap-5"><div onClick={() => setViewingProfileId(studentId)} className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-black border border-slate-200 cursor-pointer hover:border-teal-500 hover:text-teal-700 transition shadow-sm">{systemUsers[studentId]?.avatar || '?'}</div><div><span onClick={() => setViewingProfileId(studentId)} className="block font-black text-slate-800 text-lg cursor-pointer hover:text-teal-700 transition">{systemUsers[studentId]?.nome || 'Aluno Oculto/Removido'}</span><span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Enviada em: {new Date(sub.submittedAt).toLocaleString()}</span></div></div>
                        <div className="text-right bg-slate-50 px-5 py-3 rounded-xl border border-slate-200 shadow-inner"><span className="block font-black text-rose-700 text-3xl leading-none mb-1">{sub.score}</span><span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Nota F.</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-6 md:p-8 bg-white border-t border-slate-200 shrink-0 flex justify-end gap-5 shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-10"><button onClick={handleCloseExam} className="px-8 py-4 rounded-xl text-base font-black text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition">Abortar Edição</button><button onClick={handleSaveExam} className="bg-rose-700 text-white font-black px-12 py-4 rounded-xl hover:bg-rose-800 transition shadow-xl hover:shadow-rose-900/30 flex items-center gap-3 text-lg"><Check className="w-6 h-6"/> Oficializar Modificações e Publicar Prova</button></div>
          </div>
        </div>
      );
    }

    const mySubmission = examData.submissions[currentUser.id];
    
    const handleSumbitExam = (e) => {
      e.preventDefault();
      if(examData.questions.length === 0) return alert("Sinalização Acadêmica: O conteúdo desta prova não possui questões ativas devidamente configuradas pela Instituição.");
      const formData = new FormData(e.target); let score = 0; const answers = [];
      examData.questions.forEach((q, index) => { const selectedOption = parseInt(formData.get(`q_${index}`)); answers.push(selectedOption); if (selectedOption === q.correctIndex) score++; });
      const finalScore = ((score / examData.questions.length) * 10).toFixed(1);
      const updatedSubmissions = { ...examData.submissions, [currentUser.id]: { score: finalScore, answers: answers, submittedAt: new Date().toISOString() } };
      setDbExams({ ...exams, [activeExamItem.id]: { ...examData, submissions: updatedSubmissions } });
      alert(`Avaliação despachada com sucesso aos servidores! Sua nota oficial computada foi: ${finalScore}`);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-0 sm:p-8 print:hidden">
        <div className="bg-slate-50 sm:rounded-[2rem] shadow-2xl w-full h-full sm:h-auto max-w-4xl sm:max-h-[95vh] overflow-hidden animate-fade-in flex flex-col border border-slate-200">
          <div className="p-6 sm:p-10 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 shadow-sm z-10 relative"><div className="flex items-center gap-5"><div className="w-14 h-14 bg-rose-50 border border-rose-100 rounded-2xl hidden sm:flex items-center justify-center shadow-inner"><ClipboardList className="w-7 h-7 text-rose-600"/></div><div><h2 className="font-black text-2xl sm:text-3xl text-slate-800 tracking-tight leading-none mb-2">{activeExamItem.title}</h2><p className="text-xs text-rose-600 uppercase tracking-widest font-black">Central de Avaliações Oficiais COREMU</p></div></div><button onClick={handleCloseExam} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors border border-slate-200" title="Fechar prova sem salvar"><X className="w-7 h-7"/></button></div>
          <div className="flex-1 overflow-y-auto p-6 sm:p-12 relative bg-slate-50">
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white to-transparent pointer-events-none opacity-60"></div>
            {mySubmission ? (
              <div className="text-center bg-white p-10 sm:p-16 rounded-[2.5rem] border border-slate-200 shadow-xl max-w-lg mx-auto mt-10 relative z-10"><div className="w-32 h-32 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-emerald-100 shadow-inner"><CheckCircle className="w-16 h-16 text-emerald-500"/></div><h3 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Trabalho Concluído</h3><p className="text-slate-600 text-lg leading-relaxed mb-8">Você enviou definitivamente as suas respostas para esta avaliação. O gabarito foi registrado com sucesso e chancelado no sistema eletrônico da instituição.</p><div className="inline-block bg-slate-50 p-8 rounded-3xl border-2 border-slate-200 w-full shadow-sm"><span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-3">Apuração Final</span><span className="text-7xl font-black text-emerald-600 tracking-tighter">{mySubmission.score}</span></div></div>
            ) : (
              <form onSubmit={handleSumbitExam} className="space-y-10 max-w-3xl mx-auto pb-12 relative z-10">
                {examData.questions.length === 0 ? (
                  <div className="text-center text-slate-500 bg-white p-12 rounded-3xl border border-dashed border-slate-300 shadow-sm text-lg font-medium">A gestão pedagógica ainda não incluiu as alternativas ou o material de base que compõem a grade desta prova oficial. Tente novamente mais tarde.</div>
                ) : (
                  <>
                    <div className="bg-rose-50 border border-rose-200 p-6 rounded-2xl text-rose-800 text-base font-medium mb-10 shadow-md flex gap-5 items-center"><Shield className="w-10 h-10 text-rose-500 shrink-0"/><span className="leading-relaxed"><strong>Termo de Ciente:</strong> Ao clicar no botão de submissão ao final do material, o seu formulário virtual será processado instantaneamente, não sendo facultada aos residentes a opção legal de revisar os dados informados. <strong>Preencha com cautela e sobriedade.</strong></span></div>
                    {examData.questions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-white p-8 sm:p-12 border border-slate-200 rounded-3xl shadow-md hover:shadow-lg transition-shadow">
                        <div className="flex gap-5 items-start mb-8"><span className="w-12 h-12 shrink-0 bg-slate-800 text-white flex items-center justify-center rounded-2xl font-black text-lg shadow-inner">{qIndex + 1}</span><h4 className="font-black text-slate-800 text-xl sm:text-2xl leading-relaxed pt-2">{q.title}</h4></div>
                        <div className="space-y-4 pl-0 sm:pl-16">
                          {q.options.map((opt, oIndex) => (
                            <label key={oIndex} className="flex items-start gap-5 p-5 border-2 border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all has-[:checked]:bg-rose-50 has-[:checked]:border-rose-500 has-[:checked]:shadow-md"><div className="pt-1"><input type="radio" required name={`q_${qIndex}`} value={oIndex} className="w-6 h-6 text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"/></div><span className="text-lg font-bold text-slate-700 leading-relaxed pt-0.5">{opt}</span></label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="pt-12 mt-12 flex justify-center border-t-4 border-dashed border-slate-200"><button type="submit" className="bg-rose-700 text-white font-black px-12 py-6 rounded-[2rem] hover:bg-rose-800 transition-all shadow-2xl hover:shadow-rose-900/40 text-2xl flex items-center gap-4 w-full sm:w-auto justify-center uppercase tracking-wider"><Check className="w-8 h-8"/> Protocolar e Finalizar</button></div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ============================================================================
  // RENDERIZAÇÕES DOS DASHBOARDS E LISTAGENS
  // ============================================================================
  const renderUserHome = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center border border-teal-100 shadow-inner shrink-0">
          <Home className="w-8 h-8"/>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Olá, {currentUser.nome.split(' ')[0]}</h2>
          <p className="text-base text-slate-500 font-medium">Bem-vindo(a) ao ecossistema digital COREMU HACO. Selecione abaixo a grade para prosseguir.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {visibleCourses.length === 0 ? (
          <div className="col-span-full text-center p-16 border-2 border-dashed border-slate-200 rounded-3xl bg-white text-slate-500 shadow-sm">
            <Book className="w-16 h-16 mx-auto mb-4 text-slate-300"/>
            <p className="font-black text-2xl text-slate-700 mb-2 tracking-tight">Sem Vínculos de Turma</p>
            <p className="text-base font-medium">Você ainda não foi alocado pela instituição em nenhuma disciplina presente no semestre letivo corrente.</p>
          </div>
        ) : (
          visibleCourses.map(c => {
            if(!c) return null;
            return (
              <div 
                key={c.id} 
                onClick={() => { setActiveCourseId(c.id); setCurrentView('course_home'); }} 
                className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-400 transition-all cursor-pointer flex flex-col justify-between h-full group"
              >
                <div>
                  <span className="text-[11px] font-black text-teal-800 bg-teal-100 px-3 py-1 rounded-md uppercase tracking-widest border border-teal-200 shadow-sm">
                    {c.codigo}
                  </span>
                  <h3 className="font-black text-slate-800 mt-5 group-hover:text-teal-700 transition-colors text-2xl leading-tight">
                    {c.nome}
                  </h3>
                  <p className="text-sm text-slate-500 mt-3 font-medium">
                    Titular: <strong className="text-slate-700">{systemUsers[c.professorId]?.nome || 'Não estabelecido'}</strong>
                  </p>
                </div>
                <div className="mt-8 pt-5 border-t-2 border-slate-100 flex items-center justify-between text-teal-800 text-base font-black">
                  Acessar Ambiente Virtual <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform"/>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-6">
        <div className="w-16 h-16 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center border border-teal-100 shadow-inner shrink-0">
          <Shield className="w-8 h-8"/>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Governança Acadêmica Integrada</h2>
          <p className="text-base text-slate-500 font-medium">Inste cursos estruturais, altere parâmetros críticos e gerencie a base global do portal em Nuvem.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 text-xl">
            <Book className="w-6 h-6 text-teal-600"/> Abertura Oficial de Disciplina
          </h3>
          <form onSubmit={handleCreateCourse} className="space-y-5">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Código Acadêmico Institucional</label>
              <input type="text" required value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} placeholder="Exemplo padrão: RMAB001" className="w-full border border-slate-300 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Nome Legível da Disciplina</label>
              <input type="text" required value={newCourseName} onChange={e => setNewCourseName(e.target.value)} placeholder="Ex: Fundamentos de Saúde Coletiva" className="w-full border border-slate-300 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Responsabilidade Docente</label>
              <select required value={newCourseProfId} onChange={e => setNewCourseProfId(e.target.value)} className="w-full border border-slate-300 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white transition-colors cursor-pointer">
                <option value="">Selecione um corpo docente na listagem base...</option>
                {Object.values(systemUsers).filter(u => u && u.role === 'professor').map(p => (<option key={p.id} value={p.id}>{p.nome}</option>))}
              </select>
            </div>
            <button type="submit" className="w-full bg-teal-800 text-white font-black p-4 rounded-xl hover:bg-teal-900 transition-all shadow-lg hover:shadow-teal-900/30 text-base flex items-center justify-center gap-2 mt-4">
              <Plus className="w-5 h-5"/> Gravar Modificações em Nuvem e Ativar Sala
            </button>
          </form>
        </div>
        
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 text-xl">
            <Layout className="w-6 h-6 text-blue-600"/> Painel Analítico: Matriz Curricular Global
          </h3>
          
          {courses.length === 0 ? (
            <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-500 font-medium">
              A arquitetura atual se encontra estéril. Adicione componentes disciplinares no utilitário de sistema ao lado.
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map(c => {
                if(!c) return null;
                const totalAlunos = Array.isArray(courseStudents[c.id]) ? courseStudents[c.id].length : 0;
                
                return (
                  <div key={c.id} className="p-6 border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-6 group">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-teal-800 bg-teal-100 px-3 py-1 rounded shadow-sm uppercase tracking-widest">{c.codigo}</span>
                        <span className="text-xs text-slate-400 font-bold tracking-wider">| VOLUME DE MATRÍCULAS: <span className="text-slate-700">{totalAlunos}</span></span>
                      </div>
                      <h4 className="font-black text-slate-800 text-xl leading-tight mb-1">{c.nome}</h4>
                      <p className="text-sm text-slate-500 font-medium flex gap-2 items-center mt-2">
                        <span>Liderança de Turma designada à:</span>
                        <strong className="text-slate-700 hover:text-teal-700 cursor-pointer transition-colors bg-slate-100 px-2 py-0.5 rounded border border-slate-200" onClick={() => setViewingProfileId(c.professorId)}>{systemUsers[c.professorId]?.nome || 'Dado Omitido'}</strong>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 shrink-0">
                      <button onClick={() => { setActiveCourseId(c.id); setCurrentView('participants'); }} className="bg-white border-2 border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-black hover:bg-slate-50 hover:border-slate-300 flex items-center gap-2 transition-all shadow-sm"><Layout className="w-5 h-5 text-slate-400 group-hover:text-teal-600 transition-colors"/> Monitorar Matriz</button>
                      <button onClick={() => handleDeleteCourse(c.id)} className="bg-red-50 border border-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm font-black hover:bg-red-100 hover:border-red-200 transition-all shadow-sm" title="Executar Purga Lógica desta Disciplina"><Trash2 className="w-5 h-5"/></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAdminUsers = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-6">
        <div className="w-16 h-16 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center border border-purple-100 shadow-inner shrink-0">
          <Users className="w-8 h-8"/>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Acesso Mestre à Entidades Logadas</h2>
          <p className="text-base text-slate-500 font-medium">Utilize as interfaces avançadas para adicionar as credenciais autorizativas e de Perfil no sistema integrado.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 text-xl">
            <UserPlus className="w-6 h-6 text-purple-600"/> Incorporar Entidade Humana
          </h3>
          <form onSubmit={handleCreateUser} className="space-y-5">
            <div>
              <label className="text-xs font-black text-slate-500 uppercase tracking-wider block mb-2">Registro de Nome Legal (Civil/Militar)</label>
              <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Exemplo formal: Capitã Flávia Silva" className="w-full border border-slate-300 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">E-mail Institucional Definitivo</label>
              <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="nome.guerra@haco.mil.br" className="w-full border border-slate-300 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">Categoria Tática / Nível Hierárquico no Sistema</label>
              <select required value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full border border-slate-300 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white transition-colors cursor-pointer">
                <option value="aluno">Aluno Regular / Residente Oficial</option>
                <option value="professor">Comando Preceptor / Cadeira de Professor</option>
                <option value="admin">Operador Mestre (Escopo Administrativo Completo)</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-purple-800 text-white font-black p-4 rounded-xl hover:bg-purple-900 transition-all shadow-lg hover:shadow-purple-900/30 text-base flex items-center justify-center gap-2 mt-4">
              <Plus className="w-5 h-5"/> Aprovar Ficha e Enviar Configuração
            </button>
          </form>
        </div>
        
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-3 text-xl">
            <Users className="w-6 h-6 text-slate-600"/> Relatório Operacional de Contas
          </h3>
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-5">Carga Cadastral Consolidada (Avatar e Identificação Rápida)</th>
                  <th className="p-5 text-center border-x border-slate-200">Classe de Privilégios (RBAC)</th>
                  <th className="p-5 text-right">Comandos Override Padrão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {Object.values(systemUsers).map(u => {
                  if(!u) return null;
                  const isEditingThisUser = editingUserId === u.id;
                  
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-5 font-bold text-slate-800">
                        <div className="flex items-center gap-4">
                          <div 
                            onClick={() => setViewingProfileId(u.id)} 
                            className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-black shrink-0 border-2 border-slate-200 cursor-pointer hover:border-purple-500 hover:text-purple-800 transition shadow-sm"
                            title="Acesso completo à ficha detalhada do usuário."
                          >
                            {u.avatar}
                          </div>
                          
                          {isEditingThisUser ? (
                            <input 
                              type="text" 
                              value={editingUserName} 
                              onChange={e => setEditingUserName(e.target.value)} 
                              className="border-2 border-purple-400 px-4 py-2.5 rounded-lg focus:ring-4 focus:ring-purple-500/20 outline-none w-full max-w-sm shadow-inner font-black text-base"
                              autoFocus 
                            />
                          ) : (
                            <div className="flex flex-col">
                              <span onClick={() => setViewingProfileId(u.id)} className="cursor-pointer hover:text-purple-700 transition text-base font-black leading-tight">
                                {u.nome}
                              </span>
                              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 font-mono">
                                AUTORIZADO EM: {u.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-5 text-center border-x border-slate-100">
                        <span className={`text-[10px] px-4 py-2 rounded-lg font-black uppercase tracking-widest border shadow-sm ${
                          u.role === 'admin' 
                            ? 'bg-slate-800 text-white border-slate-900' 
                            : u.role === 'professor' 
                              ? 'bg-blue-50 text-blue-800 border-blue-200' 
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        }`}>
                          {u.role === 'admin' ? 'Mestre Geral' : u.role}
                        </span>
                      </td>
                      
                      <td className="p-5 text-right whitespace-nowrap">
                        {isEditingThisUser ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleSaveEditedUser(u.id)} className="bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 px-3 py-2 rounded-lg transition font-bold text-xs flex items-center gap-1 shadow-sm" title="Confirmar alteração de nome civil."><Check className="w-4 h-4 inline"/> Aplicar</button>
                            <button onClick={handleCancelEditUser} className="bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 px-3 py-2 rounded-lg transition font-bold text-xs flex items-center gap-1 shadow-sm" title="Ignorar processamento."><X className="w-4 h-4 inline"/> Recusar</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleStartEditUser(u)} className="text-slate-400 hover:text-purple-600 hover:bg-purple-50 p-2.5 rounded-lg transition" title="Modificar identidade virtual."><Edit2 className="w-5 h-5 inline"/></button>
                            {u.id !== 'admin1' && u.id !== currentUser.id && (
                              <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-lg transition" title="Destituir todos os acessos operacionais (Soft Delete)."><Trash2 className="w-5 h-5 inline"/></button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderParticipants = () => (
    <div className="space-y-8 animate-fade-in">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex items-start gap-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center border border-blue-100 shadow-inner shrink-0">
          <Users className="w-8 h-8"/>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1">Membros Interativos do Curso Setorial</h2>
          <p className="text-base text-slate-500 font-medium">Relatório visual, cadastro automático de residentes vinculados a esta tabela disciplinar específica.</p>
        </div>
      </div>

      {isEditing && (
        <div className="bg-blue-50 p-8 rounded-3xl border border-blue-200 shadow-sm print:hidden">
          <h3 className="font-black text-blue-900 mb-6 flex items-center gap-3 text-xl">
            <UserPlus className="w-6 h-6 text-blue-600"/> Instanciar Participante na Carga Horária (Matrícula)
          </h3>
          <form onSubmit={(e) => handleEnrollStudent(e, activeCourseId)} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <select 
              required 
              value={newStudentId} 
              onChange={e => setNewStudentId(e.target.value)} 
              className="flex-1 border-2 border-blue-200 p-4 rounded-xl text-base font-bold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none bg-white text-slate-700 shadow-inner cursor-pointer"
            >
              <option value="">Acesso Geral (Selecione um membro não matriculado da Instituição...)</option>
              {availableStudentsForEnrollment.map(s => <option key={s.id} value={s.id}>PERFIL OFICIAL: {s.nome}</option>)}
            </select>
            <button 
              type="submit" 
              className="bg-blue-700 text-white font-black px-8 py-4 rounded-xl hover:bg-blue-800 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-blue-900/30 text-lg sm:w-auto w-full shrink-0"
            >
              <Plus className="w-6 h-6"/> Executar Matrícula
            </button>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest text-[10px] border-b border-slate-200">
            <tr>
              <th className="p-6">Nome Residente (Controle Cívico Acadêmico)</th>
              <th className="p-6 text-center border-x border-slate-200">Situação Paramétrica</th>
              {isEditing && <th className="p-6 text-right print:hidden">Execuções e Rotinas de Controle</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {studentsInCourse.length === 0 ? (
              <tr>
                <td colSpan={isEditing ? 3 : 2} className="p-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-200 shadow-inner mb-6">
                      <Users className="w-10 h-10 text-slate-300" />
                    </div>
                    <span className="text-xl font-black text-slate-700">Polo Acadêmico Vazio</span>
                    <span className="text-sm font-medium mt-2">No estado corrente de arquitetura, o banco não detectou discentes atrelados ao vetor lógico.</span>
                  </div>
                </td>
              </tr>
            ) : (
              studentsInCourse.map(s => {
                if(!s) return null;
                return (
                  <tr key={s.studentId} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-6 font-bold text-slate-800 flex items-center gap-5">
                      <div 
                        className="w-14 h-14 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-black shrink-0 border-2 border-slate-200 cursor-pointer hover:border-teal-500 hover:text-teal-700 transition shadow-sm" 
                        onClick={() => setViewingProfileId(s.studentId)}
                        title="Acionar protocolo de Visualização Profunda da ficha discente."
                      >
                        {systemUsers[s.studentId]?.avatar || '??'}
                      </div>
                      <span 
                        className="text-lg cursor-pointer hover:text-teal-700 transition font-black leading-tight" 
                        onClick={() => setViewingProfileId(s.studentId)}
                      >
                        {s.nome}
                      </span>
                    </td>
                    <td className="p-6 text-center border-x border-slate-100">
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] px-4 py-2 rounded-lg font-black uppercase tracking-widest shadow-sm">
                        MATRÍCULA INSTITUCIONAL ATIVADA
                      </span>
                    </td>
                    {isEditing && (
                      <td className="p-6 text-right print:hidden">
                        <button 
                          onClick={() => deleteStudent(s.studentId)} 
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-3 rounded-xl transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-200 shadow-sm" 
                          title="Aniquilar permanentemente matriz de relacionamento disciplina-aluno."
                        >
                          <Trash2 className="w-6 h-6 inline"/>
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGradebook = () => (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-fade-in print:shadow-none print:border-none">
      
      <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:bg-white print:border-b-4 print:border-slate-800">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center justify-center shadow-inner shrink-0 print:hidden">
            <BarChart className="w-7 h-7"/>
          </div>
          <div>
            <h3 className="font-black text-2xl text-slate-800 tracking-tight leading-none mb-1">Boletim Escalar Consolidado (Tabela de Notas)</h3>
            <p className="text-sm text-slate-500 font-medium print:hidden">Interface para imputação manual das notas (GA, GB e GC) resultando num log aritmético automatizado do panorama acadêmico.</p>
          </div>
        </div>
        
        {(role === 'professor' || role === 'admin') && (
          <button 
            onClick={() => window.print()} 
            className="bg-slate-800 text-white px-8 py-3.5 rounded-xl text-sm font-black flex items-center gap-3 hover:bg-slate-900 transition-all print:hidden shadow-lg hover:shadow-slate-900/30"
          >
            <Printer className="w-5 h-5"/> Imprimir Relatório Impresso Definitivo
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse bg-white">
          <thead>
            <tr className="bg-slate-800 text-white border-b-2 border-slate-900 print:bg-slate-200 print:text-slate-900 font-black uppercase tracking-widest text-[10px]">
              <th className="p-6 w-1/4">Estruturação Lexical do Residente</th>
              <th className="p-6 border-x border-slate-700 print:border-slate-300 text-center">Peso Paramétrico: Nota GA</th>
              <th className="p-6 border-x border-slate-700 print:border-slate-300 text-center">Peso Paramétrico: Nota GB</th>
              <th className="p-6 border-x border-slate-700 print:border-slate-300 text-center">Apoio Compensatório: Nota GC</th>
              <th className="p-6 bg-teal-800 border-x border-teal-900 print:bg-slate-400 print:text-slate-900 text-center text-teal-50">Cálculo Resultante Ponderado</th>
              <th className="p-6 border-x border-slate-700 print:border-slate-300 text-center">Deliberação Semestral Situação Algorítmica</th>
              <th className="p-6">Protocolo Extensivo (Apreciação Humana ou Feedback)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleGradesAndAttendance.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-16 text-center text-slate-500 font-medium text-lg">
                  <BarChart className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                  Operação Impossibilitada: Inexistência Crítica de Matrículas para Apuração.
                </td>
              </tr>
            ) : (
              visibleGradesAndAttendance.map((aluno, idx) => {
                if(!aluno) return null;
                
                const valGA = parseFloat(aluno.ga) || 0;
                const valGB = parseFloat(aluno.gb) || 0;
                const valGC = parseFloat(aluno.gc) || 0;
                const total = (valGA + valGB + valGC).toFixed(2);
                
                const isApproved = total >= 14 || (valGC > 0 && total >= 15);

                return (
                  <tr key={aluno.studentId} className={`hover:bg-teal-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                    <td className="p-5 font-bold text-slate-800 border-r border-slate-100 flex items-center gap-4">
                       <div 
                         className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-black shrink-0 border border-slate-200 print:hidden cursor-pointer hover:border-teal-400 shadow-sm" 
                         onClick={() => setViewingProfileId(aluno.studentId)}
                       >
                         {systemUsers[aluno.studentId]?.avatar || '??'}
                       </div>
                       <span 
                         className="text-base cursor-pointer hover:text-teal-700 transition" 
                         onClick={() => setViewingProfileId(aluno.studentId)}
                       >
                         {aluno.nome}
                       </span>
                    </td>
                    
                    <td className="p-4 border-r border-slate-100 text-center bg-white/50">
                      {isEditing ? (
                        <input 
                          type="number" 
                          step="0.1" 
                          value={aluno.ga === 0 && !aluno.ga_touched ? '' : aluno.ga} 
                          onChange={(e) => updateGrade(aluno.studentId, 'ga', e.target.value)} 
                          className="w-20 text-center border border-slate-300 p-3 rounded-xl font-black text-slate-800 focus:ring-2 focus:border-teal-500 focus:ring-teal-200 outline-none bg-white shadow-inner transition-shadow text-lg" 
                        />
                      ) : (
                        <span className="font-black text-slate-700 text-xl">{valGA.toFixed(1)}</span>
                      )}
                    </td>
                    
                    <td className="p-4 border-r border-slate-100 text-center bg-white/50">
                      {isEditing ? (
                        <input 
                          type="number" 
                          step="0.1" 
                          value={aluno.gb === 0 && !aluno.gb_touched ? '' : aluno.gb} 
                          onChange={(e) => updateGrade(aluno.studentId, 'gb', e.target.value)} 
                          className="w-20 text-center border border-slate-300 p-3 rounded-xl font-black text-slate-800 focus:ring-2 focus:border-teal-500 focus:ring-teal-200 outline-none bg-white shadow-inner transition-shadow text-lg" 
                        />
                      ) : (
                        <span className="font-black text-slate-700 text-xl">{valGB.toFixed(1)}</span>
                      )}
                    </td>
                    
                    <td className="p-4 border-r border-slate-100 text-center bg-white/50">
                      {isEditing ? (
                        <input 
                          type="number" 
                          step="0.1" 
                          value={aluno.gc === 0 && !aluno.gc_touched ? '' : aluno.gc} 
                          onChange={(e) => updateGrade(aluno.studentId, 'gc', e.target.value)} 
                          className="w-20 text-center border border-slate-300 p-3 rounded-xl font-black text-slate-800 focus:ring-2 focus:border-teal-500 focus:ring-teal-200 outline-none bg-white shadow-inner transition-shadow text-lg" 
                        />
                      ) : (
                        <span className="font-black text-slate-700 text-xl">{valGC.toFixed(1)}</span>
                      )}
                    </td>
                    
                    <td className="p-4 border-r border-slate-200 text-center font-black bg-teal-50/50 print:bg-white text-2xl text-teal-800 border-l border-teal-100">
                      {total}
                    </td>
                    
                    <td className="p-5 border-r border-slate-100 text-center">
                      <span className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest print:border shadow-sm border ${
                        isApproved 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 print:border-emerald-500' 
                          : 'bg-red-50 text-red-700 border-red-200 print:border-red-500'
                      }`}>
                        {isApproved ? 'Carga Aprovada' : 'Reprovação (Aberto)'}
                      </span>
                    </td>
                    
                    <td className="p-5">
                      {isEditing ? (
                        <textarea 
                          value={aluno.feedback||''} 
                          onChange={(e) => updateFeedback(aluno.studentId, e.target.value)} 
                          placeholder="Desenvolva o relatório de feedback ou registro do conselho de classe referente a este caso de estudo..." 
                          className="w-full border border-slate-300 p-4 rounded-xl text-sm font-medium focus:ring-2 focus:border-teal-500 focus:ring-teal-200 outline-none bg-white shadow-inner transition-shadow resize-none h-16" 
                        ></textarea>
                      ) : (
                        <p className="text-sm text-slate-600 font-serif leading-relaxed italic bg-slate-50 p-4 rounded-xl border border-slate-100">
                          "{aluno.feedback || "Avaliação formal sem registro textual associado pelo docente."}"
                        </p>
                      )}
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
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-fade-in print:shadow-none print:border-none">
      
      <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:bg-white print:border-b-4 print:border-slate-800">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl flex items-center justify-center shadow-inner shrink-0 print:hidden">
            <CheckSquare className="w-7 h-7"/>
          </div>
          <div>
            <h3 className="font-black text-2xl text-slate-800 tracking-tight leading-none mb-1">Livro Ponto e Assiduidade Diária Consolidada</h3>
            <p className="text-sm text-slate-500 font-medium print:hidden">
              Manual Interativo: A célula assinalada visualmente com <strong className="text-slate-800">Cinzento Escuro</strong> projeta a abstenção ao longo da aula, ao revés do bloco de cor <strong className="text-emerald-700">Pura Esmeralda</strong>, que configura a pontualidade cívica acadêmica do indivíduo logado.
            </p>
          </div>
        </div>
        
        <div className="flex gap-4">
          {isEditing && (
            <button 
              onClick={handleAddAttendanceCol} 
              className="bg-amber-100 text-amber-900 border border-amber-200 px-6 py-3.5 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-amber-200 transition-all print:hidden shadow-sm"
            >
              <Plus className="w-5 h-5"/> Arquitetar Nova Frequência Longitudinal
            </button>
          )}
          <button 
            onClick={() => window.print()} 
            className="bg-slate-800 text-white px-6 py-3.5 rounded-xl text-sm font-black flex items-center gap-2 hover:bg-slate-900 transition-all print:hidden shadow-lg hover:shadow-slate-900/30"
          >
            <Printer className="w-5 h-5"/> Exportar Ponto Chancelado Físico
          </button>
        </div>
      </div>

      <div className="overflow-x-auto relative">
        <table className="w-full text-left text-sm border-collapse bg-white table-fixed">
          <thead>
            <tr className="bg-slate-800 text-slate-50 print:bg-slate-200 print:border-b-4 print:border-slate-800 font-black uppercase tracking-widest text-[10px]">
              <th rowSpan="2" className="p-6 border-r border-slate-700 font-black w-72 sticky left-0 z-10 bg-slate-800 print:bg-slate-200 print:text-slate-900 shadow-[2px_0_5px_rgba(0,0,0,0.1)] print:shadow-none">Nomeação Legal do Estudante</th>
              <th rowSpan="2" className="p-6 border-r border-slate-700 font-black text-center w-32 bg-slate-800 print:bg-slate-200 print:text-slate-900">Total Indexado Abstenções</th>
              
              {currentAttendanceCols.length > 0 ? (
                <th colSpan={currentAttendanceCols.length} className="p-4 border-b border-slate-700 font-black text-center bg-slate-900 text-slate-300 print:bg-slate-300 print:text-slate-800">
                  Arquivos Magnéticos e Datas Paramétricas Consolidadas Pelo Sistema (Eixo Horizontal Letivo X)
                </th>
              ) : (
                <th rowSpan="2" className="p-6 font-medium text-center text-slate-400 italic bg-slate-900 border-b border-slate-700">
                  Procedimento Paralisado: A matriz não conta com pontos espaciais temporais gravados neste momento.
                </th>
              )}
            </tr>
            
            {currentAttendanceCols.length > 0 && (
              <tr className="bg-slate-100 text-slate-700 text-center text-[11px] font-black uppercase tracking-wider print:bg-white border-b-2 border-slate-200">
                {currentAttendanceCols.map((col, index) => (
                  <th key={col.id} className="p-4 border-r border-slate-200 relative group w-24 min-w-[96px] bg-slate-100 shadow-inner align-middle">
                    <div className="transform -rotate-45 whitespace-nowrap pt-8 pb-4">{col.label}</div>
                    {isEditing && (
                      <button 
                        onClick={() => handleRemoveAttendanceCol(index)} 
                        className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-all print:hidden shadow-sm hover:bg-red-500 hover:text-white border border-red-200" 
                        title="Demolir o ponto espácio-temporal e apagar o registro desta base letiva"
                      >
                        <X className="w-4 h-4"/>
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleGradesAndAttendance.length === 0 ? (
              <tr>
                <td colSpan={2 + currentAttendanceCols.length} className="p-16 text-center text-slate-500 font-medium text-lg">
                  <CheckSquare className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                  Operação Inválida: Matrizes Discentes insuficientes para alocar no Diário Geográfico de Turmas.
                </td>
              </tr>
            ) : (
              visibleGradesAndAttendance.map((aluno) => {
                if(!aluno) return null;
                
                const faltasArray = aluno.faltas || new Array(currentAttendanceCols.length).fill(false);
                const qtdeFaltas = faltasArray.filter(f => f).length;
                
                return (
                  <tr key={aluno.studentId} className="hover:bg-amber-50/50 print:border-b print:border-slate-300 transition-colors group">
                    <td className="p-4 border-r border-slate-100 font-bold text-slate-800 flex items-center gap-4 sticky left-0 z-10 bg-white group-hover:bg-amber-50/50 transition-colors shadow-[2px_0_5px_rgba(0,0,0,0.02)] print:shadow-none">
                      <div 
                        className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-black shrink-0 border border-slate-200 print:hidden cursor-pointer hover:border-amber-400 shadow-sm" 
                        onClick={() => setViewingProfileId(aluno.studentId)}
                      >
                        {systemUsers[aluno.studentId]?.avatar || '??'}
                      </div>
                      <span 
                        className="text-base cursor-pointer hover:text-amber-700 transition font-black truncate max-w-[180px]" 
                        onClick={() => setViewingProfileId(aluno.studentId)}
                      >
                        {aluno.nome}
                      </span>
                    </td>
                    
                    <td className="p-4 border-r border-slate-100 text-center bg-slate-50/30">
                      <span className={`font-black text-2xl ${qtdeFaltas > 1 ? 'text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-100' : 'text-slate-700'}`}>
                        {qtdeFaltas}
                      </span>
                    </td>
                    
                    {currentAttendanceCols.map((col, i) => {
                      const isFalta = faltasArray[i];
                      
                      return (
                        <td 
                          key={col.id} 
                          className={`p-0 border-r border-slate-100 text-center transition-all h-16 w-24 ${
                            isEditing ? 'cursor-pointer hover:opacity-80 active:scale-95' : ''
                          } ${
                            isFalta 
                              ? 'bg-slate-800 hover:bg-slate-900 print:bg-white print:text-black shadow-inner border-y-2 border-slate-900' 
                              : 'bg-emerald-500 hover:bg-emerald-600 print:bg-white print:text-black border-y-2 border-emerald-600'
                          }`} 
                          onClick={() => isEditing && toggleAttendance(aluno.studentId, i)}
                        >
                          <div className="print:hidden w-full h-full flex items-center justify-center">
                            <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all shadow-sm ${
                              isFalta ? 'border-slate-600 bg-slate-700' : 'border-emerald-300 bg-emerald-400'
                            }`}>
                              {!isFalta && <Check className="w-6 h-6 text-white stroke-[3px] drop-shadow-md"/>}
                              {isFalta && <X className="w-5 h-5 text-slate-500 stroke-[3px]"/>}
                            </div>
                          </div>
                          
                          <div className="hidden print:flex w-full h-full items-center justify-center font-black text-2xl font-serif text-slate-900">
                            {isFalta ? 'F' : '•'}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCourseHome = () => (
    <div className="animate-fade-in relative">
      
      {activeSectionForNewItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-fade-in flex flex-col h-[95vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-slate-800 text-lg">Adicionar material à aula</h3>
              <button onClick={() => setActiveSectionForNewItem(null)} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-1.5 rounded-full transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="p-6 md:p-10 overflow-y-auto flex-1 bg-slate-50/50">
              <form onSubmit={handleConfirmAddItem} className="space-y-8 max-w-4xl mx-auto">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Título do Material na Plataforma</label>
                  <input type="text" required value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} placeholder="Ex: Aula 01 - Fundamentos Essenciais" className="w-full border border-slate-300 p-4 rounded-xl text-base font-medium focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-all" />
                </div>
                
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Formato do Conteúdo (Escolha um)</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div onClick={() => setNewItemType('TextContent')} className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center gap-3 transition-all text-center ${newItemType === 'TextContent' ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-md' : 'border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm bg-white'}`}>
                      <AlignLeft className="w-7 h-7"/><span className="text-[11px] font-bold leading-tight">Página Web<br/><span className="font-normal text-slate-400 mt-1 block">Texto Escrito</span></span>
                    </div>
                    <div onClick={() => setNewItemType('FileText')} className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center gap-3 transition-all text-center ${newItemType === 'FileText' ? 'border-red-500 bg-red-50 text-red-800 shadow-md' : 'border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm bg-white'}`}>
                      <FileText className="w-7 h-7"/><span className="text-[11px] font-bold leading-tight">Documento<br/><span className="font-normal text-slate-400 mt-1 block">PDF ou Excel</span></span>
                    </div>
                    <div onClick={() => setNewItemType('Link')} className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center gap-3 transition-all text-center ${newItemType === 'Link' ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md' : 'border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm bg-white'}`}>
                      <Link className="w-7 h-7"/><span className="text-[11px] font-bold leading-tight">Vídeo Aula<br/><span className="font-normal text-slate-400 mt-1 block">Link Externo</span></span>
                    </div>
                    <div onClick={() => setNewItemType('NativeExam')} className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center gap-3 transition-all text-center ${newItemType === 'NativeExam' ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-md' : 'border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm bg-white'}`}>
                      <ClipboardList className="w-7 h-7"/><span className="text-[11px] font-bold leading-tight">Prova Nativa<br/><span className="font-normal text-slate-400 mt-1 block">Avaliação COREMU</span></span>
                    </div>
                    <div onClick={() => setNewItemType('MessageSquare')} className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center gap-3 transition-all text-center ${newItemType === 'MessageSquare' ? 'border-purple-500 bg-purple-50 text-purple-800 shadow-md' : 'border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm bg-white'}`}>
                      <MessageSquare className="w-7 h-7"/><span className="text-[11px] font-bold leading-tight">Fórum phpBB<br/><span className="font-normal text-slate-400 mt-1 block">Tópicos e Debates</span></span>
                    </div>
                  </div>
                </div>

                <div className="animate-fade-in border-t border-slate-200 pt-6">
                  {newItemType === 'FileText' || newItemType === 'Upload' ? (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Upload Direto para Nuvem (Storage)</label>
                      <input type="file" onChange={(e) => setNewFile(e.target.files[0])} className="w-full text-sm bg-slate-50 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-teal-100 file:text-teal-800 hover:file:bg-teal-200 cursor-pointer text-slate-500 rounded-xl transition" />
                    </div>
                  ) : newItemType === 'Link' ? (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">URL do Vídeo (YouTube/Drive) ou Site</label>
                      <input type="url" required value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} placeholder="Cole o link começando com https://..." className="w-full border border-slate-300 p-4 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition" />
                    </div>
                  ) : newItemType === 'NativeExam' ? (
                    <div className="bg-rose-50 text-rose-800 p-6 rounded-xl border border-rose-200 flex items-center gap-4 shadow-sm">
                      <ClipboardList className="w-10 h-10 shrink-0 text-rose-500"/>
                      <div>
                        <strong className="block text-base mb-1">A prova será ativada no formato de rascunho em branco.</strong>
                        <span className="text-sm">Após salvar e fechar esta tela, clique no botão "Configurar Prova Oficial" lá no mural principal da disciplina para escrever as perguntas, as alternativas e definir o gabarito.</span>
                      </div>
                    </div>
                  ) : newItemType === 'MessageSquare' ? (
                    <div className="bg-purple-50 text-purple-800 p-6 rounded-xl border border-purple-200 flex items-center gap-4 shadow-sm">
                      <Users className="w-10 h-10 shrink-0 text-purple-500"/>
                      <div>
                        <strong className="block text-base mb-1">Criação de Fórum Acadêmico</strong>
                        <span className="text-sm">Um ambiente estruturado no estilo phpBB será gerado automaticamente. Professores e alunos poderão criar Tópicos e enviar Respostas documentadas permanentemente.</span>
                      </div>
                    </div>
                  ) : newItemType === 'TextContent' ? (
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-amber-600 uppercase tracking-widest block">Redator da Aula (Página Web Rica)</label>
                      <div className="border-2 border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm h-[400px] flex flex-col">
                        <ReactQuill theme="snow" value={newItemTextContent} onChange={setNewItemTextContent} modules={quillModules} className="h-full flex flex-col" />
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="pt-6 shrink-0">
                  <button type="submit" disabled={isUploading} className="w-full bg-teal-800 text-white font-black p-4 rounded-xl hover:bg-teal-900 transition shadow-lg text-lg disabled:bg-slate-400 flex items-center justify-center">
                    {isUploading ? (
                      <span className="flex items-center gap-3"><Loader2 className="w-6 h-6 animate-spin"/> Transferindo arquivo para nuvem...</span>
                    ) : (
                      'Publicar na Sala de Aula'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div onClick={addSection} className="mb-8 border-2 border-dashed border-teal-300 rounded-xl p-6 text-center bg-teal-50/50 hover:bg-teal-50 cursor-pointer transition text-teal-700 font-bold text-base flex items-center justify-center gap-3 shadow-sm print:hidden">
          <Plus className="w-6 h-6"/> Criar Novo Tópico ou Módulo Temático
        </div>
      )}

      {activeContent.length === 0 && (
        <div className="text-center p-16 bg-white rounded-2xl border border-slate-200 text-slate-400 shadow-sm mt-8">
          <Book className="w-16 h-16 mx-auto mb-4 opacity-20"/>
          <p className="font-black text-xl text-slate-700">Sala de Aula Vazia</p>
          <p className="text-sm mt-2">Ative o "Modo de Edição" e clique no botão acima para começar a adicionar materiais, provas e fóruns.</p>
        </div>
      )}

      {activeContent.map(section => {
        if(!section) return null;
        return(
        <div key={section.id} className={`mb-8 rounded-2xl border ${section.borderColor || 'border-slate-200'} overflow-hidden shadow-sm bg-white print:break-inside-avoid transition-all`}>
          <div className={`flex items-center justify-between p-4 sm:p-5 ${section.bgColor || 'bg-slate-50'} border-b ${section.borderColor || 'border-slate-200'}`}>
            <div className="flex items-center gap-4 w-full">
              <button onClick={() => toggleModule(section.id)} className="p-2 bg-white/50 hover:bg-white rounded-lg transition shadow-sm print:hidden">
                {expandedModules[section.id] !== false ? <ChevronDown className="w-5 h-5 text-slate-600"/> : <ChevronRight className="w-5 h-5 text-slate-600"/>}
              </button>
              
              {isEditing ? (
                <input type="text" value={section.title || ''} onChange={(e) => updateSectionTitle(section.id, e.target.value)} className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-lg font-black text-slate-800 w-full max-w-lg focus:ring-2 focus:ring-teal-500 outline-none shadow-inner" />
              ) : (
                <h3 className="text-xl font-black text-slate-800 cursor-pointer tracking-tight" onClick={() => toggleModule(section.id)}>{section.title}</h3>
              )}
            </div>
            {isEditing && (
              <button onClick={() => deleteSection(section.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-4 print:hidden" title="Excluir Módulo Completo">
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {expandedModules[section.id] !== false && (
            <div className="p-0">
              {(section.items || []).map(item => {
                if(!item) return null;
                const IconComponent = getIconComponent(item.type);
                return (
                  <div key={item.id} className="flex items-start justify-between p-5 sm:p-6 border-b border-slate-100 hover:bg-slate-50/50 group transition">
                    <div className="flex items-start gap-4 w-full">
                      
                      {isEditing && (
                        <GripVertical className="w-5 h-5 text-slate-300 cursor-move mt-1 print:hidden" />
                      )}
                      
                      <div className={`p-3 rounded-xl flex-shrink-0 ${item.color?.replace('text-', 'bg-').replace('500', '50').replace('600', '50') || 'bg-slate-100'}`}>
                        <IconComponent className={`w-6 h-6 ${item.color || 'text-slate-500'}`} />
                      </div>
                      
                      <div className="flex-1 pt-1">
                        {isEditing ? (
                          <input type="text" value={item.title || ''} onChange={(e) => updateItemTitle(section.id, item.id, e.target.value)} className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-base font-bold text-slate-800 w-full max-w-md focus:ring-2 focus:ring-teal-500 outline-none shadow-sm" />
                        ) : (
                          <h4 className="text-base font-bold text-slate-800">{item.title}</h4>
                        )}
                        
                        {!isEditing && (
                          <div className="mt-3 flex flex-wrap gap-3 print:hidden">
                            
                            {item.fileName && item.url && (
                              <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2 rounded-lg transition shadow-sm w-fit">
                                <Download className="w-4 h-4"/> Baixar {item.fileName}
                              </a>
                            )}
                            
                            {item.type === 'NativeExam' && (
                              <button onClick={() => { setActiveExamItem(item); setLocalQuestions(exams[item.id]?.questions || []); }} className="flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg transition shadow-md w-fit">
                                <ClipboardList className="w-4 h-4"/> {(role === 'professor' || role === 'admin') ? 'Configurar Prova Oficial / Ver Notas' : 'Fazer Avaliação'}
                              </button>
                            )}
                            
                            {item.type === 'Link' && item.url && !item.fileName && (
                              <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2 rounded-lg transition shadow-sm w-fit">
                                <Link className="w-4 h-4"/> Acessar Link Externo
                              </a>
                            )}
                            
                            {item.type === 'TextContent' && (
                              <button onClick={() => setReadingItem(item)} className="flex items-center gap-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-4 py-2 rounded-lg transition shadow-sm w-fit">
                                <AlignLeft className="w-4 h-4"/> Ler Conteúdo da Aula
                              </button>
                            )}
                            
                            {item.type === 'MessageSquare' && (
                              <button onClick={() => setActiveForumItem(item)} className="flex items-center gap-1.5 text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-4 py-2 rounded-lg transition shadow-sm w-fit">
                                <MessageSquare className="w-4 h-4"/> Abrir Fórum Acadêmico
                              </button>
                            )}
                            
                          </div>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <button onClick={() => deleteItem(section.id, item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4 print:hidden" title="Excluir Material">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                );
              })}
              
              {isEditing && (
                <div className="p-4 border-t border-dashed border-slate-200 bg-slate-50 flex justify-end print:hidden">
                  <button onClick={() => handleOpenAddItemModal(section.id)} className="flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 bg-white px-5 py-2.5 rounded-lg border border-teal-200 shadow-sm transition hover:shadow-md">
                    <Plus className="w-4 h-4"/> Adicionar Material neste Módulo
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )})}
    </div>
  );

  // ============================================================================
  // ESTRUTURA GLOBAL DA PLATAFORMA GERAL (A "CASCA" SHELL DO APLICATIVO WEB ENTERPRISE)
  // ============================================================================
  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans text-slate-800 overflow-hidden print:bg-white print:h-auto print:overflow-visible">
      
      {/* ------------------------------------------------------------- */}
      {/* NAVEGAÇÃO LATERAL (MASTER SIDEBAR DO SISTEMA COREMU) */}
      {/* ------------------------------------------------------------- */}
      <aside 
        className={`${sidebarOpen ? 'w-[320px]' : 'w-[88px]'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col flex-shrink-0 shadow-2xl z-20 relative print:hidden border-r border-slate-800`}
      >
        <div className="h-24 flex items-center justify-between px-6 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md">
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-black text-white text-2xl tracking-tight leading-none mb-1">
                Portal <span className="text-teal-400">COREMU</span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Arquitetura de Gerenciamento</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-3 hover:bg-slate-800 rounded-2xl text-slate-400 transition-all hover:text-white focus:ring-2 focus:ring-teal-500/50 outline-none shadow-sm"
          >
            <Menu className="w-7 h-7" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-8 no-scrollbar relative">
          <nav className="space-y-3 px-5">
            
            {/* LINKS EXCLUSIVOS DA ADMINISTRAÇÃO CENTRAL LOGADA */}
            {role === 'admin' && (
              <div className="bg-slate-800/50 p-2 rounded-2xl border border-slate-800 mb-6">
                <button 
                  onClick={() => {setCurrentView('admin_dashboard'); setActiveCourseId(null); setEditMode(false);}} 
                  className={`w-full flex items-center gap-4 p-4 rounded-xl text-base font-black transition-all ${currentView === 'admin_dashboard' ? 'bg-teal-900/60 text-teal-300 shadow-inner border border-teal-800' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <Shield className="w-6 h-6 flex-shrink-0" />
                  {sidebarOpen && <span>Gestão COREMU Central</span>}
                </button>
                <button 
                  onClick={() => {setCurrentView('admin_users'); setActiveCourseId(null); setEditMode(false);}} 
                  className={`w-full flex items-center gap-4 p-4 rounded-xl text-base font-black transition-all mt-1 ${currentView === 'admin_users' ? 'bg-teal-900/60 text-teal-300 shadow-inner border border-teal-800' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                >
                  <Users className="w-6 h-6 flex-shrink-0" />
                  {sidebarOpen && <span>Diretório Paramétrico de Usuários</span>}
                </button>
              </div>
            )}

            {/* LINKS PARA O ALUNO / E CORPO DOCENTE (A Cadeira Comum) */}
            {(role === 'professor' || role === 'aluno') && (
              <button 
                onClick={() => {setCurrentView('user_home'); setActiveCourseId(null); setEditMode(false);}} 
                className={`w-full flex items-center gap-4 p-5 rounded-2xl text-lg font-black transition-all shadow-sm ${currentView === 'user_home' ? 'bg-gradient-to-r from-teal-900 to-slate-900 text-teal-300 border border-teal-800' : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white'}`}
              >
                <Home className="w-7 h-7 flex-shrink-0 text-teal-500" />
                {sidebarOpen && <span>Página Inicial Base</span>}
              </button>
            )}

            {/* ÁREA MÓVEL DE CARREGAMENTO DAS DISCIPLINAS ASSOCIADAS VIGENTES */}
            {sidebarOpen && (
              <div className="mt-12 mb-5 px-3 flex items-center gap-3">
                <div className="h-px bg-slate-800 flex-1"></div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Minhas Disciplinas Ativas da Grade</div>
                <div className="h-px bg-slate-800 flex-1"></div>
              </div>
            )}
            
            {visibleCourses.length === 0 ? (
              <div className="px-6 text-sm text-slate-500 font-bold mt-4 bg-slate-800/30 p-4 rounded-xl border border-dashed border-slate-700">
                Nenhuma disciplina foi detectada sob responsabilidade ou participação da atual credencial ativa.
              </div>
            ) : (
              visibleCourses.map((c) => {
                if(!c) return null;
                const isCourseActive = activeCourseId === c.id && ['course_home', 'participants', 'grades', 'attendance'].includes(currentView);
                
                return (
                  <div key={c.id} className="mb-3 relative group">
                    <button 
                      onClick={() => {setActiveCourseId(c.id); setCurrentView('course_home'); setEditMode(false);}} 
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl text-base transition-all shadow-sm ${
                        isCourseActive 
                          ? 'bg-teal-600 text-white font-black border border-teal-500' 
                          : 'bg-slate-800 text-slate-300 font-bold border border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-600'
                      }`} 
                      title={`Ingressar no Módulo: ${c.nome}`}
                    >
                      <div className={`p-1.5 rounded-lg ${isCourseActive ? 'bg-teal-500' : 'bg-slate-700'}`}>
                        <Book className={`w-5 h-5 flex-shrink-0 ${isCourseActive ? 'text-white' : 'text-slate-400'}`} />
                      </div>
                      {sidebarOpen && <span className="truncate block w-full text-left">{c.nome}</span>}
                    </button>
                    
                    {/* SUBMENU EXPANSO INTRA-DISCIPLINA QUANDO ATIVADA (MODO DE OPERAÇÃO ISOLADA) */}
                    {isCourseActive && sidebarOpen && (
                      <div className="ml-8 pl-5 border-l-2 border-slate-700 mt-3 space-y-2 mb-8 relative">
                        {/* Linhas conectoras tipo File Tree */}
                        <div className="absolute top-6 -left-0.5 w-5 border-t-2 border-slate-700"></div>
                        <button 
                          onClick={() => setCurrentView('course_home')} 
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-black transition-all ${currentView === 'course_home' ? 'text-teal-300 bg-slate-800 shadow-inner border border-slate-700' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                        >
                          <Layout className="w-4 h-4 flex-shrink-0 text-amber-500" /> Sala de Aula Virtual
                        </button>
                        
                        <div className="absolute top-[4.5rem] -left-0.5 w-5 border-t-2 border-slate-700"></div>
                        <button 
                          onClick={() => setCurrentView('participants')} 
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-black transition-all ${currentView === 'participants' ? 'text-teal-300 bg-slate-800 shadow-inner border border-slate-700' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                        >
                          <Users className="w-4 h-4 flex-shrink-0 text-blue-500" /> Corpo Estudantil e Docente (Matrículas)
                        </button>
                        
                        <div className="absolute top-[8rem] -left-0.5 w-5 border-t-2 border-slate-700"></div>
                        <button 
                          onClick={() => setCurrentView('grades')} 
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-black transition-all ${currentView === 'grades' ? 'text-teal-300 bg-slate-800 shadow-inner border border-slate-700' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                        >
                          <BarChart className="w-4 h-4 flex-shrink-0 text-emerald-500" /> Log Aritmético: Boletim e Notas
                        </button>
                        
                        <div className="absolute top-[11.5rem] -left-0.5 w-5 border-t-2 border-slate-700"></div>
                        <button 
                          onClick={() => setCurrentView('attendance')} 
                          className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-black transition-all ${currentView === 'attendance' ? 'text-teal-300 bg-slate-800 shadow-inner border border-slate-700' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                        >
                          <CheckSquare className="w-4 h-4 flex-shrink-0 text-rose-500" /> Instrumento Legal: Diário de Frequência
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </nav>
        </div>

        {/* CONTROLE MÓDULO ROTEAMENTO (SAIR DO SISTEMA) */}
        {sidebarOpen && (
          <div className="p-6 bg-slate-950 border-t border-slate-800 z-50 shrink-0">
            <button 
              onClick={handleLogout} 
              className="w-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white text-base font-black p-4 rounded-2xl border border-slate-700 hover:border-red-500 transition-all flex items-center justify-center gap-3 shadow-lg group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Encerrar Conexão / Log Out
            </button>
          </div>
        )}
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* ÁREA CENTRAL DE CONTEÚDO E HEADER DA PLATAFORMA */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative print:overflow-visible bg-[#f8f9fa]">
        
        {/* CABEÇALHO SUPERIOR HORIZONTAL (HEADER MASTER) */}
        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-8 md:px-12 shadow-sm z-10 print:hidden shrink-0 relative">
          
          <div className="flex items-center gap-6 flex-1">
            <div className="hidden sm:flex items-center text-sm font-semibold text-slate-600 gap-6">
              <div className="bg-teal-50 p-2 rounded-xl border border-teal-100">
                <Shield className="w-8 h-8 text-teal-700"/>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-800 font-black text-2xl tracking-tight leading-none mb-1">
                  COREMU Institucional <span className="font-medium text-slate-400 tracking-normal">| HACO Base Aérea</span>
                </span>
                <span className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">
                  Software Integrado de Educação Multiprofissional Cloud
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            
            {/* Notificações Fictícias de Sistema */}
            <div className="hidden md:flex p-3 bg-slate-50 border border-slate-200 rounded-full text-slate-400 hover:text-teal-600 hover:bg-teal-50 cursor-pointer transition-colors relative">
              <Bell className="w-6 h-6"/>
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </div>

            <div className="h-10 w-px bg-slate-200 hidden md:block"></div>

            {/* Painel de Identidade Miniatura */}
            <div 
              onClick={() => setViewingProfileId(currentUser.id)} 
              className="flex items-center gap-4 p-2 pl-4 hover:bg-slate-50 rounded-full transition-all cursor-pointer border border-transparent hover:border-slate-200 group"
              title="Acessar Configurações e Ficha Acadêmica"
            >
              <div className="text-right hidden sm:block">
                <p className="text-base font-black text-slate-800 leading-tight group-hover:text-teal-700 transition-colors">
                  {currentUser.nome}
                </p>
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  {role === 'aluno' ? 'Cargo: Residente COREMU' : role === 'professor' ? 'Cargo: Docente/Preceptor' : 'Nível: Administração'}
                </p>
              </div>
              <div className="w-14 h-14 rounded-full bg-teal-800 text-white flex items-center justify-center text-lg font-black shadow-md border-4 border-teal-100 group-hover:border-teal-200 group-hover:bg-teal-700 transition-all">
                {currentUser.avatar}
              </div>
            </div>

          </div>
        </header>

        {/* ------------------------------------------------------------- */}
        {/* MIOLO CENTRAL: ONDE AS TELAS SÃO RENDERIZADAS PELO ROTEADOR */}
        {/* ------------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto p-6 md:p-12 print:bg-white print:p-0 print:overflow-visible relative">
          
          {/* Efeito de Gradiente Radial de Fundo Global */}
          <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-slate-100 to-transparent pointer-events-none -z-10"></div>
          
          <div className="max-w-[1400px] mx-auto pb-32">
            
            {/* ROTAS GLOBAIS FORA DA DISCIPLINA */}
            {currentView === 'user_home' && renderUserHome()}
            {currentView === 'admin_dashboard' && renderAdminDashboard()}
            {currentView === 'admin_users' && renderAdminUsers()}
            
            {/* RENDERIZAÇÃO COMPLEXA DA DISCIPLINA ATIVA (CONTROLLER) */}
            {activeCourseId && ['course_home', 'participants', 'grades', 'attendance'].includes(currentView) && (
              <div className="animate-fade-in">
                
                {/* O CABEÇALHO MAGNO DA DISCIPLINA */}
                <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-8 mt-4 bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                  
                  {/* Faixa lateral decorativa do cabeçalho da disciplina */}
                  <div className="absolute top-0 left-0 w-2 h-full bg-teal-500"></div>

                  <div className="flex-1 z-10 relative">
                    {/* Componente Dinâmico: Título da Disciplina */}
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={activeCourseObj?.nome || ''} 
                        onChange={(e) => updateCourseDetails('nome', e.target.value)} 
                        placeholder="Clique aqui e digite o Nome da Disciplina / Arquitetura Curricular..." 
                        className="w-full text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight bg-transparent border-b-4 border-dashed border-teal-200 hover:border-teal-400 focus:border-teal-600 focus:bg-teal-50 focus:outline-none mb-4 pb-3 transition-all" 
                      />
                    ) : (
                      <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4 flex items-center gap-4">
                        <Book className="w-10 h-10 text-teal-600 hidden md:block" /> 
                        {activeCourseObj?.nome}
                      </h1>
                    )}
                    
                    {/* Componente Dinâmico: Dados Secundários da Disciplina */}
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner w-fit">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Código Oficial:</span>
                          <input 
                            type="text" 
                            value={activeCourseObj?.codigo || ''} 
                            onChange={(e) => updateCourseDetails('codigo', e.target.value)} 
                            placeholder="Cód: RMAB001" 
                            className="w-40 text-base text-teal-800 font-black bg-white px-4 py-2 rounded-xl border-2 border-dashed border-teal-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-100 focus:outline-none transition-all shadow-sm" 
                          />
                        </div>
                        <div className="hidden sm:block h-8 w-px bg-slate-300"></div>
                        <span className="text-base text-slate-500 font-medium">
                          Professor Associado Liderança: <strong className="text-slate-800">{systemUsers[activeCourseObj?.professorId]?.nome}</strong>
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-4">
                        <span className="text-sm font-black text-teal-900 bg-teal-100 px-5 py-2 rounded-lg uppercase tracking-widest shadow-sm border border-teal-200 flex items-center gap-2">
                          <Book className="w-4 h-4"/> {activeCourseObj?.codigo}
                        </span>
                        <div className="hidden sm:block h-6 w-2 bg-slate-200 rounded-full"></div>
                        <span className="text-base text-slate-500 font-medium flex gap-2 items-center bg-slate-50 px-4 py-1.5 rounded-lg border border-slate-200">
                          Professor Titular Responsável: 
                          <strong 
                            onClick={() => setViewingProfileId(activeCourseObj?.professorId)} 
                            className="text-slate-700 hover:text-teal-700 cursor-pointer transition-colors border-b border-dashed border-slate-400 hover:border-teal-500"
                          >
                            {systemUsers[activeCourseObj?.professorId]?.nome}
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* MÓDULO EXECUTIVO: ATIVAÇÃO DE MODO DE EDIÇÃO GERAL DE MATRIZES (ADMIN/PROF) */}
                  {hasEditPermission && (
                    <div className="flex items-center bg-slate-50 border-2 border-slate-200 p-2 rounded-2xl shadow-sm shrink-0 print:hidden z-10 relative">
                      <div className="px-4 hidden sm:flex flex-col justify-center">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Permissão Mestre</span>
                        <span className="text-sm font-black text-slate-700 leading-none">Modo de Edição Estrutural</span>
                      </div>
                      <button 
                        onClick={() => setEditMode(!editMode)} 
                        className={`flex items-center px-6 py-3.5 rounded-xl text-base font-black transition-all border shadow-sm ${
                          editMode 
                            ? 'bg-gradient-to-r from-rose-700 to-rose-600 text-white border-rose-800 shadow-rose-900/30' 
                            : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-300 hover:border-slate-400'
                        }`}
                        title="Ativar/Desativar recursos de deleção e inserção profunda de módulos acadêmicos"
                      >
                        {editMode ? <ToggleRight className="w-7 h-7 mr-3 drop-shadow-md"/> : <ToggleLeft className="w-7 h-7 mr-3 opacity-60"/>}
                        {editMode ? 'SISTEMA DESTRAVADO (CUIDADO)' : 'MODO DE VISUALIZAÇÃO SEGURO'}
                      </button>
                    </div>
                  )}
                </div>

                {/* CAIXA DE ALERTA DO MODO DE EDIÇÃO (BANNER COMUNICATIVO) */}
                {hasEditPermission && editMode && (
                  <div className="bg-gradient-to-r from-rose-50 to-orange-50 border-2 border-rose-200 text-rose-900 p-6 rounded-3xl mb-8 text-base flex flex-col sm:flex-row gap-5 print:hidden shadow-lg shadow-rose-100/50 items-start sm:items-center relative overflow-hidden">
                    {/* Efeito de Perigo/Aviso */}
                    <div className="absolute top-0 left-0 w-2 h-full bg-rose-500 animate-pulse"></div>
                    <Shield className="w-12 h-12 text-rose-500 shrink-0 drop-shadow-sm"/>
                    <div className="flex-1">
                      <strong className="block text-lg mb-1 font-black">Atenção Estratégica: Os Trincos Estão Soltos</strong>
                      <p className="leading-relaxed font-medium">O Modo de Edição Estrutural está LIGADO. Você tem permissão gravíssima para excluir módulos permanentes, modificar textos globais e construir matrizes. <strong>Desligue o botão logo acima se quiser retornar à segurança visual e testar os Fóruns e Provas (O MODO DE RESPOSTA NÃO APARECE COM O EDITOR LIGADO)</strong>.</p>
                    </div>
                  </div>
                )}

                {/* NAVEGAÇÃO DE BREADCRUMB (Localizador Hierárquico Acadêmico) */}
                <div className="flex flex-wrap items-center text-xs sm:text-sm text-slate-500 mb-10 bg-white p-5 px-6 rounded-2xl border border-slate-200 shadow-[0_4px_10px_rgba(0,0,0,0.02)] print:hidden">
                  <Home className="w-4 h-4 mr-3 opacity-60"/>
                  <span className="hover:text-slate-800 font-bold transition-colors cursor-pointer" onClick={() => setCurrentView('user_home')}>Plataforma Virtual COREMU Central</span>
                  <ChevronRight className="w-4 h-4 mx-3 text-slate-300" />
                  <span className="font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">{activeCourseObj?.codigo}</span>
                  <ChevronRight className="w-4 h-4 mx-3 text-slate-300" />
                  <span className="text-slate-800 font-black uppercase tracking-wider bg-slate-100 px-3 py-1 rounded shadow-inner">
                    {
                      currentView === 'course_home' ? 'Painel de Classes e Arquivos (Módulos Base)' : 
                      currentView === 'grades' ? 'Boletim Integrado de Avaliações e Parametrização' : 
                      currentView === 'participants' ? 'Lista Oficial de Discentes (Corpo Residente)' : 
                      'Instrumento Eletrônico de Ponto e Frequência (Diário Oficial)'
                    }
                  </span>
                </div>

                {/* INJEÇÃO DO SWITCHER DAS TELAS INTERNAS DA DISCIPLINA */}
                <div className="relative">
                  {currentView === 'course_home' && renderCourseHome()}
                  {currentView === 'participants' && renderParticipants()}
                  {currentView === 'grades' && renderGradebook()}
                  {currentView === 'attendance' && renderAttendance()}
                </div>
              </div> // Fechamento CORRETO da tag aberta na linha 2816 (<div className="animate-fade-in">)
            )}
            
            {/* RENDERIZAÇÃO FLUTUANTE GLOBAL (MODAIS EM CAMADA Z-INDEX ALTA SUPERIOR) */}
            {viewingProfileId && renderProfileModal()}
            {activeForumItem && renderForumModal()}
            {activeExamItem && renderExamModal()}
            {readingItem && renderReadingModal()}

          </div>
        </main>
      </div>
    </div>
  );
}

// ============================================================================
// INJEÇÃO DA PLATAFORMA NA DOM ROOT DO VITE/REACT ATRAVÉS DO APP EXPORT
// ============================================================================
export default function App() {
  return (
    <ErrorBoundary>
      <LmsEnterprisePortal />
    </ErrorBoundary>
  );
}
