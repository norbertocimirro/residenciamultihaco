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
// 1. CONFIGURAÇÃO DE CONEXÃO COM A NUVEM (FIREBASE)
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
  console.error("Erro na inicialização do Firebase:", e);
}

// ============================================================================
// 2. INTERCEPTADOR DE FALHAS (ERROR BOUNDARY)
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
    console.error("Erro interceptado:", error, info);
    this.setState({ info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-slate-50 h-screen overflow-auto font-sans flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-red-600 max-w-2xl w-full">
            <h1 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-red-600" />
              Erro no processamento da interface
            </h1>
            <p className="text-slate-600 mb-4 text-sm">
              O sistema evitou um travamento completo. Detalhes técnicos:
            </p>
            <pre className="bg-slate-100 p-4 border border-slate-200 rounded-lg text-xs text-red-700 overflow-x-auto whitespace-pre-wrap font-mono">
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
// 3. HOOK DE SINCRONIZAÇÃO EM TEMPO REAL (FIRESTORE)
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
            console.error("Falha ao criar o documento inicial:", err);
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
        console.error("Falha ao salvar na nuvem:", error);
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
// 4. COMPONENTE PRINCIPAL MESTRE: PORTAL ACADÊMICO
// ============================================================================
function LmsEnterprisePortal() {
  
  // --------------------------------------------------------------------------
  // BANCO DE DADOS: COLEÇÕES E ESTADOS
  // --------------------------------------------------------------------------
  const [dbUsers, setDbUsers, usersLoaded] = useFirestoreDB('tb_users_v4', {
    'admin1': { 
      id: 'admin1', 
      nome: 'Gestão Acadêmica', 
      role: 'admin', 
      avatar: 'GA', 
      email: 'gestao@haco.mil.br', 
      phone: '(00) 0000-0000', 
      bio: 'Perfil administrativo do sistema.', 
      showContactPublicly: true 
    },
    'prof1': { 
      id: 'prof1', 
      nome: 'Prof. Norberto Cimirro', 
      role: 'professor', 
      avatar: 'NC', 
      email: 'norberto@haco.mil.br', 
      phone: '(00) 99999-9999', 
      bio: 'Docente responsável pelas disciplinas base.', 
      showContactPublicly: true 
    },
    'stu1': { 
      id: 'stu1', 
      nome: 'Mariana Alves', 
      role: 'aluno', 
      avatar: 'MA', 
      email: 'mariana@teste.com', 
      phone: '(00) 88888-8888', 
      bio: 'Residente / Aluno matriculado.', 
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
      bgColor: 'bg-slate-50', 
      borderColor: 'border-slate-200',
      items: [
        { 
          id: 'i1', 
          title: 'Plano de Ensino', 
          type: 'FileText', 
          color: 'text-red-500', 
          fileName: 'Plano_de_Ensino.pdf', 
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
        feedback: "Bom desempenho." 
      }
    ] 
  });
  
  const [dbAttendanceCols, setDbAttendanceCols, colsLoaded] = useFirestoreDB('tb_attendance_cols', { 'c1': [] });
  const [dbForums, setDbForums, forumsLoaded] = useFirestoreDB('tb_forums_v3', {});
  const [dbExams, setDbExams, examsLoaded] = useFirestoreDB('tb_exams_v1', {});

  // Prevenção contra undefined
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
  const [showNotifications, setShowNotifications] = useState(false);

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
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Sincronizando Sistema</h2>
        <p className="text-sm text-slate-500 mt-2">Acessando banco de dados...</p>
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
        alert("E-mail não cadastrado na base de dados do sistema.");
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

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 font-sans p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30"></div>

        <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-2xl w-full max-w-sm relative z-10 animate-fade-in border border-slate-100">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100">
              <Shield className="w-8 h-8 text-teal-700"/>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 text-center tracking-tight mb-2">Portal Acadêmico</h1>
          <p className="text-sm text-slate-500 text-center mb-8">Acesso ao Ambiente Virtual de Aprendizagem</p>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1.5">E-mail Institucional</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  value={loginEmailInput} 
                  onChange={e => setLoginEmailInput(e.target.value)} 
                  placeholder="email@instituicao.edu.br" 
                  className="w-full border border-slate-300 p-3 pl-10 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-shadow bg-slate-50 focus:bg-white text-slate-800" 
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest block mb-1.5">Senha</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="password" 
                  required 
                  value={loginPasswordInput} 
                  onChange={e => setLoginPasswordInput(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full border border-slate-300 p-3 pl-10 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-shadow bg-slate-50 focus:bg-white text-slate-800" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isAuthenticating} 
              className="w-full bg-teal-800 text-white font-semibold p-3 rounded-lg hover:bg-teal-900 transition-all shadow-md text-sm flex items-center justify-center gap-2 mt-2 disabled:bg-slate-400"
            >
              {isAuthenticating ? (
                <><Loader2 className="w-4 h-4 animate-spin"/> Validando...</>
              ) : (
                <><Lock className="w-4 h-4"/> Entrar no Sistema</>
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
    
    if (emailExists) {
      return alert("Este e-mail já está sendo utilizado no sistema.");
    }

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

    setDbUsers({ 
      ...systemUsers, 
      [newId]: newUserObject 
    });
    
    setNewUserName('');
    setNewUserEmail('');
    alert('Usuário cadastrado com sucesso! Crie a senha no painel de Autenticação.');
  };

  const handleDeleteUser = (id) => {
    if (id === 'admin1' || id === currentUser.id) {
      return alert('Você não pode excluir a si mesmo ou o Administrador do sistema.');
    }
    if (window.confirm('Tem certeza que deseja remover este usuário permanentemente?')) {
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
    if (!editingUserName.trim()) return alert("O nome não pode ser nulo.");
    
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
    
    const newCourseObj = { 
      id: newId, 
      codigo: newCourseCode, 
      nome: newCourseName, 
      professorId: newCourseProfId 
    };
    
    setDbCourses([...courses, newCourseObj]);
    setDbContents({ ...courseContents, [newId]: defaultModules });
    setDbStudents({ ...courseStudents, [newId]: [] });
    setDbAttendanceCols({ ...attendanceCols, [newId]: [] }); 
    
    setNewCourseCode(''); 
    setNewCourseName(''); 
    setNewCourseProfId('');
    alert('Disciplina criada com sucesso!');
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm('Atenção: A exclusão da disciplina destruirá fóruns, notas e provas. Proceder?')) {
      setDbCourses(courses.filter((c) => c && c.id !== id));
      if (activeCourseId === id) { 
        setActiveCourseId(null); 
        setCurrentView('admin_dashboard'); 
      }
    }
  };

  const updateCourseDetails = (field, value) => {
    setDbCourses(courses.map((c) => c?.id === activeCourseId ? { ...c, [field]: value } : c));
  };

  const handleEnrollStudent = (e, courseId) => {
    e.preventDefault();
    if (!newStudentId) return;
    
    const currentColsLength = (attendanceCols[courseId] || []).length;
    const newStudentData = { 
      studentId: newStudentId, 
      ga: 0, 
      gb: 0, 
      gc: 0, 
      faltas: new Array(currentColsLength).fill(false), 
      feedback: "" 
    };
    
    const currentEnrolled = Array.isArray(courseStudents[courseId]) ? courseStudents[courseId] : [];
    
    setDbStudents({ 
      ...courseStudents, 
      [courseId]: [...currentEnrolled, newStudentData] 
    });
    
    setNewStudentId('');
  };

  const deleteStudent = (studentId) => {
    if (window.confirm('Remover a matrícula deste aluno da disciplina?')) {
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
    const newSection = { 
      id: `sec_${Date.now()}`, 
      title: 'Novo Módulo Temático', 
      bgColor: 'bg-slate-50', 
      borderColor: 'border-slate-200', 
      items: [] 
    };
    
    updateContent([...activeContent, newSection]);
    setExpandedModules((prev) => ({ ...prev, [newSection.id]: true }));
  };

  const updateSectionTitle = (id, newTitle) => {
    updateContent(activeContent.map((sec) => sec?.id === id ? { ...sec, title: newTitle } : sec));
  };

  const deleteSection = (id) => {
    if (window.confirm('Apagar este módulo e todos os seus itens?')) {
      updateContent(activeContent.filter((sec) => sec?.id !== id));
    }
  };

  const updateItemTitle = (sectionId, itemId, newTitle) => {
    updateContent(activeContent.map((sec) => {
      if (sec?.id === sectionId) {
        return { 
          ...sec, 
          items: (sec.items || []).map((item) => item?.id === itemId ? { ...item, title: newTitle } : item) 
        };
      }
      return sec;
    }));
  };

  const deleteItem = (sectionId, itemId) => {
    if (window.confirm('Apagar este material da visualização do aluno?')) {
      updateContent(activeContent.map((sec) => {
        if (sec?.id === sectionId) {
          return { 
            ...sec, 
            items: (sec.items || []).filter((item) => item?.id !== itemId) 
          };
        }
        return sec;
      }));
    }
  };

  const handleOpenAddItemModal = (sectionId) => {
    setActiveSectionForNewItem(sectionId);
    setNewItemTitle('');
    setNewItemType('FileText');
    setNewItemUrl('');
    setNewItemTextContent('');
    setNewFile(null);
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
        console.error("Erro no Storage:", err);
        alert("Falha no Upload. Verifique as configurações de nuvem.");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    if (newItemType === 'MessageSquare') {
      setDbForums({ ...forums, [finalItemId]: [] }); 
    }
    
    if (newItemType === 'NativeExam') {
      setDbExams({ ...exams, [finalItemId]: { questions: [], submissions: {} } }); 
    }

    updateContent(activeContent.map((sec) => {
      if (sec?.id === activeSectionForNewItem) {
        return {
          ...sec,
          items: [
            ...(sec.items || []), 
            { 
              id: finalItemId, 
              title: newItemTitle, 
              type: newItemType, 
              color: color, 
              url: finalUrl, 
              fileName: finalFileName, 
              textContent: newItemType === 'TextContent' ? newItemTextContent : null
            }
          ]
        };
      }
      return sec;
    }));
    
    setActiveSectionForNewItem(null); 
  };

  const updateGrade = (studentId, field, value) => {
    const updatedStudents = (courseStudents[activeCourseId] || []).map((s) => {
      if (s?.studentId === studentId) {
        return { ...s, [field]: parseFloat(value) || 0 };
      }
      return s;
    });
    setDbStudents({ ...courseStudents, [activeCourseId]: updatedStudents });
  };

  const updateFeedback = (studentId, value) => {
    const updatedStudents = (courseStudents[activeCourseId] || []).map((s) => {
      if (s?.studentId === studentId) {
        return { ...s, feedback: value };
      }
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
    const label = prompt("Data e Horário (Ex: 15/09 - 08:00):");
    if (!label) return;
    
    const currentCols = attendanceCols[activeCourseId] || [];
    const newCols = [...currentCols, { id: `col_${Date.now()}`, label }];
    setDbAttendanceCols({ ...attendanceCols, [activeCourseId]: newCols });
    
    const updatedStudents = (courseStudents[activeCourseId] || []).map((s) => ({
      ...s, 
      faltas: [...(s.faltas || []), false] 
    }));
    setDbStudents({ ...courseStudents, [activeCourseId]: updatedStudents });
  };

  const handleRemoveAttendanceCol = (colIndex) => {
    if (!window.confirm('Apagar a coluna de frequência desta aula?')) return;
    
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
    nome: systemUsers[enrollment?.studentId]?.nome || 'Usuário Removido'
  }));

  const visibleGradesAndAttendance = role === 'aluno' 
    ? studentsInCourse.filter((s) => s.studentId === currentUser.id) 
    : studentsInCourse;

  const availableStudentsForEnrollment = Object.values(systemUsers).filter((u) => 
    u && u.role === 'aluno' && !rawActiveStudents.some((s) => s?.studentId === u.id)
  );

  // ============================================================================
  // RENDERIZAÇÕES DOS MODAIS
  // ============================================================================

  const renderProfileModal = () => {
    const profileUser = systemUsers[viewingProfileId];
    if (!profileUser) return null;

    const isMe = viewingProfileId === currentUser.id;
    const canSeePrivate = isMe || role === 'admin' || role === 'professor' || profileUser.showContactPublicly;

    const startEditingProfile = () => {
      setEditProfileData({
        bio: profileUser.bio || '',
        phone: profileUser.phone || '',
        email: profileUser.email || '',
        showContactPublicly: profileUser.showContactPublicly || false
      });
    };

    const saveProfile = (e) => {
      e.preventDefault();
      setDbUsers({ 
        ...systemUsers, 
        [viewingProfileId]: { ...profileUser, ...editProfileData } 
      });
      setEditProfileData(null);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 print:hidden">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
          
          <div className="bg-gradient-to-r from-teal-800 to-teal-600 p-8 text-white relative flex flex-col items-center shrink-0 shadow-sm">
            <button 
              onClick={() => {setViewingProfileId(null); setEditProfileData(null);}} 
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <X className="w-5 h-5"/>
            </button>
            <div className="w-20 h-20 bg-white text-teal-800 rounded-full flex items-center justify-center text-3xl font-black shadow-md border-4 border-white/20 mb-3">
              {profileUser.avatar}
            </div>
            <h2 className="text-xl font-bold text-center tracking-tight">{profileUser.nome}</h2>
            <span className="bg-teal-900/50 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mt-2 border border-teal-500/30">
              {profileUser.role === 'aluno' ? 'Aluno / Residente' : profileUser.role === 'professor' ? 'Professor' : 'Administrador'}
            </span>
          </div>

          <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-slate-50">
            {editProfileData ? (
              <form onSubmit={saveProfile} className="space-y-5">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Biografia Acadêmica</label>
                  <textarea 
                    value={editProfileData.bio} 
                    onChange={e => setEditProfileData({...editProfileData, bio: e.target.value})} 
                    placeholder="Escreva sobre sua formação e especialidades..." 
                    className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none h-24 bg-white transition-shadow shadow-sm"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">E-mail Institucional</label>
                    <input 
                      type="email" 
                      value={editProfileData.email} 
                      onChange={e => setEditProfileData({...editProfileData, email: e.target.value})} 
                      className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white transition-shadow shadow-sm" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Telefone Comercial</label>
                    <input 
                      type="text" 
                      value={editProfileData.phone} 
                      onChange={e => setEditProfileData({...editProfileData, phone: e.target.value})} 
                      placeholder="(XX) XXXXX-XXXX" 
                      className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white transition-shadow shadow-sm" 
                    />
                  </div>
                </div>

                <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="pr-4">
                    <strong className="block text-sm text-teal-900 mb-0.5">Visibilidade de Contato</strong>
                    <span className="text-xs text-teal-700 block leading-tight">Se ativada, todos os alunos poderão ver seu telefone e e-mail.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input 
                      type="checkbox" 
                      checked={editProfileData.showContactPublicly} 
                      onChange={e => setEditProfileData({...editProfileData, showContactPublicly: e.target.checked})} 
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
                
                <div className="flex gap-3 justify-end pt-5 border-t border-slate-200 mt-6">
                  <button 
                    type="button" 
                    onClick={() => setEditProfileData(null)} 
                    className="px-5 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="bg-teal-800 text-white font-semibold px-6 py-2 rounded-lg hover:bg-teal-900 transition shadow-sm flex items-center gap-2 text-sm"
                  >
                    <Check className="w-4 h-4"/> Salvar Perfil 
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4"/> Biografia
                  </h3>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    {profileUser.bio || <span className="italic text-slate-400">Nenhuma biografia registrada.</span>}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4"/> Contato
                  </h3>
                  {canSeePrivate ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4 hover:border-teal-300 transition">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Mail className="w-5 h-5"/>
                        </div>
                        <div className="overflow-hidden">
                          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">E-mail Institucional</span>
                          <span className="font-semibold text-slate-800 text-sm truncate block">{profileUser.email || 'Não informado'}</span>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4 hover:border-teal-300 transition">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <Phone className="w-5 h-5"/>
                        </div>
                        <div className="overflow-hidden">
                          <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Telefone / WhatsApp</span>
                          <span className="font-semibold text-slate-800 text-sm truncate block">{profileUser.phone || 'Não informado'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-100 text-slate-500 p-5 rounded-xl text-center text-sm border border-slate-200 font-medium">
                      O usuário optou por manter suas informações de contato privadas.
                    </div>
                  )}
                </div>

                {isMe && (
                  <div className="pt-6 border-t border-slate-200 flex justify-center mt-6">
                    <button 
                      onClick={startEditingProfile} 
                      className="bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-slate-900 transition-all shadow-md flex items-center gap-2 text-sm"
                    >
                      <Edit2 className="w-4 h-4"/> Editar Meu Perfil
                    </button>
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
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-6 print:hidden">
        <div className="bg-white md:rounded-2xl shadow-2xl w-full h-full md:h-[90vh] max-w-4xl overflow-hidden animate-fade-in flex flex-col border border-slate-200">
          
          <div className="p-5 md:p-6 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 shadow-sm z-10 relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl hidden sm:flex items-center justify-center shadow-inner">
                <AlignLeft className="w-6 h-6"/>
              </div>
              <div>
                <h2 className="font-bold text-xl text-slate-800 tracking-tight leading-none mb-1">{readingItem.title}</h2>
                <p className="text-xs text-amber-600 font-semibold uppercase tracking-widest">Leitura da Disciplina</p>
              </div>
            </div>
            <button 
              onClick={() => setReadingItem(null)} 
              className="p-2.5 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5"/>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-10 relative">
            <div className="max-w-3xl mx-auto bg-white p-6 md:p-12 rounded-2xl shadow-sm border border-slate-200 relative z-10">
              <div 
                className="prose prose-slate max-w-none text-slate-800 leading-relaxed" 
                dangerouslySetInnerHTML={{ __html: readingItem.textContent }}
              ></div>
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
      
      const newTopic = { 
        id: `topic_${Date.now()}`, 
        title: title, 
        description: desc, 
        authorId: currentUser.id, 
        authorName: currentUser.nome, 
        avatar: currentUser.avatar, 
        createdAt: new Date().toISOString(), 
        replies: [] 
      };
      
      setDbForums({ 
        ...forums, 
        [activeForumItem.id]: [...forumData, newTopic] 
      });
      
      e.target.reset();
    };

    const handleReplyTopic = (e) => {
      e.preventDefault();
      const text = e.target.elements.reply.value;
      if(!text) return;
      
      const newReply = { 
        id: `rep_${Date.now()}`, 
        text: text, 
        authorId: currentUser.id, 
        authorName: currentUser.nome, 
        avatar: currentUser.avatar, 
        createdAt: new Date().toISOString() 
      };
      
      const updatedTopics = forumData.map((t) => {
        if (t.id === activeTopicId) {
          return { ...t, replies: [...(t.replies || []), newReply] };
        }
        return t;
      });
      
      setDbForums({ ...forums, [activeForumItem.id]: updatedTopics });
      e.target.reset();
      
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 print:hidden">
        <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden animate-fade-in flex flex-col border border-slate-200">
          
          <div className="p-5 border-b border-purple-800 flex justify-between items-center bg-purple-900 text-white shrink-0 shadow-md relative z-20">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-800 rounded-lg flex items-center justify-center shadow-inner">
                <MessageCircle className="w-5 h-5 text-purple-200"/>
              </div>
              <div>
                <h2 className="font-bold text-lg leading-none mb-1">{activeForumItem.title}</h2>
                <p className="text-[10px] text-purple-300 uppercase tracking-widest font-semibold">Fórum de Dúvidas e Discussões</p>
              </div>
            </div>
            <button 
              onClick={() => { setActiveForumItem(null); setActiveTopicId(null); }} 
              className="p-2 text-purple-200 hover:bg-purple-800 hover:text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6"/>
            </button>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            {!activeTopicId ? (
              
              <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 relative">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600"/> Abrir Novo Tópico
                  </h3>
                  <form onSubmit={handleCreateTopic} className="space-y-4">
                    <input 
                      name="title" 
                      required 
                      placeholder="Qual a sua dúvida ou tema de discussão?" 
                      className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white transition-colors" 
                    />
                    <textarea 
                      name="desc" 
                      required 
                      placeholder="Forneça os detalhes para que os colegas e professores possam colaborar..." 
                      className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none h-24 bg-slate-50 focus:bg-white transition-colors"
                    ></textarea>
                    <button 
                      type="submit" 
                      className="bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-purple-800 transition shadow-sm text-sm flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4"/> Criar Tópico
                    </button>
                  </form>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-slate-400 uppercase tracking-widest text-xs mb-4 border-b border-slate-200 pb-2">Tópicos Recentes</h3>
                  
                  {forumData.length === 0 ? (
                    <div className="text-center p-12 text-slate-500 font-medium bg-white rounded-xl border border-dashed border-slate-300 text-sm">
                      <MessageCircle className="w-10 h-10 mx-auto mb-3 text-slate-300"/>
                      Nenhum tópico criado ainda. Seja o primeiro a participar!
                    </div>
                  ) : (
                    forumData.map((topic) => (
                      <div 
                        key={topic.id} 
                        onClick={() => setActiveTopicId(topic.id)} 
                        className="bg-white p-5 border border-slate-200 rounded-xl hover:border-purple-400 hover:shadow-md cursor-pointer transition-all flex items-center gap-4 group"
                      >
                        <div 
                          onClick={(e) => {e.stopPropagation(); setViewingProfileId(topic.authorId)}} 
                          className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold shrink-0 border border-slate-200 hover:border-purple-500 hover:text-purple-700 transition cursor-pointer"
                        >
                          {topic.avatar}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-base group-hover:text-purple-700 transition mb-0.5">{topic.title}</h4>
                          <p className="text-xs text-slate-500">
                            Por <strong className="text-slate-700 hover:text-purple-700 cursor-pointer transition" onClick={(e) => {e.stopPropagation(); setViewingProfileId(topic.authorId)}}>{topic.authorName}</strong> em {new Date(topic.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-center shrink-0 bg-purple-50 px-4 py-2 rounded-lg border border-purple-100 group-hover:bg-purple-100 transition">
                          <span className="block font-bold text-purple-800 text-lg leading-none">{(topic.replies || []).length}</span>
                          <span className="text-[9px] uppercase font-bold text-purple-500 tracking-wider">Respostas</span>
                        </div>
                        <div className="shrink-0 pl-1">
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition"/>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              
              <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
                
                <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex items-center gap-4 shadow-sm z-10">
                  <button 
                    onClick={() => setActiveTopicId(null)} 
                    className="p-2 bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-800 rounded-lg font-bold transition flex items-center gap-1 text-xs"
                  >
                    <ChevronRight className="w-4 h-4 rotate-180"/> Voltar
                  </button>
                  <h3 className="font-bold text-lg text-slate-800 truncate pr-4">{currentTopicData?.title}</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 relative">
                  
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600"></div>
                    <div className="flex items-center gap-4 mb-4 border-b border-slate-100 pb-4">
                      <div 
                        onClick={() => setViewingProfileId(currentTopicData?.authorId)} 
                        className="cursor-pointer w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold border border-slate-200 hover:border-purple-500 hover:text-purple-800 transition"
                      >
                        {currentTopicData?.avatar}
                      </div>
                      <div>
                        <p 
                          onClick={() => setViewingProfileId(currentTopicData?.authorId)} 
                          className="font-bold text-slate-800 text-sm cursor-pointer hover:text-purple-700 transition"
                        >
                          {currentTopicData?.authorName}
                        </p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                          {new Date(currentTopicData?.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed pl-1">
                      {currentTopicData?.description}
                    </p>
                  </div>

                  <div className="space-y-4 pl-3 md:pl-10 border-l-2 border-slate-200 ml-3 md:ml-6">
                    {(currentTopicData?.replies || []).map((reply, idx) => (
                      <div key={reply.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm relative hover:border-slate-300 transition">
                        <div className="absolute -left-9 md:-left-16 top-6 w-9 md:w-16 border-t-2 border-slate-200"></div>
                        
                        <div className="flex justify-between items-start mb-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div 
                              onClick={() => setViewingProfileId(reply.authorId)} 
                              className="cursor-pointer w-8 h-8 rounded-full bg-white text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200 hover:border-purple-500 transition shadow-sm"
                            >
                              {reply.avatar}
                            </div>
                            <div>
                              <p 
                                onClick={() => setViewingProfileId(reply.authorId)} 
                                className="font-bold text-slate-800 text-xs cursor-pointer hover:text-purple-700 transition"
                              >
                                {reply.authorName}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{new Date(reply.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-slate-400 bg-white px-2 py-0.5 rounded border border-slate-100">
                            #{idx + 1}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed pl-1">
                          {reply.text}
                        </p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                <div className="p-5 md:p-6 bg-white border-t border-slate-200 shrink-0">
                  <form onSubmit={handleReplyTopic} className="flex flex-col sm:flex-row gap-3 max-w-4xl mx-auto">
                    <textarea 
                      name="reply" 
                      required 
                      placeholder="Escreva sua resposta..." 
                      className="flex-1 border border-slate-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none h-16 bg-slate-50 focus:bg-white transition-shadow"
                    ></textarea>
                    <button 
                      type="submit" 
                      className="bg-purple-700 text-white font-semibold px-6 rounded-xl hover:bg-purple-800 transition shadow-sm flex items-center justify-center gap-2 text-sm sm:w-auto w-full shrink-0"
                    >
                      <Send className="w-4 h-4"/> Enviar
                    </button>
                  </form>
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
      const newQuestion = { 
        id: `q_${Date.now()}_${Math.random()}`, 
        title: 'Nova Pergunta', 
        options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'], 
        correctIndex: 0 
      };
      setLocalQuestions([...localQuestions, newQuestion]);
    };

    const handleUpdateQuestion = (idx, field, val) => { 
      const updatedQs = [...localQuestions]; 
      updatedQs[idx] = { ...updatedQs[idx], [field]: val };
      setLocalQuestions(updatedQs); 
    };

    const handleUpdateOption = (qIdx, oIdx, val) => { 
      const updatedQs = [...localQuestions]; 
      const newOptions = [...updatedQs[qIdx].options];
      newOptions[oIdx] = val;
      updatedQs[qIdx] = { ...updatedQs[qIdx], options: newOptions };
      setLocalQuestions(updatedQs); 
    };

    const handleSaveExam = () => { 
      setDbExams({ 
        ...exams, 
        [activeExamItem.id]: { ...examData, questions: localQuestions } 
      }); 
      setActiveExamItem(null); 
      setLocalQuestions([]); 
      alert("Avaliação salva e publicada com sucesso!"); 
    };

    const handleCloseExam = () => { 
      setActiveExamItem(null); 
      setLocalQuestions([]); 
    };

    const isInstructor = role === 'admin' || role === 'professor';

    if (isEditing && isInstructor) {
      return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 print:hidden">
          <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden animate-fade-in flex flex-col border border-slate-200">
            
            <div className="p-5 border-b border-rose-800 flex justify-between items-center bg-rose-700 text-white shrink-0 shadow-sm relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-rose-600 rounded-lg flex items-center justify-center border border-rose-500">
                  <ClipboardList className="w-5 h-5 text-white"/>
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-none mb-1">Configurar Avaliação: {activeExamItem.title}</h2>
                  <p className="text-[10px] text-rose-200 uppercase tracking-widest font-semibold">Modo do Professor</p>
                </div>
              </div>
              <button 
                onClick={handleCloseExam} 
                className="p-2 hover:bg-rose-800 rounded-full transition-colors bg-rose-600 border border-rose-500"
                title="Cancelar"
              >
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 relative bg-slate-50">
              
              <div className="bg-white border border-slate-200 p-5 rounded-xl flex items-center gap-4 text-slate-600 shadow-sm">
                <Info className="w-6 h-6 shrink-0 text-rose-500" />
                <p className="text-sm">As questões adicionadas serão salvas e disponibilizadas para a turma. Marque o gabarito correto na coluna da esquerda.</p>
              </div>

              {localQuestions.map((q, qIndex) => (
                <div key={q.id} className="bg-white p-6 md:p-8 border border-slate-200 rounded-xl shadow-sm relative group hover:border-rose-300 transition-colors">
                  <button 
                    onClick={() => setLocalQuestions(localQuestions.filter((_, i) => i !== qIndex))} 
                    className="absolute top-5 right-5 text-slate-400 hover:text-white hover:bg-red-500 p-1.5 rounded-lg transition-all" 
                    title="Excluir Questão"
                  >
                    <Trash2 className="w-5 h-5"/>
                  </button>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-8 h-8 bg-slate-100 text-slate-500 flex items-center justify-center rounded-full font-bold border border-slate-200 text-sm">
                      {qIndex + 1}
                    </span>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enunciado da Questão</label>
                  </div>
                  
                  <input 
                    type="text" 
                    value={q.title} 
                    onChange={e => handleUpdateQuestion(qIndex, 'title', e.target.value)} 
                    placeholder="Digite a pergunta..." 
                    className="w-full border border-slate-200 p-3 rounded-lg text-base font-semibold text-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 outline-none mb-6 transition-shadow bg-slate-50 focus:bg-white shadow-inner" 
                  />
                  
                  <div className="space-y-3 pl-2 md:pl-10">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Alternativas</label>
                    {q.options.map((opt, oIndex) => (
                      <div 
                        key={oIndex} 
                        className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                          q.correctIndex === oIndex 
                            ? 'border-emerald-500 bg-emerald-50' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center pl-2 w-12">
                          <input 
                            type="radio" 
                            name={`correct_${q.id}`} 
                            checked={q.correctIndex === oIndex} 
                            onChange={() => handleUpdateQuestion(qIndex, 'correctIndex', oIndex)} 
                            className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </div>
                        <input 
                          type="text" 
                          value={opt} 
                          onChange={e => handleUpdateOption(qIndex, oIndex, e.target.value)} 
                          className={`flex-1 bg-transparent p-2 text-sm outline-none font-medium rounded-md transition-colors ${
                            q.correctIndex === oIndex ? 'text-emerald-900' : 'text-slate-600 focus:bg-slate-100'
                          }`} 
                          placeholder={`Opção ${String.fromCharCode(65 + oIndex)}`} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <button 
                onClick={handleAddQuestion} 
                className="w-full border-2 border-dashed border-rose-300 text-rose-600 font-bold p-5 rounded-xl hover:bg-rose-50 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-5 h-5"/> Adicionar Questão
              </button>

              <div className="mt-10 border-t border-slate-200 pt-8">
                <h3 className="font-bold text-lg text-slate-800 mb-5 flex items-center gap-3">
                  <BarChart className="w-5 h-5 text-rose-600"/> Resultados dos Alunos
                </h3>
                
                {Object.keys(examData.submissions || {}).length === 0 ? (
                  <div className="text-center bg-white p-8 rounded-xl border border-slate-200 shadow-sm text-sm text-slate-500">
                    Nenhum aluno realizou esta avaliação ainda.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(examData.submissions).map(([studentId, sub]) => (
                      <div key={studentId} className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:border-teal-300 transition">
                        <div className="flex items-center gap-4">
                           <div 
                             onClick={() => setViewingProfileId(studentId)} 
                             className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200 cursor-pointer hover:border-teal-500 transition"
                           >
                             {systemUsers[studentId]?.avatar || '?'}
                           </div>
                           <div>
                             <span 
                               onClick={() => setViewingProfileId(studentId)} 
                               className="block font-bold text-slate-800 text-sm cursor-pointer hover:text-teal-700 transition"
                             >
                               {systemUsers[studentId]?.nome || 'Aluno Removido'}
                             </span>
                             <span className="text-[10px] text-slate-400 mt-0.5 block">
                               {new Date(sub.submittedAt).toLocaleString()}
                             </span>
                           </div>
                        </div>
                        <div className="text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <span className="block font-black text-rose-600 text-xl leading-none mb-0.5">{sub.score}</span>
                          <span className="text-[9px] text-slate-400 uppercase font-bold">Média</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 bg-white border-t border-slate-200 shrink-0 flex justify-end gap-3 shadow-sm z-10">
              <button 
                onClick={handleCloseExam} 
                className="px-5 py-2.5 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveExam} 
                className="bg-rose-700 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-rose-800 transition shadow-sm flex items-center gap-2 text-sm"
              >
                <Check className="w-4 h-4"/> Salvar e Publicar
              </button>
            </div>
          </div>
        </div>
      );
    }

    const mySubmission = examData.submissions[currentUser.id];
    
    const handleSumbitExam = (e) => {
      e.preventDefault();
      
      if(examData.questions.length === 0) {
        return alert("Esta avaliação ainda não possui questões configuradas pelo professor.");
      }
      
      const formData = new FormData(e.target);
      let score = 0; 
      const answers = [];
      
      examData.questions.forEach((q, index) => {
        const selectedOption = parseInt(formData.get(`q_${index}`));
        answers.push(selectedOption);
        
        if (selectedOption === q.correctIndex) {
          score++;
        }
      });
      
      const finalScore = ((score / examData.questions.length) * 10).toFixed(1);
      
      const updatedSubmissions = { 
        ...examData.submissions, 
        [currentUser.id]: { 
          score: finalScore, 
          answers: answers, 
          submittedAt: new Date().toISOString() 
        } 
      };
      
      setDbExams({ 
        ...exams, 
        [activeExamItem.id]: { ...examData, submissions: updatedSubmissions } 
      });
      
      alert(`Avaliação enviada com sucesso! Sua nota final: ${finalScore}`);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 print:hidden">
        <div className="bg-slate-50 sm:rounded-2xl shadow-2xl w-full h-full sm:h-auto max-w-3xl sm:max-h-[90vh] overflow-hidden animate-fade-in flex flex-col border border-slate-200">
          
          <div className="p-5 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-lg hidden sm:flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-rose-600"/>
              </div>
              <div>
                <h2 className="font-bold text-xl text-slate-800 tracking-tight leading-none mb-1">{activeExamItem.title}</h2>
                <p className="text-[10px] text-rose-600 uppercase tracking-widest font-bold">Avaliação Oficial</p>
              </div>
            </div>
            <button 
              onClick={handleCloseExam} 
              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
            >
              <X className="w-5 h-5"/>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 sm:p-8 relative bg-slate-50">

            {mySubmission ? (
              
              <div className="text-center bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-sm max-w-sm mx-auto mt-8 relative z-10">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-emerald-100">
                  <CheckCircle className="w-10 h-10 text-emerald-500"/>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Avaliação Concluída</h3>
                <p className="text-slate-500 text-sm mb-6">
                  Suas respostas foram gravadas com sucesso no sistema.
                </p>
                <div className="inline-block bg-slate-50 p-6 rounded-xl border border-slate-200 w-full">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Nota Obtida</span>
                  <span className="text-4xl font-black text-emerald-600">{mySubmission.score}</span>
                </div>
              </div>

            ) : (
              
              <form onSubmit={handleSumbitExam} className="space-y-6 max-w-2xl mx-auto pb-8 relative z-10">
                {examData.questions.length === 0 ? (
                  
                  <div className="text-center text-slate-500 bg-white p-10 rounded-xl border border-dashed border-slate-300 shadow-sm text-sm">
                    Esta avaliação ainda não possui questões configuradas.
                  </div>
                  
                ) : (
                  <>
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-sm font-medium mb-6 flex gap-4 items-center">
                      <Shield className="w-6 h-6 text-amber-500 shrink-0"/>
                      <span>
                        <strong>Atenção:</strong> Revise suas respostas antes de enviar. Após a submissão, não será possível realizar alterações em seu teste.
                      </span>
                    </div>
                    
                    {examData.questions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-white p-6 sm:p-8 border border-slate-200 rounded-xl shadow-sm">
                        
                        <div className="flex gap-4 items-start mb-5">
                          <span className="w-8 h-8 shrink-0 bg-slate-100 text-slate-600 flex items-center justify-center rounded-lg font-bold text-sm border border-slate-200">
                            {qIndex + 1}
                          </span>
                          <h4 className="font-semibold text-slate-800 text-base pt-1">
                            {q.title}
                          </h4>
                        </div>
                        
                        <div className="space-y-3 pl-0 sm:pl-12">
                          {q.options.map((opt, oIndex) => (
                            <label 
                              key={oIndex} 
                              className="flex items-start gap-3 p-4 border border-slate-100 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all has-[:checked]:bg-rose-50 has-[:checked]:border-rose-500"
                            >
                              <div className="pt-0.5">
                                <input 
                                  type="radio" 
                                  required 
                                  name={`q_${qIndex}`} 
                                  value={oIndex} 
                                  className="w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
                                />
                              </div>
                              <span className="text-sm font-medium text-slate-700">
                                {opt}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-8 flex justify-center">
                      <button 
                        type="submit" 
                        className="bg-rose-700 text-white font-bold px-8 py-3 rounded-lg hover:bg-rose-800 transition-all shadow-md text-base flex items-center gap-2 w-full sm:w-auto justify-center"
                      >
                        <Check className="w-5 h-5"/> Enviar Respostas
                      </button>
                    </div>
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
  // RENDERIZAÇÕES DOS DASHBOARDS CENTRAIS
  // ============================================================================
  
  const renderUserHome = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center border border-teal-100 shrink-0">
          <Home className="w-6 h-6"/>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Página Inicial, {currentUser.nome.split(' ')[0]}</h2>
          <p className="text-sm text-slate-500">Acesse as disciplinas em que você está matriculado(a).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCourses.length === 0 ? (
          <div className="col-span-full text-center p-12 border border-dashed border-slate-300 rounded-2xl bg-white text-slate-500 shadow-sm">
            <Book className="w-10 h-10 mx-auto mb-3 text-slate-300"/>
            <p className="font-bold text-lg text-slate-700">Sem Vínculos de Turma</p>
            <p className="text-sm">Você ainda não possui disciplinas ativas neste semestre.</p>
          </div>
        ) : (
          visibleCourses.map(c => {
            if(!c) return null;
            return (
              <div 
                key={c.id} 
                onClick={() => { setActiveCourseId(c.id); setCurrentView('course_home'); }} 
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between h-full group"
              >
                <div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-100 uppercase tracking-widest">
                    {c.codigo}
                  </span>
                  <h3 className="font-bold text-slate-800 mt-3 group-hover:text-teal-700 transition-colors text-lg leading-snug">
                    {c.nome}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2">
                    Prof. Responsável: <strong className="text-slate-700">{systemUsers[c.professorId]?.nome || 'Não definido'}</strong>
                  </p>
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-teal-700 text-sm font-semibold">
                  Acessar Sala <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderAdminDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center border border-teal-100 shrink-0">
          <Shield className="w-6 h-6"/>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Gestão Acadêmica e Cursos</h2>
          <p className="text-sm text-slate-500">Crie disciplinas e gerencie o catálogo de cursos da instituição.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-base">
            <Book className="w-5 h-5 text-teal-600"/> Cadastrar Nova Disciplina
          </h3>
          <form onSubmit={handleCreateCourse} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Código da Disciplina</label>
              <input 
                type="text" 
                required 
                value={newCourseCode} 
                onChange={e => setNewCourseCode(e.target.value)} 
                placeholder="Ex: BIO101" 
                className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Nome da Disciplina</label>
              <input 
                type="text" 
                required 
                value={newCourseName} 
                onChange={e => setNewCourseName(e.target.value)} 
                placeholder="Ex: Saúde Coletiva" 
                className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Professor Responsável</label>
              <select 
                required 
                value={newCourseProfId} 
                onChange={e => setNewCourseProfId(e.target.value)} 
                className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-slate-50 focus:bg-white cursor-pointer"
              >
                <option value="">Selecione na lista...</option>
                {Object.values(systemUsers)
                  .filter(u => u && u.role === 'professor')
                  .map(p => (
                    <option key={p.id} value={p.id}>{p.nome}</option>
                  ))
                }
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full bg-teal-800 text-white font-semibold p-3 rounded-lg hover:bg-teal-900 transition shadow-sm text-sm flex items-center justify-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4"/> Criar Disciplina
            </button>
          </form>
        </div>
        
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-base">
            <Layout className="w-5 h-5 text-blue-600"/> Matriz Curricular
          </h3>
          
          {courses.length === 0 ? (
            <div className="text-center p-10 border border-dashed border-slate-300 rounded-xl bg-slate-50 text-slate-500 text-sm">
              Nenhuma disciplina cadastrada no sistema.
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map(c => {
                if(!c) return null;
                const totalAlunos = Array.isArray(courseStudents[c.id]) ? courseStudents[c.id].length : 0;
                
                return (
                  <div 
                    key={c.id} 
                    className="p-4 border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-sm transition-all bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded uppercase tracking-wider">
                          {c.codigo}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold tracking-wider">
                          • {totalAlunos} alunos
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-base">{c.nome}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Prof: <strong className="text-slate-700 hover:text-teal-700 cursor-pointer transition-colors" onClick={() => setViewingProfileId(c.professorId)}>
                          {systemUsers[c.professorId]?.nome || 'Não definido'}
                        </strong>
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => { setActiveCourseId(c.id); setCurrentView('participants'); }} 
                        className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-50 hover:text-teal-600 flex items-center gap-1.5 transition"
                      >
                        <Layout className="w-4 h-4"/> Acessar
                      </button>
                      <button 
                        onClick={() => handleDeleteCourse(c.id)} 
                        className="bg-white border border-red-100 text-red-500 px-3 py-2 rounded-lg text-xs hover:bg-red-50 transition"
                        title="Excluir disciplina"
                      >
                        <Trash2 className="w-4 h-4"/>
                      </button>
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
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-xl flex items-center justify-center border border-purple-100 shrink-0">
          <Users className="w-6 h-6"/>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Gestão de Usuários e Perfis</h2>
          <p className="text-sm text-slate-500">Cadastre novos alunos e professores ou edite os perfis existentes no sistema.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2 text-base">
            <UserPlus className="w-5 h-5 text-purple-600"/> Cadastrar Novo Usuário
          </h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Nome Completo</label>
              <input 
                type="text" 
                required 
                value={newUserName} 
                onChange={e => setNewUserName(e.target.value)} 
                placeholder="Ex: Mariana Alves" 
                className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">E-mail Institucional</label>
              <input 
                type="email" 
                required 
                value={newUserEmail} 
                onChange={e => setNewUserEmail(e.target.value)} 
                placeholder="email@instituicao.edu.br" 
                className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white" 
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1.5">Perfil de Acesso</label>
              <select 
                required 
                value={newUserRole} 
                onChange={e => setNewUserRole(e.target.value)} 
                className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none bg-slate-50 focus:bg-white cursor-pointer"
              >
                <option value="aluno">Aluno / Residente</option>
                <option value="professor">Professor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <button 
              type="submit" 
              className="w-full bg-purple-800 text-white font-semibold p-3 rounded-lg hover:bg-purple-900 transition shadow-sm text-sm flex items-center justify-center gap-2 mt-2"
            >
              <Plus className="w-4 h-4"/> Salvar Cadastro
            </button>
          </form>
        </div>
        
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-slate-600"/> Tabela de Usuários Ativos
          </h3>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-200">
                <tr>
                  <th className="p-4">Usuário (Nome e E-mail)</th>
                  <th className="p-4 text-center border-x border-slate-200">Perfil de Acesso</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {Object.values(systemUsers).map(u => {
                  if(!u) return null;
                  const isEditingThisUser = editingUserId === u.id;
                  
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="p-4 text-slate-800">
                        <div className="flex items-center gap-3">
                          <div 
                            onClick={() => setViewingProfileId(u.id)} 
                            className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200 cursor-pointer hover:border-purple-500 hover:text-purple-700 transition"
                          >
                            {u.avatar}
                          </div>
                          
                          {isEditingThisUser ? (
                            <input 
                              type="text" 
                              value={editingUserName} 
                              onChange={e => setEditingUserName(e.target.value)} 
                              className="border border-purple-300 px-3 py-1.5 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none w-full max-w-xs text-sm"
                              autoFocus 
                            />
                          ) : (
                            <div className="flex flex-col">
                              <span 
                                onClick={() => setViewingProfileId(u.id)} 
                                className="cursor-pointer font-bold hover:text-purple-700 transition"
                              >
                                {u.nome}
                              </span>
                              <span className="text-xs text-slate-500 mt-0.5">
                                {u.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4 text-center border-x border-slate-100">
                        <span className={`text-[10px] px-3 py-1 rounded-md font-bold uppercase tracking-wider border ${
                          u.role === 'admin' 
                            ? 'bg-slate-800 text-white border-slate-900' 
                            : u.role === 'professor' 
                              ? 'bg-blue-50 text-blue-700 border-blue-200' 
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}>
                          {u.role === 'admin' ? 'Administrador' : u.role}
                        </span>
                      </td>
                      
                      <td className="p-4 text-right whitespace-nowrap">
                        {isEditingThisUser ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleSaveEditedUser(u.id)} className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 p-1.5 rounded transition" title="Salvar"><Check className="w-4 h-4"/></button>
                            <button onClick={handleCancelEditUser} className="text-slate-500 bg-slate-100 hover:bg-slate-200 border border-slate-200 p-1.5 rounded transition" title="Cancelar"><X className="w-4 h-4"/></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleStartEditUser(u)} className="text-slate-400 hover:text-purple-600 bg-slate-50 hover:bg-purple-50 p-2 rounded transition border border-transparent hover:border-purple-200" title="Editar"><Edit2 className="w-4 h-4"/></button>
                            {u.id !== 'admin1' && u.id !== currentUser.id && (
                              <button onClick={() => handleDeleteUser(u.id)} className="text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 p-2 rounded transition border border-transparent hover:border-red-200" title="Excluir"><Trash2 className="w-4 h-4"/></button>
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
    <div className="space-y-6 animate-fade-in">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-xl flex items-center justify-center border border-blue-100 shrink-0">
          <Users className="w-6 h-6"/>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Participantes da Disciplina</h2>
          <p className="text-sm text-slate-500">Visualize e gerencie os alunos matriculados nesta turma.</p>
        </div>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-base">
            <UserPlus className="w-5 h-5 text-teal-600"/> Matricular Aluno
          </h3>
          <form onSubmit={(e) => handleEnrollStudent(e, activeCourseId)} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <select 
              required 
              value={newStudentId} 
              onChange={e => setNewStudentId(e.target.value)} 
              className="flex-1 border border-slate-300 p-3 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none bg-white text-slate-700 cursor-pointer"
            >
              <option value="">Selecione um aluno disponível...</option>
              {availableStudentsForEnrollment.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
            </select>
            <button 
              type="submit" 
              className="bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg hover:bg-teal-800 transition flex items-center justify-center gap-2 text-sm shrink-0"
            >
              <Plus className="w-4 h-4"/> Matricular
            </button>
          </form>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold text-xs border-b border-slate-200">
            <tr>
              <th className="p-4">Nome do Aluno</th>
              <th className="p-4 text-center border-x border-slate-200">Situação</th>
              {isEditing && <th className="p-4 text-right print:hidden">Ações</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {studentsInCourse.length === 0 ? (
              <tr>
                <td colSpan={isEditing ? 3 : 2} className="p-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="w-10 h-10 text-slate-300 mb-3" />
                    <span className="text-base font-bold text-slate-700">Nenhum aluno matriculado na disciplina.</span>
                  </div>
                </td>
              </tr>
            ) : (
              studentsInCourse.map(s => {
                if(!s) return null;
                return (
                  <tr key={s.studentId} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-semibold text-slate-800 flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200 cursor-pointer hover:border-teal-500 hover:text-teal-700 transition" 
                        onClick={() => setViewingProfileId(s.studentId)}
                      >
                        {systemUsers[s.studentId]?.avatar || '??'}
                      </div>
                      <span 
                        className="cursor-pointer hover:text-teal-700 transition" 
                        onClick={() => setViewingProfileId(s.studentId)}
                      >
                        {s.nome}
                      </span>
                    </td>
                    <td className="p-4 text-center border-x border-slate-100">
                      <span className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] px-3 py-1 rounded-md font-bold uppercase tracking-widest">
                        Ativo
                      </span>
                    </td>
                    {isEditing && (
                      <td className="p-4 text-right print:hidden">
                        <button 
                          onClick={() => deleteStudent(s.studentId)} 
                          className="text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-red-200" 
                          title="Remover Matrícula"
                        >
                          <Trash2 className="w-4 h-4 inline"/>
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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in print:shadow-none print:border-none">
      
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:bg-white print:border-b-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0 print:hidden">
            <BarChart className="w-5 h-5"/>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 tracking-tight mb-0.5">Boletim de Notas</h3>
            <p className="text-xs text-slate-500 print:hidden">Visualização e lançamento das notas dos alunos.</p>
          </div>
        </div>
        
        {(role === 'professor' || role === 'admin') && (
          <button 
            onClick={() => window.print()} 
            className="bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-900 transition-all print:hidden shadow-sm"
          >
            <Printer className="w-4 h-4"/> Imprimir
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse bg-white">
          <thead>
            <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 print:bg-slate-100 font-bold uppercase tracking-wider text-[10px]">
              <th className="p-4 w-1/4">Nome do Aluno</th>
              <th className="p-4 border-x border-slate-200 text-center">Nota GA</th>
              <th className="p-4 border-x border-slate-200 text-center">Nota GB</th>
              <th className="p-4 border-x border-slate-200 text-center">Nota GC</th>
              <th className="p-4 bg-teal-50 border-x border-teal-100 text-teal-800 text-center">Média Final</th>
              <th className="p-4 border-x border-slate-200 text-center">Situação</th>
              <th className="p-4">Feedback do Professor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleGradesAndAttendance.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-12 text-center text-slate-500 text-sm">
                  Nenhum aluno matriculado para apuração de notas.
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
                  <tr key={aluno.studentId} className={`hover:bg-slate-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}>
                    <td className="p-4 font-semibold text-slate-800 border-r border-slate-100 flex items-center gap-3">
                       <div 
                         className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200 print:hidden cursor-pointer" 
                         onClick={() => setViewingProfileId(aluno.studentId)}
                       >
                         {systemUsers[aluno.studentId]?.avatar || '??'}
                       </div>
                       <span 
                         className="cursor-pointer hover:text-teal-600 transition" 
                         onClick={() => setViewingProfileId(aluno.studentId)}
                       >
                         {aluno.nome}
                       </span>
                    </td>
                    
                    <td className="p-3 border-r border-slate-100 text-center">
                      {isEditing ? (
                        <input 
                          type="number" 
                          step="0.1" 
                          value={aluno.ga === 0 && !aluno.ga_touched ? '' : aluno.ga} 
                          onChange={(e) => updateGrade(aluno.studentId, 'ga', e.target.value)} 
                          className="w-16 text-center border border-slate-300 p-2 rounded-lg font-bold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none transition-shadow text-sm" 
                        />
                      ) : (
                        <span className="font-bold text-slate-700">{valGA.toFixed(1)}</span>
                      )}
                    </td>
                    
                    <td className="p-3 border-r border-slate-100 text-center">
                      {isEditing ? (
                        <input 
                          type="number" 
                          step="0.1" 
                          value={aluno.gb === 0 && !aluno.gb_touched ? '' : aluno.gb} 
                          onChange={(e) => updateGrade(aluno.studentId, 'gb', e.target.value)} 
                          className="w-16 text-center border border-slate-300 p-2 rounded-lg font-bold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none transition-shadow text-sm" 
                        />
                      ) : (
                        <span className="font-bold text-slate-700">{valGB.toFixed(1)}</span>
                      )}
                    </td>
                    
                    <td className="p-3 border-r border-slate-100 text-center">
                      {isEditing ? (
                        <input 
                          type="number" 
                          step="0.1" 
                          value={aluno.gc === 0 && !aluno.gc_touched ? '' : aluno.gc} 
                          onChange={(e) => updateGrade(aluno.studentId, 'gc', e.target.value)} 
                          className="w-16 text-center border border-slate-300 p-2 rounded-lg font-bold text-slate-800 focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none transition-shadow text-sm" 
                        />
                      ) : (
                        <span className="font-bold text-slate-700">{valGC.toFixed(1)}</span>
                      )}
                    </td>
                    
                    <td className="p-4 border-r border-slate-100 text-center font-bold bg-teal-50/30 text-teal-800 text-base">
                      {total}
                    </td>
                    
                    <td className="p-4 border-r border-slate-100 text-center">
                      <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${
                        isApproved 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        {isApproved ? 'Aprovado' : 'Em Exame'}
                      </span>
                    </td>
                    
                    <td className="p-3">
                      {isEditing ? (
                        <textarea 
                          value={aluno.feedback||''} 
                          onChange={(e) => updateFeedback(aluno.studentId, e.target.value)} 
                          placeholder="Adicione um comentário..." 
                          className="w-full border border-slate-300 p-2.5 rounded-lg text-xs focus:border-teal-500 outline-none resize-none h-12" 
                        ></textarea>
                      ) : (
                        <p className="text-xs text-slate-600 leading-relaxed italic">
                          {aluno.feedback || "-"}
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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fade-in print:shadow-none print:border-none">
      
      <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50 print:bg-white print:border-b-2">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 border border-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0 print:hidden">
            <CheckSquare className="w-5 h-5"/>
          </div>
          <div>
            <h3 className="font-bold text-lg text-slate-800 tracking-tight mb-0.5">Diário de Frequência</h3>
            <p className="text-xs text-slate-500 print:hidden">
              Marque a caixa para registrar presença. Desmarque para registrar falta.
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          {isEditing && (
            <button 
              onClick={handleAddAttendanceCol} 
              className="bg-white text-slate-600 border border-slate-300 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition-all print:hidden shadow-sm"
            >
              <Plus className="w-4 h-4"/> Registrar Nova Aula
            </button>
          )}
          <button 
            onClick={() => window.print()} 
            className="bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-slate-900 transition-all print:hidden shadow-sm"
          >
            <Printer className="w-4 h-4"/> Imprimir Frequência
          </button>
        </div>
      </div>

      <div className="overflow-x-auto relative">
        <table className="w-full text-left text-sm border-collapse bg-white table-fixed">
          <thead>
            <tr className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <th rowSpan="2" className="p-4 border-r border-slate-200 w-64 sticky left-0 z-10 bg-slate-100 shadow-[1px_0_2px_rgba(0,0,0,0.05)] print:shadow-none">Nome do Aluno</th>
              <th rowSpan="2" className="p-4 border-r border-slate-200 text-center w-28 bg-slate-100">Total de Faltas</th>
              
              {currentAttendanceCols.length > 0 ? (
                <th colSpan={currentAttendanceCols.length} className="p-3 border-b border-slate-200 text-center bg-slate-50">
                  Aulas Registradas no Semestre
                </th>
              ) : (
                <th rowSpan="2" className="p-4 text-center text-slate-400 italic bg-white border-b border-slate-200 font-normal text-xs">
                  Nenhuma aula registrada ainda.
                </th>
              )}
            </tr>
            
            {currentAttendanceCols.length > 0 && (
              <tr className="bg-white text-slate-500 text-center text-[10px] font-bold uppercase border-b border-slate-200">
                {currentAttendanceCols.map((col, index) => (
                  <th key={col.id} className="p-3 border-r border-slate-100 relative group w-20 min-w-[80px] bg-slate-50 align-middle">
                    <div className="whitespace-nowrap">{col.label}</div>
                    {isEditing && (
                      <button 
                        onClick={() => handleRemoveAttendanceCol(index)} 
                        className="absolute top-1 right-1 text-slate-300 hover:text-red-500 rounded p-1 opacity-0 group-hover:opacity-100 transition-all print:hidden" 
                        title="Remover Aula"
                      >
                        <X className="w-3 h-3"/>
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
                <td colSpan={2 + currentAttendanceCols.length} className="p-12 text-center text-slate-500 text-sm">
                  Nenhum aluno matriculado na disciplina.
                </td>
              </tr>
            ) : (
              visibleGradesAndAttendance.map((aluno) => {
                if(!aluno) return null;
                
                const faltasArray = aluno.faltas || new Array(currentAttendanceCols.length).fill(false);
                const qtdeFaltas = faltasArray.filter(f => f).length;
                
                return (
                  <tr key={aluno.studentId} className="hover:bg-slate-50 print:border-b print:border-slate-300 transition-colors group">
                    <td className="p-3 border-r border-slate-100 font-semibold text-slate-800 flex items-center gap-3 sticky left-0 z-10 bg-white group-hover:bg-slate-50 transition-colors shadow-[1px_0_2px_rgba(0,0,0,0.02)] print:shadow-none">
                      <div 
                        className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-200 print:hidden cursor-pointer" 
                        onClick={() => setViewingProfileId(aluno.studentId)}
                      >
                        {systemUsers[aluno.studentId]?.avatar || '??'}
                      </div>
                      <span 
                        className="text-sm cursor-pointer hover:text-teal-600 transition truncate max-w-[150px]" 
                        onClick={() => setViewingProfileId(aluno.studentId)}
                      >
                        {aluno.nome}
                      </span>
                    </td>
                    
                    <td className="p-3 border-r border-slate-100 text-center">
                      <span className={`font-bold text-sm ${qtdeFaltas > 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        {qtdeFaltas}
                      </span>
                    </td>
                    
                    {currentAttendanceCols.map((col, i) => {
                      const isFalta = faltasArray[i];
                      
                      return (
                        <td 
                          key={col.id} 
                          className={`p-0 border-r border-slate-100 text-center transition-all h-12 w-20 ${
                            isEditing ? 'cursor-pointer hover:opacity-80' : ''
                          } ${
                            isFalta 
                              ? 'bg-red-50 hover:bg-red-100' 
                              : 'bg-white hover:bg-slate-50'
                          }`} 
                          onClick={() => isEditing && toggleAttendance(aluno.studentId, i)}
                        >
                          {/* VISÃO DIGITAL */}
                          <div className="print:hidden w-full h-full flex items-center justify-center">
                            <input 
                              type="checkbox" 
                              checked={!isFalta} 
                              readOnly 
                              className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 pointer-events-none" 
                            />
                          </div>
                          
                          {/* VISÃO IMPRESSÃO PDF */}
                          <div className="hidden print:flex w-full h-full items-center justify-center font-bold text-sm text-slate-800">
                            {isFalta ? 'F' : 'P'}
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
  // ESTRUTURA GLOBAL DA PLATAFORMA GERAL (A "CASCA" SHELL DO APLICATIVO WEB)
  // ============================================================================
  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-slate-800 overflow-hidden print:bg-white print:h-auto print:overflow-visible">
      
      {/* ------------------------------------------------------------- */}
      {/* NAVEGAÇÃO LATERAL (SIDEBAR) */}
      {/* ------------------------------------------------------------- */}
      <aside 
        className={`${sidebarOpen ? 'w-[280px]' : 'w-[80px]'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col flex-shrink-0 shadow-xl z-20 relative print:hidden border-r border-slate-800`}
      >
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800 bg-slate-900">
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-black text-white text-xl tracking-tight leading-none mb-1">
                Portal <span className="text-teal-500">COREMU</span>
              </span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all hover:text-white outline-none"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 no-scrollbar relative">
          <nav className="space-y-2 px-4">
            
            {role === 'admin' && (
              <div className="mb-6">
                <button 
                  onClick={() => {setCurrentView('admin_dashboard'); setActiveCourseId(null); setEditMode(false);}} 
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition-all ${currentView === 'admin_dashboard' ? 'bg-teal-900/50 text-teal-400' : 'hover:bg-slate-800 text-slate-400'}`}
                >
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Gestão Acadêmica</span>}
                </button>
                <button 
                  onClick={() => {setCurrentView('admin_users'); setActiveCourseId(null); setEditMode(false);}} 
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition-all mt-1 ${currentView === 'admin_users' ? 'bg-teal-900/50 text-teal-400' : 'hover:bg-slate-800 text-slate-400'}`}
                >
                  <Users className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Diretório de Usuários</span>}
                </button>
              </div>
            )}

            {(role === 'professor' || role === 'aluno') && (
              <button 
                onClick={() => {setCurrentView('user_home'); setActiveCourseId(null); setEditMode(false);}} 
                className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-semibold transition-all ${currentView === 'user_home' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <Home className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>Página Inicial</span>}
              </button>
            )}

            {sidebarOpen && (
              <div className="mt-8 mb-3 px-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Minhas Disciplinas Ativas</div>
              </div>
            )}
            
            {visibleCourses.length === 0 ? (
              <div className="px-4 text-xs text-slate-500 mt-2">
                Nenhuma disciplina vinculada.
              </div>
            ) : (
              visibleCourses.map((c) => {
                if(!c) return null;
                const isCourseActive = activeCourseId === c.id && ['course_home', 'participants', 'grades', 'attendance'].includes(currentView);
                
                return (
                  <div key={c.id} className="mb-2">
                    <button 
                      onClick={() => {setActiveCourseId(c.id); setCurrentView('course_home'); setEditMode(false);}} 
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-all ${
                        isCourseActive 
                          ? 'bg-teal-600 text-white font-semibold' 
                          : 'text-slate-400 font-medium hover:bg-slate-800 hover:text-white'
                      }`} 
                    >
                      <Book className={`w-4 h-4 flex-shrink-0 ${isCourseActive ? 'text-white' : 'text-slate-500'}`} />
                      {sidebarOpen && <span className="truncate block w-full text-left">{c.nome}</span>}
                    </button>
                    
                    {isCourseActive && sidebarOpen && (
                      <div className="ml-5 pl-4 border-l border-slate-700 mt-2 space-y-1 mb-4">
                        <button 
                          onClick={() => setCurrentView('course_home')} 
                          className={`w-full flex items-center gap-2 p-2 rounded-md text-xs font-semibold transition-all ${currentView === 'course_home' ? 'text-teal-400 bg-slate-800' : 'hover:bg-slate-800 text-slate-400'}`}
                        >
                          <Layout className="w-3.5 h-3.5 flex-shrink-0" /> Sala de Aula Virtual
                        </button>
                        <button 
                          onClick={() => setCurrentView('participants')} 
                          className={`w-full flex items-center gap-2 p-2 rounded-md text-xs font-semibold transition-all ${currentView === 'participants' ? 'text-teal-400 bg-slate-800' : 'hover:bg-slate-800 text-slate-400'}`}
                        >
                          <Users className="w-3.5 h-3.5 flex-shrink-0" /> Participantes
                        </button>
                        <button 
                          onClick={() => setCurrentView('grades')} 
                          className={`w-full flex items-center gap-2 p-2 rounded-md text-xs font-semibold transition-all ${currentView === 'grades' ? 'text-teal-400 bg-slate-800' : 'hover:bg-slate-800 text-slate-400'}`}
                        >
                          <BarChart className="w-3.5 h-3.5 flex-shrink-0" /> Boletim de Notas
                        </button>
                        <button 
                          onClick={() => setCurrentView('attendance')} 
                          className={`w-full flex items-center gap-2 p-2 rounded-md text-xs font-semibold transition-all ${currentView === 'attendance' ? 'text-teal-400 bg-slate-800' : 'hover:bg-slate-800 text-slate-400'}`}
                        >
                          <CheckSquare className="w-3.5 h-3.5 flex-shrink-0" /> Diário de Frequência
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </nav>
        </div>

        {/* LOGOUT */}
        {sidebarOpen && (
          <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
            <button 
              onClick={handleLogout} 
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-semibold p-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Sair do Sistema
            </button>
          </div>
        )}
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* ÁREA CENTRAL DE CONTEÚDO E HEADER DA PLATAFORMA */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative print:overflow-visible bg-[#f8f9fa]">
        
        {/* CABEÇALHO SUPERIOR HORIZONTAL */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 shadow-sm z-10 print:hidden shrink-0 relative">
          
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden sm:flex items-center gap-3">
              <div className="bg-teal-50 p-1.5 rounded-lg border border-teal-100">
                <Book className="w-5 h-5 text-teal-700"/>
              </div>
              <div className="flex flex-col">
                <span className="text-slate-800 font-bold text-lg tracking-tight leading-none">
                  Portal Acadêmico | LMS Enterprise
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            
            {/* NOTIFICAÇÕES FUNCIONAIS (POPOVER) */}
            <div className="relative">
              <div 
                onClick={() => setShowNotifications(!showNotifications)} 
                className="flex p-2 bg-slate-50 border border-slate-200 rounded-full text-slate-400 hover:text-teal-600 hover:bg-teal-50 cursor-pointer transition-colors relative"
              >
                <Bell className="w-5 h-5"/>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </div>
              
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden animate-fade-in">
                  <div className="p-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Avisos Recentes</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4"/></button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center shrink-0"><CheckCircle className="w-4 h-4 text-teal-600"/></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">Bem-vindo(a) ao Portal Acadêmico</p>
                        <p className="text-xs text-slate-500 leading-snug">Seu ambiente virtual foi configurado e liberado com sucesso.</p>
                      </div>
                    </div>
                    <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center shrink-0"><Bell className="w-4 h-4 text-blue-600"/></div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 mb-0.5">Módulo de Notificações Ativo</p>
                        <p className="text-xs text-slate-500 leading-snug">A partir de agora você receberá avisos da instituição por aqui.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2 text-center bg-slate-50 border-t border-slate-100 cursor-pointer hover:bg-slate-100" onClick={() => setShowNotifications(false)}>
                    <span className="text-xs font-bold text-teal-600">Ocultar painel</span>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

            {/* Avatar do Usuário */}
            <div 
              onClick={() => setViewingProfileId(currentUser.id)} 
              className="flex items-center gap-3 p-1.5 pl-3 hover:bg-slate-50 rounded-full transition-all cursor-pointer border border-transparent hover:border-slate-200 group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-teal-700 transition-colors">
                  {currentUser.nome}
                </p>
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest">
                  {role === 'aluno' ? 'Aluno / Residente' : role === 'professor' ? 'Professor' : 'Administrador'}
                </p>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-800 text-white flex items-center justify-center text-sm font-bold shadow-sm group-hover:bg-teal-700 transition-colors">
                {currentUser.avatar}
              </div>
            </div>

          </div>
        </header>

        {/* ------------------------------------------------------------- */}
        {/* MIOLO CENTRAL: ONDE AS TELAS SÃO RENDERIZADAS PELO ROTEADOR */}
        {/* ------------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 relative">
          
          <div className="max-w-[1200px] mx-auto pb-20">
            
            {/* ROTAS GLOBAIS FORA DA DISCIPLINA */}
            {currentView === 'user_home' && renderUserHome()}
            {currentView === 'admin_dashboard' && renderAdminDashboard()}
            {currentView === 'admin_users' && renderAdminUsers()}
            
            {/* RENDERIZAÇÃO DA DISCIPLINA ATIVA */}
            {activeCourseId && ['course_home', 'participants', 'grades', 'attendance'].includes(currentView) && (
              <div className="animate-fade-in">
                
                {/* CABEÇALHO DA DISCIPLINA */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 mt-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                  
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-teal-500"></div>

                  <div className="flex-1 z-10 relative pl-2">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={activeCourseObj?.nome || ''} 
                        onChange={(e) => updateCourseDetails('nome', e.target.value)} 
                        placeholder="Nome da Disciplina..." 
                        className="w-full text-2xl font-bold text-slate-900 tracking-tight bg-transparent border-b-2 border-dashed border-teal-200 focus:border-teal-500 focus:outline-none mb-3 pb-1" 
                      />
                    ) : (
                      <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-3">
                        {activeCourseObj?.nome}
                      </h1>
                    )}
                    
                    {isEditing ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 w-fit">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase">Código:</span>
                          <input 
                            type="text" 
                            value={activeCourseObj?.codigo || ''} 
                            onChange={(e) => updateCourseDetails('codigo', e.target.value)} 
                            className="w-32 text-sm text-teal-800 font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-300 focus:border-teal-500 outline-none" 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1 rounded-md uppercase tracking-wider border border-teal-100">
                          {activeCourseObj?.codigo}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">
                          Professor: <strong className="text-slate-700">{systemUsers[activeCourseObj?.professorId]?.nome}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {hasEditPermission && (
                    <div className="flex items-center bg-slate-50 border border-slate-200 p-1.5 rounded-xl shrink-0 print:hidden z-10 relative">
                      <div className="px-3 hidden sm:flex flex-col justify-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Permissão</span>
                        <span className="text-xs font-bold text-slate-700 leading-none">Modo de Edição</span>
                      </div>
                      <button 
                        onClick={() => setEditMode(!editMode)} 
                        className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          editMode 
                            ? 'bg-rose-600 text-white shadow-md' 
                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {editMode ? <ToggleRight className="w-5 h-5 mr-2"/> : <ToggleLeft className="w-5 h-5 mr-2 opacity-50"/>}
                        {editMode ? 'ATIVADO' : 'INATIVO'}
                      </button>
                    </div>
                  )}
                </div>

                {hasEditPermission && editMode && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl mb-6 text-sm flex gap-4 print:hidden items-center">
                    <Shield className="w-6 h-6 shrink-0"/>
                    <p>O Modo de Edição está LIGADO. Você pode modificar, excluir e construir materiais. <strong>Desligue este modo para visualizar a página como aluno e testar Fóruns e Avaliações.</strong></p>
                  </div>
                )}

                {/* BREADCRUMB */}
                <div className="flex items-center text-xs text-slate-500 mb-6 bg-white p-4 rounded-xl border border-slate-200 print:hidden">
                  <Home className="w-3.5 h-3.5 mr-2 opacity-70"/>
                  <span className="hover:text-slate-800 transition-colors cursor-pointer" onClick={() => setCurrentView('user_home')}>Plataforma</span>
                  <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
                  <span className="font-semibold text-teal-700">{activeCourseObj?.codigo}</span>
                  <ChevronRight className="w-3.5 h-3.5 mx-2 text-slate-300" />
                  <span className="text-slate-700 font-bold uppercase tracking-wider">
                    {
                      currentView === 'course_home' ? 'Painel da Disciplina' : 
                      currentView === 'grades' ? 'Boletim de Notas' : 
                      currentView === 'participants' ? 'Lista de Alunos' : 
                      'Diário de Frequência'
                    }
                  </span>
                </div>

                {/* SWITCHER DAS TELAS INTERNAS */}
                <div className="relative">
                  {currentView === 'course_home' && renderCourseHome()}
                  {currentView === 'participants' && renderParticipants()}
                  {currentView === 'grades' && renderGradebook()}
                  {currentView === 'attendance' && renderAttendance()}
                </div>
              </div>
            )}
            
            {/* MODAIS GLOBAIS */}
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

export default function App() {
  return (
    <ErrorBoundary>
      <LmsEnterprisePortal />
    </ErrorBoundary>
  );
}
