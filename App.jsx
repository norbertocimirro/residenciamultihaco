import React, { useState, useEffect, useRef } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Estilo profissional do Editor
import { 
  Menu, Bell, Search, Home, Book, Calendar, BarChart, 
  ChevronDown, ChevronRight, Plus, FileText, 
  MessageSquare, Folder, CheckCircle, Upload, Download,
  ToggleLeft, ToggleRight, Layout, GripVertical, Trash2,
  Shield, UserPlus, CheckSquare, X, Link, Paperclip, Users, 
  Edit2, Check, Loader2, Printer, AlignLeft, ClipboardList, Send, MessageCircle
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

let app, db, storage;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  storage = getStorage(app);
} catch (e) {
  console.error("Erro inicializando Firebase", e);
}

// ==========================================
// ESCUDO CONTRA TELA BRANCA
// ==========================================
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 h-screen overflow-auto">
          <h1 className="text-2xl font-bold text-red-700 mb-4">🚨 Erro de Sistema</h1>
          <pre className="bg-white p-4 border rounded text-xs text-red-600 whitespace-pre-wrap">{this.state.error?.toString()}</pre>
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
    const unsub = onSnapshot(doc(db, 'coremu_database', docName), 
      (docSnap) => {
        if (docSnap.exists()) setData(docSnap.data().value || initialValue);
        else { setDoc(doc(db, 'coremu_database', docName), { value: initialValue }); setData(initialValue); }
        setIsLoaded(true);
      },
      () => { setData(initialValue); setIsLoaded(true); }
    );
    return () => unsub();
  }, [docName]);

  const updateData = async (newValue) => {
    const valToSave = typeof newValue === 'function' ? newValue(data) : newValue;
    setData(valToSave); 
    if (db) await setDoc(doc(db, 'coremu_database', docName), { value: valToSave }).catch(console.error);
  };
  return [data, updateData, isLoaded];
};

