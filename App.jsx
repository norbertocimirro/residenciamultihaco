import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; 
import { 
  Menu, Bell, Search, Home, Book, Calendar, BarChart, 
  ChevronDown, ChevronRight, Plus, FileText, 
  MessageSquare, Folder, CheckCircle, Upload, Download,
  ToggleLeft, ToggleRight, Layout, GripVertical, Trash2,
  Shield, UserPlus, CheckSquare, X, Link, Paperclip, Users, 
  Edit2, Check, Loader2, Printer, AlignLeft, ClipboardList, Send, MessageCircle, Info, Phone, Mail, LogOut, Lock
} from 'lucide-react';

// ==========================================
// 1. CREDENCIAIS DO FIREBASE (PORTAL COREMU)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAwRjc9QUmF4quqYOvt-Z187Mlv5rQnHXE",
  authDomain: "residenciamultihaco.firebaseapp.com",
  projectId: "residenciamultihaco",
  storageBucket: "residenciamultihaco.firebasestorage.app",
  messagingSenderId: "1089100227489",
  appId: "1:1089100227489:web:3b0102e76b25f2c9e8a1e0"
};

let app, db, storage;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  storage = getStorage(app);
} catch (e) {
  console.error("Erro inicializando Firebase", e);
}

// ==========================================
// 2. ESCUDO CONTRA TELA BRANCA
// ==========================================
class ErrorBoundary extends React.Component {
  constructor(props) { 
    super(props); 
    this.state = { hasError: false, error: null }; 
  }
  static getDerivedStateFromError(error) { 
    return { hasError: true, error }; 
  }
  componentDidCatch(error, info) { 
    console.error("Erro interceptado:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 h-screen overflow-auto font-sans">
          <h1 className="text-3xl font-black text-red-700 mb-4">🚨 Erro Crítico Interceptado</h1>
          <p className="text-slate-700 mb-4">O sistema evitou uma tela branca. Detalhes técnicos:</p>
          <pre className="bg-white p-4 border border-red-200 rounded-xl text-xs text-red-600 whitespace-pre-wrap">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==========================================
// 3. HOOK DE SINCRONIZAÇÃO EM TEMPO REAL
// ==========================================
const useFirestoreDB = (docName, initialValue) => {
  const [data, setData] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!db) { setIsLoaded(true); return; }
    const unsub = onSnapshot(doc(db, 'coremu_database', docName), 
      (docSnap) => {
        if (docSnap.exists()) {
          setData(docSnap.data().value || initialValue);
        } else {
          setDoc(doc(db, 'coremu_database', docName), { value: initialValue }).catch(console.error);
          setData(initialValue);
        }
        setIsLoaded(true);
      },
      (error) => {
        console.error(`Erro de leitura na nuvem [${docName}]:`, error);
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
      try { await setDoc(doc(db, 'coremu_database', docName), { value: valToSave }); } 
      catch (error) { console.error("Falha ao gravar na nuvem:", error); }
    }
  };

  return [data, updateData, isLoaded];
};

const quillModules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
    ['link', 'image', 'video'],
    ['clean']
  ],
};

