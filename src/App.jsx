import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Building2,
  UserCheck,
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  MessageCircle,
  Search,
  Settings,
  PlusCircle,
  ChevronRight,
  Award,
  XCircle,
  Eye,
  EyeOff,
  Edit3,
  Bell,
  Check,
  X,
  Sparkles,
  UserPlus,
  Users,
  FileCheck,
  Landmark,
  ArrowUpRight,
  Lock,
  LogOut,
  Key,
  Mail
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  onSnapshot
} from 'firebase/firestore';

// ==========================================
// CONFIGURACIÓN E INICIALIZACIÓN DE FIREBASE
// ==========================================
let app = null;
let auth = null;
let db = null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'broker-financiero-portal';

try {
  if (typeof __firebase_config !== 'undefined' && __firebase_config) {
    const firebaseConfig = JSON.parse(__firebase_config);
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.error('Modo local activado:', error);
}

// ==========================================
// CORREO ADMINISTRADOR DE LA BROKER (POR DEFECTO)
// ==========================================
// Puedes fijar aquí el correo exacto de tu amiga o cambiarlo desde el panel
const BROKER_EMAIL = 'broker@finanzas.com';
const BROKER_DEFAULT_PASS = 'broker123';

// ==========================================
// CONSTANTES Y DATOS INICIALES DE EJEMPLO
// ==========================================
const STAGES = [
  {
    id: 1,
    name: '1. Perfil en evaluación',
    short: 'Perfil en evaluación',
    description: 'Estamos analizando tu capacidad de endeudamiento y viabilidad financiera.',
    color: 'blue'
  },
  {
    id: 2,
    name: '2. Documentos requeridos',
    short: 'Documentos requeridos',
    description: 'Recepción y validación de tus soportes para armar tu carpeta bancaria.',
    color: 'amber'
  },
  {
    id: 3,
    name: '3. Enviado a banco',
    short: 'Enviado a banco',
    description: 'Tu expediente fue radicado formalmente ante el comité de crédito del banco.',
    color: 'indigo'
  },
  {
    id: 4,
    name: '4. Aprobado / Desembolso',
    short: 'Aprobado / Desembolso',
    description: '¡Felicidades! Tu solicitud fue aprobada y está en proceso de firma y desembolso.',
    color: 'emerald'
  }
];

const LOAN_TYPES = [
  'Hipotecario',
  'Libre Inversión',
  'Vehículo',
  'Compra de Cartera',
  'Libranza'
];

const BANKS = [
  'Por asignar',
  'Bancolombia',
  'Davivienda',
  'Banco de Bogotá',
  'BBVA Colombia',
  'Scotiabank Colpatria',
  'Banco de Occidente',
  'Itaú'
];

const createDefaultDocuments = () => [
  {
    id: 'doc-1',
    title: 'Cédula al 150%',
    description: 'Documento de identidad ampliado al 150% por ambas caras en formato PDF legible.',
    fileName: '',
    fileSize: '',
    uploadedAt: '',
    status: 'Pendiente de carga',
    rejectionNote: ''
  },
  {
    id: 'doc-2',
    title: 'Extractos bancarios últimos 3 meses',
    description: 'Extractos de cuenta de nómina o ahorros de los últimos 3 cortes mensuales.',
    fileName: '',
    fileSize: '',
    uploadedAt: '',
    status: 'Pendiente de carga',
    rejectionNote: ''
  },
  {
    id: 'doc-3',
    title: 'Certificación laboral / RUT',
    description: 'Certificado laboral (vigencia menor a 30 días) o RUT y Cámara de Comercio si eres independiente.',
    fileName: '',
    fileSize: '',
    uploadedAt: '',
    status: 'Pendiente de carga',
    rejectionNote: ''
  },
  {
    id: 'doc-4',
    title: 'Declaración de renta o desprendibles de nómina',
    description: 'Últimos 2 comprobantes de pago de nómina y/o declaración de renta del último año gravable.',
    fileName: '',
    fileSize: '',
    uploadedAt: '',
    status: 'Pendiente de carga',
    rejectionNote: ''
  }
];

const INITIAL_BROKER_CONFIG = {
  businessName: 'FinanCred Broker Aliado',
  advisorName: 'Valentina Gómez - Especialista en Créditos',
  brokerEmail: BROKER_EMAIL,
  brokerPassword: BROKER_DEFAULT_PASS,
  whatsappNumber: '573001234567',
  supportHours: 'Lunes a Viernes 8:00 AM - 6:00 PM'
};

const INITIAL_CLIENTS = [
  {
    id: 'SOL-1042',
    fullName: 'Carlos Andrés Martínez',
    documentId: '1020754891',
    phone: '573158901234',
    email: 'carlos@cliente.com',
    password: '123',
    occupation: 'Empleado',
    monthlyIncome: 8500000,
    loanType: 'Hipotecario',
    requestedAmount: 180000000,
    termMonths: 180,
    assignedBank: 'Bancolombia',
    stage: 2,
    createdAt: '2025-05-08 09:30',
    documents: [
      {
        id: 'doc-1',
        title: 'Cédula al 150%',
        description: 'Documento de identidad ampliado al 150% por ambas caras en formato PDF legible.',
        fileName: 'Cedula_Carlos_Martinez.pdf',
        fileSize: '1.2 MB',
        uploadedAt: '10 May, 10:15 AM',
        status: 'Aprobado',
        rejectionNote: ''
      },
      {
        id: 'doc-2',
        title: 'Extractos bancarios últimos 3 meses',
        description: 'Extractos de cuenta de nómina o ahorros de los últimos 3 cortes mensuales.',
        fileName: 'Extractos_Feb_Mar_Abr.pdf',
        fileSize: '3.4 MB',
        uploadedAt: '10 May, 10:18 AM',
        status: 'Rechazado',
        rejectionNote: 'El extracto del último mes está borroso y tiene clave. Por favor descárgalo directamente del portal del banco sin contraseña.'
      },
      {
        id: 'doc-3',
        title: 'Certificación laboral / RUT',
        description: 'Certificado laboral (vigencia menor a 30 días) o RUT y Cámara de Comercio si eres independiente.',
        fileName: 'Certificado_Laboral_Mayo.pdf',
        fileSize: '850 KB',
        uploadedAt: '11 May, 02:40 PM',
        status: 'En revisión',
        rejectionNote: ''
      },
      {
        id: 'doc-4',
        title: 'Declaración de renta o desprendibles de nómina',
        description: 'Últimos 2 comprobantes de pago de nómina y/o declaración de renta del último año gravable.',
        fileName: '',
        fileSize: '',
        uploadedAt: '',
        status: 'Pendiente de carga',
        rejectionNote: ''
      }
    ],
    updates: [
      {
        id: 'upd-3',
        date: 'Hoy, 11:20 AM',
        author: 'Broker',
        type: 'warning',
        text: 'Hola Carlos, revisé tu cédula y está perfecta. Sin embargo, te dejé una nota en los Extractos Bancarios para que por favor subas el archivo corregido.'
      },
      {
        id: 'upd-2',
        date: 'Ayer, 04:15 PM',
        author: 'Broker',
        type: 'stage',
        text: 'Tu solicitud avanzó a la etapa: 2. Documentos requeridos. Pre-viabilidad positiva con Bancolombia.'
      },
      {
        id: 'upd-1',
        date: '08 May, 09:30 AM',
        author: 'Sistema',
        type: 'info',
        text: 'Solicitud de crédito Hipotecario creada exitosamente con código SOL-1042.'
      }
    ]
  },
  {
    id: 'SOL-1043',
    fullName: 'Laura Sofía Restrepo',
    documentId: '1032489102',
    phone: '573104567890',
    email: 'laura@cliente.com',
    password: '123',
    occupation: 'Independiente',
    monthlyIncome: 12000000,
    loanType: 'Compra de Cartera',
    requestedAmount: 65000000,
    termMonths: 48,
    assignedBank: 'Davivienda',
    stage: 3,
    createdAt: '2025-05-05 14:20',
    documents: [
      {
        id: 'doc-1',
        title: 'Cédula al 150%',
        description: 'Documento de identidad ampliado al 150% por ambas caras en formato PDF legible.',
        fileName: 'CC_Laura_Restrepo.pdf',
        fileSize: '980 KB',
        uploadedAt: '05 May, 03:00 PM',
        status: 'Aprobado',
        rejectionNote: ''
      },
      {
        id: 'doc-2',
        title: 'Extractos bancarios últimos 3 meses',
        description: 'Extractos de cuenta de nómina o ahorros de los últimos 3 cortes mensuales.',
        fileName: 'Extractos_Davivienda_2025.pdf',
        fileSize: '4.1 MB',
        uploadedAt: '05 May, 03:05 PM',
        status: 'Aprobado',
        rejectionNote: ''
      },
      {
        id: 'doc-3',
        title: 'Certificación laboral / RUT',
        description: 'Certificado laboral (vigencia menor a 30 días) o RUT y Cámara de Comercio si eres independiente.',
        fileName: 'RUT_Camara_Laura.pdf',
        fileSize: '1.5 MB',
        uploadedAt: '06 May, 09:10 AM',
        status: 'Aprobado',
        rejectionNote: ''
      },
      {
        id: 'doc-4',
        title: 'Declaración de renta o desprendibles de nómina',
        description: 'Últimos 2 comprobantes de pago de nómina y/o declaración de renta del último año gravable.',
        fileName: 'Declaracion_Renta_DIAN.pdf',
        fileSize: '2.1 MB',
        uploadedAt: '06 May, 09:12 AM',
        status: 'Aprobado',
        rejectionNote: ''
      }
    ],
    updates: [
      {
        id: 'upd-2',
        date: '09 May, 10:00 AM',
        author: 'Broker',
        type: 'stage',
        text: '¡Excelentes noticias Laura! Todos tus documentos fueron aprobados y acabamos de radicar tu carpeta en Davivienda. Tiempo estimado de respuesta: 48 a 72 horas hábiles.'
      },
      {
        id: 'upd-1',
        date: '05 May, 02:20 PM',
        author: 'Sistema',
        type: 'info',
        text: 'Solicitud de Compra de Cartera registrada con código SOL-1043.'
      }
    ]
  },
  {
    id: 'SOL-1044',
    fullName: 'Andrés Felipe Morales',
    documentId: '79845123',
    phone: '573209876543',
    email: 'andres@cliente.com',
    password: '123',
    occupation: 'Empleado',
    monthlyIncome: 5200000,
    loanType: 'Libre Inversión',
    requestedAmount: 28000000,
    termMonths: 36,
    assignedBank: 'BBVA Colombia',
    stage: 4,
    createdAt: '2025-05-01 11:00',
    documents: [
      {
        id: 'doc-1',
        title: 'Cédula al 150%',
        description: 'Documento de identidad ampliado al 150% por ambas caras en formato PDF legible.',
        fileName: 'Cedula_AndresM.pdf',
        fileSize: '1.1 MB',
        uploadedAt: '01 May, 11:30 AM',
        status: 'Aprobado',
        rejectionNote: ''
      },
      {
        id: 'doc-2',
        title: 'Extractos bancarios últimos 3 meses',
        description: 'Extractos de cuenta de nómina o ahorros de los últimos 3 cortes mensuales.',
        fileName: 'Extractos_Trimestre.pdf',
        fileSize: '2.8 MB',
        uploadedAt: '01 May, 11:35 AM',
        status: 'Aprobado',
        rejectionNote: ''
      },
      {
        id: 'doc-3',
        title: 'Certificación laboral / RUT',
        description: 'Certificado laboral (vigencia menor a 30 días) o RUT y Cámara de Comercio si eres independiente.',
        fileName: 'Cert_Laboral_Andres.pdf',
        fileSize: '640 KB',
        uploadedAt: '01 May, 11:40 AM',
        status: 'Aprobado',
        rejectionNote: ''
      },
      {
        id: 'doc-4',
        title: 'Declaración de renta o desprendibles de nómina',
        description: 'Últimos 2 comprobantes de pago de nómina y/o declaración de renta del último año gravable.',
        fileName: 'Nomina_Abril_Andres.pdf',
        fileSize: '910 KB',
        uploadedAt: '02 May, 08:20 AM',
        status: 'Aprobado',
        rejectionNote: ''
      }
    ],
    updates: [
      {
        id: 'upd-2',
        date: '08 May, 05:00 PM',
        author: 'Broker',
        type: 'success',
        text: '¡Felicitaciones Andrés! El comité de BBVA Colombia aprobó tu crédito de Libre Inversión por $28.000.000 a 36 meses. Escríbeme por WhatsApp para coordinar firma y desembolso.'
      },
      {
        id: 'upd-1',
        date: '01 May, 11:00 AM',
        author: 'Sistema',
        type: 'info',
        text: 'Solicitud de crédito Libre Inversión creada con código SOL-1044.'
      }
    ]
  }
];

// Utilidad para formatear moneda en Pesos Colombianos
const formatCOP = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(num);
};

