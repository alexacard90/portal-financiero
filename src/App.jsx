import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  ShieldCheck,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  LogOut,
  Users,
  Building2,
  Send,
  UserPlus,
  LogIn
} from "lucide-react";

// CONFIGURACIÓN REAL DE TU AMIGA (Modifica lo que está entre comillas)
const BROKER_EMAIL = "solicitudes.credito.serfinanza@gmail.com"; 
const BROKER_PHONE = "573138231893"; // Con código de país sin el +, ej: 57321...

// CONFIGURACIÓN DE SUPABASE
const supabaseUrl = "https://qmugawgqkxpadsqhyguc.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtdWdhd2dxa3hwYWRzcWh5Z3VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyMzQwOTMsImV4cCI6MjEwOTgxMDA5M30.S3PBDV_8g3WITzRai-SeBpVBCyYjoEKIyWiazve89-A";
const supabase = createClient(supabaseUrl, supabaseKey);

const INITIAL_CLIENTS = [];

const STAGES = [
  "Perfil en Evaluación",
  "Recepción de Documentos",
  "Radicado en Banco",
  "Crédito Aprobado"
];

export default function App() {
  const [clients, setClients] = useState(() => {
    // Al cambiar v1 a v2, el sistema borra automáticamente los datos viejos
    const saved = localStorage.getItem("portal_clients_v2");
    return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    cedula: "",
    phone: "",
    countryCode: "+57",
    creditType: "Libre Inversión",
    amount: ""
  });

  const [selectedClientId, setSelectedClientId] = useState(null);
  const [newNotice, setNewNotice] = useState("");

  useEffect(() => {
    localStorage.setItem("portal_clients_v2", JSON.stringify(clients));
  }, [clients]);

  const handleLogin = (e) => {
    e.preventDefault();
    setErrorMsg("");
    const cleanEmail = loginEmail.trim().toLowerCase();

if (cleanEmail === BROKER_EMAIL.toLowerCase()) {
  if (loginPassword === "Kike#1401") {
    setCurrentUser({ role: "broker", email: BROKER_EMAIL, name: "Panel Broker" });
  } else {
    setErrorMsg("Contraseña de administradora incorrecta.");
  }
  return;
}

    const found = clients.find((c) => c.email.toLowerCase() === cleanEmail && c.password === loginPassword);
    if (found) {
      setCurrentUser({ role: "client", id: found.id });
    } else {
      setErrorMsg("Correo o contraseña incorrectos.");
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.password) return;

    const exists = clients.some(c => c.email.toLowerCase() === regForm.email.trim().toLowerCase());
    if(exists) {
      setErrorMsg("Este correo ya está registrado.");
      return;
    }

    const newClient = {
      id: "C-" + Math.floor(100 + Math.random() * 900),
      name: regForm.name,
      cedula: regForm.cedula,
      email: regForm.email.trim().toLowerCase(),
      password: regForm.password,
      phone: regForm.countryCode + " " + regForm.phone,
      creditType: regForm.creditType,
      amount: regForm.amount,
      bank: "En asignación",
      stage: 1,
      documents: [
        { id: "d1", name: "Cédula de ciudadanía (legible por ambas caras)", status: "pendiente", fileName: "", feedback: "" },
        { id: "d2", name: "Extractos bancarios (últimos 3 meses)", status: "pendiente", fileName: "", feedback: "" },
        { id: "d3", name: "Certificación laboral o RUT", status: "pendiente", fileName: "", feedback: "" },
        { id: "d4", name: "Declaración de renta o nómina", status: "pendiente", fileName: "", feedback: "" }
      ],
      notifications: [
        { id: Date.now().toString(), date: "Hoy", text: "Bienvenido. Por favor carga tus documentos para iniciar el estudio." }
      ]
    };

    setClients([...clients, newClient]);
    setCurrentUser({ role: "client", id: newClient.id });
  };

const handleFileUpload = async (clientId, docId, file) => {
    if (!file) return;
    
    alert("⏳ Subiendo archivo a la bóveda segura, espera un momento...");

    try {
      const fileExt = file.name.split('.').pop();
      // Esto limpia el nombre del archivo: quita tildes, ñ y espacios para que Supabase no lo bloquee
      const safeName = file.name.replace(/[^a-zA-Z0-9]/g, '');
      const uniqueName = `${clientId}_${docId}_${Date.now()}_${safeName}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('documentos')
        .upload(uniqueName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        alert("❌ Error técnico exacto: " + error.message);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(uniqueName);

      setClients((prev) =>
        prev.map((c) => {
          if (c.id !== clientId) return c;
          return {
            ...c,
            documents: c.documents.map((d) =>
              d.id === docId ? { ...d, status: "cargado", fileName: file.name, fileUrl: urlData.publicUrl, feedback: "" } : d
            )
          };
        })
      );
      alert("✅ ¡Archivo cargado con éxito!");
    } catch (err) {
      alert("❌ Error grave en la aplicación: " + err.message);
    }
  };

  const updateClientStage = (clientId, newStage) => {
    setClients((prev) => prev.map((c) => (c.id === clientId ? { ...c, stage: Number(newStage) } : c)));
  };

  const updateDocStatus = (clientId, docId, status) => {
    const feedback = status === "rechazado" ? prompt("Indica al cliente el motivo para corregir el documento:") || "Por favor vuelve a subir un archivo legible." : "";
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          documents: c.documents.map((d) => (d.id === docId ? { ...d, status, feedback } : d))
        };
      })
    );
  };

  const sendNotification = (clientId) => {
    if (!newNotice.trim()) return;
    setClients((prev) =>
      prev.map((c) => {
        if (c.id !== clientId) return c;
        return {
          ...c,
          notifications: [{ id: Date.now().toString(), date: "Hoy", text: newNotice }, ...c.notifications]
        };
      })
    );
    setNewNotice("");
  };

const downloadExcel = () => {
    if (clients.length === 0) {
      alert("No hay clientes para descargar.");
      return;
    }
    let csv = "ID,Nombre,Cedula,Celular,Correo,Tipo Credito,Monto,Etapa\n";
    clients.forEach(c => {
      // Usamos comillas para evitar problemas con los signos pesos y espacios
      csv += `${c.id},"${c.name}",${c.cedula},"${c.phone}","${c.email}","${c.creditType}","${c.amount}",${STAGES[c.stage - 1]}\n`;
    });
    
    // Esto asegura que Excel lea bien las tildes y las eñes (formato UTF-8 con BOM)
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Base_Clientes_Broker.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full grid md:grid-cols-2 overflow-hidden">
          <div className="bg-indigo-700 p-8 text-white flex flex-col justify-center">
            <div>
              <div className="flex items-center gap-2 text-xl font-bold mb-6">
                <ShieldCheck className="w-8 h-8 text-indigo-300" />
                <span>Broker Financiero</span>
              </div>
              <div className="inline-block bg-indigo-900/50 text-indigo-100 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 mt-2 border border-indigo-400/30">
                🤝 En alianza con SERFINANZA
              </div>
              <h1 className="text-2xl font-bold mb-3">¡Bienvenido a tu portal financiero!</h1>
              
              <div className="space-y-4 text-indigo-100 text-sm">
                <p>
                  Este es un formulario <strong>100% seguro y confidencial</strong>. Toda la información proporcionada está encriptada y será utilizada de manera exclusiva para la validación y análisis de tu crédito.
                </p>

                <div className="bg-amber-500/20 border border-amber-400/50 p-3 rounded-lg text-amber-100">
                  <p className="font-bold text-amber-50 flex items-center gap-1">⚠️ ¡Aviso Importante!</p>
                  <p className="text-xs mt-1">Guarda esta página o copia el enlace web en tus notas. Así podrás volver a ingresar en el futuro para revisar cómo avanza tu trámite.</p>
                </div>

                <div>
                  <p className="font-bold text-white mb-2">Inicia tu solicitud de crédito en 3 pasos:</p>
                  <ul className="space-y-2 text-xs">
                    <li><strong>Paso 1:</strong> Selecciona <strong>"Nuevo Cliente"</strong> y diligencia tus datos básicos.</li>
                    <li><strong>Paso 2:</strong> Elige el monto y crea tu contraseña (sin requisitos mínimos: usa números, letras o símbolos a tu gusto).</li>
                    <li><strong>Paso 3:</strong> Ingresa a cargar tus documentos. Allí tendrás un botón de <strong>Soporte por WhatsApp</strong> para hablar con tu asesora.</li>
                    <li><strong>Paso 4:</strong> Para volver a revisar tu estado otro día, selecciona <strong>"Iniciar Sesión"</strong> usando tu correo y tu clave.</li>
                  </ul>
                </div>

                <div className="bg-indigo-800/50 p-3 rounded-lg text-xs space-y-2">
                  <p><strong>Aplica para personas reportadas:</strong> Evaluamos tu caso incluso si tienes reportes negativos, siempre y cuando demuestres capacidad de pago y nivel de endeudamiento disponible.</p>
                  <p className="font-bold text-white pt-1 border-t border-indigo-700/50 mt-2">Para agilizar tu estudio, ten a la mano (PDF o Foto):</p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>Cédula de ciudadanía original (legible).</li>
                    <li>Extractos bancarios (últimos 3 meses).</li>
                    <li>Certificación laboral o RUT.</li>
                  </ul>
                </div>

                <p className="text-[10px] text-indigo-300 italic pt-2 leading-tight">
                  *Al registrarte, autorizas el uso de tu información para el análisis crediticio. Conoce nuestra política de tratamiento de datos personales en: www.bancoserfinanza.com
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 ${!isRegistering ? "bg-white shadow text-indigo-700" : "text-slate-600"}`}
              >
                <LogIn className="w-4 h-4" /> Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-1 ${isRegistering ? "bg-white shadow text-indigo-700" : "text-slate-600"}`}
              >
                <UserPlus className="w-4 h-4" /> Nuevo Cliente
              </button>
            </div>

            {errorMsg && <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg">{errorMsg}</div>}

            {!isRegistering ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Correo electrónico</label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ejemplo@correo.com"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm">
                  Ingresar al Portal
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Nombre completo"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
               <input
                 type="text"
                 required
                 placeholder="No. de Cédula"
                 value={regForm.cedula}
                 onChange={(e) => setRegForm({ ...regForm, cedula: e.target.value })}
                 className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
               />
               <div className="flex gap-1">
                 <select
                   value={regForm.countryCode}
                   onChange={(e) => setRegForm({ ...regForm, countryCode: e.target.value })}
                   className="border border-slate-300 rounded-lg px-1 py-2 text-sm bg-white cursor-pointer"
                 >
                   <option value="+57">🇨🇴 +57</option>
                   <option value="+1">🇺🇸 +1</option>
                 </select>
                 <input
                   type="tel"
                   required
                   placeholder="Celular"
                   value={regForm.phone}
                   onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                   className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full"
                 />
               </div>
             </div>
                <input
                  type="email"
                  required
                  placeholder="Correo electrónico"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
                <input
                  type="password"
                  required
                  placeholder="Crear contraseña"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={regForm.creditType}
                    onChange={(e) => setRegForm({ ...regForm, creditType: e.target.value })}
                    className="border border-slate-300 rounded-lg px-2 py-2 text-sm"
                  >
                    <option>Libre Inversión</option>
                    <option>Crédito Hipotecario</option>
                    <option>Compra de Cartera</option>
                    <option>Crédito Vehículo</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Monto (ej. $40.000.000)"
                    value={regForm.amount}
                    onChange={(e) => setRegForm({ ...regForm, amount: e.target.value })}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg text-sm">
                  Crear Expediente
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === "client") {
    const client = clients.find((c) => c.id === currentUser.id);
    if(!client) return null;
    const whatsappUrl = `https://wa.me/${BROKER_PHONE}?text=${encodeURIComponent(
      `Hola, soy ${client.name} (Expediente ${client.id}). Tengo una consulta sobre mi solicitud.`
    )}`;

    return (
      <div className="min-h-screen bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            <span>Mi Trámite Financiero</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">{client.name}</span>
            <button
              onClick={() => setCurrentUser(null)}
              className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg"
            >
              <LogOut className="w-4 h-4" /> Salir
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-indigo-600 uppercase">Expediente {client.id}</span>
                <h2 className="text-xl font-bold text-slate-800">{client.creditType} — {client.amount}</h2>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <Building2 className="w-4 h-4" /> Entidad asignada: {client.bank}
                </p>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm"
              >
                <MessageCircle className="w-4 h-4" /> Soporte por WhatsApp
              </a>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {STAGES.map((label, idx) => {
                const stepNum = idx + 1;
                const active = client.stage >= stepNum;
                return (
                  <div key={label} className={`p-3 rounded-xl border ${active ? "bg-indigo-50 border-indigo-300 text-indigo-900" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
                    <div className="text-xs font-bold mb-1">Paso {stepNum}</div>
                    <div className="text-xs font-medium">{label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Documentos Requeridos
              </h3>
              {client.documents.map((docItem) => (
                <div key={docItem.id} className="p-4 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{docItem.name}</p>
                    {docItem.fileName && <p className="text-xs text-slate-500">Archivo: {docItem.fileName}</p>}
                    {docItem.feedback && <p className="text-xs text-red-600 font-medium mt-1">⚠️ {docItem.feedback}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {docItem.status === "aprobado" && (
                      <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Aprobado
                      </span>
                    )}
                    {docItem.status === "cargado" && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> En revisión
                      </span>
                    )}
                    {docItem.status === "rechazado" && (
                      <span className="text-xs bg-red-100 text-red-800 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Corregir
                      </span>
                    )}
                    <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1">
                      <Upload className="w-3.5 h-3.5" /> Subir PDF
                      <input
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileUpload(client.id, docItem.id, e.target.files[0])}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3">
              <h3 className="font-bold text-slate-800">Actualizaciones de tu Broker</h3>
              {client.notifications.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-indigo-600">{n.date}</span>
                  <p className="text-slate-700">{n.text}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const activeClient = clients.find((c) => c.id === selectedClientId) || clients[0];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2 font-bold">
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          <span>Panel Administrador — Broker Financiero</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={downloadExcel}
            className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 font-semibold shadow-sm"
          >
            📥 Descargar Base de Datos
          </button>
          <button
            onClick={() => setCurrentUser(null)}
            className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 grid md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 space-y-3">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" /> Clientes ({clients.length})
          </h3>
          {clients.length === 0 && (
             <p className="text-sm text-slate-500 p-2">Aún no hay clientes registrados.</p>
          )}
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClientId(c.id)}
              className={`w-full text-left p-3 rounded-xl border transition ${
                activeClient && c.id === activeClient.id ? "bg-indigo-50 border-indigo-400" : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="font-bold text-sm text-slate-800">{c.name}</div>
              <div className="text-xs text-slate-500">{c.creditType} • {c.amount}</div>
              <div className="text-xs font-semibold text-indigo-600 mt-1">Etapa: {STAGES[c.stage - 1]}</div>
            </button>
          ))}
        </div>

        {activeClient && (
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">{activeClient.name}</h2>
                <p className="text-sm font-semibold text-slate-700 mt-1">
               Cédula: {activeClient.cedula} • Celular: {activeClient.phone}
             </p>
                <p className="text-xs text-slate-500">{activeClient.email} • Solicitud: {activeClient.amount}</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Cambiar Etapa del Trámite:</label>
                <select
                  value={activeClient.stage}
                  onChange={(e) => updateClientStage(activeClient.id, e.target.value)}
                  className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-semibold text-indigo-700"
                >
                  {STAGES.map((s, i) => (
                    <option key={s} value={i + 1}>
                      Paso {i + 1}: {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-sm text-slate-700">Revisión de Documentos del Cliente</h4>
              {activeClient.documents.map((d) => (
                <div key={d.id} className="p-3 rounded-xl border border-slate-200 flex flex-wrap justify-between items-center gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{d.name}</p>
                    <p className="text-xs text-slate-500">
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                   Estado: <strong>{d.status.toUpperCase()}</strong> 
                   {d.fileUrl ? (
                     <a href={d.fileUrl} target="_blank" rel="noreferrer" className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded font-bold hover:bg-indigo-200">
                       Abrir Documento
                     </a>
                   ) : (
                     d.fileName && `(${d.fileName})`
                   )}
                 </p>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateDocStatus(activeClient.id, d.id, "aprobado")}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                    >
                      Aprobar
                    </button>
                    <button
                      onClick={() => updateDocStatus(activeClient.id, d.id, "rechazado")}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                    >
                      Pedir Corrección
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <h4 className="font-bold text-sm text-slate-700">Enviar Actualización al Cliente</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNotice}
                  onChange={(e) => setNewNotice(e.target.value)}
                  placeholder="Ej. Tu solicitud ya fue radicada..."
                  className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
                <button
                  onClick={() => sendNotification(activeClient.id)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1"
                >
                  <Send className="w-4 h-4" /> Enviar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}