import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { 
  Menu, Bell, Search, Home, Book, Calendar, BarChart, 
  ChevronDown, ChevronRight, Plus, FileText, 
  MessageSquare, Folder, CheckCircle, Upload, Download,
  ToggleLeft, ToggleRight, Layout, GripVertical, Trash2,
  Shield, UserPlus, CheckSquare, X, Link, Paperclip, Users, 
  Edit2, Check, Loader2, Printer, AlignLeft, ClipboardList, Send,
  Bold, Italic, Underline, Heading1, Heading2, List
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
let storage;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  storage = getStorage(app);
} catch (e) {
  console.error("Erro crítico na inicialização do Firebase", e);
}

// ==========================================
// ESCUDO CONTRA TELA BRANCA
// ==========================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { this.setState({ info }); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 h-screen overflow-auto">
          <h1 className="text-2xl font-bold text-red-700 mb-4">🚨 Ocorreu um Erro no Sistema</h1>
          <p className="text-slate-700 mb-4">Tire um print do erro abaixo para correção:</p>
          <pre className="bg-white p-4 border border-red-200 rounded text-xs text-red-600 overflow-x-auto whitespace-pre-wrap">{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

// ==========================================
// HOOK DE SINCRONIZAÇÃO (NUVEM)
// ==========================================
const useFirestoreDB = (docName, initialValue) => {
  const [data, setData] = useState(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!db) { setIsLoaded(true); return; }
    try {
      const unsub = onSnapshot(doc(db, 'coremu_database', docName), 
        (docSnap) => {
          if (docSnap.exists()) setData(docSnap.data().value || initialValue);
          else {
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
  
  // 1. BANCOS DE DADOS
  const [dbUsers, setDbUsers, usersLoaded] = useFirestoreDB('tb_users', {
    'admin1': { id: 'admin1', nome: 'Gestão COREMU', role: 'admin', avatar: 'GC' },
    'prof1': { id: 'prof1', nome: '1º Ten Norberto Cimirro', role: 'professor', avatar: 'NC' },
    'stu1': { id: 'stu1', nome: 'Mariana Alves', role: 'aluno', avatar: 'MA' }
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
    'c1': [{ studentId: 'stu1', ga: 8.6, gb: 7.4, gc: 0, faltas: [], feedback: "Ótimo desempenho." }]
  });
  const [dbAttendanceCols, setDbAttendanceCols, colsLoaded] = useFirestoreDB('tb_attendance_cols', { 'c1': [] });
  
  // Tabelas: Fóruns (Tópicos e Respostas) e Provas Nativas
  const [dbForums, setDbForums, forumsLoaded] = useFirestoreDB('tb_forums_v2', {});
  const [dbExams, setDbExams, examsLoaded] = useFirestoreDB('tb_exams_v1', {});

  const systemUsers = typeof dbUsers === 'object' && dbUsers !== null ? dbUsers : {};
  const courses = Array.isArray(dbCourses) ? dbCourses : [];
  const courseContents = typeof dbContents === 'object' && dbContents !== null ? dbContents : {};
  const courseStudents = typeof dbStudents === 'object' && dbStudents !== null ? dbStudents : {};
  const attendanceCols = typeof dbAttendanceCols === 'object' && dbAttendanceCols !== null ? dbAttendanceCols : {};
  const forums = typeof dbForums === 'object' && dbForums !== null ? dbForums : {};
  const exams = typeof dbExams === 'object' && dbExams !== null ? dbExams : {};

  // 2. ESTADOS DA INTERFACE
  const [activeUserId, setActiveUserId] = useState('admin1');
  const currentUser = systemUsers[activeUserId] || systemUsers['admin1'] || { id: 'admin1', nome: 'Gestão COREMU', role: 'admin', avatar: 'GC' };
  const role = currentUser?.role || 'admin';

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentView, setCurrentView] = useState('admin_dashboard'); 
  const [editMode, setEditMode] = useState(false);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  const hasEditPermission = role === 'admin' || role === 'professor';
  const isEditing = editMode && hasEditPermission;

  // 3. ESTADOS DOS MODAIS E FORMULÁRIOS
  const [activeSectionForNewItem, setActiveSectionForNewItem] = useState(null);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType] = useState('FileText');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemTextContent, setNewItemTextContent] = useState(''); 
  const [newFile, setNewFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState('aluno');
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingUserName, setEditingUserName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseProfId, setNewCourseProfId] = useState('');
  const [newStudentId, setNewStudentId] = useState('');

  // Estados dos Novos Módulos (Provas, Leitura e Fórum)
  const [readingItem, setReadingItem] = useState(null); 
  const [activeForumItem, setActiveForumItem] = useState(null); 
  const [activeTopicId, setActiveTopicId] = useState(null); 
  const [activeExamItem, setActiveExamItem] = useState(null); 
  const [localQuestions, setLocalQuestions] = useState([]); // Variável blindada para evitar erros no React

  const editorRef = useRef(null); 
  const chatEndRef = useRef(null); 

  const isDbReady = usersLoaded && coursesLoaded && contentsLoaded && studentsLoaded && colsLoaded && forumsLoaded && examsLoaded;
  if (!isDbReady) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 flex-col">
        <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-black text-slate-800">Sincronizando com a Nuvem</h2>
        <p className="text-sm text-slate-500 mt-2">Conectando ao banco de dados do Portal COREMU...</p>
      </div>
    );
  }

  // ==========================================
  // FUNÇÕES GERAIS E NAVEGAÇÃO
  // ==========================================
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
      setCurrentView('user_home'); 
      setActiveCourseId(null);
    }
  };

  // ==========================================
  // GESTÃO DE USUÁRIOS E DISCIPLINAS
  // ==========================================
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

  const handleCancelEditUser = () => { setEditingUserId(null); setEditingUserName(''); };

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
    if (window.confirm('Excluir esta disciplina apagará todo o conteúdo. Confirmar?')) {
      setDbCourses(courses.filter(c => c && c.id !== id));
      if (activeCourseId === id) { setActiveCourseId(null); setCurrentView('admin_dashboard'); }
    }
  };

  const updateCourseDetails = (field, value) => setDbCourses(courses.map(c => c?.id === activeCourseId ? { ...c, [field]: value } : c));

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
    if (window.confirm('Remover a matrícula deste residente?')) {
      setDbStudents({ ...courseStudents, [activeCourseId]: rawActiveStudents.filter(s => s?.studentId !== studentId) });
    }
  };

  // ==========================================
  // CONTEÚDOS, UPLOAD E ÍCONES (CORRIGIDO)
  // ==========================================
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

  const handleOpenAddItemModal = (sectionId) => {
    setActiveSectionForNewItem(sectionId);
    setNewItemTitle(''); setNewItemType('FileText'); setNewItemUrl(''); setNewItemTextContent(''); setNewFile(null);
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
        alert("Erro no Upload! Verifique as Regras do Firebase Storage.");
        setIsUploading(false); return;
      }
      setIsUploading(false);
    }

    if (newItemType === 'MessageSquare') {
      setDbForums({ ...forums, [finalItemId]: [] }); 
    }
    if (newItemType === 'NativeExam') {
      setDbExams({ ...exams, [finalItemId]: { questions: [], submissions: {} } }); 
    }

    const textContentToSave = newItemType === 'TextContent' && editorRef.current ? editorRef.current.innerHTML : '';

    updateContent(activeContent.map(sec => {
      if (sec?.id === activeSectionForNewItem) {
        return {
          ...sec,
          items: [...(sec.items || []), { 
            id: finalItemId, title: newItemTitle, type: newItemType, color: color, url: finalUrl, fileName: finalFileName, textContent: textContentToSave
          }]
        };
      }
      return sec;
    }));
    setActiveSectionForNewItem(null); 
  };

  // Funções do Editor de Texto (WYSIWYG)
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    if (editorRef.current) editorRef.current.focus();
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

  // ==========================================
  // FUNÇÕES DE NOTAS E FREQUÊNCIAS
  // ==========================================
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

  const handleAddAttendanceCol = () => {
    const label = prompt("Digite a data e horário da aula (Ex: 15/09 - 08:00 às 10:00):");
    if (!label) return;
    const currentCols = attendanceCols[activeCourseId] || [];
    const newCols = [...currentCols, { id: `col_${Date.now()}`, label }];
    setDbAttendanceCols({ ...attendanceCols, [activeCourseId]: newCols });
    const updatedStudents = rawActiveStudents.map(s => ({ ...s, faltas: [...(s.faltas || []), false] }));
    setDbStudents({ ...courseStudents, [activeCourseId]: updatedStudents });
  };

  const handleRemoveAttendanceCol = (colIndex) => {
    if (!window.confirm('Deseja excluir esta aula do registro de todos os alunos?')) return;
    const currentCols = attendanceCols[activeCourseId] || [];
    const newCols = currentCols.filter((_, i) => i !== colIndex);
    setDbAttendanceCols({ ...attendanceCols, [activeCourseId]: newCols });
    const updatedStudents = rawActiveStudents.map(s => {
      const newFaltas = [...(s.faltas || [])];
      newFaltas.splice(colIndex, 1);
      return { ...s, faltas: newFaltas };
    });
    setDbStudents({ ...courseStudents, [activeCourseId]: updatedStudents });
  };

  const handlePrintPDF = () => { window.print(); };

  // Variáveis da Disciplina Ativa
  const activeContent = Array.isArray(courseContents[activeCourseId]) ? courseContents[activeCourseId] : [];
  const rawActiveStudents = Array.isArray(courseStudents[activeCourseId]) ? courseStudents[activeCourseId] : [];
  const currentAttendanceCols = attendanceCols[activeCourseId] || [];
  const activeCourseObj = courses.find(c => c && c.id === activeCourseId) || {};

  const studentsInCourse = rawActiveStudents.map(enrollment => ({
    ...enrollment, nome: systemUsers[enrollment?.studentId]?.nome || 'Usuário Excluído'
  }));

  const visibleGradesAndAttendance = role === 'aluno' ? studentsInCourse.filter(s => s.studentId === currentUser.id) : studentsInCourse;
  const availableStudentsForEnrollment = Object.values(systemUsers).filter(u => u && u.role === 'aluno' && !rawActiveStudents.some(s => s?.studentId === u.id));

  // ==========================================
  // RENDERIZAÇÕES DOS MÓDULOS ESPECÍFICOS
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
        id: `topic_${Date.now()}`, title, description: desc, authorId: currentUser.id, authorName: currentUser.nome, avatar: currentUser.avatar, createdAt: new Date().toISOString(), replies: []
      };
      setDbForums({ ...forums, [activeForumItem.id]: [...forumData, newTopic] });
      e.target.reset();
    };

    const handleReplyTopic = (e) => {
      e.preventDefault();
      const text = e.target.elements.reply.value;
      if(!text) return;
      const newReply = { id: `rep_${Date.now()}`, text, authorId: currentUser.id, authorName: currentUser.nome, avatar: currentUser.avatar, createdAt: new Date().toISOString() };
      
      const updatedTopics = forumData.map(t => t.id === activeTopicId ? { ...t, replies: [...(t.replies||[]), newReply] } : t);
      setDbForums({ ...forums, [activeForumItem.id]: updatedTopics });
      e.target.reset();
    };

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 print:hidden">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden animate-fade-in flex flex-col">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-purple-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5 text-purple-200"/>
              <div>
                <h2 className="font-bold leading-tight">{activeForumItem.title}</h2>
                <p className="text-[10px] text-purple-200 uppercase font-medium">Fórum de Discussão da Disciplina</p>
              </div>
            </div>
            <button onClick={() => { setActiveForumItem(null); setActiveTopicId(null); }} className="p-2 text-purple-200 hover:bg-purple-800 rounded-full transition-colors"><X className="w-5 h-5"/></button>
          </div>
          
          <div className="flex-1 flex overflow-hidden bg-slate-50">
            {!activeTopicId ? (
              <div className="flex-1 p-6 overflow-y-auto">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">Abrir Novo Tópico de Discussão</h3>
                  <form onSubmit={handleCreateTopic} className="space-y-3">
                    <input name="title" required placeholder="Título do Tópico (Ex: Dúvida sobre a Aula 02)" className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                    <textarea name="desc" required placeholder="Descreva sua dúvida ou assunto detalhadamente..." className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none h-20"></textarea>
                    <button type="submit" className="bg-purple-700 text-white font-bold px-4 py-2 rounded-lg hover:bg-purple-800 transition text-sm">Criar Tópico</button>
                  </form>
                </div>

                <div className="space-y-3">
                  {forumData.length === 0 ? (
                    <div className="text-center p-8 text-slate-400 font-medium">Nenhum tópico criado neste fórum. Seja o primeiro!</div>
                  ) : (
                    forumData.map(topic => (
                      <div key={topic.id} onClick={() => setActiveTopicId(topic.id)} className="bg-white p-4 border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md cursor-pointer transition flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold shrink-0">{topic.avatar}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-base">{topic.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">Por {topic.authorName} em {new Date(topic.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-center shrink-0">
                          <span className="block font-black text-purple-700 text-lg">{(topic.replies || []).length}</span>
                          <span className="text-[10px] uppercase font-bold text-slate-400">Respostas</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col h-full bg-white">
                <div className="p-4 border-b border-slate-100 bg-slate-50 shrink-0">
                  <button onClick={() => setActiveTopicId(null)} className="text-xs font-bold text-slate-500 hover:text-purple-700 flex items-center gap-1"><ChevronRight className="w-4 h-4 rotate-180"/> Voltar aos Tópicos</button>
                  <h3 className="font-black text-xl text-slate-800 mt-2">{currentTopicData?.title}</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3 border-b border-slate-100 pb-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">{currentTopicData?.avatar}</div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{currentTopicData?.authorName}</p>
                        <p className="text-[10px] text-slate-400">{new Date(currentTopicData?.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 text-sm whitespace-pre-wrap">{currentTopicData?.description}</p>
                  </div>

                  <div className="pl-8 space-y-4 border-l-2 border-slate-200">
                    {(currentTopicData?.replies || []).map(reply => (
                      <div key={reply.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
                        <div className="absolute -left-10 top-4 w-8 border-t-2 border-slate-200"></div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0">{reply.avatar}</div>
                          <p className="font-bold text-slate-800 text-xs">{reply.authorName} <span className="font-normal text-slate-400 ml-2">{new Date(reply.createdAt).toLocaleString()}</span></p>
                        </div>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                  <form onSubmit={handleReplyTopic} className="flex gap-3">
                    <textarea name="reply" required placeholder="Escreva sua resposta..." className="flex-1 border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none h-14"></textarea>
                    <button type="submit" className="bg-purple-700 text-white font-bold px-6 py-2 rounded-lg hover:bg-purple-800 transition flex items-center justify-center">Enviar</button>
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
    
    // Funções Seguras do Editor de Provas (Top-Level State modificado para State Derivado de Variável Global)
    const handleAddQuestion = () => {
      const newQ = [...localQuestions, { id: `q_${Date.now()}`, title: 'Nova Pergunta', options: ['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4'], correctIndex: 0 }];
      setLocalQuestions(newQ);
    };
    
    const handleUpdateQuestion = (index, field, value) => {
      const newQ = [...localQuestions];
      newQ[index][field] = value;
      setLocalQuestions(newQ);
    };

    const handleUpdateOption = (qIndex, oIndex, value) => {
      const newQ = [...localQuestions];
      newQ[qIndex].options[oIndex] = value;
      setLocalQuestions(newQ);
    };

    const handleSaveExam = () => {
      setDbExams({ ...exams, [activeExamItem.id]: { ...examData, questions: localQuestions } });
      setActiveExamItem(null);
      setLocalQuestions([]);
      alert("Prova configurada e salva com sucesso!");
    };

    const handleCloseExam = () => {
      setActiveExamItem(null);
      setLocalQuestions([]);
    };

    if (isEditing) {
      return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] overflow-hidden animate-fade-in flex flex-col">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-rose-700 text-white shrink-0">
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5"/>
                <div>
                  <h2 className="font-bold leading-tight">Configurar Prova: {activeExamItem.title}</h2>
                  <p className="text-[10px] uppercase font-medium">Construtor Nativo</p>
                </div>
              </div>
              <button onClick={handleCloseExam} className="p-2 hover:bg-rose-800 rounded-full transition-colors"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 space-y-6">
              {localQuestions.map((q, qIndex) => (
                <div key={q.id} className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm relative">
                  <button onClick={() => setLocalQuestions(localQuestions.filter((_, i) => i !== qIndex))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Pergunta {qIndex + 1}</label>
                  <input type="text" value={q.title} onChange={e => handleUpdateQuestion(qIndex, 'title', e.target.value)} className="w-full border border-slate-300 p-3 rounded-lg text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none mb-4" />
                  
                  <div className="space-y-3 pl-4 border-l-2 border-slate-100">
                    {q.options.map((opt, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-3">
                        <input type="radio" name={`correct_${q.id}`} checked={q.correctIndex === oIndex} onChange={() => handleUpdateQuestion(qIndex, 'correctIndex', oIndex)} className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer"/>
                        <input type="text" value={opt} onChange={e => handleUpdateOption(qIndex, oIndex, e.target.value)} className={`flex-1 border p-2 rounded-lg text-sm outline-none transition-all ${q.correctIndex === oIndex ? 'border-emerald-400 bg-emerald-50 text-emerald-800 font-bold' : 'border-slate-300 bg-white'}`} />
                        {q.correctIndex === oIndex && <span className="text-[10px] font-bold text-emerald-600 uppercase">Correta</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              <button onClick={handleAddQuestion} className="w-full border-2 border-dashed border-rose-300 text-rose-700 font-bold p-4 rounded-xl hover:bg-rose-50 transition flex items-center justify-center gap-2">
                <Plus className="w-5 h-5"/> Adicionar Pergunta
              </button>
            </div>

            <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex justify-end gap-3">
              <button onClick={handleCloseExam} className="px-6 py-2 rounded-lg text-sm font-bold text-slate-600 hover:bg-slate-100">Cancelar</button>
              <button onClick={handleSaveExam} className="bg-rose-700 text-white font-bold px-6 py-2 rounded-lg hover:bg-rose-800 transition shadow-md">Salvar Prova Oficial</button>
            </div>
          </div>
        </div>
      );
    }

    const mySubmission = examData.submissions[currentUser.id];
    const handleSumbitExam = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      let score = 0;
      const answers = [];
      
      examData.questions.forEach((q, index) => {
        const selectedOption = parseInt(formData.get(`q_${index}`));
        answers.push(selectedOption);
        if (selectedOption === q.correctIndex) score++;
      });
      
      const finalScore = ((score / examData.questions.length) * 10).toFixed(1);
      const newSubmissions = { ...examData.submissions, [currentUser.id]: { score: finalScore, answers, submittedAt: new Date().toISOString() } };
      setDbExams({ ...exams, [activeExamItem.id]: { ...examData, submissions: newSubmissions } });
      alert(`Prova enviada com sucesso! Sua nota foi: ${finalScore}`);
    };

    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 print:hidden">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[85vh] overflow-hidden animate-fade-in flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-rose-700 text-white shrink-0">
            <div>
              <h2 className="font-black text-2xl leading-tight">{activeExamItem.title}</h2>
              <p className="text-xs text-rose-200 uppercase font-bold mt-1">Avaliação Oficial COREMU</p>
            </div>
            <button onClick={handleCloseExam} className="p-2 hover:bg-rose-800 rounded-full transition-colors"><X className="w-6 h-6"/></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50">
            {mySubmission ? (
              <div className="text-center bg-white p-12 rounded-2xl border border-slate-200 shadow-sm max-w-md mx-auto mt-10">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4"/>
                <h3 className="text-2xl font-black text-slate-800">Prova Concluída</h3>
                <p className="text-slate-500 mt-2">Você já enviou suas respostas para esta avaliação.</p>
                <div className="mt-6 inline-block bg-slate-100 p-4 rounded-xl border border-slate-200">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nota Final Obtida</span>
                  <span className="text-4xl font-black text-slate-800">{mySubmission.score}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSumbitExam} className="space-y-8 max-w-2xl mx-auto">
                {examData.questions.length === 0 ? (
                  <p className="text-center text-slate-500">O professor ainda não configurou as questões desta prova.</p>
                ) : (
                  <>
                    {examData.questions.map((q, qIndex) => (
                      <div key={qIndex} className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                        <h4 className="font-bold text-slate-800 text-lg mb-4">{qIndex + 1}. {q.title}</h4>
                        <div className="space-y-3">
                          {q.options.map((opt, oIndex) => (
                            <label key={oIndex} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 hover:border-rose-300 transition-all has-[:checked]:bg-rose-50 has-[:checked]:border-rose-500 has-[:checked]:ring-1 has-[:checked]:ring-rose-500">
                              <input type="radio" required name={`q_${qIndex}`} value={oIndex} className="mt-1 w-4 h-4 text-rose-600 focus:ring-rose-500 border-slate-300"/>
                              <span className="text-sm font-medium text-slate-700 leading-relaxed">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="pt-6 flex justify-end border-t border-slate-200">
                      <button type="submit" className="bg-rose-700 text-white font-bold px-8 py-4 rounded-xl hover:bg-rose-800 transition shadow-lg text-lg flex items-center gap-2">
                        <Check className="w-6 h-6"/> Enviar Respostas Oficialmente
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
  // RENDERIZAÇÕES PRINCIPAIS DAS TELAS
  // ==========================================
  // (Reaproveitamento das telas UserHome, AdminUsers, AdminDashboard, Participants, Grades, Attendance, Home, Modal)

  const renderCourseHome = () => (
    <div className="animate-fade-in relative">
      
      {/* MODAL DE ADICIONAR ITEM */}
      {activeSectionForNewItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-fade-in flex flex-col h-[90vh]">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-slate-800">Adicionar atividade ou recurso</h3>
              <button onClick={() => setActiveSectionForNewItem(null)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form onSubmit={handleConfirmAddItem} className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Título / Nome do Recurso</label>
                  <input type="text" required value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} placeholder="Ex: Aula 01 - Fundamentos" className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Selecione o Tipo de Material</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div onClick={() => setNewItemType('FileText')} className={`cursor-pointer border p-3 rounded-lg flex flex-col items-center gap-2 transition-all text-center ${newItemType === 'FileText' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      <FileText className="w-6 h-6"/><span className="text-[10px] font-bold leading-tight">Arquivo<br/>PDF/Doc</span>
                    </div>
                    <div onClick={() => setNewItemType('TextContent')} className={`cursor-pointer border p-3 rounded-lg flex flex-col items-center gap-2 transition-all text-center ${newItemType === 'TextContent' ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      <AlignLeft className="w-6 h-6"/><span className="text-[10px] font-bold leading-tight">Página<br/>Texto Escrito</span>
                    </div>
                    <div onClick={() => setNewItemType('Link')} className={`cursor-pointer border p-3 rounded-lg flex flex-col items-center gap-2 transition-all text-center ${newItemType === 'Link' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      <Link className="w-6 h-6"/><span className="text-[10px] font-bold leading-tight">Link Externo<br/>Vídeo/Site</span>
                    </div>
                    <div onClick={() => setNewItemType('NativeExam')} className={`cursor-pointer border p-3 rounded-lg flex flex-col items-center gap-2 transition-all text-center ${newItemType === 'NativeExam' ? 'border-rose-500 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      <ClipboardList className="w-6 h-6"/><span className="text-[10px] font-bold leading-tight">Prova Nativa<br/>Avaliação COREMU</span>
                    </div>
                    <div onClick={() => setNewItemType('MessageSquare')} className={`cursor-pointer border p-3 rounded-lg flex flex-col items-center gap-2 transition-all text-center ${newItemType === 'MessageSquare' ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                      <MessageSquare className="w-6 h-6"/><span className="text-[10px] font-bold leading-tight">Fórum<br/>Tópicos de Dúvidas</span>
                    </div>
                  </div>
                </div>

                <div className="animate-fade-in border-t pt-4">
                  {newItemType === 'FileText' || newItemType === 'Upload' ? (
                    <>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Anexar Arquivo do Computador</label>
                      <input type="file" onChange={(e) => setNewFile(e.target.files[0])} className="w-full border border-slate-300 p-2 rounded-lg text-sm bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer text-slate-500" />
                    </>
                  ) : newItemType === 'Link' ? (
                    <>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-2">URL do Link (Vídeo, Site, etc)</label>
                      <input type="url" required value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} placeholder="https://..." className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" />
                    </>
                  ) : newItemType === 'NativeExam' ? (
                    <div className="bg-rose-50 text-rose-800 p-4 rounded-lg text-sm font-medium border border-rose-200 flex items-center gap-3">
                      <ClipboardList className="w-8 h-8 shrink-0 text-rose-500"/>
                      A prova será criada vazia. Após salvar, clique no botão "Configurar Prova Oficial" no mural para adicionar as perguntas e o gabarito.
                    </div>
                  ) : newItemType === 'MessageSquare' ? (
                    <div className="bg-purple-50 text-purple-800 p-4 rounded-lg text-sm font-medium border border-purple-200 flex items-center gap-3">
                      <MessageSquare className="w-8 h-8 shrink-0 text-purple-500"/>
                      O Fórum de Discussão será ativado e permitirá a criação de Tópicos e Respostas (Estilo phpBB) entre professores e alunos.
                    </div>
                  ) : newItemType === 'TextContent' ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-amber-600 uppercase block">Conteúdo da Página (WYSIWYG Editor)</label>
                      <div className="border border-slate-300 rounded-lg overflow-hidden bg-white flex flex-col h-64 shadow-inner">
                        <div className="bg-slate-100 border-b border-slate-300 p-2 flex gap-1 items-center shrink-0">
                          <button type="button" onClick={() => execCommand('bold')} className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition" title="Negrito"><Bold className="w-4 h-4"/></button>
                          <button type="button" onClick={() => execCommand('italic')} className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition" title="Itálico"><Italic className="w-4 h-4"/></button>
                          <button type="button" onClick={() => execCommand('underline')} className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition" title="Sublinhado"><Underline className="w-4 h-4"/></button>
                          <div className="w-px h-5 bg-slate-300 mx-1"></div>
                          <button type="button" onClick={() => execCommand('formatBlock', 'H1')} className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition" title="Título Principal"><Heading1 className="w-4 h-4"/></button>
                          <button type="button" onClick={() => execCommand('formatBlock', 'H2')} className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition" title="Subtítulo"><Heading2 className="w-4 h-4"/></button>
                          <div className="w-px h-5 bg-slate-300 mx-1"></div>
                          <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-1.5 hover:bg-slate-200 rounded text-slate-700 transition" title="Lista"><List className="w-4 h-4"/></button>
                        </div>
                        <div 
                          ref={editorRef}
                          contentEditable 
                          className="p-4 outline-none flex-1 overflow-y-auto prose max-w-none prose-sm"
                          placeholder="Digite o conteúdo da aula aqui..."
                        ></div>
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="pt-4 border-t border-slate-100 shrink-0">
                  <button type="submit" disabled={isUploading} className="w-full bg-teal-800 text-white font-bold p-3.5 rounded-lg hover:bg-teal-900 transition shadow-md disabled:bg-slate-400">
                    {isUploading ? (
                      <span className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin"/> Enviando arquivo...</span>
                    ) : 'Salvar e Publicar no Mural'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LEITURA DE TEXTO (TEXTCONTENT) */}
      {readingItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><AlignLeft className="w-5 h-5"/></div>
                <h2 className="font-black text-xl text-slate-800">{readingItem.title}</h2>
              </div>
              <button onClick={() => setReadingItem(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"><X className="w-6 h-6"/></button>
            </div>
            <div className="p-6 sm:p-10 overflow-y-auto bg-white flex-1">
              <div className="prose prose-slate max-w-none text-slate-700" dangerouslySetInnerHTML={{ __html: readingItem.textContent }}></div>
            </div>
          </div>
        </div>
      )}

      {activeForumItem && renderForumModal()}
      {activeExamItem && renderExamModal()}

      {isEditing && (
        <div onClick={addSection} className="mb-6 border border-dashed border-teal-400 rounded-lg p-4 text-center bg-teal-50/50 hover:bg-teal-100 cursor-pointer transition text-teal-700 font-bold text-sm flex items-center justify-center gap-2 shadow-sm print:hidden">
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
        <div key={section.id} className={`mb-6 rounded-lg border ${section.borderColor || 'border-slate-200'} overflow-hidden shadow-sm bg-white print:break-inside-avoid`}>
          <div className={`flex items-center justify-between p-3 ${section.bgColor || 'bg-slate-50'} border-b ${section.borderColor || 'border-slate-200'}`}>
            <div className="flex items-center gap-3 w-full">
              <button onClick={() => toggleModule(section.id)} className="p-1 hover:bg-slate-200 rounded print:hidden">
                {expandedModules[section.id] !== false ? <ChevronDown className="w-5 h-5 text-slate-500"/> : <ChevronRight className="w-5 h-5 text-slate-500"/>}
              </button>
              {isEditing ? (
                <input type="text" value={section.title || ''} onChange={(e) => updateSectionTitle(section.id, e.target.value)} className="bg-white border border-slate-300 rounded px-2 py-1 text-base font-bold text-slate-800 w-full max-w-md focus:ring-2 focus:ring-teal-500 outline-none" />
              ) : (
                <h3 className="text-base font-bold text-slate-800 cursor-pointer" onClick={() => toggleModule(section.id)}>{section.title}</h3>
              )}
            </div>
            {isEditing && (
              <button onClick={() => deleteSection(section.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors ml-2 print:hidden"><Trash2 className="w-4 h-4" /></button>
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
                      {isEditing && <GripVertical className="w-4 h-4 text-slate-300 cursor-move mt-1 print:hidden" />}
                      <IconComponent className={`w-5 h-5 ${item.color || 'text-slate-500'} flex-shrink-0 mt-0.5`} />
                      <div className="flex-1">
                        {isEditing ? (
                          <input type="text" value={item.title || ''} onChange={(e) => updateItemTitle(section.id, item.id, e.target.value)} className="bg-white border border-slate-300 rounded px-2 py-1 text-sm font-semibold text-slate-800 w-full max-w-md focus:ring-2 focus:ring-teal-500 outline-none" />
                        ) : (
                          <h4 className="text-sm font-semibold text-slate-800">{item.title}</h4>
                        )}
                        
                        {!isEditing && (
                          <div className="mt-1.5 flex flex-wrap gap-2 print:hidden">
                            {item.fileName && item.url && (
                              <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-md transition shadow-sm w-fit">
                                <Download className="w-3.5 h-3.5"/> Baixar {item.fileName}
                              </a>
                            )}
                            {item.type === 'NativeExam' && (
                              <button onClick={() => { setActiveExamItem(item); setLocalQuestions(exams[item.id]?.questions || []); }} className="flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-4 py-1.5 rounded-md transition shadow-md w-fit">
                                <ClipboardList className="w-4 h-4"/> {(role === 'professor' || role === 'admin') ? 'Configurar Prova Oficial' : 'Acessar Avaliação'}
                              </button>
                            )}
                            {item.type === 'Link' && item.url && !item.fileName && (
                              <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-md transition shadow-sm w-fit">
                                <Link className="w-3.5 h-3.5"/> Abrir Link Externo
                              </a>
                            )}
                            {item.type === 'TextContent' && (
                              <button onClick={() => setReadingItem(item)} className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-md transition shadow-sm w-fit">
                                <AlignLeft className="w-3.5 h-3.5"/> Ler Conteúdo
                              </button>
                            )}
                            {item.type === 'MessageSquare' && (
                              <button onClick={() => setActiveForumItem(item)} className="flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-md transition shadow-sm w-fit">
                                <MessageSquare className="w-3.5 h-3.5"/> Abrir Fórum
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    {isEditing && (
                      <button onClick={() => deleteItem(section.id, item.id)} className="p-1 text-slate-300 hover:text-red-500 transition-colors ml-2 print:hidden"><Trash2 className="w-4 h-4" /></button>
                    )}
                  </div>
                );
              })}
              {isEditing && (
                <div className="p-3 border-t border-dashed border-slate-300 bg-slate-50 flex justify-end print:hidden">
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

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans text-slate-800 overflow-hidden print:bg-white print:h-auto print:overflow-visible">
      
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col flex-shrink-0 shadow-2xl z-20 relative print:hidden`}>
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

            {(role === 'professor' || role === 'aluno') && (
              <button onClick={() => {setCurrentView('user_home'); setActiveCourseId(null); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-bold transition-colors ${currentView === 'user_home' ? 'bg-teal-900/40 text-teal-400 border-l-4 border-teal-500' : 'hover:bg-slate-800 text-slate-400'}`}>
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
                  <button onClick={() => {setActiveCourseId(c.id); setCurrentView('course_home'); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm transition-colors ${isCourseActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 text-slate-400'}`} title={c.nome}>
                    <Book className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="truncate">{c.nome}</span>}
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative print:overflow-visible">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 shadow-sm z-10 print:hidden">
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

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#f8f9fa] print:bg-white print:p-0 print:overflow-visible">
          <div className="max-w-5xl mx-auto">
            
            {currentView === 'user_home' && renderUserHome()}
            {currentView === 'admin_dashboard' && renderAdminDashboard()}
            {currentView === 'admin_users' && renderAdminUsers()}
            {currentView === 'empty_state' && renderEmptyState()}

            {activeCourseId && ['course_home', 'participants', 'grades', 'attendance'].includes(currentView) && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                  <div className="flex-1">
                    {isEditing ? (
                      <input type="text" value={activeCourseObj?.nome || ''} onChange={(e) => updateCourseDetails('nome', e.target.value)} placeholder="Nome da Disciplina" className="w-full text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight bg-transparent border-b-2 border-dashed border-slate-300 focus:border-teal-500 focus:outline-none mb-1 pb-1" />
                    ) : (
                      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">{activeCourseObj?.nome}</h1>
                    )}
                    
                    {isEditing ? (
                      <div className="flex items-center gap-2 mt-2">
                        <input type="text" value={activeCourseObj?.codigo || ''} onChange={(e) => updateCourseDetails('codigo', e.target.value)} placeholder="Código" className="w-32 text-sm text-slate-500 font-medium bg-transparent border-b-2 border-dashed border-slate-300 focus:border-teal-500 focus:outline-none" />
                        <span className="text-sm text-slate-500 font-medium">• Professor: {systemUsers[activeCourseObj?.professorId]?.nome}</span>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 mt-1 font-medium">{activeCourseObj?.codigo} • Professor Titular: {systemUsers[activeCourseObj?.professorId]?.nome}</p>
                    )}
                  </div>
                  
                  {hasEditPermission && (
                    <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-lg shadow-sm shrink-0 print:hidden">
                      <span className="text-xs font-bold text-slate-600 px-2 hidden sm:inline">Modo de Edição</span>
                      <button onClick={() => setEditMode(!editMode)} className={`flex items-center px-3 py-1.5 rounded-md text-xs font-bold transition-all ${editMode ? 'bg-teal-700 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        {editMode ? <ToggleRight className="w-4 h-4 mr-1"/> : <ToggleLeft className="w-4 h-4 mr-1"/>}
                        {editMode ? 'Ativo' : 'Inativo'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center text-xs text-slate-500 mb-6 bg-white p-3 rounded-md border border-slate-200 shadow-sm print:hidden">
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