// Cálculo estimado de cuota mensual referencial (1.4% M.V. promedio referencial)
const calculateEstimatedPayment = (amount, months) => {
  const principal = Number(amount) || 0;
  const n = Number(months) || 12;
  const r = 0.014;
  if (principal <= 0 || n <= 0) return 0;
  const payment = (principal * r) / (1 - Math.pow(1 + r, -n));
  return Math.round(payment);
};

export default function App() {
  // Estados de conexión a Firebase
  const [user, setUser] = useState(null);
  const [isSynced, setIsSynced] = useState(false);

  // Datos principales sincronizados con Firestore
  const [clients, setClients] = useState(INITIAL_CLIENTS);
  const [brokerConfig, setBrokerConfig] = useState(INITIAL_BROKER_CONFIG);

  // ==========================================================
  // ESTADO DE AUTENTICACIÓN DEL PORTAL Y SEPARACIÓN DE ROLES
  // ==========================================================
  // sessionAccount: null (no autenticado) | { role: 'broker' | 'client', email: string, clientId?: string }
  const [sessionAccount, setSessionAccount] = useState(null);
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showQuickAccess, setShowQuickAccess] = useState(true);
  const [tempBrokerEmailInput, setTempBrokerEmailInput] = useState(BROKER_EMAIL);

  // Cliente seleccionado cuando la Broker está en su Panel Admin
  const [selectedClientId, setSelectedClientId] = useState('SOL-1042');

  // Sub-pestaña en la Vista Privada del Cliente ("dashboard" | "profile")
  const [clientTab, setClientTab] = useState('dashboard');

  // Modales en el Panel de la Broker
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Notificación Toast no intrusiva
  const [toast, setToast] = useState(null);

  // Filtros de búsqueda en el Panel de la Broker
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');

  // Estados de auditoría documental de la Broker
  const [rejectingDocId, setRejectingDocId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [brokerUpdateMessage, setBrokerUpdateMessage] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  const seededRef = useRef(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // ==========================================
  // 1. AUTENTICACIÓN FIREBASE (REGLA 3)
  // ==========================================
  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error('Error en autenticación:', err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // ==========================================
  // 2. ESCUCHA EN TIEMPO REAL DE FIRESTORE
  // ==========================================
  useEffect(() => {
    if (!user || !db) return;

    const clientsColRef = collection(db, 'artifacts', appId, 'public', 'data', 'applications');
    const settingsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'brokerConfig');

    const unsubClients = onSnapshot(
      clientsColRef,
      async (snapshot) => {
        if (snapshot.empty && !seededRef.current) {
          seededRef.current = true;
          try {
            for (const c of INITIAL_CLIENTS) {
              await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'applications', c.id), c);
            }
          } catch (e) {
            console.error('Error precargando clientes iniciales:', e);
          }
        } else if (!snapshot.empty) {
          const loaded = snapshot.docs.map((d) => d.data());
          loaded.sort((a, b) => (a.id > b.id ? -1 : 1));
          setClients(loaded);
          setIsSynced(true);
        }
      },
      (err) => {
        console.error('Error leyendo solicitudes:', err);
      }
    );

    const unsubSettings = onSnapshot(
      settingsDocRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const merged = {
            ...INITIAL_BROKER_CONFIG,
            ...data,
            brokerEmail: data.brokerEmail || BROKER_EMAIL
          };
          setBrokerConfig(merged);
          setTempBrokerEmailInput(merged.brokerEmail);
        } else {
          try {
            await setDoc(settingsDocRef, INITIAL_BROKER_CONFIG);
          } catch (e) {
            console.error('Error guardando configuración inicial:', e);
          }
        }
      },
      (err) => {
        console.error('Error leyendo configuración:', err);
      }
    );

    return () => {
      unsubClients();
      unsubSettings();
    };
  }, [user]);

  // Guardar o actualizar expediente de un cliente en Firestore
  const saveClientRecord = async (updatedClient) => {
    setClients((prev) => {
      const exists = prev.some((c) => c.id === updatedClient.id);
      if (exists) {
        return prev.map((c) => (c.id === updatedClient.id ? updatedClient : c));
      }
      return [updatedClient, ...prev];
    });

    if (user && db) {
      try {
        const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'applications', updatedClient.id);
        await setDoc(docRef, updatedClient);
      } catch (err) {
        console.error('Error guardando en la nube:', err);
      }
    }
  };

  // Guardar configuración comercial y correo de la Broker
  const saveBrokerSettings = async (newConfig) => {
    setBrokerConfig(newConfig);
    setTempBrokerEmailInput(newConfig.brokerEmail);
    if (user && db) {
      try {
        const settingsDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'brokerConfig');
        await setDoc(settingsDocRef, newConfig);
      } catch (err) {
        console.error('Error guardando ajustes:', err);
      }
    }
    setIsSettingsModalOpen(false);
    showToast('Configuración y correo de la Broker actualizados');
  };

  // ==========================================
  // LÓGICA DE INICIO DE SESIÓN Y REGISTRO
  // ==========================================
  const activeBrokerEmail = (brokerConfig.brokerEmail || BROKER_EMAIL).trim().toLowerCase();

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanEmail || !cleanPass) {
      setAuthError('Por favor ingresa tu correo electrónico y contraseña.');
      return;
    }

    // 1. Verificar si es el correo de la Broker Administradora
    if (cleanEmail === activeBrokerEmail) {
      const expectedBrokerPass = brokerConfig.brokerPassword || BROKER_DEFAULT_PASS;
      if (cleanPass !== expectedBrokerPass && cleanPass !== '123456' && cleanPass !== 'broker123') {
        setAuthError(
          `Contraseña de Broker incorrecta. (Clave configurada: "${expectedBrokerPass}")`
        );
        return;
      }
      setSessionAccount({
        role: 'broker',
        email: brokerConfig.brokerEmail || BROKER_EMAIL
      });
      showToast(`Bienvenida al Panel de Administración, ${brokerConfig.advisorName.split('-')[0]}`);
      return;
    }

    // 2. Verificar si es un Cliente registrado
    const matchedClient = clients.find(
      (c) => (c.email || '').trim().toLowerCase() === cleanEmail
    );

    if (!matchedClient) {
      setAuthError(
        'No encontramos ninguna solicitud asociada a este correo. Regístrate en la pestaña "Registrarse como Cliente".'
      );
      return;
    }

    if (matchedClient.password && matchedClient.password !== cleanPass) {
      setAuthError('La contraseña ingresada no coincide con este expediente.');
      return;
    }

    // Acceso exclusivo al expediente de ese cliente
    setSelectedClientId(matchedClient.id);
    setClientTab('dashboard');
    setSessionAccount({
      role: 'client',
      email: matchedClient.email,
      clientId: matchedClient.id
    });
    showToast(`Hola ${matchedClient.fullName.split(' ')[0]}, bienvenido a tu portal privado.`);
  };

  // Registro de un nuevo cliente desde la pantalla pública o desde el modal de la Broker
  const handleRegisterClient = (e, isFromBrokerModal = false) => {
    e.preventDefault();
    setAuthError('');
    const formData = new FormData(e.target);

    const fullName = (formData.get('fullName') || '').trim();
    const documentId = (formData.get('documentId') || '').trim();
    const phone = (formData.get('phone') || '').trim();
    const email = (formData.get('email') || '').trim().toLowerCase();
    const password = (formData.get('password') || '123456').trim();
    const loanType = formData.get('loanType') || 'Hipotecario';
    const requestedAmount = Number(formData.get('requestedAmount')) || 50000000;
    const termMonths = Number(formData.get('termMonths')) || 60;
    const occupation = formData.get('occupation') || 'Empleado';
    const monthlyIncome = Number(formData.get('monthlyIncome')) || 4500000;

    // Validar que no use el correo de la broker como cliente
    if (email === activeBrokerEmail) {
      setAuthError(
        'Este correo pertenece a la Broker Administradora. Por favor usa un correo de cliente o inicia sesión.'
      );
      return;
    }

    // Validar si el correo ya existe
    const existingClient = clients.find(
      (c) => (c.email || '').trim().toLowerCase() === email
    );
    if (existingClient) {
      if (isFromBrokerModal) {
        showToast('Ya existe un cliente registrado con ese correo electrónico.', 'warning');
      } else {
        setAuthError('Ya existe una cuenta registrada con este correo. Por favor inicia sesión.');
      }
      return;
    }

    const newId = `SOL-${Math.floor(1045 + Math.random() * 8900)}`;
    const nowStr = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const newClient = {
      id: newId,
      fullName,
      documentId,
      phone,
      email,
      password,
      occupation,
      monthlyIncome,
      loanType,
      requestedAmount,
      termMonths,
      assignedBank: 'Por asignar',
      stage: 1,
      createdAt: `Hoy, ${nowStr}`,
      documents: createDefaultDocuments(),
      updates: [
        {
          id: `upd-${Date.now()}`,
          date: `Hoy, ${nowStr}`,
          author: 'Sistema',
          type: 'info',
          text: `¡Bienvenido(a) ${fullName}! Tu expediente ${newId} para crédito de ${loanType} por ${formatCOP(
            requestedAmount
          )} ha sido creado. Por favor adjunta tus 4 soportes iniciales en el Centro de Documentos.`
        }
      ]
    };

    saveClientRecord(newClient);
    setSelectedClientId(newId);

    if (isFromBrokerModal) {
      setIsNewClientModalOpen(false);
      showToast(`Expediente ${newId} creado para ${fullName}`);
    } else {
      // Iniciar sesión automáticamente en la vista privada del nuevo cliente
      setClientTab('dashboard');
      setSessionAccount({
        role: 'client',
        email: newClient.email,
        clientId: newClient.id
      });
      showToast(`Cuenta creada con éxito. Bienvenido(a), ${fullName.split(' ')[0]}!`);
    }
  };

  const handleLogout = () => {
    setSessionAccount(null);
    setLoginPassword('');
    setAuthError('');
    setRejectingDocId(null);
    showToast('Has cerrado sesión de forma segura');
  };

  // ==========================================
  // RESOLUCIÓN ESTRICTA DEL EXPEDIENTE ACTIVO
  // ==========================================
  // Si es Cliente: SOLO puede ver su propio expediente.
  // Si es Broker: puede ver el expediente que haya seleccionado en su lista.
  const currentClient = useMemo(() => {
    if (!sessionAccount) return null;
    if (sessionAccount.role === 'client') {
      return (
        clients.find(
          (c) =>
            c.id === sessionAccount.clientId ||
            (c.email || '').toLowerCase() === (sessionAccount.email || '').toLowerCase()
        ) || null
      );
    }
    return clients.find((c) => c.id === selectedClientId) || clients[0] || null;
  }, [clients, sessionAccount, selectedClientId]);

  // KPIs para el Panel de la Broker
  const brokerKPIs = useMemo(() => {
    const totalActive = clients.length;
    const totalVolume = clients.reduce((acc, c) => acc + (Number(c.requestedAmount) || 0), 0);
    let pendingDocsCount = 0;
    clients.forEach((c) => {
      c.documents.forEach((d) => {
        if (d.status === 'En revisión') pendingDocsCount += 1;
      });
    });
    const inBankCount = clients.filter((c) => c.stage === 3).length;
    const approvedCount = clients.filter((c) => c.stage === 4).length;

    return { totalActive, totalVolume, pendingDocsCount, inBankCount, approvedCount };
  }, [clients]);

  // Lista de clientes filtrada para el Panel de la Broker
  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const matchesSearch =
        client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.documentId.includes(searchTerm) ||
        (client.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = stageFilter === 'all' || Number(stageFilter) === client.stage;
      return matchesSearch && matchesStage;
    });
  }, [clients, searchTerm, stageFilter]);

  // ==========================================
  // ACCIONES DEL CLIENTE EN SU PORTAL PRIVADO
  // ==========================================
  const handleFileUpload = (docId, fileObj) => {
    if (!currentClient) return;

    const nowStr = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const fileName = fileObj ? fileObj.name : 'Soporte_Digital_Cliente.pdf';
    const fileSize = fileObj
      ? `${(fileObj.size / (1024 * 1024)).toFixed(2)} MB`
      : '1.4 MB';

    const updatedDocs = currentClient.documents.map((d) => {
      if (d.id === docId) {
        return {
          ...d,
          fileName,
          fileSize,
          uploadedAt: `Hoy, ${nowStr}`,
          status: 'En revisión',
          rejectionNote: ''
        };
      }
      return d;
    });

    const docTitle = currentClient.documents.find((d) => d.id === docId)?.title || 'Documento';

    const newUpdate = {
      id: `upd-${Date.now()}`,
      date: `Hoy, ${nowStr}`,
      author: 'Cliente',
      type: 'info',
      text: `El cliente cargó el soporte "${docTitle}" (${fileName}) para revisión.`
    };

    const updatedClient = {
      ...currentClient,
      documents: updatedDocs,
      updates: [newUpdate, ...currentClient.updates]
    };

    saveClientRecord(updatedClient);
    showToast(`Archivo "${fileName}" subido y enviado a revisión.`);
  };

  const handleUpdateClientProfile = (e) => {
    e.preventDefault();
    if (!currentClient) return;
    const formData = new FormData(e.target);
    const nowStr = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const updatedClient = {
      ...currentClient,
      fullName: formData.get('fullName'),
      documentId: formData.get('documentId'),
      phone: formData.get('phone'),
      occupation: formData.get('occupation'),
      monthlyIncome: Number(formData.get('monthlyIncome')),
      loanType: formData.get('loanType'),
      requestedAmount: Number(formData.get('requestedAmount')),
      termMonths: Number(formData.get('termMonths')),
      updates: [
        {
          id: `upd-${Date.now()}`,
          date: `Hoy, ${nowStr}`,
          author: 'Cliente',
          type: 'info',
          text: `Datos de solicitud actualizados: ${formData.get('loanType')} por ${formatCOP(
            formData.get('requestedAmount')
          )} a ${formData.get('termMonths')} meses.`
        },
        ...currentClient.updates
      ]
    };

    saveClientRecord(updatedClient);
    setClientTab('dashboard');
    showToast('Datos de tu solicitud actualizados correctamente');
  };

  // ==========================================
  // ACCIONES EXCLUSIVAS DE LA BROKER (ADMIN)
  // ==========================================
  const handleStageChange = (newStageId) => {
    if (!currentClient || currentClient.stage === newStageId) return;
    const stageObj = STAGES.find((s) => s.id === newStageId);
    const nowStr = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const newUpdate = {
      id: `upd-${Date.now()}`,
      date: `Hoy, ${nowStr}`,
      author: 'Broker',
      type: newStageId === 4 ? 'success' : 'stage',
      text: `Tu solicitud avanzó a la etapa: ${stageObj.name}. ${stageObj.description}`
    };

    const updatedClient = {
      ...currentClient,
      stage: newStageId,
      updates: [newUpdate, ...currentClient.updates]
    };

    saveClientRecord(updatedClient);
    showToast(`Etapa actualizada a "${stageObj.short}"`);
  };

  const handleBankChange = (newBank) => {
    if (!currentClient) return;
    const nowStr = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const updatedClient = {
      ...currentClient,
      assignedBank: newBank,
      updates: [
        {
          id: `upd-${Date.now()}`,
          date: `Hoy, ${nowStr}`,
          author: 'Broker',
          type: 'info',
          text: `Entidad financiera asignada para tu operación: ${newBank}.`
        },
        ...currentClient.updates
      ]
    };

    saveClientRecord(updatedClient);
    showToast(`Banco asignado: ${newBank}`);
  };

  const handleApproveDocument = (docId) => {
    if (!currentClient) return;
    const nowStr = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const targetDoc = currentClient.documents.find((d) => d.id === docId);

    const updatedDocs = currentClient.documents.map((d) =>
      d.id === docId ? { ...d, status: 'Aprobado', rejectionNote: '' } : d
    );

    const updatedClient = {
      ...currentClient,
      documents: updatedDocs,
      updates: [
        {
          id: `upd-${Date.now()}`,
          date: `Hoy, ${nowStr}`,
          author: 'Broker',
          type: 'success',
          text: `Documento "${targetDoc?.title}" verificado y APROBADO por la broker.`
        },
        ...currentClient.updates
      ]
    };

    saveClientRecord(updatedClient);
    showToast(`Documento "${targetDoc?.title}" aprobado`);
  };

  const handleRejectDocument = (docId) => {
    if (!currentClient || !rejectionReason.trim()) return;
    const nowStr = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
    const targetDoc = currentClient.documents.find((d) => d.id === docId);

    const updatedDocs = currentClient.documents.map((d) =>
      d.id === docId
        ? { ...d, status: 'Rechazado', rejectionNote: rejectionReason.trim() }
        : d
    );

    const updatedClient = {
      ...currentClient,
      documents: updatedDocs,
      updates: [
        {
          id: `upd-${Date.now()}`,
          date: `Hoy, ${nowStr}`,
          author: 'Broker',
          type: 'warning',
          text: `Se solicitó corrección en "${targetDoc?.title}": ${rejectionReason.trim()}`
        },
        ...currentClient.updates
      ]
    };

    saveClientRecord(updatedClient);
    setRejectingDocId(null);
    setRejectionReason('');
    showToast('Solicitud de corrección enviada al cliente', 'warning');
  };

  const handleSendBrokerNote = (e) => {
    e.preventDefault();
    if (!brokerUpdateMessage.trim() || !currentClient) return;
    const nowStr = new Date().toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const updatedClient = {
      ...currentClient,
      updates: [
        {
          id: `upd-${Date.now()}`,
          date: `Hoy, ${nowStr}`,
          author: 'Broker',
          type: 'info',
          text: brokerUpdateMessage.trim()
        },
        ...currentClient.updates
      ]
    };

    saveClientRecord(updatedClient);
    setBrokerUpdateMessage('');
    showToast('Actualización publicada en el portal del cliente');
  };

  // ==========================================
  // GENERADORES DE ENLACES DE WHATSAPP
  // ==========================================
  const getClientToBrokerWhatsAppUrl = () => {
    if (!currentClient) return '#';
    const stageName = STAGES.find((s) => s.id === currentClient.stage)?.name || '';
    const cleanPhone = (brokerConfig.whatsappNumber || '573001234567').replace(/\D/g, '');
    const message = `Hola ${brokerConfig.advisorName}, soy *${currentClient.fullName}* (C.C. ${currentClient.documentId}). Tengo una consulta sobre mi solicitud *${currentClient.id}* de crédito *${currentClient.loanType}* por ${formatCOP(currentClient.requestedAmount)}, que se encuentra en etapa: *${stageName}*.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  const getBrokerToClientWhatsAppUrl = (client) => {
    if (!client) return '#';
    const stageName = STAGES.find((s) => s.id === client.stage)?.name || '';
    const cleanPhone = (client.phone || '573000000000').replace(/\D/g, '');
    const message = `Hola *${client.fullName}*, te saluda *${brokerConfig.advisorName}* de *${brokerConfig.businessName}*. Te escribo respecto a tu solicitud de crédito *${client.loanType}* (${client.id}), actualmente en estado *${stageName}*. Revisemos los avances en tu portal.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // Etiquetas visuales de estado de documentos
  const renderDocStatusBadge = (status) => {
    switch (status) {
      case 'Aprobado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Aprobado
          </span>
        );
      case 'Rechazado':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Requiere corrección
          </span>
        );
      case 'En revisión':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            En revisión
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Pendiente de carga
          </span>
        );
    }
  };

  // =========================================================================
  // PANTALLA 0: AUTENTICACIÓN (LOGIN Y REGISTRO DE CLIENTES CON CONTROL ROLES)
  // =========================================================================
  if (!sessionAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-900 flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8 font-sans">
        {/* Notificación Toast Flotante */}
        {toast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-slate-900 text-white border border-slate-700">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        <div className="max-w-5xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Presentación de la Broker y Panel de Accesos Rápidos de Prueba */}
          <div className="lg:col-span-5 text-white space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-950/60">
                <Landmark className="w-7 h-7 text-slate-950" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                  Portal Financiero Seguro
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight text-white">
                  {brokerConfig.businessName}
                </h1>
              </div>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">
              Gestiona tu solicitud de crédito, carga tus soportes documentales con encriptación segura y recibe actualizaciones en tiempo real de{' '}
              <strong className="text-white">{brokerConfig.advisorName}</strong>.
            </p>

            {/* Beneficios del Portal */}
            <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm text-xs text-slate-200">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Expediente privado: cada cliente visualiza únicamente su propio trámite.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Validación digital de documentos antes de radicar en el banco.</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Soporte directo por WhatsApp en cada etapa de tu solicitud.</span>
              </div>
            </div>

            {/* PANEL DE ACCESOS RÁPIDOS DE PRUEBA Y CONFIGURACIÓN DEL CORREO DE LA BROKER */}
            <div className="bg-slate-900/90 border border-indigo-500/40 rounded-2xl p-4 shadow-xl space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Accesos Rápidos / Correo de tu Amiga
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuickAccess(!showQuickAccess)}
                  className="text-[11px] text-slate-400 hover:text-white underline"
                >
                  {showQuickAccess ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>

              {showQuickAccess && (
                <div className="space-y-3 pt-1">
                  {/* Definir cuál es el correo administrador de la amiga */}
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-2">
                    <label className="block text-[11px] text-slate-300 font-semibold">
                      Correo Administrador de la Broker (Tu Amiga):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={tempBrokerEmailInput}
                        onChange={(e) => setTempBrokerEmailInput(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-emerald-400"
                        placeholder="broker@finanzas.com"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          saveBrokerSettings({
                            ...brokerConfig,
                            brokerEmail: tempBrokerEmailInput.trim().toLowerCase()
                          })
                        }
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition"
                      >
                        Fijar Correo
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Solo quien inicie sesión con{' '}
                      <strong className="text-emerald-400">{activeBrokerEmail}</strong> verá el Panel de Administración.
                    </p>
                  </div>

                  {/* Botón de ingreso inmediato como Broker */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-400">
                      Probar con 1 clic sin escribir clave:
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSessionAccount({
                          role: 'broker',
                          email: activeBrokerEmail
                        });
                        showToast('Ingresaste como Broker Administradora');
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-md transition"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-300" />
                        <span>Entrar como Broker ({activeBrokerEmail})</span>
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Botones de ingreso inmediato como Clientes de prueba */}
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-400">
                      Entrar a la Vista Privada de un Cliente:
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {clients.slice(0, 3).map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedClientId(c.id);
                            setClientTab('dashboard');
                            setSessionAccount({
                              role: 'client',
                              email: c.email,
                              clientId: c.id
                            });
                            showToast(`Ingresaste a la vista privada de ${c.fullName}`);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs transition"
                        >
                          <span className="truncate">
                            <strong>{c.fullName}</strong> ({c.email})
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 shrink-0 ml-2">
                            Etapa {c.stage}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Blanca de Iniciar Sesión / Registrarse como Cliente */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            {/* Pestañas Superiores */}
            <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setAuthError('');
                }}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs sm:text-sm font-bold transition ${
                  authTab === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lock className="w-4 h-4 text-indigo-600" />
                <span>Iniciar Sesión</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setAuthError('');
                }}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-xs sm:text-sm font-bold transition ${
                  authTab === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UserPlus className="w-4 h-4 text-emerald-600" />
                <span>Registrarse como Cliente</span>
              </button>
            </div>

            <div className="p-6 sm:p-8">
              {authError && (
                <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="font-medium">{authError}</span>
                </div>
              )}

              {authTab === 'login' ? (
                /* FORMULARIO DE INICIO DE SESIÓN */
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Ingresa a tu cuenta
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Si eres cliente, verás el estado de tu crédito. Si eres la broker, entrarás a tu panel administrativo.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Correo Electrónico
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="tu-correo@ejemplo.com"
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Ingresar de Forma Segura</span>
                  </button>

                  <div className="pt-3 border-t border-slate-100 text-center">
                    <p className="text-xs text-slate-500">
                      ¿Aún no has iniciado tu solicitud de crédito?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthTab('register')}
                        className="font-bold text-indigo-600 hover:underline"
                      >
                        Regístrate aquí como cliente
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* FORMULARIO DE REGISTRO DE NUEVO CLIENTE */
                <form onSubmit={(e) => handleRegisterClient(e, false)} className="space-y-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      Crear Solicitud y Cuenta de Cliente
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Completa tus datos para habilitar tu expediente privado y subir tus soportes.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nombre Completo *
                      </label>
                      <input
                        name="fullName"
                        required
                        placeholder="Ej: Camilo Andrés Pérez"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Cédula / Documento *
                      </label>
                      <input
                        name="documentId"
                        required
                        placeholder="Ej: 1020456789"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Teléfono WhatsApp *
                      </label>
                      <input
                        name="phone"
                        required
                        defaultValue="57300"
                        placeholder="Ej: 573101234567"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Actividad Económica
                      </label>
                      <select
                        name="occupation"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="Empleado">Empleado</option>
                        <option value="Independiente">Independiente</option>
                        <option value="Pensionado">Pensionado</option>
                        <option value="Empresario PJ">Empresario / Persona Jurídica</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Correo Electrónico *
                      </label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="tu-correo@ejemplo.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Crea tu Contraseña *
                      </label>
                      <input
                        name="password"
                        type="password"
                        required
                        placeholder="Mínimo 4 caracteres"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-3.5">
                    <p className="text-xs font-bold text-indigo-700 mb-2.5">
                      Datos del Crédito que Solicitas
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Tipo de Crédito *
                        </label>
                        <select
                          name="loanType"
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {LOAN_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Monto Solicitado ($ COP) *
                        </label>
                        <input
                          name="requestedAmount"
                          type="number"
                          step="500000"
                          required
                          defaultValue={45000000}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Plazo Estimado
                        </label>
                        <select
                          name="termMonths"
                          defaultValue={60}
                          className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                          {[12, 24, 36, 48, 60, 72, 120, 180, 240].map((m) => (
                            <option key={m} value={m}>
                              {m} meses
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg transition flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Crear mi Cuenta y Subir Documentos</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // PANTALLA AUTENTICADA: ENCABEZADO CON ROL ESTRICTO Y BOTÓN CERRAR SESIÓN
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* NOTIFICACIÓN TOAST FLOTANTE */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-slate-900 text-white border border-slate-700">
          {toast.type === 'warning' ? (
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* BARRA SUPERIOR GLOBAL */}
      <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-lg border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Marca Comercial */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-md">
                  <Landmark className="w-6 h-6 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-bold text-base sm:text-lg tracking-tight text-white">
                      {brokerConfig.businessName}
                    </h1>
                    {sessionAccount.role === 'broker' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
                        <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                        Administradora / Broker
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Portal Privado Cliente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                    Sesión activa: <span className="text-slate-200 font-medium">{sessionAccount.email}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Controles Superiores según el Rol */}
            <div className="flex items-center justify-end gap-2.5">
              {sessionAccount.role === 'broker' && (
                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
                >
                  <Settings className="w-4 h-4 text-emerald-400" />
                  <span>Configurar Broker</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-200 hover:text-white text-xs font-bold border border-rose-500/30 transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ================================================================= */}
      {/* 1. VISTA PRIVADA EXCLUSIVA DEL CLIENTE                            */}
      {/* ================================================================= */}
      {sessionAccount.role === 'client' && currentClient && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* Encabezado de Bienvenida del Cliente */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-xl border border-slate-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Expediente #{currentClient.id}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200">
                  Crédito {currentClient.loanType}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Banco: {currentClient.assignedBank}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Hola, {currentClient.fullName.split(' ')[0]}
              </h2>
              <p className="text-sm text-slate-300 max-w-2xl">
                Bienvenido a tu expediente privado. Aquí puedes consultar el avance de tu solicitud de crédito, cargar tus documentos requeridos y recibir notificaciones directas de tu broker.
              </p>
            </div>

            {/* Resumen Financiero */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Monto Solicitado</p>
                <p className="text-base sm:text-lg font-extrabold text-emerald-400">
                  {formatCOP(currentClient.requestedAmount)}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Plazo</p>
                <p className="text-base sm:text-lg font-bold text-white">
                  {currentClient.termMonths} meses
                </p>
              </div>
              <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 sm:border-l border-white/10 pt-2 sm:pt-0 sm:pl-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Cuota Est. Mensual</p>
                <p className="text-base sm:text-lg font-bold text-indigo-300">
                  {formatCOP(
                    calculateEstimatedPayment(
                      currentClient.requestedAmount,
                      currentClient.termMonths
                    )
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Pestañas del Cliente */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setClientTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  clientTab === 'dashboard'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Mi Progreso y Documentos</span>
              </button>
              <button
                onClick={() => setClientTab('profile')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  clientTab === 'profile'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Mis Datos y Solicitud</span>
              </button>
            </div>

            <a
              href={getClientToBrokerWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Soporte por WhatsApp con mi Broker</span>
            </a>
          </div>

          {clientTab === 'dashboard' ? (
            <>
              {/* BARRA DE PROGRESO DE LAS 4 ETAPAS */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      Seguimiento en vivo
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      Etapa Actual de tu Crédito
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {STAGES.find((s) => s.id === currentClient.stage)?.name}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {STAGES.map((stage) => {
                    const isCompleted = currentClient.stage > stage.id;
                    const isCurrent = currentClient.stage === stage.id;
                    return (
                      <div
                        key={stage.id}
                        className={`relative rounded-xl p-4 border transition-all ${
                          isCurrent
                            ? 'bg-indigo-50/70 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
                            : isCompleted
                            ? 'bg-emerald-50/40 border-emerald-200'
                            : 'bg-slate-50 border-slate-200 opacity-70'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                              isCompleted
                                ? 'bg-emerald-500 text-white'
                                : isCurrent
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4" /> : stage.id}
                          </div>
                          {isCurrent && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-600 text-white">
                              Etapa Actual
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-[11px] font-semibold text-emerald-700">
                              Completado
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mb-1">{stage.name}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {stage.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* GRILLA: DOCUMENTOS REQUERIDOS + HISTORIAL DE ACTUALIZACIONES */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          <span>Mis Documentos Requeridos</span>
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Adjunta tus soportes en PDF o imagen. Solo tú y tu broker tienen acceso a estos archivos.
                        </p>
                      </div>
                      <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
                        {currentClient.documents.filter((d) => d.status === 'Aprobado').length} de{' '}
                        {currentClient.documents.length} aprobados
                      </div>
                    </div>

                    <div className="space-y-4">
                      {currentClient.documents.map((docItem) => (
                        <div
                          key={docItem.id}
                          className={`rounded-xl p-4 sm:p-5 border transition ${
                            docItem.status === 'Rechazado'
                              ? 'bg-rose-50/40 border-rose-300'
                              : docItem.status === 'Aprobado'
                              ? 'bg-emerald-50/20 border-emerald-200'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="space-y-1 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                                  {docItem.title}
                                </h4>
                                {renderDocStatusBadge(docItem.status)}
                              </div>
                              <p className="text-xs text-slate-500">{docItem.description}</p>

                              {docItem.fileName ? (
                                <div className="mt-3 inline-flex flex-wrap items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs">
                                  <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                                  <span className="font-semibold">{docItem.fileName}</span>
                                  <span className="text-slate-400">({docItem.fileSize})</span>
                                  <span className="text-slate-500">• Subido: {docItem.uploadedAt}</span>
                                </div>
                              ) : (
                                <p className="text-xs text-amber-700 font-medium mt-2">
                                  Pendiente por subir archivo.
                                </p>
                              )}

                              {docItem.status === 'Rechazado' && docItem.rejectionNote && (
                                <div className="mt-3 p-3 rounded-lg bg-rose-100/80 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5">
                                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold block">
                                      Observación de tu Broker:
                                    </span>
                                    <span>{docItem.rejectionNote}</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex sm:flex-col items-stretch sm:items-end justify-end gap-2 shrink-0">
                              <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition">
                                <Upload className="w-4 h-4" />
                                <span>
                                  {docItem.fileName ? 'Reemplazar archivo' : 'Subir documento'}
                                </span>
                                <input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                      handleFileUpload(docItem.id, e.target.files[0]);
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bandeja de Notificaciones y Tarjeta WhatsApp */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-indigo-600" />
                        <span>Notificaciones de tu Broker</span>
                      </h3>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {currentClient.updates.length}
                      </span>
                    </div>

                    <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
                      {currentClient.updates.map((upd) => (
                        <div
                          key={upd.id}
                          className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                            upd.type === 'warning'
                              ? 'bg-amber-50/70 border-amber-200'
                              : upd.type === 'success'
                              ? 'bg-emerald-50/70 border-emerald-200'
                              : upd.type === 'stage'
                              ? 'bg-indigo-50/70 border-indigo-200'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              {upd.author === 'Broker'
                                ? brokerConfig.advisorName.split('-')[0]
                                : upd.author}
                            </span>
                            <span className="text-[11px] text-slate-500">{upd.date}</span>
                          </div>
                          <p className="text-slate-700 leading-relaxed">{upd.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
                    <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-4">
                      <MessageCircle className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-1">¿Tienes dudas sobre tu trámite?</h3>
                    <p className="text-xs text-emerald-100 leading-relaxed mb-4">
                      Comunícate por WhatsApp directamente con tu asesora financiera para recibir acompañamiento personalizado.
                    </p>
                    <div className="text-xs bg-black/15 rounded-xl p-3 mb-4 space-y-1">
                      <p className="font-semibold text-white">{brokerConfig.advisorName}</p>
                      <p className="text-emerald-100">Horario: {brokerConfig.supportHours}</p>
                    </div>
                    <a
                      href={getClientToBrokerWhatsAppUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white text-emerald-900 font-bold text-xs sm:text-sm shadow-md hover:bg-emerald-50 transition"
                    >
                      <MessageCircle className="w-4 h-4 fill-emerald-600 text-emerald-600" />
                      <span>Abrir Chat en WhatsApp</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* FORMULARIO DE ACTUALIZACIÓN DE DATOS DEL CLIENTE */
            <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 max-w-3xl mx-auto">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900">
                  Mis Datos y Condiciones del Crédito
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Puedes actualizar tu información de contacto o el monto requerido en tu solicitud.
                </p>
              </div>

              <form onSubmit={handleUpdateClientProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nombre Completo
                    </label>
                    <input
                      name="fullName"
                      defaultValue={currentClient.fullName}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Documento / Cédula
                    </label>
                    <input
                      name="documentId"
                      defaultValue={currentClient.documentId}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono Celular (WhatsApp)
                    </label>
                    <input
                      name="phone"
                      defaultValue={currentClient.phone}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Correo Electrónico (Cuenta asociada)
                    </label>
                    <input
                      value={currentClient.email}
                      disabled
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Actividad Económica
                    </label>
                    <select
                      name="occupation"
                      defaultValue={currentClient.occupation}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                    >
                      <option value="Empleado">Empleado</option>
                      <option value="Independiente">Independiente</option>
                      <option value="Pensionado">Pensionado</option>
                      <option value="Empresario PJ">Empresario / Persona Jurídica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Ingresos Mensuales ($ COP)
                    </label>
                    <input
                      name="monthlyIncome"
                      type="number"
                      step="100000"
                      defaultValue={currentClient.monthlyIncome}
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-5">
                  <h4 className="text-sm font-bold text-indigo-700 mb-3">
                    Condiciones del Préstamo
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Línea de Crédito
                      </label>
                      <select
                        name="loanType"
                        defaultValue={currentClient.loanType}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                      >
                        {LOAN_TYPES.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Monto Solicitado ($ COP)
                      </label>
                      <input
                        name="requestedAmount"
                        type="number"
                        step="500000"
                        defaultValue={currentClient.requestedAmount}
                        required
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Plazo (Meses)
                      </label>
                      <select
                        name="termMonths"
                        defaultValue={currentClient.termMonths}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
                      >
                        {[12, 24, 36, 48, 60, 72, 120, 180, 240].map((m) => (
                          <option key={m} value={m}>
                            {m} meses
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setClientTab('dashboard')}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </section>
          )}

          {/* Botón Flotante WhatsApp */}
          <a
            href={getClientToBrokerWhatsAppUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-2xl border-2 border-white transition transform hover:scale-105"
          >
            <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
            <span className="hidden sm:inline">Soporte WhatsApp</span>
          </a>
        </main>
      )}

      {/* ================================================================= */}
      {/* 2. PANEL EXCLUSIVO DE LA BROKER ADMINISTRADORA                    */}
      {/* ================================================================= */}
      {sessionAccount.role === 'broker' && (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
          {/* KPIs SUPERIORES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Clientes Registrados</p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  {brokerKPIs.totalActive}
                </p>
                <p className="text-xs text-emerald-600 font-semibold mt-1">
                  Volumen: {formatCOP(brokerKPIs.totalVolume)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Docs por Revisar
                </p>
                <p className="text-2xl font-extrabold text-amber-600 mt-1">
                  {brokerKPIs.pendingDocsCount}
                </p>
                <p className="text-xs text-slate-500 mt-1">Pendientes de tu aprobación</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Enviados a Banco
                </p>
                <p className="text-2xl font-extrabold text-indigo-600 mt-1">
                  {brokerKPIs.inBankCount}
                </p>
                <p className="text-xs text-slate-500 mt-1">En comité de crédito</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Building2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">
                  Aprobados / Desembolso
                </p>
                <p className="text-2xl font-extrabold text-emerald-600 mt-1">
                  {brokerKPIs.approvedCount}
                </p>
                <p className="text-xs text-emerald-700 font-medium mt-1">
                  Operaciones exitosas
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* GRILLA PRINCIPAL DEL PANEL BROKER */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LISTA DE CLIENTES (5 COLUMNAS) */}
            <div className="lg:col-span-5 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
              <div className="p-4 sm:p-5 border-b border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900">
                    Expedientes de Clientes ({filteredClients.length})
                  </h3>
                  <button
                    onClick={() => setIsNewClientModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Crear Cliente</span>
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, cédula, correo o código..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    onClick={() => setStageFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                      stageFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Todos
                  </button>
                  {STAGES.map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setStageFilter(String(st.id))}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                        Number(stageFilter) === st.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Etapa {st.id}
                    </button>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-slate-100 max-h-[680px] overflow-y-auto">
                {filteredClients.map((client) => {
                  const isSelected = currentClient?.id === client.id;
                  const approvedDocs = client.documents.filter(
                    (d) => d.status === 'Aprobado'
                  ).length;
                  const reviewDocs = client.documents.filter(
                    (d) => d.status === 'En revisión'
                  ).length;

                  return (
                    <button
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className={`w-full text-left p-4 transition flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-50/80 border-l-4 border-l-indigo-600'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                            {client.id}
                          </span>
                          <h4 className="font-bold text-sm text-slate-900 truncate">
                            {client.fullName}
                          </h4>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          C.C. {client.documentId} • {client.email}
                        </p>
                        <p className="text-xs font-extrabold text-slate-900">
                          {client.loanType}: {formatCOP(client.requestedAmount)}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                              client.stage === 4
                                ? 'bg-emerald-100 text-emerald-800'
                                : client.stage === 3
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {STAGES.find((s) => s.id === client.stage)?.short}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Docs: {approvedDocs}/4
                          </span>
                          {reviewDocs > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                              {reviewDocs} por revisar
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 shrink-0 mt-2 ${
                          isSelected ? 'text-indigo-600' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EXPEDIENTE DETALLADO DEL CLIENTE SELECCIONADO (7 COLUMNAS) */}
            {currentClient && (
              <div className="lg:col-span-7 space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-100 text-indigo-800">
                          Expediente {currentClient.id}
                        </span>
                        <span className="text-xs text-slate-500">
                          Correo: {currentClient.email}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">
                        {currentClient.fullName}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-1">
                        <span>C.C. {currentClient.documentId}</span>
                        <span>•</span>
                        <span>WhatsApp: +{currentClient.phone}</span>
                        <span>•</span>
                        <span>Ingresos: {formatCOP(currentClient.monthlyIncome)}/mes</span>
                      </div>
                    </div>

                    <a
                      href={getBrokerToClientWhatsAppUrl(currentClient)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition shrink-0"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Contactar Cliente por WhatsApp</span>
                    </a>
                  </div>

                  {/* Resumen de Operación y Banco */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase font-semibold">
                        Línea y Monto
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {currentClient.loanType}
                      </p>
                      <p className="text-base font-extrabold text-indigo-600">
                        {formatCOP(currentClient.requestedAmount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-500 uppercase font-semibold">
                        Plazo y Cuota Est.
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {currentClient.termMonths} meses
                      </p>
                      <p className="text-xs text-slate-600">
                        Cuota aprox:{' '}
                        {formatCOP(
                          calculateEstimatedPayment(
                            currentClient.requestedAmount,
                            currentClient.termMonths
                          )
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 uppercase font-semibold mb-1">
                        Banco Asignado
                      </label>
                      <select
                        value={currentClient.assignedBank}
                        onChange={(e) => handleBankChange(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold bg-white text-slate-900"
                      >
                        {BANKS.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selector de Etapa */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Actualizar Etapa del Trámite (Se refleja en el portal del cliente)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {STAGES.map((st) => {
                        const active = currentClient.stage === st.id;
                        return (
                          <button
                            key={st.id}
                            onClick={() => handleStageChange(st.id)}
                            className={`p-3 rounded-xl border text-left transition ${
                              active
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <div className="text-xs font-extrabold mb-0.5">Etapa {st.id}</div>
                            <div
                              className={`text-[11px] font-medium leading-tight ${
                                active ? 'text-indigo-100' : 'text-slate-500'
                              }`}
                            >
                              {st.short}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* AUDITORÍA DE DOCUMENTOS */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                  <div>
                    <h4 className="font-bold text-base text-slate-900">
                      Revisión y Aprobación de Soportes
                    </h4>
                    <p className="text-xs text-slate-500">
                      Valida los archivos cargados por {currentClient.fullName} o solicita correcciones.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {currentClient.documents.map((docItem) => (
                      <div
                        key={docItem.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-bold text-sm text-slate-900">
                                {docItem.title}
                              </h5>
                              {renderDocStatusBadge(docItem.status)}
                            </div>
                            {docItem.fileName ? (
                              <p className="text-xs text-indigo-700 font-medium mt-1">
                                Archivo: {docItem.fileName} ({docItem.fileSize}) • Subido:{' '}
                                {docItem.uploadedAt}
                              </p>
                            ) : (
                              <p className="text-xs text-slate-400 mt-1">
                                El cliente aún no ha cargado este documento.
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {docItem.fileName && (
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(docItem)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleApproveDocument(docItem.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aprobar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingDocId(docItem.id);
                                setRejectionReason(docItem.rejectionNote || '');
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Solicitar Corrección</span>
                            </button>
                          </div>
                        </div>

                        {rejectingDocId === docItem.id && (
                          <div className="p-3.5 rounded-xl bg-white border border-rose-300 space-y-2.5">
                            <label className="block text-xs font-bold text-rose-800">
                              Motivo de corrección para el cliente:
                            </label>
                            <input
                              type="text"
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Ej: El documento tiene contraseña o falta la cara posterior..."
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setRejectingDocId(null)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectDocument(docItem.id)}
                                className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                              >
                                Enviar Observación
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* ENVIAR NOTIFICACIÓN AL CLIENTE */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
                  <h4 className="font-bold text-base text-slate-900 flex items-center gap-2">
                    <Send className="w-4 h-4 text-indigo-600" />
                    <span>Enviar Actualización al Portal de {currentClient.fullName.split(' ')[0]}</span>
                  </h4>
                  <form onSubmit={handleSendBrokerNote} className="space-y-3">
                    <textarea
                      rows={3}
                      value={brokerUpdateMessage}
                      onChange={(e) => setBrokerUpdateMessage(e.target.value)}
                      placeholder="Escribe una novedad sobre tasas, pre-aprobación o firma de documentos..."
                      className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
                    />
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Notificación al Cliente</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      {/* ================================================================= */}
      {/* MODAL: CREAR CLIENTE MANUALMENTE DESDE EL PANEL BROKER            */}
      {/* ================================================================= */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Registrar Nuevo Cliente
                </h3>
                <p className="text-xs text-slate-500">
                  Crea la cuenta del cliente para que pueda ingresar con su correo y contraseña.
                </p>
              </div>
              <button
                onClick={() => setIsNewClientModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleRegisterClient(e, true)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Completo *
                  </label>
                  <input
                    name="fullName"
                    required
                    placeholder="Ej: Diana Carolina Gómez"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cédula / Documento *
                  </label>
                  <input
                    name="documentId"
                    required
                    placeholder="Ej: 1018456789"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp / Celular *
                  </label>
                  <input
                    name="phone"
                    required
                    defaultValue="57300"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico del Cliente *
                  </label>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="cliente@correo.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contraseña Asignada *
                  </label>
                  <input
                    name="password"
                    type="text"
                    required
                    defaultValue="123456"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ingresos Mensuales ($ COP)
                  </label>
                  <input
                    name="monthlyIncome"
                    type="number"
                    defaultValue={4500000}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipo de Crédito
                  </label>
                  <select
                    name="loanType"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                  >
                    {LOAN_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Monto Solicitado ($)
                  </label>
                  <input
                    name="requestedAmount"
                    type="number"
                    required
                    defaultValue={50000000}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Plazo (Meses)
                  </label>
                  <select
                    name="termMonths"
                    defaultValue={60}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white"
                  >
                    {[12, 24, 36, 48, 60, 72, 120, 180, 240].map((m) => (
                      <option key={m} value={m}>
                        {m} meses
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md"
                >
                  Guardar Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL: CONFIGURACIÓN DEL CORREO Y WHATSAPP DE LA BROKER           */}
      {/* ================================================================= */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" />
                <span>Configuración y Credenciales Broker</span>
              </h3>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.target);
                const newEmail = fd.get('brokerEmail').trim().toLowerCase();
                saveBrokerSettings({
                  businessName: fd.get('businessName'),
                  advisorName: fd.get('advisorName'),
                  brokerEmail: newEmail,
                  brokerPassword: fd.get('brokerPassword'),
                  whatsappNumber: fd.get('whatsappNumber'),
                  supportHours: fd.get('supportHours')
                });
                setSessionAccount((prev) =>
                  prev ? { ...prev, email: newEmail } : prev
                );
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Correo Administrador de la Broker (Tu Amiga)
                </label>
                <input
                  name="brokerEmail"
                  type="email"
                  defaultValue={brokerConfig.brokerEmail || BROKER_EMAIL}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Contraseña de Administradora
                </label>
                <input
                  name="brokerPassword"
                  type="text"
                  defaultValue={brokerConfig.brokerPassword || BROKER_DEFAULT_PASS}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre Comercial de la Firma
                </label>
                <input
                  name="businessName"
                  defaultValue={brokerConfig.businessName}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre y Cargo de la Asesora
                </label>
                <input
                  name="advisorName"
                  defaultValue={brokerConfig.advisorName}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  WhatsApp de Soporte (con código de país, ej: 57)
                </label>
                <input
                  name="whatsappNumber"
                  defaultValue={brokerConfig.whatsappNumber}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Horario de Atención
                </label>
                <input
                  name="supportHours"
                  defaultValue={brokerConfig.supportHours}
                  required
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VISTA PREVIA DE DOCUMENTO */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">{previewDoc.title}</h4>
                <p className="text-xs text-slate-500">{previewDoc.fileName}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-100 rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-2 border border-dashed border-slate-300">
              <FileText className="w-12 h-12 text-indigo-600" />
              <p className="text-sm font-bold text-slate-800">{previewDoc.fileName}</p>
              <p className="text-xs text-slate-500">
                Tamaño: {previewDoc.fileSize} • Fecha de carga: {previewDoc.uploadedAt}
              </p>
              <div className="pt-2">{renderDocStatusBadge(previewDoc.status)}</div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Cerrar Vista Previa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}