// ==========================================
// CONFIGURAÇÕES DO EDITOR PROFISSIONAL
// ==========================================
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
// COMPONENTE PRINCIPAL DO PORTAL
// ==========================================
function LmsEnterprisePortal() {
  
  // BANCOS DE DADOS
  const [dbUsers, setDbUsers, usersLoaded] = useFirestoreDB('tb_users', {
    'admin1': { id: 'admin1', nome: 'Gestão COREMU', role: 'admin', avatar: 'GC' },
    'prof1': { id: 'prof1', nome: '1º Ten Norberto Cimirro', role: 'professor', avatar: 'NC' },
    'stu1': { id: 'stu1', nome: 'Mariana Alves', role: 'aluno', avatar: 'MA' }
  });
  const [dbCourses, setDbCourses, coursesLoaded] = useFirestoreDB('tb_courses', [
    { id: 'c1', codigo: '001/003/07A', nome: 'Enfermagem Forense e Saúde da Família', professorId: 'prof1' }
  ]);
  const defaultModules = [{
    id: 'boas_vindas', title: 'Mural de Boas-vindas', bgColor: 'bg-blue-50/50', borderColor: 'border-blue-100',
    items: [{ id: 'i1', title: 'Plano de Ensino', type: 'FileText', color: 'text-red-500', fileName: 'Plano_de_Ensino_2026.pdf' }]
  }];
  const [dbContents, setDbContents, contentsLoaded] = useFirestoreDB('tb_contents', { 'c1': defaultModules });
  const [dbStudents, setDbStudents, studentsLoaded] = useFirestoreDB('tb_enrollments', { 'c1': [{ studentId: 'stu1', ga: 8.6, gb: 7.4, gc: 0, faltas: [], feedback: "" }] });
  const [dbAttendanceCols, setDbAttendanceCols, colsLoaded] = useFirestoreDB('tb_attendance_cols', { 'c1': [] });
  const [dbForums, setDbForums, forumsLoaded] = useFirestoreDB('tb_forums_v3', {});
  const [dbExams, setDbExams, examsLoaded] = useFirestoreDB('tb_exams_v1', {});

  const systemUsers = typeof dbUsers === 'object' && dbUsers !== null ? dbUsers : {};
  const courses = Array.isArray(dbCourses) ? dbCourses : [];
  const courseContents = typeof dbContents === 'object' && dbContents !== null ? dbContents : {};
  const courseStudents = typeof dbStudents === 'object' && dbStudents !== null ? dbStudents : {};
  const attendanceCols = typeof dbAttendanceCols === 'object' && dbAttendanceCols !== null ? dbAttendanceCols : {};
  const forums = typeof dbForums === 'object' && dbForums !== null ? dbForums : {};
  const exams = typeof dbExams === 'object' && dbExams !== null ? dbExams : {};

  // NAVEGAÇÃO E SESSÃO
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

  // ESTADOS GERAIS
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

  // ESTADOS DOS MÓDULOS DE AULA
  const [readingItem, setReadingItem] = useState(null); 
  const [activeForumItem, setActiveForumItem] = useState(null); 
  const [activeTopicId, setActiveTopicId] = useState(null); 
  const [activeExamItem, setActiveExamItem] = useState(null); 
  const [localQuestions, setLocalQuestions] = useState([]);

  if (!(usersLoaded && coursesLoaded && contentsLoaded && studentsLoaded && colsLoaded && forumsLoaded && examsLoaded)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 flex-col">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
        <h2 className="text-xl font-black text-slate-800">Sincronizando com a Nuvem</h2>
        <p className="text-sm text-slate-500 mt-2">Iniciando AVA Profissional COREMU...</p>
      </div>
    );
  }

  const visibleCourses = courses.filter(c => c && (role === 'admin' || (role === 'professor' && c.professorId === currentUser.id) || (role === 'aluno' && Array.isArray(courseStudents[c.id]) && courseStudents[c.id].some(e => e?.studentId === currentUser.id))));

  const switchUser = (userId) => {
    setActiveUserId(userId); setEditMode(false); setActiveCourseId(null);
    setCurrentView(systemUsers[userId]?.role === 'admin' ? 'admin_dashboard' : 'user_home'); 
  };

  // ==========================================
  // LÓGICA DE UPLOAD E PUBLICAÇÃO
  // ==========================================
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
        alert("Erro no Upload! Verifique as regras do Storage no Firebase.");
        setIsUploading(false); return;
      }
      setIsUploading(false);
    }

    if (newItemType === 'MessageSquare') setDbForums({ ...forums, [finalItemId]: [] }); 
    if (newItemType === 'NativeExam') setDbExams({ ...exams, [finalItemId]: { questions: [], submissions: {} } }); 

    updateContent(activeContent.map(sec => {
      if (sec?.id === activeSectionForNewItem) {
        return {
          ...sec,
          items: [...(sec.items || []), { 
            id: finalItemId, title: newItemTitle, type: newItemType, color: color, url: finalUrl, fileName: finalFileName, textContent: newItemTextContent
          }]
        };
      }
      return sec;
    }));
    setActiveSectionForNewItem(null); 
  };

  // Demais funções (Simplificadas para poupar espaço mas mantendo a lógica de update)
  const toggleModule = (id) => setExpandedModules(prev => ({ ...prev, [id]: !prev[id] }));
  const updateContent = (newContent) => setDbContents({ ...courseContents, [activeCourseId]: newContent });
  const addSection = () => { const newSec = { id: `sec_${Date.now()}`, title: 'Novo Módulo', bgColor: 'bg-slate-50', borderColor: 'border-slate-200', items: [] }; updateContent([...activeContent, newSec]); setExpandedModules(prev => ({ ...prev, [newSec.id]: true })); };
  const deleteSection = (id) => { if (window.confirm('Excluir este módulo?')) updateContent(activeContent.filter(sec => sec?.id !== id)); };
  const updateItemTitle = (sId, iId, val) => updateContent(activeContent.map(sec => sec?.id === sId ? { ...sec, items: (sec.items || []).map(item => item?.id === iId ? { ...item, title: val } : item) } : sec));
  const deleteItem = (sId, iId) => updateContent(activeContent.map(sec => sec?.id === sId ? { ...sec, items: (sec.items || []).filter(item => item?.id !== iId) } : sec));
  
  const handleOpenAddItemModal = (sectionId) => { setActiveSectionForNewItem(sectionId); setNewItemTitle(''); setNewItemType('FileText'); setNewItemUrl(''); setNewItemTextContent(''); setNewFile(null); };

  const handleCreateUser = (e) => { e.preventDefault(); if (!newUserName) return; const newId = `usr_${Date.now()}`; setDbUsers({ ...systemUsers, [newId]: { id: newId, nome: newUserName, role: newUserRole, avatar: newUserName.substring(0, 2).toUpperCase() } }); setNewUserName(''); alert('Salvo com sucesso!'); };
  const handleDeleteUser = (id) => { if (id === 'admin1') return; if (window.confirm('Excluir?')) { const u = { ...systemUsers }; delete u[id]; setDbUsers(u); } };
  const handleSaveEditedUser = (id) => { if (!editingUserName.trim()) return; const u = { ...systemUsers }; u[id].nome = editingUserName; u[id].avatar = editingUserName.substring(0, 2).toUpperCase(); setDbUsers(u); setEditingUserId(null); setEditingUserName(''); };
  
  const handleCreateCourse = (e) => { e.preventDefault(); if (!newCourseCode || !newCourseName || !newCourseProfId) return; const newId = `c_${Date.now()}`; setDbCourses([...courses, { id: newId, codigo: newCourseCode, nome: newCourseName, professorId: newCourseProfId }]); setDbContents({ ...courseContents, [newId]: defaultModules }); setDbStudents({ ...courseStudents, [newId]: [] }); setDbAttendanceCols({ ...attendanceCols, [newId]: [] }); setNewCourseCode(''); setNewCourseName(''); setNewCourseProfId(''); alert('Disciplina criada com sucesso!'); };
  const handleDeleteCourse = (id) => { if (window.confirm('Excluir disciplina?')) { setDbCourses(courses.filter(c => c && c.id !== id)); if (activeCourseId === id) { setActiveCourseId(null); setCurrentView('admin_dashboard'); } } };
  const updateCourseDetails = (field, value) => setDbCourses(courses.map(c => c?.id === activeCourseId ? { ...c, [field]: value } : c));
  const handleEnrollStudent = (e, courseId) => { e.preventDefault(); if (!newStudentId) return; const len = (attendanceCols[courseId] || []).length; const stu = { studentId: newStudentId, ga: 0, gb: 0, gc: 0, faltas: new Array(len).fill(false), feedback: "" }; setDbStudents({ ...courseStudents, [courseId]: [...(courseStudents[courseId] || []), stu] }); setNewStudentId(''); };
  const deleteStudent = (studentId) => { if (window.confirm('Remover matrícula?')) { setDbStudents({ ...courseStudents, [activeCourseId]: (courseStudents[activeCourseId] || []).filter(s => s?.studentId !== studentId) }); } };

  // Notas e Frequencia
  const updateGrade = (studentId, field, value) => setDbStudents({ ...courseStudents, [activeCourseId]: (courseStudents[activeCourseId] || []).map(s => s?.studentId === studentId ? { ...s, [field]: parseFloat(value) || 0 } : s) });
  const updateFeedback = (studentId, value) => setDbStudents({ ...courseStudents, [activeCourseId]: (courseStudents[activeCourseId] || []).map(s => s?.studentId === studentId ? { ...s, feedback: value } : s) });
  const toggleAttendance = (studentId, index) => setDbStudents({ ...courseStudents, [activeCourseId]: (courseStudents[activeCourseId] || []).map(s => { if (s?.studentId === studentId) { const nf = [...(s.faltas || [])]; nf[index] = !nf[index]; return { ...s, faltas: nf }; } return s; }) });
  
  const handleAddAttendanceCol = () => { const label = prompt("Data e Horário (Ex: 15/09 - 08:00):"); if (!label) return; setDbAttendanceCols({ ...attendanceCols, [activeCourseId]: [...(attendanceCols[activeCourseId] || []), { id: `col_${Date.now()}`, label }] }); setDbStudents({ ...courseStudents, [activeCourseId]: (courseStudents[activeCourseId] || []).map(s => ({ ...s, faltas: [...(s.faltas || []), false] })) }); };
  const handleRemoveAttendanceCol = (colIndex) => { if (!window.confirm('Excluir esta aula?')) return; setDbAttendanceCols({ ...attendanceCols, [activeCourseId]: (attendanceCols[activeCourseId] || []).filter((_, i) => i !== colIndex) }); setDbStudents({ ...courseStudents, [activeCourseId]: (courseStudents[activeCourseId] || []).map(s => { const nf = [...(s.faltas || [])]; nf.splice(colIndex, 1); return { ...s, faltas: nf }; }) }); };

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
  const activeCourseObj = courses.find(c => c && c.id === activeCourseId) || {};
  const studentsInCourse = rawActiveStudents.map(e => ({ ...e, nome: systemUsers[e?.studentId]?.nome || 'Usuário Excluído' }));
  const visibleGradesAndAttendance = role === 'aluno' ? studentsInCourse.filter(s => s.studentId === currentUser.id) : studentsInCourse;
  const availableStudentsForEnrollment = Object.values(systemUsers).filter(u => u && u.role === 'aluno' && !rawActiveStudents.some(s => s?.studentId === u.id));


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
      const newTopic = { id: `topic_${Date.now()}`, title, description: desc, authorId: currentUser.id, authorName: currentUser.nome, avatar: currentUser.avatar, createdAt: new Date().toISOString(), replies: [] };
      setDbForums({ ...forums, [activeForumItem.id]: [...forumData, newTopic] });
      e.target.reset();
    };

    const handleReplyTopic = (e) => {
      e.preventDefault();
      const text = e.target.elements.reply.value;
      if(!text) return;
      const newReply = { id: `rep_${Date.now()}`, text, authorId: currentUser.id, authorName: currentUser.nome, avatar: currentUser.avatar, createdAt: new Date().toISOString() };
      setDbForums({ ...forums, [activeForumItem.id]: forumData.map(t => t.id === activeTopicId ? { ...t, replies: [...(t.replies||[]), newReply] } : t) });
      e.target.reset();
    };

    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 print:hidden">
        <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] overflow-hidden animate-fade-in flex flex-col">
          <div className="p-5 border-b border-purple-800 flex justify-between items-center bg-purple-900 text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-800 rounded-lg"><MessageCircle className="w-6 h-6 text-purple-200"/></div>
              <div>
                <h2 className="font-bold text-lg leading-tight">{activeForumItem.title}</h2>
                <p className="text-[11px] text-purple-300 uppercase tracking-widest font-bold">Fórum Acadêmico Oficial</p>
              </div>
            </div>
            <button onClick={() => { setActiveForumItem(null); setActiveTopicId(null); }} className="p-2 text-purple-200 hover:bg-purple-800 rounded-full transition-colors"><X className="w-6 h-6"/></button>
          </div>
          
          <div className="flex-1 flex overflow-hidden">
            {!activeTopicId ? (
              <div className="flex-1 p-8 overflow-y-auto space-y-8">
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg"><MessageSquare className="w-5 h-5 text-purple-600"/> Abrir Novo Tópico de Discussão</h3>
                  <form onSubmit={handleCreateTopic} className="space-y-4">
                    <input name="title" required placeholder="Título do Tópico (Ex: Dúvida sobre o Caso Clínico 02)" className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                    <textarea name="desc" required placeholder="Descreva o assunto detalhadamente para a turma..." className="w-full border border-slate-300 p-3 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none h-24"></textarea>
                    <button type="submit" className="bg-purple-700 text-white font-bold px-6 py-2.5 rounded-lg hover:bg-purple-800 transition">Publicar Tópico</button>
                  </form>
                </div>

                <div className="space-y-4">
                  <h3 className="font-black text-slate-400 uppercase tracking-widest text-xs mb-4">Tópicos Recentes</h3>
                  {forumData.length === 0 ? (
                    <div className="text-center p-12 text-slate-400 font-medium bg-white rounded-xl border border-slate-200">Nenhum tópico criado neste fórum. Seja o primeiro!</div>
                  ) : (
                    forumData.map(topic => (
                      <div key={topic.id} onClick={() => setActiveTopicId(topic.id)} className="bg-white p-5 border border-slate-200 rounded-xl hover:border-purple-300 hover:shadow-md cursor-pointer transition flex items-center gap-5">
                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-black shrink-0 border border-slate-200">{topic.avatar}</div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-lg group-hover:text-purple-700 transition">{topic.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">Iniciado por <strong className="text-slate-700">{topic.authorName}</strong> em {new Date(topic.createdAt).toLocaleString()}</p>
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
              <div className="flex-1 flex flex-col h-full bg-slate-50">
                <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex items-center gap-4 shadow-sm">
                  <button onClick={() => setActiveTopicId(null)} className="p-2 bg-slate-100 text-slate-600 hover:bg-purple-100 hover:text-purple-700 rounded-lg font-bold transition flex items-center gap-1"><ChevronRight className="w-4 h-4 rotate-180"/> Voltar</button>
                  <h3 className="font-black text-xl text-slate-800 truncate">{currentTopicData?.title}</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6">
                  {/* Post Original do Tópico */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-600"></div>
                    <div className="flex items-center gap-4 mb-4 border-b border-slate-100 pb-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold border border-slate-200">{currentTopicData?.avatar}</div>
                      <div>
                        <p className="font-black text-slate-800">{currentTopicData?.authorName}</p>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{new Date(currentTopicData?.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <p className="text-slate-700 text-base whitespace-pre-wrap leading-relaxed">{currentTopicData?.description}</p>
                  </div>

                  {/* Respostas do Tópico */}
                  <div className="space-y-4 pl-4 md:pl-12 border-l-2 border-slate-200">
                    {(currentTopicData?.replies || []).map((reply, idx) => (
                      <div key={reply.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative">
                        <div className="absolute -left-12 top-6 w-12 border-t-2 border-slate-200"></div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-bold border border-slate-200">{reply.avatar}</div>
                            <div>
                              <p className="font-bold text-slate-800 text-sm">{reply.authorName}</p>
                              <p className="text-[10px] text-slate-400">{new Date(reply.createdAt).toLocaleString()}</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-300">#{idx + 1}</span>
                        </div>
                        <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form de Resposta */}
                <div className="p-6 bg-white border-t border-slate-200 shrink-0">
                  <form onSubmit={handleReplyTopic} className="flex gap-4">
                    <textarea name="reply" required placeholder="Escreva sua resposta para o tópico..." className="flex-1 border border-slate-300 p-4 rounded-xl text-sm focus:ring-2 focus:ring-purple-500 outline-none resize-none h-20 bg-slate-50 focus:bg-white transition-colors"></textarea>
                    <button type="submit" className="bg-purple-700 text-white font-bold px-8 rounded-xl hover:bg-purple-800 transition flex items-center justify-center gap-2 shadow-md"><Send className="w-4 h-4"/> Responder</button>
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
  // RENDER: PROVA NATIVA (Construtor e Aluno)
  // ==========================================
  const renderExamModal = () => {
    const examData = exams[activeExamItem.id] || { questions: [], submissions: {} };
    
    const handleAddQuestion = () => setLocalQuestions([...localQuestions, { id: `q_${Date.now()}`, title: 'Nova Pergunta', options: ['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4'], correctIndex: 0 }]);
    const handleUpdateQuestion = (idx, field, val) => { const n = [...localQuestions]; n[idx][field] = val; setLocalQuestions(n); };
    const handleUpdateOption = (qIdx, oIdx, val) => { const n = [...localQuestions]; n[qIdx].options[oIdx] = val; setLocalQuestions(n); };
    const handleSaveExam = () => { setDbExams({ ...exams, [activeExamItem.id]: { ...examData, questions: localQuestions } }); setActiveExamItem(null); setLocalQuestions([]); alert("Prova salva com sucesso!"); };
    const handleCloseExam = () => { setActiveExamItem(null); setLocalQuestions([]); };

    if (isEditing || role === 'professor') {
      return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-8 print:hidden">
          <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden animate-fade-in flex flex-col">
            <div className="p-5 border-b border-rose-800 flex justify-between items-center bg-rose-700 text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-600 rounded-lg"><ClipboardList className="w-6 h-6"/></div>
                <div>
                  <h2 className="font-bold text-lg leading-tight">Construtor de Prova: {activeExamItem.title}</h2>
                  <p className="text-[11px] text-rose-200 uppercase tracking-widest font-bold">Avaliação Oficial COREMU</p>
                </div>
              </div>
              <button onClick={handleCloseExam} className="p-2 hover:bg-rose-800 rounded-full transition-colors"><X className="w-6 h-6"/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8">
              {localQuestions.map((q, qIndex) => (
                <div key={q.id} className="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm relative">
                  <button onClick={() => setLocalQuestions(localQuestions.filter((_, i) => i !== qIndex))} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5"/></button>
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
            </div>

            <div className="p-5 bg-white border-t border-slate-200 shrink-0 flex justify-end gap-4 shadow-up">
              <button onClick={handleCloseExam} className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition">Cancelar</button>
              <button onClick={handleSaveExam} className="bg-rose-700 text-white font-bold px-8 py-2.5 rounded-xl hover:bg-rose-800 transition shadow-md flex items-center gap-2"><Check className="w-4 h-4"/> Publicar Prova Oficial</button>
            </div>
          </div>
        </div>
      );
    }

    const mySubmission = examData.submissions[currentUser.id];
    const handleSumbitExam = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      let score = 0; const answers = [];
      examData.questions.forEach((q, index) => {
        const selectedOption = parseInt(formData.get(`q_${index}`));
        answers.push(selectedOption);
        if (selectedOption === q.correctIndex) score++;
      });
      const finalScore = ((score / examData.questions.length) * 10).toFixed(1);
      setDbExams({ ...exams, [activeExamItem.id]: { ...examData, submissions: { ...examData.submissions, [currentUser.id]: { score: finalScore, answers, submittedAt: new Date().toISOString() } } } });
      alert(`Prova enviada com sucesso! Sua nota foi: ${finalScore}`);
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
              <form onSubmit={handleSumbitExam} className="space-y-8 max-w-3xl mx-auto pb-10">
                {examData.questions.length === 0 ? (
                  <p className="text-center text-slate-500 bg-white p-8 rounded-xl border border-slate-200">O professor ainda não configurou as questões desta prova.</p>
                ) : (
                  <>
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl text-rose-800 text-sm font-medium mb-8">
                      <strong>Atenção:</strong> Após clicar em "Enviar Respostas", a nota será computada imediatamente e não será possível refazer a prova. Revise suas escolhas.
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
  // RENDERIZAÇÕES PRINCIPAIS (Telas do Portal)
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
          </div>
        ) : (
          visibleCourses.map(c => {
            if(!c) return null;
            return (
            <div key={c.id} onClick={() => {setActiveCourseId(c.id); setCurrentView('course_home');}} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-300 transition cursor-pointer flex flex-col justify-between h-full group">
              <div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">{c.codigo}</span>
                <h3 className="font-bold text-slate-800 mt-3 group-hover:text-teal-700 transition leading-tight">{c.nome}</h3>
                <p className="text-xs text-slate-500 mt-2">Professor Titular: {systemUsers[c.professorId]?.nome}</p>
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
            <div><label className="text-xs font-bold text-slate-500 uppercase">Código</label><input type="text" required value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} placeholder="Ex: RMAB001" className="w-full mt-1 border p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Nome da Disciplina</label><input type="text" required value={newCourseName} onChange={e => setNewCourseName(e.target.value)} placeholder="Ex: Saúde Coletiva" className="w-full mt-1 border p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500" /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Professor Titular</label><select required value={newCourseProfId} onChange={e => setNewCourseProfId(e.target.value)} className="w-full mt-1 border p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-teal-500 bg-white"><option value="">Selecione...</option>{Object.values(systemUsers).filter(u => u && u.role === 'professor').map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}</select></div>
            <button type="submit" className="w-full bg-teal-800 text-white font-bold p-3 rounded-lg hover:bg-teal-900 transition flex items-center justify-center gap-2"><Plus className="w-4 h-4"/> Salvar Disciplina</button>
          </form>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Layout className="w-5 h-5 text-blue-600"/> Matriz Curricular Global</h3>
          {courses.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-xl bg-slate-50 text-slate-500">Nenhuma disciplina ativa.</div>
          ) : (
            <div className="space-y-3">
              {courses.map(c => {
                if(!c) return null;
                return (
                <div key={c.id} className="p-4 border border-slate-200 rounded-xl hover:shadow-md transition bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded uppercase">{c.codigo}</span>
                    <h4 className="font-bold text-slate-800 mt-1">{c.nome}</h4>
                    <p className="text-xs text-slate-500 mt-1">Professor: <strong>{systemUsers[c.professorId]?.nome}</strong> | {Array.isArray(courseStudents[c.id]) ? courseStudents[c.id].length : 0} matriculado(s)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setActiveCourseId(c.id); setCurrentView('participants'); }} className="bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 flex items-center gap-2"><Layout className="w-3.5 h-3.5"/> Abrir</button>
                    <button onClick={() => handleDeleteCourse(c.id)} className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-100">Excluir</button>
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCourseHome = () => (
    <div className="animate-fade-in relative">
      
      {/* MODAL DE ADICIONAR ITEM */}
      {activeSectionForNewItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-fade-in flex flex-col h-[95vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
              <h3 className="font-black text-slate-800 text-lg">Adicionar material à aula</h3>
              <button onClick={() => setActiveSectionForNewItem(null)} className="text-slate-400 hover:text-slate-700 bg-white shadow-sm p-1.5 rounded-full"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-6 md:p-10 overflow-y-auto flex-1 bg-slate-50/50">
              <form onSubmit={handleConfirmAddItem} className="space-y-8 max-w-4xl mx-auto">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Título do Material na Plataforma</label>
                  <input type="text" required value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} placeholder="Ex: Aula 01 - Fundamentos" className="w-full border border-slate-300 p-4 rounded-xl text-base font-medium focus:ring-2 focus:ring-teal-500 outline-none shadow-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-3">Formato do Conteúdo</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div onClick={() => setNewItemType('TextContent')} className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center gap-3 transition-all text-center ${newItemType === 'TextContent' ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-md' : 'border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm bg-white'}`}>
                      <AlignLeft className="w-7 h-7"/><span className="text-[11px] font-bold leading-tight">Página Web<br/><span className="font-normal text-slate-400">Texto Escrito</span></span>
                    </div>
                    <div onClick={() => setNewItemType('FileText')} className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center gap-3 transition-all text-center ${newItemType === 'FileText' ? 'border-red-500 bg-red-50 text-red-800 shadow-md' : 'border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm bg-white'}`}>
                      <FileText className="w-7 h-7"/><span className="text-[11px] font-bold leading-tight">Documento<br/><span className="font-normal text-slate-400">PDF ou Excel</span></span>
                    </div>
                    <div onClick={() => setNewItemType('Link')} className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center gap-3 transition-all text-center ${newItemType === 'Link' ? 'border-blue-500 bg-blue-50 text-blue-800 shadow-md' : 'border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm bg-white'}`}>
                      <Link className="w-7 h-7"/><span className="text-[11px] font-bold leading-tight">Vídeo Aula<br/><span className="font-normal text-slate-400">Link Externo</span></span>
                    </div>
                    <div onClick={() => setNewItemType('NativeExam')} className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center gap-3 transition-all text-center ${newItemType === 'NativeExam' ? 'border-rose-500 bg-rose-50 text-rose-800 shadow-md' : 'border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm bg-white'}`}>
                      <ClipboardList className="w-7 h-7"/><span className="text-[11px] font-bold leading-tight">Prova Online<br/><span className="font-normal text-slate-400">Avaliação COREMU</span></span>
                    </div>
                    <div onClick={() => setNewItemType('MessageSquare')} className={`cursor-pointer border-2 p-4 rounded-xl flex flex-col items-center gap-3 transition-all text-center ${newItemType === 'MessageSquare' ? 'border-purple-500 bg-purple-50 text-purple-800 shadow-md' : 'border-slate-200 text-slate-500 hover:bg-white hover:shadow-sm bg-white'}`}>
                      <MessageSquare className="w-7 h-7"/><span className="text-[11px] font-bold leading-tight">Fórum phpBB<br/><span className="font-normal text-slate-400">Tópicos e Debates</span></span>
                    </div>
                  </div>
                </div>

                <div className="animate-fade-in border-t border-slate-200 pt-6">
                  {newItemType === 'FileText' || newItemType === 'Upload' ? (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Upload Direto para Nuvem</label>
                      <input type="file" onChange={(e) => setNewFile(e.target.files[0])} className="w-full text-sm bg-slate-50 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-teal-100 file:text-teal-800 hover:file:bg-teal-200 cursor-pointer text-slate-500 rounded-xl" />
                    </div>
                  ) : newItemType === 'Link' ? (
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">URL do Vídeo ou Site</label>
                      <input type="url" required value={newItemUrl} onChange={e => setNewItemUrl(e.target.value)} placeholder="https://..." className="w-full border border-slate-300 p-4 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  ) : newItemType === 'NativeExam' ? (
                    <div className="bg-rose-50 text-rose-800 p-6 rounded-xl border border-rose-200 flex items-center gap-4 shadow-sm">
                      <ClipboardList className="w-10 h-10 shrink-0 text-rose-500"/>
                      <div>
                        <strong className="block text-base mb-1">A prova será ativada no formato de rascunho.</strong>
                        <span className="text-sm">Após salvar este módulo, clique em "Configurar Prova Oficial" no mural principal para adicionar as perguntas e definir o gabarito.</span>
                      </div>
                    </div>
                  ) : newItemType === 'MessageSquare' ? (
                    <div className="bg-purple-50 text-purple-800 p-6 rounded-xl border border-purple-200 flex items-center gap-4 shadow-sm">
                      <Users className="w-10 h-10 shrink-0 text-purple-500"/>
                      <div>
                        <strong className="block text-base mb-1">Criação de Fórum Acadêmico</strong>
                        <span className="text-sm">Um ambiente estilo phpBB será gerado automaticamente. Professores e alunos poderão criar Tópicos e enviar Respostas permanentemente.</span>
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
                  <button type="submit" disabled={isUploading} className="w-full bg-teal-800 text-white font-black p-4 rounded-xl hover:bg-teal-900 transition shadow-lg text-lg disabled:bg-slate-400">
                    {isUploading ? <span className="flex items-center justify-center gap-3"><Loader2 className="w-6 h-6 animate-spin"/> Transferindo arquivo para nuvem...</span> : 'Publicar na Sala de Aula'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE LEITURA PROFISSIONAL */}
      {readingItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-0 md:p-8 print:hidden">
          <div className="bg-white md:rounded-2xl shadow-2xl w-full h-full md:h-[95vh] max-w-5xl overflow-hidden animate-fade-in flex flex-col">
            <div className="p-5 md:p-6 border-b border-slate-200 flex justify-between items-center bg-white shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl hidden sm:block"><AlignLeft className="w-6 h-6"/></div>
                <div>
                  <h2 className="font-black text-2xl text-slate-800 tracking-tight">{readingItem.title}</h2>
                  <p className="text-xs text-amber-600 font-bold uppercase tracking-widest mt-1">Leitura Oficial</p>
                </div>
              </div>
              <button onClick={() => setReadingItem(null)} className="p-3 bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded-full transition-colors"><X className="w-6 h-6"/></button>
            </div>
            <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-12">
              <div className="max-w-3xl mx-auto bg-white p-8 md:p-16 rounded-2xl shadow-sm border border-slate-200">
                <div className="prose prose-slate prose-lg md:prose-xl max-w-none text-slate-800" dangerouslySetInnerHTML={{ __html: readingItem.textContent }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isEditing && (
        <div onClick={addSection} className="mb-6 border-2 border-dashed border-teal-300 rounded-xl p-6 text-center bg-teal-50/50 hover:bg-teal-50 cursor-pointer transition text-teal-700 font-bold text-base flex items-center justify-center gap-3 shadow-sm print:hidden">
          <Plus className="w-6 h-6"/> Adicionar novo Tópico / Módulo
        </div>
      )}

      {activeContent.length === 0 && (
        <div className="text-center p-16 bg-white rounded-2xl border border-slate-200 text-slate-400 shadow-sm mt-8">
          <Book className="w-16 h-16 mx-auto mb-4 opacity-20"/>
          <p className="font-black text-xl text-slate-700">Sala de Aula Vazia</p>
          <p className="text-sm mt-2">Clique no botão acima para começar a adicionar materiais e módulos.</p>
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
              <button onClick={() => deleteSection(section.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-4 print:hidden"><Trash2 className="w-5 h-5" /></button>
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
                      {isEditing && <GripVertical className="w-5 h-5 text-slate-300 cursor-move mt-1 print:hidden" />}
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
                          <div className="mt-3 flex flex-wrap gap-2 print:hidden">
                            {item.fileName && item.url && (
                              <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-4 py-2 rounded-lg transition shadow-sm w-fit">
                                <Download className="w-4 h-4"/> Baixar Documento
                              </a>
                            )}
                            {item.type === 'NativeExam' && (
                              <button onClick={() => { setActiveExamItem(item); setLocalQuestions(exams[item.id]?.questions || []); }} className="flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-4 py-2 rounded-lg transition shadow-md w-fit">
                                <ClipboardList className="w-4 h-4"/> {(role === 'professor' || role === 'admin') ? 'Configurar Prova Oficial' : 'Fazer Avaliação'}
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
                      <button onClick={() => deleteItem(section.id, item.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-4 print:hidden"><Trash2 className="w-5 h-5" /></button>
                    )}
                  </div>
                );
              })}
              {isEditing && (
                <div className="p-4 border-t border-dashed border-slate-200 bg-slate-50 flex justify-end print:hidden">
                  <button onClick={() => handleOpenAddItemModal(section.id)} className="flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-800 bg-white px-4 py-2 rounded-lg border border-teal-200 shadow-sm transition hover:shadow-md">
                    <Plus className="w-4 h-4"/> Adicionar Material ao Módulo
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
      
      {/* SIDEBAR COM NOME DO CURSO EM VEZ DE CÓDIGO */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-20'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col flex-shrink-0 shadow-2xl z-20 relative print:hidden`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {sidebarOpen && <span className="font-black text-white text-base tracking-tight leading-tight">Portal <span className="text-teal-400">COREMU</span></span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <Menu className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 no-scrollbar">
          <nav className="space-y-1 px-3">
            
            {role === 'admin' && (
              <>
                <button onClick={() => {setCurrentView('admin_dashboard'); setActiveCourseId(null); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-colors ${currentView === 'admin_dashboard' ? 'bg-teal-900/40 text-teal-400 border-l-4 border-teal-500' : 'hover:bg-slate-800 text-slate-400'}`}>
                  <Shield className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Gestão COREMU</span>}
                </button>
                <button onClick={() => {setCurrentView('admin_users'); setActiveCourseId(null); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-colors ${currentView === 'admin_users' ? 'bg-teal-900/40 text-teal-400 border-l-4 border-teal-500' : 'hover:bg-slate-800 text-slate-400'}`}>
                  <Users className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && <span>Gestão de Usuários</span>}
                </button>
                <div className="my-6 border-t border-slate-800 mx-2"></div>
              </>
            )}

            {(role === 'professor' || role === 'aluno') && (
              <button onClick={() => {setCurrentView('user_home'); setActiveCourseId(null); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-colors ${currentView === 'user_home' ? 'bg-teal-900/40 text-teal-400 border-l-4 border-teal-500' : 'hover:bg-slate-800 text-slate-400'}`}>
                <Home className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>Página Inicial</span>}
              </button>
            )}

            {sidebarOpen && <div className="mt-8 mb-3 px-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Minhas Disciplinas</div>}
            
            {visibleCourses.length === 0 ? (
              <div className="px-5 text-xs text-slate-600 font-medium mt-2">Nenhuma disciplina.</div>
            ) : (
              visibleCourses.map(c => {
                if(!c) return null;
                const isCourseActive = activeCourseId === c.id && ['course_home', 'participants', 'grades', 'attendance'].includes(currentView);
                return (
                <div key={c.id} className="mb-1">
                  {/* AGORA EXIBE O NOME DA DISCIPLINA, COM TRUNCATE PARA NÃO QUEBRAR O MENU */}
                  <button onClick={() => {setActiveCourseId(c.id); setCurrentView('course_home'); setEditMode(false);}} className={`w-full flex items-center gap-3 p-3 rounded-xl text-sm transition-colors ${isCourseActive ? 'bg-teal-900/60 text-white font-bold' : 'hover:bg-slate-800 text-slate-400 font-medium'}`} title={c.nome}>
                    <Book className={`w-5 h-5 flex-shrink-0 ${isCourseActive ? 'text-teal-400' : ''}`} />
                    {sidebarOpen && <span className="truncate">{c.nome}</span>}
                  </button>
                  
                  {isCourseActive && sidebarOpen && (
                    <div className="ml-5 pl-4 border-l-2 border-slate-700 mt-2 space-y-1.5 mb-4">
                      <button onClick={() => setCurrentView('course_home')} className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition-colors ${currentView === 'course_home' ? 'text-teal-400 bg-slate-800' : 'hover:bg-slate-800 text-slate-400'}`}>
                        <Layout className="w-4 h-4 flex-shrink-0" /> Sala Virtual
                      </button>
                      <button onClick={() => setCurrentView('participants')} className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition-colors ${currentView === 'participants' ? 'text-teal-400 bg-slate-800' : 'hover:bg-slate-800 text-slate-400'}`}>
                        <Users className="w-4 h-4 flex-shrink-0" /> Participantes
                      </button>
                      <button onClick={() => setCurrentView('grades')} className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition-colors ${currentView === 'grades' ? 'text-teal-400 bg-slate-800' : 'hover:bg-slate-800 text-slate-400'}`}>
                        <BarChart className="w-4 h-4 flex-shrink-0" /> Notas e Parecer
                      </button>
                      <button onClick={() => setCurrentView('attendance')} className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-xs font-bold transition-colors ${currentView === 'attendance' ? 'text-teal-400 bg-slate-800' : 'hover:bg-slate-800 text-slate-400'}`}>
                        <CheckSquare className="w-4 h-4 flex-shrink-0" /> Diário Oficial
                      </button>
                    </div>
                  )}
                </div>
              )})
            )}
          </nav>
        </div>

        {sidebarOpen && (
          <div className="p-5 bg-slate-950 border-t border-slate-800 z-50">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Simular Perfil</p>
            <select value={activeUserId} onChange={(e) => switchUser(e.target.value)} className="w-full bg-slate-800 text-xs font-bold text-white p-3 rounded-xl border border-slate-700 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
              {Object.values(systemUsers).map(u => {
                if(!u) return null;
                return (<option key={u.id} value={u.id}>{u.nome} ({u.role})</option>)
              })}
            </select>
          </div>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative print:overflow-visible">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 shadow-sm z-10 print:hidden">
          <div className="flex items-center gap-4 flex-1">
            <div className="hidden sm:flex items-center text-sm font-semibold text-slate-600 gap-6">
              <span className="text-teal-800 font-black text-xl py-5 tracking-tight">Portal COREMU HACO</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 p-1.5 hover:bg-slate-50 rounded-xl transition cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-800">{currentUser.nome}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{role === 'aluno' ? 'Residente' : role === 'professor' ? 'Docente/Preceptor' : 'Administração'}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-teal-800 text-white flex items-center justify-center text-sm font-black shadow-md border-2 border-teal-100">
                {currentUser.avatar}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-[#f8f9fa] print:bg-white print:p-0 print:overflow-visible">
          <div className="max-w-6xl mx-auto">
            
            {currentView === 'user_home' && renderUserHome()}
            {currentView === 'admin_dashboard' && renderAdminDashboard()}
            {currentView === 'admin_users' && renderAdminUsers()}

            {activeCourseId && ['course_home', 'participants', 'grades', 'attendance'].includes(currentView) && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6">
                  <div className="flex-1">
                    {isEditing ? (
                      <input type="text" value={activeCourseObj?.nome || ''} onChange={(e) => updateCourseDetails('nome', e.target.value)} placeholder="Nome da Disciplina" className="w-full text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight bg-transparent border-b-2 border-dashed border-slate-300 focus:border-teal-500 focus:outline-none mb-2 pb-1" />
                    ) : (
                      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2">{activeCourseObj?.nome}</h1>
                    )}
                    
                    {isEditing ? (
                      <div className="flex items-center gap-3">
                        <input type="text" value={activeCourseObj?.codigo || ''} onChange={(e) => updateCourseDetails('codigo', e.target.value)} placeholder="Código" className="w-32 text-sm text-teal-700 font-bold bg-teal-50 px-3 py-1 rounded-md border border-dashed border-teal-300 focus:border-teal-500 focus:outline-none" />
                        <span className="text-sm text-slate-500 font-medium">Prof: {systemUsers[activeCourseObj?.professorId]?.nome}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-teal-800 bg-teal-100 px-3 py-1 rounded-full uppercase tracking-wider">{activeCourseObj?.codigo}</span>
                        <span className="text-sm text-slate-500 font-medium border-l border-slate-300 pl-3">Professor Titular: <strong className="text-slate-700">{systemUsers[activeCourseObj?.professorId]?.nome}</strong></span>
                      </div>
                    )}
                  </div>
                  
                  {hasEditPermission && (
                    <div className="flex items-center bg-white border border-slate-200 p-1.5 rounded-xl shadow-sm shrink-0 print:hidden">
                      <span className="text-xs font-bold text-slate-600 px-3 hidden sm:inline uppercase tracking-widest">Modo de Edição</span>
                      <button onClick={() => setEditMode(!editMode)} className={`flex items-center px-4 py-2 rounded-lg text-xs font-bold transition-all ${editMode ? 'bg-teal-700 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        {editMode ? <ToggleRight className="w-5 h-5 mr-1.5"/> : <ToggleLeft className="w-5 h-5 mr-1.5"/>}
                        {editMode ? 'ATIVO' : 'INATIVO'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center text-xs text-slate-500 mb-8 bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
                  <span className="hover:text-slate-800 font-medium">Portal COREMU</span>
                  <ChevronRight className="w-4 h-4 mx-3 text-slate-300" />
                  <span className="font-bold text-teal-700">{activeCourseObj?.codigo}</span>
                  <ChevronRight className="w-4 h-4 mx-3 text-slate-300" />
                  <span className="text-slate-800 font-bold uppercase tracking-wider">{
                    currentView === 'course_home' ? 'Mural e Módulos' : 
                    currentView === 'grades' ? 'Boletim de Notas Oficial' : 
                    currentView === 'participants' ? 'Residentes Participantes' : 'Diário de Classe (Frequência)'
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