// ==========================================
// 4. COMPONENTE PRINCIPAL (COREMU PORTAL)
// ==========================================
function LmsEnterprisePortal() {
  
  // ----------------------------------------
  // BANCO DE DADOS EM NUVEM
  // ----------------------------------------
  const [dbUsers, setDbUsers, usersLoaded] = useFirestoreDB('tb_users_V2', {
    'admin1': { id: 'admin1', nome: 'Gestão COREMU', role: 'admin', avatar: 'GC', email: 'gestao@haco.mil.br', phone: '(51) 3333-4444', bio: 'Gestão Geral do Programa de Residência Multiprofissional.', showContactPublicly: true },
    'prof1': { id: 'prof1', nome: '1º Ten Norberto Cimirro', role: 'professor', avatar: 'NC', email: 'norberto@haco.mil.br', phone: '(51) 99999-9999', bio: 'Enfermeiro da Força Aérea Brasileira. Pós-graduado em Gestão de Saúde, Auditoria e Enfermagem Aeroespacial.', showContactPublicly: true },
    'stu1': { id: 'stu1', nome: 'Mariana Alves', role: 'aluno', avatar: 'MA', email: 'mariana@teste.com', phone: '(51) 98888-8888', bio: 'Residente R1.', showContactPublicly: false }
  });
  
  const [dbCourses, setDbCourses, coursesLoaded] = useFirestoreDB('tb_courses', [
    { id: 'c1', codigo: '001/003/07A', nome: 'Enfermagem Forense e Saúde da Família', professorId: 'prof1' }
  ]);
  
  const defaultModules = [{
    id: 'boas_vindas', title: 'Mural de Boas-vindas e Orientações', bgColor: 'bg-blue-50/50', borderColor: 'border-blue-100',
    items: [{ id: 'i1', title: 'Plano de Ensino 2026', type: 'FileText', color: 'text-red-500', fileName: 'Plano_de_Ensino_2026.pdf', url: null }]
  }];
  
  const [dbContents, setDbContents, contentsLoaded] = useFirestoreDB('tb_contents', { 'c1': defaultModules });
  const [dbStudents, setDbStudents, studentsLoaded] = useFirestoreDB('tb_enrollments', { 'c1': [{ studentId: 'stu1', ga: 8.6, gb: 7.4, gc: 0, faltas: [], feedback: "Ótimo desempenho clínico." }] });
  const [dbAttendanceCols, setDbAttendanceCols, colsLoaded] = useFirestoreDB('tb_attendance_cols', { 'c1': [] });
  const [dbForums, setDbForums, forumsLoaded] = useFirestoreDB('tb_forums_v3', {});
  const [dbExams, setDbExams, examsLoaded] = useFirestoreDB('tb_exams_v1', {});

  // Blindagem de Variáveis
  const systemUsers = typeof dbUsers === 'object' && dbUsers !== null ? dbUsers : {};
  const courses = Array.isArray(dbCourses) ? dbCourses : [];
  const courseContents = typeof dbContents === 'object' && dbContents !== null ? dbContents : {};
  const courseStudents = typeof dbStudents === 'object' && dbStudents !== null ? dbStudents : {};
  const attendanceCols = typeof dbAttendanceCols === 'object' && dbAttendanceCols !== null ? dbAttendanceCols : {};
  const forums = typeof dbForums === 'object' && dbForums !== null ? dbForums : {};
  const exams = typeof dbExams === 'object' && dbExams !== null ? dbExams : {};

  // ----------------------------------------
  // SISTEMA DE LOGIN E SESSÃO
  // ----------------------------------------
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginEmailInput, setLoginEmailInput] = useState('');
  
  const [activeUserId, setActiveUserId] = useState(null);
  const currentUser = systemUsers[activeUserId] || {};
  const role = currentUser?.role || 'aluno';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('user_home'); 
  const [editMode, setEditMode] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  const hasEditPermission = role === 'admin' || role === 'professor';
  const isEditing = editMode && hasEditPermission;

  // ----------------------------------------
  // ESTADOS DOS MODAIS GERAIS
  // ----------------------------------------
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

  // ----------------------------------------
  // ESTADOS DOS MÓDULOS AVA E PERFIL
  // ----------------------------------------
  const [readingItem, setReadingItem] = useState(null); 
  const [activeForumItem, setActiveForumItem] = useState(null); 
  const [activeTopicId, setActiveTopicId] = useState(null); 
  const [activeExamItem, setActiveExamItem] = useState(null); 
  const [localQuestions, setLocalQuestions] = useState([]);
  
  const [viewingProfileId, setViewingProfileId] = useState(null);
  const [editProfileData, setEditProfileData] = useState(null);

  const chatEndRef = useRef(null); 

  // Verificação de Prontidão
  const isDbReady = usersLoaded && coursesLoaded && contentsLoaded && studentsLoaded && colsLoaded && forumsLoaded && examsLoaded;
  
  if (!isDbReady) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 flex-col font-sans">
        <Loader2 className="w-16 h-16 text-teal-600 animate-spin mb-6" />
        <h2 className="text-2xl font-black text-slate-800">Sincronizando com a Nuvem</h2>
        <p className="text-base text-slate-500 mt-2">Iniciando Ambiente Virtual de Aprendizagem COREMU...</p>
      </div>
    );
  }

  // ========================================
  // LÓGICA DE LOGIN (ROTEAMENTO)
  // ========================================
  const handleLogin = (e) => {
    e.preventDefault();
    const userFound = Object.values(systemUsers).find(u => u?.email?.toLowerCase() === loginEmailInput.toLowerCase().trim());
    
    if (userFound) {
      setActiveUserId(userFound.id);
      setIsLoggedIn(true);
      setCurrentView(userFound.role === 'admin' ? 'admin_dashboard' : 'user_home');
    } else {
      alert("E-mail não encontrado na base de dados. Procure a Gestão do COREMU.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveUserId(null);
    setActiveCourseId(null);
    setLoginEmailInput('');
  };

  // Se não estiver logado, exibe apenas a tela de Login
  if (!isLoggedIn) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 font-sans p-4 relative overflow-hidden">
        {/* Efeitos de Fundo */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>

        <div className="bg-white p-10 md:p-12 rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100 shadow-inner">
              <Shield className="w-10 h-10 text-teal-700"/>
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-800 text-center tracking-tight mb-2">Portal COREMU</h1>
          <p className="text-sm text-slate-500 text-center mb-8 font-medium">Acesso ao Ambiente Virtual de Aprendizagem</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">E-mail Institucional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  value={loginEmailInput} 
                  onChange={e => setLoginEmailInput(e.target.value)} 
                  placeholder="seu.email@exemplo.com" 
                  className="w-full border border-slate-300 p-4 pl-12 rounded-xl text-base focus:ring-2 focus:ring-teal-500 outline-none transition-shadow bg-slate-50 focus:bg-white" 
                />
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs flex gap-3">
              <Lock className="w-5 h-5 shrink-0 text-amber-500"/>
              <p>O acesso inicial não exige senha. Insira um dos e-mails de teste para simular o nível de acesso:<br/><br/>
              • <strong>gestao@haco.mil.br</strong> (Admin)<br/>
              • <strong>norberto@haco.mil.br</strong> (Prof)<br/>
              • <strong>mariana@teste.com</strong> (Aluno)
              </p>
            </div>

            <button type="submit" className="w-full bg-teal-800 text-white font-black p-4 rounded-xl hover:bg-teal-900 transition shadow-lg text-lg flex items-center justify-center gap-2">
              Entrar no Portal <ChevronRight className="w-5 h-5"/>
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------
  // LÓGICA DE NAVEGAÇÃO E REGRAS DE ACESSO
  // ----------------------------------------
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

  // ----------------------------------------
  // FUNÇÕES DE USUÁRIOS E DIRETÓRIO
  // ----------------------------------------
  const handleCreateUser = (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;
    
    // Verifica se e-mail já existe
    const emailExists = Object.values(systemUsers).some(u => u?.email?.toLowerCase() === newUserEmail.toLowerCase());
    if (emailExists) {
      return alert("Este e-mail já está cadastrado no sistema.");
    }

    const newId = `usr_${Date.now()}`;
    const initials = newUserName.substring(0, 2).toUpperCase();
    
    setDbUsers({ 
      ...systemUsers, 
      [newId]: { 
        id: newId, 
        nome: newUserName, 
        role: newUserRole, 
        avatar: initials, 
        email: newUserEmail.toLowerCase().trim(), 
        phone: '', 
        bio: '', 
        showContactPublicly: false 
      } 
    });
    setNewUserName('');
    setNewUserEmail('');
    alert('Usuário cadastrado! Ele já pode fazer login com este e-mail.');
  };

  const handleDeleteUser = (id) => {
    if (id === 'admin1' || id === currentUser.id) return alert('Você não pode excluir este usuário.');
    if (window.confirm('Deseja excluir este usuário permanentemente?')) {
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

  const handleCancelEditUser = () => {
    setEditingUserId(null);
    setEditingUserName('');
  };

  // ----------------------------------------
  // FUNÇÕES DE DISCIPLINAS E MATRÍCULAS
  // ----------------------------------------
  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseCode || !newCourseName || !newCourseProfId) return;
    const newId = `c_${Date.now()}`;
    setDbCourses([...courses, { id: newId, codigo: newCourseCode, nome: newCourseName, professorId: newCourseProfId }]);
    setDbContents({ ...courseContents, [newId]: defaultModules });
    setDbStudents({ ...courseStudents, [newId]: [] });
    setDbAttendanceCols({ ...attendanceCols, [newId]: [] }); 
    setNewCourseCode(''); setNewCourseName(''); setNewCourseProfId('');
    alert('Disciplina criada com sucesso!');
  };

  const handleDeleteCourse = (id) => {
    if (window.confirm('Atenção: Excluir esta disciplina apagará todo o conteúdo para sempre. Confirmar?')) {
      setDbCourses(courses.filter(c => c && c.id !== id));
      if (activeCourseId === id) { setActiveCourseId(null); setCurrentView('admin_dashboard'); }
    }
  };

  const updateCourseDetails = (field, value) => {
    setDbCourses(courses.map(c => c?.id === activeCourseId ? { ...c, [field]: value } : c));
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
    if (window.confirm('Remover a matrícula deste residente na disciplina?')) {
      const filteredStudents = (courseStudents[activeCourseId] || []).filter(s => s?.studentId !== studentId);
      setDbStudents({ ...courseStudents, [activeCourseId]: filteredStudents });
    }
  };

  // ----------------------------------------
  // GESTÃO DE MÓDULOS E CONTEÚDOS
  // ----------------------------------------
  const toggleModule = (id) => {
    setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const updateContent = (newContent) => {
    setDbContents({ ...courseContents, [activeCourseId]: newContent });
  };

  const addSection = () => {
    const newSection = { id: `sec_${Date.now()}`, title: 'Novo Módulo / Semestre', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', items: [] };
    updateContent([...activeContent, newSection]);
    setExpandedModules(prev => ({ ...prev, [newSection.id]: true }));
  };

  const updateSectionTitle = (id, newTitle) => {
    updateContent(activeContent.map(sec => sec?.id === id ? { ...sec, title: newTitle } : sec));
  };

  const deleteSection = (id) => {
    if (window.confirm('Deseja excluir este módulo inteiro?')) {
      updateContent(activeContent.filter(sec => sec?.id !== id));
    }
  };

  const updateItemTitle = (sectionId, itemId, newTitle) => {
    updateContent(activeContent.map(sec => {
      if (sec?.id === sectionId) {
        return { ...sec, items: (sec.items || []).map(item => item?.id === itemId ? { ...item, title: newTitle } : item) };
      }
      return sec;
    }));
  };

  const deleteItem = (sectionId, itemId) => {
    if (window.confirm('Apagar este material definitivamente?')) {
      updateContent(activeContent.map(sec => {
        if (sec?.id === sectionId) {
          return { ...sec, items: (sec.items || []).filter(item => item?.id !== itemId) };
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

  // ----------------------------------------
  // UPLOAD E PUBLICAÇÃO
  // ----------------------------------------
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

    // Upload Físico de Arquivos
    if ((newItemType === 'FileText' || newItemType === 'Upload') && newFile) {
      setIsUploading(true);
      try {
        const fileRef = ref(storage, `arquivos_coremu/${Date.now()}_${newFile.name}`);
        await uploadBytes(fileRef, newFile);
        finalUrl = await getDownloadURL(fileRef);
      } catch (err) {
        alert("Erro no Upload! Verifique as regras do Storage no Firebase.");
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

    updateContent(activeContent.map(sec => {
      if (sec?.id === activeSectionForNewItem) {
        return {
          ...sec,
          items: [...(sec.items || []), { 
            id: finalItemId, 
            title: newItemTitle, 
            type: newItemType, 
            color: color, 
            url: finalUrl, 
            fileName: finalFileName, 
            textContent: newItemType === 'TextContent' ? newItemTextContent : null
          }]
        };
      }
      return sec;
    }));
    
    setActiveSectionForNewItem(null); 
  };

  // ----------------------------------------
  // NOTAS E FREQUÊNCIA
  // ----------------------------------------
  const updateGrade = (studentId, field, value) => {
    const updatedStudents = (courseStudents[activeCourseId] || []).map(s => {
      if (s?.studentId === studentId) return { ...s, [field]: parseFloat(value) || 0 };
      return s;
    });
    setDbStudents({ ...courseStudents, [activeCourseId]: updatedStudents });
  };

  const updateFeedback = (studentId, value) => {
    const updatedStudents = (courseStudents[activeCourseId] || []).map(s => {
      if (s?.studentId === studentId) return { ...s, feedback: value };
      return s;
    });
    setDbStudents({ ...courseStudents, [activeCourseId]: updatedStudents });
  };

  const toggleAttendance = (studentId, index) => {
    const updatedStudents = (courseStudents[activeCourseId] || []).map(s => {
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
    const label = prompt("Digite a data e horário da aula (Ex: 15/09 - 08:00):");
    if (!label) return;
    
    const currentCols = attendanceCols[activeCourseId] || [];
    const newCols = [...currentCols, { id: `col_${Date.now()}`, label }];
    setDbAttendanceCols({ ...attendanceCols, [activeCourseId]: newCols });
    
    const updatedStudents = (courseStudents[activeCourseId] || []).map(s => ({
      ...s, faltas: [...(s.faltas || []), false] 
    }));
    setDbStudents({ ...courseStudents, [activeCourseId]: updatedStudents });
  };

  const handleRemoveAttendanceCol = (colIndex) => {
    if (!window.confirm('Deseja excluir esta aula do diário? A ação é irreversível.')) return;
    
    const currentCols = attendanceCols[activeCourseId] || [];
    const newCols = currentCols.filter((_, i) => i !== colIndex);
    setDbAttendanceCols({ ...attendanceCols, [activeCourseId]: newCols });
    
    const updatedStudents = (courseStudents[activeCourseId] || []).map(s => {
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

  // Variáveis Derivadas Prontas para Uso na Disciplina Ativa
  const activeContent = Array.isArray(courseContents[activeCourseId]) ? courseContents[activeCourseId] : [];
  const rawActiveStudents = Array.isArray(courseStudents[activeCourseId]) ? courseStudents[activeCourseId] : [];
  const currentAttendanceCols = attendanceCols[activeCourseId] || [];
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

  // ==========================================
  // RENDER: PÁGINA DE LEITURA (TEXT CONTENT)
  // ==========================================
  const renderReadingModal = () => {
    if (!readingItem) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-8 print:hidden">
        <div className="bg-white md:rounded-3xl shadow-2xl w-full h-full md:h-[95vh] max-w-5xl overflow-hidden animate-fade-in flex flex-col">
          <div className="p-5 md:p-6 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl hidden sm:flex items-center justify-center"><AlignLeft className="w-6 h-6"/></div>
              <div>
                <h2 className="font-black text-2xl text-slate-800 tracking-tight">{readingItem.title}</h2>
                <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mt-1">Leitura Oficial da Disciplina</p>
              </div>
            </div>
            <button onClick={() => setReadingItem(null)} className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-full transition-colors"><X className="w-6 h-6"/></button>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12">
            <div className="max-w-3xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-slate-200">
              <div className="prose prose-slate prose-lg md:prose-xl max-w-none text-slate-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: readingItem.textContent }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  };


  // ==========================================
  // RENDER: PERFIL DE USUÁRIO
  // ==========================================
  const renderProfileModal = () => {
    const profileUser = systemUsers[viewingProfileId];
    if (!profileUser) return null;

    const isMe = viewingProfileId === currentUser.id;
    // O Administrador e o Professor podem ver tudo. Alunos só veem se for público.
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
          
          <div className="bg-gradient-to-r from-teal-800 to-teal-600 p-8 pt-10 text-white relative flex flex-col items-center shrink-0">
            <button onClick={() => {setViewingProfileId(null); setEditProfileData(null);}} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"><X className="w-5 h-5"/></button>
            <div className="w-24 h-24 bg-white text-teal-800 rounded-full flex items-center justify-center text-4xl font-black shadow-lg border-4 border-white/20 mb-4">
              {profileUser.avatar}
            </div>
            <h2 className="text-2xl font-black text-center">{profileUser.nome}</h2>
            <span className="bg-teal-900/50 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mt-2 border border-teal-500/30">
              {profileUser.role === 'aluno' ? 'Residente' : profileUser.role === 'professor' ? 'Docente / Preceptor' : 'Gestão'}
            </span>
          </div>

          <div className="p-8 overflow-y-auto flex-1 bg-slate-50">
            {editProfileData ? (
              <form onSubmit={saveProfile} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Sua Biografia e Formação Acadêmica</label>
                  <textarea value={editProfileData.bio} onChange={e => setEditProfileData({...editProfileData, bio: e.target.value})} placeholder="Escreva sobre sua especialidade..." className="w-full border border-slate-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none h-24 bg-white"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">E-mail de Contato</label>
                    <input type="email" value={editProfileData.email} onChange={e => setEditProfileData({...editProfileData, email: e.target.value})} placeholder="seu.email@exemplo.com" className="w-full border border-slate-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Telefone / WhatsApp</label>
                    <input type="text" value={editProfileData.phone} onChange={e => setEditProfileData({...editProfileData, phone: e.target.value})} placeholder="(XX) XXXXX-XXXX" className="w-full border border-slate-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none bg-white" />
                  </div>
                </div>
                <div className="bg-teal-50 border border-teal-200 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <strong className="block text-sm text-teal-900">Visibilidade Pública de Contatos</strong>
                    <span className="text-xs text-teal-700 block mt-0.5">Se ativo, alunos verão seu email e telefone publicamente.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={editProfileData.showContactPublicly} onChange={e => setEditProfileData({...editProfileData, showContactPublicly: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                  <button type="button" onClick={() => setEditProfileData(null)} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-200 transition">Cancelar</button>
                  <button type="submit" className="bg-teal-800 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-teal-900 transition shadow-md flex items-center gap-2"><Check className="w-4 h-4"/> Salvar Alterações</button>
                </div>
              </form>
            ) : (
              <div className="space-y-8">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Info className="w-4 h-4"/> Sobre o Profissional</h3>
                  <p className="text-slate-700 text-base leading-relaxed whitespace-pre-wrap bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    {profileUser.bio || <span className="italic text-slate-400">Nenhuma biografia fornecida no momento.</span>}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Users className="w-4 h-4"/> Informações de Contato</h3>
                  {canSeePrivate ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0"><Mail className="w-5 h-5"/></div>
                        <div className="overflow-hidden">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">E-mail Institucional</span>
                          <span className="font-medium text-slate-800 truncate block">{profileUser.email || 'Não informado'}</span>
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0"><Phone className="w-5 h-5"/></div>
                        <div className="overflow-hidden">
                          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Telefone / WhatsApp</span>
                          <span className="font-medium text-slate-800 truncate block">{profileUser.phone || 'Não informado'}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-100 text-slate-500 p-4 rounded-xl text-center text-sm border border-slate-200 font-medium">
                      O usuário optou por manter suas informações de contato privadas.
                    </div>
                  )}
                </div>

                {isMe && (
                  <div className="pt-6 border-t border-slate-200 flex justify-center">
                    <button onClick={startEditingProfile} className="bg-slate-800 text-white font-bold px-8 py-3 rounded-xl hover:bg-slate-900 transition shadow-md flex items-center gap-2">
                      <Edit2 className="w-4 h-4"/> Configurar Meu Perfil
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

  // ==========================================
  // RENDER: FÓRUM PROFISSIONAL (PHPBB STYLE)
  // ==========================================
  const renderForumModal = () => {
    const forumData = forums[activeForumItem.id] || []; 
    const currentTopicData = forumData.find(t => t.id === activeTopicId);

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
      
      setDbForums({ ...forums, [activeForumItem.id]: [...forumData, newTopic] });
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
      
      const updatedTopics = forumData.map(t => {
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
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 print:hidden">
        <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden animate-fade-in flex flex-col">
          
          <div className="p-5 border-b border-purple-800 flex justify-between items-center bg-purple-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-800 rounded-lg">
                <MessageCircle className="w-6 h-6 text-purple-200"/>
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight">{activeForumItem.title}</h2>
                <p className="text-[11px] text-purple-300 uppercase tracking-widest font-bold">Fórum Acadêmico Oficial</p>
              </div>
            </div>
            <button onClick={() => { setActiveForumItem(null); setActiveTopicId(null); }} className="p-2 text-purple-200 hover:bg-purple-800 rounded-full transition-colors">
              <X className="w-6 h-6"/>
            </button>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            {!activeTopicId ? (
              
              /* LISTA DE TÓPICOS */
              <div className="flex-1 p-8 overflow-y-auto space-y-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
                    <MessageSquare className="w-5 h-5 text-purple-600"/> Abrir Novo Tópico de Discussão
                  </h3>
                  <form onSubmit={handleCreateTopic} className="space-y-4">
                    <input name="title" required placeholder="Título do Tópico (Ex: Dúvida sobre o Caso Clínico 02)" className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                    <textarea name="desc" required placeholder="Descreva o assunto detalhadamente para a turma..." className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none h-24"></textarea>
                    <button type="submit" className="bg-purple-700 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-purple-800 transition">Publicar Tópico</button>
                  </form>
                </div>

                <div className="space-y-4">
                  <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-4">Tópicos Recentes</h3>
                  {forumData.length === 0 ? (
                    <div className="text-center p-12 text-slate-400 font-medium bg-white rounded-xl border border-slate-200">
                      Nenhum tópico criado neste fórum. Seja o primeiro a perguntar ou debater!
                    </div>
                  ) : (
                    forumData.map(topic => (
                      <div key={topic.id} onClick={() => setActiveTopicId(topic.id)} className="bg-white p-5 border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md cursor-pointer transition flex items-center gap-5">
                        <div onClick={(e) => {e.stopPropagation(); setViewingProfileId(topic.authorId)}} className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-black shrink-0 border border-slate-200 hover:border-purple-500 transition cursor-pointer">
                          {topic.avatar}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-lg group-hover:text-purple-700 transition">{topic.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">Iniciado por <strong className="text-slate-700 hover:text-purple-700 cursor-pointer" onClick={(e) => {e.stopPropagation(); setViewingProfileId(topic.authorId)}}>{topic.authorName}</strong> em {new Date(topic.createdAt).toLocaleString()}</p>
                        </div>
                        <div className="text-center shrink-0 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                          <span className="block font-black text-purple-700 text-xl">{(topic.replies || []).length}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Respostas</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 shrink-0"/>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              
              /* VISÃO DO TÓPICO E RESPOSTAS */
              <div className="flex-1 flex flex-col h-full bg-slate-50">
                <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex items-center gap-4 shadow-sm">
                  <button onClick={() => setActiveTopicId(null)} className="p-2 bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-700 rounded-lg font-bold transition flex items-center gap-1">
                    <ChevronRight className="w-4 h-4 rotate-180"/> Voltar
                  </button>
                  <h3 className="font-black text-xl text-slate-800 truncate">{currentTopicData?.title}</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
                  
                  {/* Post Original */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600"></div>
                    <div className="flex items-center gap-4 mb-4 border-b border-slate-100 pb-4">
                      <div onClick={() => setViewingProfileId(currentTopicData?.authorId)} className="cursor-pointer w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold border border-slate-200 hover:border-purple-500 transition">{currentTopicData?.avatar}</div>
                      <div>
                        <p onClick={() => setViewingProfileId(currentTopicData?.authorId)} className="font-black text-slate-800 cursor-pointer hover:text-purple-700 transition">{currentTopicData?.authorName}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{new Date(currentTopicData?.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 text-base whitespace-pre-wrap leading-relaxed">{currentTopicData?.description}</p>
                  </div>

                  {/* Respostas */}
                  <div className="space-y-4 pl-4 md:pl-12 border-l-2 border-slate-200">
                    {(currentTopicData?.replies || []).map((reply, idx) => (
                      <div key={reply.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
                        <div className="absolute -left-12 top-6 w-12 border-t-2 border-slate-200"></div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div onClick={() => setViewingProfileId(reply.authorId)} className="cursor-pointer w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200 hover:border-purple-500 transition">{reply.avatar}</div>
                            <div>
                              <p onClick={() => setViewingProfileId(reply.authorId)} className="font-bold text-slate-800 text-xs cursor-pointer hover:text-purple-700 transition">{reply.authorName}</p>
                              <p className="text-[10px] text-slate-400">{new Date(reply.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-300">#{idx + 1}</span>
                        </div>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{reply.text}</p>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                </div>

                {/* Área para Responder */}
                <div className="p-6 bg-white border-t border-slate-200 shrink-0">
                  <form onSubmit={handleReplyTopic} className="flex gap-4">
                    <textarea name="reply" required placeholder="Escreva sua resposta para o tópico..." className="flex-1 border border-slate-300 p-4 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none h-20 bg-slate-50 focus:bg-white transition-colors"></textarea>
                    <button type="submit" className="bg-purple-700 text-white font-bold px-8 rounded-xl hover:bg-purple-800 transition flex items-center justify-center gap-2 shadow-md">
                      <Send className="w-4 h-4"/> Responder
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

  // ==========================================
  // RENDER: PROVA NATIVA E AVALIAÇÕES
  // ==========================================
  const renderExamModal = () => {
    const examData = exams[activeExamItem.id] || { questions: [], submissions: {} };
    
    const handleAddQuestion = () => {
      const newQuestion = { 
        id: `q_${Date.now()}_${Math.random()}`, 
        title: 'Nova Pergunta', 
        options: ['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4'], 
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
      alert("Prova salva e disponibilizada com sucesso!"); 
    };

    const handleCloseExam = () => { 
      setActiveExamItem(null); 
      setLocalQuestions([]); 
    };

    // VISÃO DE CONSTRUÇÃO DE PROVA (ADMIN / PROFESSOR NO MODO EDIÇÃO)
    if (isEditing) {
      return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 print:hidden">
          <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden animate-fade-in flex flex-col">
            
            <div className="p-5 border-b border-rose-800 flex justify-between items-center bg-rose-700 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-600 rounded-lg"><ClipboardList className="w-6 h-6"/></div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">Construtor de Avaliação: {activeExamItem.title}</h2>
                  <p className="text-[11px] text-rose-200 uppercase tracking-widest font-bold">Modo de Configuração do Docente</p>
                </div>
              </div>
              <button onClick={handleCloseExam} className="p-2 hover:bg-rose-800 rounded-full transition-colors"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
              
              {/* LISTA DE QUESTÕES */}
              {localQuestions.map((q, qIndex) => (
                <div key={q.id} className="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm relative">
                  <button onClick={() => setLocalQuestions(localQuestions.filter((_, i) => i !== qIndex))} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors" title="Apagar Questão"><Trash2 className="w-5 h-5"/></button>
                  <label className="text-sm font-black text-rose-700 uppercase tracking-widest block mb-4">Questão {qIndex + 1}</label>
                  <input type="text" value={q.title} onChange={e => handleUpdateQuestion(qIndex, 'title', e.target.value)} placeholder="Digite o enunciado da questão..." className="w-full border-b-2 border-slate-200 p-2 text-lg font-bold focus:border-rose-500 outline-none mb-6 transition-colors" />
                  
                  <div className="space-y-4">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className={`flex items-center gap-4 p-3 rounded-xl border transition-all ${q.correctIndex === oIndex ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                        <div className="flex flex-col items-center justify-center pl-2">
                          <input type="radio" name={`correct_${q.id}`} checked={q.correctIndex === oIndex} onChange={() => handleUpdateQuestion(qIndex, 'correctIndex', oIndex)} className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"/>
                          <span className="text-[9px] font-bold text-emerald-600 uppercase mt-1 opacity-0 has-[:checked]:opacity-100">Gabarito</span>
                        </div>
                        <input type="text" value={opt} onChange={e => handleUpdateOption(qIndex, oIndex, e.target.value)} className={`flex-1 bg-transparent p-2 text-sm outline-none font-medium ${q.correctIndex === oIndex ? 'text-emerald-900' : 'text-slate-700'}`} placeholder={`Opção ${oIndex + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <button onClick={handleAddQuestion} className="w-full border-2 border-dashed border-rose-300 text-rose-700 font-bold p-6 rounded-2xl hover:bg-rose-50 transition flex items-center justify-center gap-2 text-lg">
                <Plus className="w-6 h-6"/> Adicionar Nova Questão
              </button>

              {/* PAINEL DE NOTAS (RESULTADOS DOS ALUNOS) */}
              <div className="mt-12 border-t-2 border-dashed border-slate-300 pt-8">
                <h3 className="font-black text-xl text-slate-800 mb-6 flex items-center gap-2">
                  <BarChart className="w-6 h-6 text-rose-600"/> Resultados dos Residentes
                </h3>
                
                {Object.keys(examData.submissions || {}).length === 0 ? (
                  <p className="text-slate-500 bg-white p-6 rounded-xl border border-slate-200">Nenhuma avaliação foi entregue pelos residentes até o momento.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(examData.submissions).map(([studentId, sub]) => (
                      <div key={studentId} className="flex justify-between items-center bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                           <div onClick={() => setViewingProfileId(studentId)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200 cursor-pointer hover:border-teal-500 transition">
                             {systemUsers[studentId]?.avatar || '?'}
                           </div>
                           <div>
                             <span onClick={() => setViewingProfileId(studentId)} className="block font-bold text-slate-700 cursor-pointer hover:text-teal-700 transition">
                               {systemUsers[studentId]?.nome || 'Aluno Oculto'}
                             </span>
                             <span className="text-[10px] text-slate-400 uppercase tracking-widest">{new Date(sub.submittedAt).toLocaleString()}</span>
                           </div>
                        </div>
                        <div className="text-right bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                          <span className="block font-black text-rose-700 text-xl">{sub.score}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Nota Final</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 bg-white border-t border-slate-200 shrink-0 flex justify-end gap-4 shadow-up">
              <button onClick={handleCloseExam} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancelar Edição</button>
              <button onClick={handleSaveExam} className="bg-rose-700 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-rose-800 transition shadow-md flex items-center gap-2">
                <Check className="w-4 h-4"/> Salvar Prova Oficial
              </button>
            </div>
          </div>
        </div>
      );
    }

    // TELA DE FAZER A PROVA (VISÃO DE QUEM ESTÁ RESPONDENDO - ALUNO)
    const mySubmission = examData.submissions[currentUser.id];
    
    const handleSumbitExam = (e) => {
      e.preventDefault();
      if(examData.questions.length === 0) {
        return alert("Esta prova não possui questões ativas configuradas pelo professor.");
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
      
      alert(`Avaliação enviada com sucesso! Sua nota oficial foi: ${finalScore}`);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 print:hidden">
        <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden animate-fade-in flex flex-col">
          
          <div className="p-8 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 shadow-sm z-10">
            <div>
              <h2 className="font-black text-3xl text-slate-800 tracking-tight">{activeExamItem.title}</h2>
              <p className="text-xs text-rose-600 uppercase tracking-widest font-black mt-2">Avaliação Oficial COREMU</p>
            </div>
            <button onClick={handleCloseExam} className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"><X className="w-6 h-6"/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 sm:p-10">
            
            {mySubmission ? (
              // SE O USUÁRIO JÁ FEZ A PROVA
              <div className="text-center bg-white p-12 rounded-3xl border border-slate-200 shadow-sm max-w-md mx-auto mt-10">
                <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6"/>
                <h3 className="text-2xl font-black text-slate-800">Avaliação Concluída</h3>
                <p className="text-slate-500 mt-2">Você já enviou suas respostas para esta prova. O gabarito foi registrado com sucesso no sistema da instituição.</p>
                <div className="mt-8 inline-block bg-slate-50 p-6 rounded-2xl border border-slate-200 w-full">
                  <span className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Sua Nota Final</span>
                  <span className="text-6xl font-black text-emerald-600">{mySubmission.score}</span>
                </div>
              </div>
            ) : (
              
              // SE O USUÁRIO AINDA VAI FAZER A PROVA
              <form onSubmit={handleSumbitExam} className="space-y-8 max-w-3xl mx-auto pb-10">
                {examData.questions.length === 0 ? (
                  <p className="text-center text-slate-500 bg-white p-8 rounded-xl border border-slate-200">
                    O professor ainda não configurou as questões desta prova.
                  </p>
                ) : (
                  <>
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-sm font-medium mb-8 shadow-sm flex gap-3 items-center">
                      <Shield className="w-6 h-6 text-rose-500 shrink-0"/>
                      <span><strong>Atenção:</strong> Após clicar em "Enviar Respostas Oficialmente", a nota será computada imediatamente e não será possível refazer a prova. Revise com atenção suas escolhas.</span>
                    </div>
                    
                    {examData.questions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm">
                        <div className="flex gap-4 items-start mb-6">
                          <span className="w-8 h-8 shrink-0 bg-slate-100 text-slate-500 flex items-center justify-center rounded-full font-black text-sm">{qIndex + 1}</span>
                          <h4 className="font-bold text-slate-800 text-lg leading-relaxed pt-1">{q.title}</h4>
                        </div>
                        <div className="space-y-3 pl-12">
                          {q.options.map((opt, oIndex) => (
                            <label key={oIndex} className="flex items-start gap-4 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-all has-[:checked]:bg-rose-50 has-[:checked]:border-rose-500 has-[:checked]:ring-1 has-[:checked]:ring-rose-500">
                              <input type="radio" required name={`q_${qIndex}`} value={oIndex} className="mt-1 w-5 h-5 text-rose-600 focus:ring-rose-500 border-slate-300"/>
                              <span className="text-base font-medium text-slate-700 leading-relaxed">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-8 flex justify-center border-t-2 border-dashed border-slate-200">
                      <button type="submit" className="bg-rose-700 text-white font-black px-12 py-5 rounded-2xl hover:bg-rose-800 transition shadow-xl text-xl flex items-center gap-3 w-full sm:w-auto justify-center">
                        <Check className="w-6 h-6"/> ENVIAR RESPOSTAS OFICIALMENTE
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

  // ==========================================
  // RENDER: DASHBOARDS E TELAS DE LISTAGEM
  // ==========================================
  
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
            <p className="text-sm mt-1">Você ainda não possui turmas ativas no semestre atual.</p>
          </div>
        ) : (
          visibleCourses.map(c => {
            if(!c) return null;
            return (
              <div key={c.id} onClick={() => { setActiveCourseId(c.id); setCurrentView('course_home'); }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition cursor-pointer flex flex-col justify-between h-full group">
                <div>
                  <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">{c.codigo}</span>
                  <h3 className="font-bold text-slate-800 mt-3 group-hover:text-teal-700 transition leading-tight">{c.nome}</h3>
                  <p className="text-xs text-slate-500 mt-2">Professor Titular: {systemUsers[c.professorId]?.nome || 'Não definido'}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-teal-700 text-sm font-bold">
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
              <input type="text" required value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} placeholder="Ex: RMAB001" className="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nome da Disciplina</label>
              <input type="text" required value={newCourseName} onChange={e => setNewCourseName(e.target.value)} placeholder="Ex: Saúde Coletiva" className="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Professor Titular / Preceptor</label>
              <select required value={newCourseProfId} onChange={e => setNewCourseProfId(e.target.value)} className="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                <option value="">Selecione na lista...</option>
                {Object.values(systemUsers).filter(u => u && u.role === 'professor').map(p => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="w-full bg-teal-800 text-white font-bold p-3 rounded-lg hover:bg-teal-900 transition flex items-center justify-center gap-2">
              <Plus className="w-4 h-4"/> Salvar Nova Disciplina
            </button>
          </form>
        </div>
        
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Layout className="w-5 h-5 text-blue-600"/> Matriz Curricular Global</h3>
          {courses.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-xl bg-slate-50 text-slate-500">Nenhuma disciplina ativa no momento.</div>
          ) : (
            <div className="space-y-3">
              {courses.map(c => {
                if(!c) return null;
                const totalAlunos = Array.isArray(courseStudents[c.id]) ? courseStudents[c.id].length : 0;
                return (
                  <div key={c.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">{c.codigo}</span>
                      <h4 className="font-bold text-slate-800 mt-1">{c.nome}</h4>
                      <p className="text-xs text-slate-500 mt-1">Professor Responsável: <strong className="text-slate-700 hover:text-teal-700 cursor-pointer transition-colors" onClick={() => setViewingProfileId(c.professorId)}>{systemUsers[c.professorId]?.nome || 'Não definido'}</strong></p>
                      <p className="text-xs text-slate-400 mt-1">{totalAlunos} aluno(s) matriculado(s)</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setActiveCourseId(c.id); setCurrentView('participants'); }} className="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-100 flex items-center gap-2 transition">
                        <Layout className="w-4 h-4"/> Abrir Gerenciamento
                      </button>
                      <button onClick={() => handleDeleteCourse(c.id)} className="bg-red-50 text-red-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition">
                        Excluir
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
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
        <div className="p-3 bg-purple-50 text-purple-700 rounded-xl"><Users className="w-8 h-8"/></div>
        <div>
          <h2 className="text-xl font-black text-slate-800">Gestão de Usuários e Diretório</h2>
          <p className="text-sm text-slate-500 mt-1">Cadastre novos residentes ou acesse os perfis de profissionais.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><UserPlus className="w-5 h-5 text-purple-600"/> Novo Usuário</h3>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo</label>
              <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} placeholder="Ex: Dra. Ana Costa" className="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">E-mail Institucional</label>
              <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} placeholder="email@haco.mil.br" className="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Perfil de Acesso</label>
              <select required value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full mt-1 border border-slate-300 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500 bg-white">
                <option value="aluno">Aluno / Residente</option>
                <option value="professor">Professor / Preceptor</option>
                <option value="admin">Administrador (Gestão)</option>
              </select>
            </div>
            <button type="submit" className="w-full bg-purple-800 text-white font-bold p-3 rounded-lg hover:bg-purple-900 transition flex items-center justify-center gap-2">
              <Plus className="w-4 h-4"/> Criar Cadastro
            </button>
          </form>
        </div>
        
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-slate-600"/> Tabela de Usuários Ativos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 text-slate-600 font-bold border-b">
                <tr>
                  <th className="p-4">Nome Registrado (Clique para ver Perfil)</th>
                  <th className="p-4 text-center">Perfil de Acesso</th>
                  <th className="p-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.values(systemUsers).map(u => {
                  if(!u) return null;
                  const isEditingThisUser = editingUserId === u.id;
                  
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div onClick={() => setViewingProfileId(u.id)} className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0 border border-slate-300 cursor-pointer hover:border-purple-500 transition">
                            {u.avatar}
                          </div>
                          {isEditingThisUser ? (
                            <input 
                              type="text" 
                              value={editingUserName} 
                              onChange={e => setEditingUserName(e.target.value)} 
                              className="border border-purple-300 px-3 py-1.5 rounded-md focus:ring-2 focus:ring-purple-500 outline-none w-full max-w-xs shadow-sm"
                              autoFocus 
                            />
                          ) : (
                            <div className="flex flex-col">
                              <span onClick={() => setViewingProfileId(u.id)} className="cursor-pointer hover:text-purple-700 transition">{u.nome}</span>
                              <span className="text-[10px] text-slate-400 font-normal">{u.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-slate-800 text-white' : 
                          u.role === 'professor' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-right whitespace-nowrap">
                        {isEditingThisUser ? (
                          <>
                            <button onClick={() => handleSaveEditedUser(u.id)} className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 p-2 rounded-md transition" title="Salvar Alteração"><Check className="w-5 h-5 inline"/></button>
                            <button onClick={handleCancelEditUser} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-md transition" title="Cancelar"><X className="w-5 h-5 inline"/></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleStartEditUser(u)} className="text-slate-400 hover:text-purple-600 hover:bg-purple-50 p-2 rounded-md transition" title="Editar Nome"><Edit2 className="w-5 h-5 inline"/></button>
                            {u.id !== 'admin1' && (
                              <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-md transition" title="Excluir Usuário"><Trash2 className="w-5 h-5 inline"/></button>
                            )}
                          </>
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

  // ==========================================
  // RENDER: TELAS DO PORTAL E SISTEMA COREMU
  // ==========================================
  
  // LOGIN SCREEN RENDERIZATION
  if (!isLoggedIn) {
    const handleLogin = (e) => {
      e.preventDefault();
      const userFound = Object.values(systemUsers).find(u => u?.email?.toLowerCase() === loginEmailInput.toLowerCase().trim());
      
      if (userFound) {
        setActiveUserId(userFound.id);
        setIsLoggedIn(true);
        setCurrentView(userFound.role === 'admin' ? 'admin_dashboard' : 'user_home');
      } else {
        alert("E-mail não encontrado na base de dados. Procure a Gestão do COREMU.");
      }
    };

    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 font-sans p-4 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40"></div>

        <div className="bg-white p-10 md:p-12 rounded-3xl shadow-2xl w-full max-w-md relative z-10 animate-fade-in">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-teal-50 rounded-2xl flex items-center justify-center border border-teal-100 shadow-inner">
              <Shield className="w-10 h-10 text-teal-700"/>
            </div>
          </div>
          <h1 className="text-3xl font-black text-slate-800 text-center tracking-tight mb-2">Portal COREMU</h1>
          <p className="text-sm text-slate-500 text-center mb-8 font-medium">Acesso ao Ambiente Virtual de Aprendizagem</p>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">E-mail Institucional</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required 
                  value={loginEmailInput} 
                  onChange={e => setLoginEmailInput(e.target.value)} 
                  placeholder="seu.email@exemplo.com" 
                  className="w-full border border-slate-300 p-4 pl-12 rounded-xl text-base focus:ring-2 focus:ring-teal-500 outline-none transition-shadow bg-slate-50 focus:bg-white" 
                />
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-xs flex gap-3">
              <Info className="w-5 h-5 shrink-0 text-amber-500"/>
              <p>O acesso inicial não exige senha. Insira um dos e-mails de teste para simular os níveis de acesso:<br/><br/>
              • <strong>gestao@haco.mil.br</strong> (Admin)<br/>
              • <strong>norberto@haco.mil.br</strong> (Prof)<br/>
              • <strong>mariana@teste.com</strong> (Aluno)
              </p>
            </div>

            <button type="submit" className="w-full bg-teal-800 text-white font-black p-4 rounded-xl hover:bg-teal-900 transition shadow-lg text-lg flex items-center justify-center gap-2">
              Entrar no Portal <ChevronRight className="w-5 h-5"/>
            </button>
          </form>
        </div>
      </div>
    );
  }


  // ==========================================
  // ESTRUTURA PRINCIPAL DO HTML (Layout Shell)
  // ==========================================
  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-slate-800 overflow-hidden print:bg-white print:h-auto print:overflow-visible">
      
      {/* MENU LATERAL ESQUERDO */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col flex-shrink-0 shadow-2xl z-20 relative print:hidden`}>
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-800">
          {sidebarOpen && <span className="font-black text-white text-lg tracking-tight leading-tight">Portal <span className="text-teal-400">COREMU</span></span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 no-scrollbar">
          <nav className="space-y-2 px-4">
            
            {/* LINKS DO ADMIN E DIRETÓRIO */}
            {role === 'admin' && (
              <>
                <button onClick={() => {setCurrentView('admin_dashboard'); setActiveCourseId(null); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-colors ${currentView === 'admin_dashboard' ? 'bg-teal-900/40 text-teal-400 border-l-4 border-teal-500' : 'hover:bg-slate-800 text-slate-400'}`}>
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Gestão COREMU</span>}
                </button>
                <button onClick={() => {setCurrentView('admin_users'); setActiveCourseId(null); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-colors ${currentView === 'admin_users' ? 'bg-teal-900/40 text-teal-400 border-l-4 border-teal-500' : 'hover:bg-slate-800 text-slate-400'}`}>
                  <Users className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Diretório de Usuários</span>}
                </button>
                <div className="my-6 border-t border-slate-800 mx-2"></div>
              </>
            )}

            {/* LINK HOME (PROF E ALUNO) */}
            {(role === 'professor' || role === 'aluno') && (
              <button onClick={() => {setCurrentView('user_home'); setActiveCourseId(null); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm font-bold transition-colors ${currentView === 'user_home' ? 'bg-teal-900/40 text-teal-400 border-l-4 border-teal-500' : 'hover:bg-slate-800 text-slate-400'}`}>
                <Home className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>Página Inicial</span>}
              </button>
            )}

            {/* LISTAGEM DE DISCIPLINAS NA BARRA LATERAL */}
            {sidebarOpen && <div className="mt-8 mb-4 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500">Minhas Disciplinas Ativas</div>}
            
            {visibleCourses.length === 0 ? (
              <div className="px-5 text-xs text-slate-600 font-medium mt-2">Nenhuma disciplina vinculada.</div>
            ) : (
              visibleCourses.map(c => {
                if(!c) return null;
                const isCourseActive = activeCourseId === c.id && ['course_home', 'participants', 'grades', 'attendance'].includes(currentView);
                
                return (
                  <div key={c.id} className="mb-2">
                    <button onClick={() => {setActiveCourseId(c.id); setCurrentView('course_home'); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm transition-colors ${isCourseActive ? 'bg-teal-900/60 text-white font-bold' : 'hover:bg-slate-800 text-slate-400 font-medium'}`} title={c.nome}>
                      <Book className={`w-5 h-5 flex-shrink-0 ${isCourseActive ? 'text-teal-400' : ''}`} />
                      {sidebarOpen && <span className="truncate block w-full text-left">{c.nome}</span>}
                    </button>
                    
                    {/* SUBMENU DA DISCIPLINA ATIVA */}
                    {isCourseActive && sidebarOpen && (
                      <div className="ml-5 pl-4 border-l-2 border-slate-700 mt-2 space-y-1 mb-6">
                        <button onClick={() => setCurrentView('course_home')} className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-bold transition-colors ${currentView === 'course_home' ? 'text-teal-400 bg-slate-800 shadow-sm' : 'hover:bg-slate-800 text-slate-400'}`}>
                          <Layout className="w-4 h-4 flex-shrink-0" /> Sala de Aula Virtual
                        </button>
                        <button onClick={() => setCurrentView('participants')} className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-bold transition-colors ${currentView === 'participants' ? 'text-teal-400 bg-slate-800 shadow-sm' : 'hover:bg-slate-800 text-slate-400'}`}>
                          <Users className="w-4 h-4 flex-shrink-0" /> Participantes e Matrículas
                        </button>
                        <button onClick={() => setCurrentView('grades')} className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-bold transition-colors ${currentView === 'grades' ? 'text-teal-400 bg-slate-800 shadow-sm' : 'hover:bg-slate-800 text-slate-400'}`}>
                          <BarChart className="w-4 h-4 flex-shrink-0" /> Boletim e Notas
                        </button>
                        <button onClick={() => setCurrentView('attendance')} className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-sm font-bold transition-colors ${currentView === 'attendance' ? 'text-teal-400 bg-slate-800 shadow-sm' : 'hover:bg-slate-800 text-slate-400'}`}>
                          <CheckSquare className="w-4 h-4 flex-shrink-0" /> Diário de Frequência
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </nav>
        </div>

        {/* BOTAO SAIR (Logout do Sistema de Roteamento) */}
        {sidebarOpen && (
          <div className="p-6 bg-slate-950 border-t border-slate-800 z-50">
            <button onClick={() => { setIsLoggedIn(false); setActiveUserId(null); }} className="w-full bg-red-900/50 hover:bg-red-800 text-red-200 text-sm font-bold p-3 rounded-xl border border-red-800 transition flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
              Sair do Sistema
            </button>
          </div>
        )}
      </aside>

      {/* ÁREA CENTRAL E DIREITA DA PLATAFORMA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative print:overflow-visible">
        
        {/* CABEÇALHO SUPERIOR (HEADER) */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 shadow-sm z-10 print:hidden shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden sm:flex items-center text-sm font-semibold text-slate-600 gap-6">
              <span className="text-teal-800 font-black text-xl tracking-tight">Portal AVA COREMU <span className="font-normal text-slate-400">HACO</span></span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div onClick={() => setViewingProfileId(currentUser.id)} className="flex items-center gap-4 p-2 hover:bg-slate-50 rounded-xl transition cursor-pointer border border-transparent hover:border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800 leading-tight">{currentUser.nome}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{role === 'aluno' ? 'Residente' : role === 'professor' ? 'Docente/Preceptor' : 'Administração'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-800 text-white flex items-center justify-center text-sm font-black shadow-md border-2 border-teal-100">
                {currentUser.avatar}
              </div>
            </div>
          </div>
        </header>

        {/* MIOLO CENTRAL: ONDE AS TELAS SÃO RENDERIZADAS */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8f9fa] print:bg-white print:p-0 print:overflow-visible relative">
          <div className="max-w-6xl mx-auto pb-20">
            
            {/* TELAS GLOBAIS */}
            {currentView === 'user_home' && renderUserHome()}
            {currentView === 'admin_dashboard' && renderAdminDashboard()}
            {currentView === 'admin_users' && renderAdminUsers()}
            
            {/* RENDERIZAÇÃO DA DISCIPLINA ATIVA */}
            {activeCourseId && ['course_home', 'participants', 'grades', 'attendance'].includes(currentView) && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6 mt-4">
                  <div className="flex-1">
                    {/* TÍTULO DA DISCIPLINA (Editável se professor/admin e Modo Edição Ativo) */}
                    {isEditing ? (
                      <input type="text" value={activeCourseObj?.nome || ''} onChange={(e) => updateCourseDetails('nome', e.target.value)} placeholder="Digite o Nome da Disciplina aqui..." className="w-full text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight bg-transparent border-b-2 border-dashed border-slate-300 focus:border-teal-500 focus:outline-none mb-3 pb-2 transition-colors" />
                    ) : (
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">{activeCourseObj?.nome}</h1>
                    )}
                    
                    {/* DADOS SECUNDÁRIOS DA DISCIPLINA */}
                    {isEditing ? (
                      <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-200 shadow-sm w-fit">
                        <input type="text" value={activeCourseObj?.codigo || ''} onChange={(e) => updateCourseDetails('codigo', e.target.value)} placeholder="Cód: RMAB001" className="w-32 text-sm text-teal-700 font-bold bg-teal-50 px-3 py-1.5 rounded-lg border border-dashed border-teal-300 focus:border-teal-500 focus:outline-none transition-colors" />
                        <span className="text-sm text-slate-500 font-medium">Professor Associado: <strong className="text-slate-800">{systemUsers[activeCourseObj?.professorId]?.nome}</strong></span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-teal-800 bg-teal-100 px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">{activeCourseObj?.codigo}</span>
                        <span className="text-sm text-slate-500 font-medium border-l-2 border-slate-300 pl-3 flex gap-1 items-center">
                          Professor Titular: <strong onClick={() => setViewingProfileId(activeCourseObj?.professorId)} className="text-slate-700 hover:text-teal-700 cursor-pointer transition-colors">{systemUsers[activeCourseObj?.professorId]?.nome}</strong>
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* O BOTÃO QUE ATIVA O MODO DE EDIÇÃO (Visível apenas se tem permissão) */}
                  {hasEditPermission && (
                    <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm shrink-0 print:hidden">
                      <span className="text-xs font-bold text-slate-600 px-3 hidden sm:inline uppercase tracking-widest">Modo de Edição</span>
                      <button onClick={() => setEditMode(!editMode)} className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-inner ${editMode ? 'bg-teal-700 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        {editMode ? <ToggleRight className="w-5 h-5 mr-2"/> : <ToggleLeft className="w-5 h-5 mr-2"/>}
                        {editMode ? 'ATIVADO' : 'INATIVO'}
                      </button>
                    </div>
                  )}
                </div>

                {/* CAIXA DE ALERTA DO MODO DE EDIÇÃO */}
                {hasEditPermission && editMode && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl mb-8 text-sm flex gap-4 print:hidden shadow-sm items-center">
                    <Shield className="w-8 h-8 text-amber-500 shrink-0"/>
                    <p className="leading-relaxed">O Modo de Edição está ligado. Você pode alterar nomes, construir provas e excluir materiais ou alunos. <strong>Desligue o botão acima se quiser ver a sala de aula exatamente como o Residente a enxerga</strong> e se quiser testar a resolução das provas e fóruns.</p>
                  </div>
                )}

                {/* BREADCRUMB (Navegação Superior das Telas Secundárias) */}
                <div className="flex items-center text-xs text-slate-500 mb-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
                  <span className="hover:text-slate-800 font-medium">Portal COREMU</span>
                  <ChevronRight className="w-4 h-4 mx-3 text-slate-300" />
                  <span className="font-bold text-teal-700">{activeCourseObj?.codigo}</span>
                  <ChevronRight className="w-4 h-4 mx-3 text-slate-300" />
                  <span className="text-slate-800 font-bold uppercase tracking-wider">{
                    currentView === 'course_home' ? 'Mural da Sala de Aula e Módulos' : 
                    currentView === 'grades' ? 'Boletim de Notas Oficial e Feedbacks' : 
                    currentView === 'participants' ? 'Residentes e Matrículas (Participantes)' : 'Diário de Classe Eletrônico (Frequência)'
                  }</span>
                </div>

                {/* RENDERIZAÇÃO DINÂMICA DA TELA DA DISCIPLINA */}
                {currentView === 'course_home' && renderCourseHome()}
                {currentView === 'participants' && renderParticipants()}
                {currentView === 'grades' && renderGradebook()}
                {currentView === 'attendance' && renderAttendance()}
              </>
            )}
            
            {/* RENDERIZAÇÃO DOS MODAIS EM CAMADA SUPERIOR */}
            {readingItem && renderReadingModal()}
            {viewingProfileId && renderProfileModal()}
            {activeForumItem && renderForumModal()}
            {activeExamItem && renderExamModal()}

          </div>
        </main>
      </div>
    </div>
  );
}

// A EXPORTAÇÃO FINAL PASSANDO PELO ESCUDO DE ERROS
export default function App() {
  return (
    <ErrorBoundary>
      <LmsEnterprisePortal />
    </ErrorBoundary>
  );
}
