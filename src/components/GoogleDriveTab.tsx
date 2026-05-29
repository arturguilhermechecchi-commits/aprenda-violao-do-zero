import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { initAuth, googleSignIn, googleLogout, getAccessToken } from "../lib/firebase";
import { UserSession } from "../types";
import { 
  Cloud, 
  Database, 
  UploadCloud, 
  RefreshCw, 
  Trash2, 
  Download, 
  CheckCircle, 
  AlertCircle, 
  FolderOpen, 
  FileText, 
  History, 
  Plus, 
  ShieldCheck, 
  LogOut, 
  Chrome,
  Check,
  Music2,
  Folder
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GoogleDriveTabProps {
  currentUser: UserSession;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime?: string;
  size?: string;
}

export default function GoogleDriveTab({ currentUser }: GoogleDriveTabProps) {
  // Authentication status
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Cloud backup & Explorer status
  const [isSearchingFolder, setIsSearchingFolder] = useState(false);
  const [driveFolderId, setDriveFolderId] = useState<string | null>(null);
  const [filesList, setFilesList] = useState<DriveFile[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // File uploading status
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        setAuthChecked(true);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
        setAuthChecked(true);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch or create dedicated folder once logged in
  useEffect(() => {
    if (accessToken) {
      loadDriveSystem(accessToken);
    } else {
      setDriveFolderId(null);
      setFilesList([]);
    }
  }, [accessToken]);

  const loadDriveSystem = async (token: string) => {
    setIsSearchingFolder(true);
    try {
      // Find or create "Guitar Studio" folder
      const folderId = await getOrCreateStudioFolder(token);
      setDriveFolderId(folderId);
      if (folderId) {
        await listFolderFiles(token, folderId);
      }
    } catch (e) {
      console.error("Erro ao iniciar sistema no Google Drive:", e);
      showSyncToast("error", "Erro ao conectar com a pasta de arquivos do seu Google Drive.");
    } finally {
      setIsSearchingFolder(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setSyncStatus(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setAccessToken(result.accessToken);
        showSyncToast("success", `Google Drive conectado com sucesso! Bem-vindo, ${result.user.displayName}.`);
      }
    } catch (e: any) {
      console.error("Erro no login Google:", e);
      showSyncToast("error", "Falha de autenticação. Confirme as permissões e tente novamente.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await googleLogout();
      setGoogleUser(null);
      setAccessToken(null);
      setDriveFolderId(null);
      setFilesList([]);
      showSyncToast("info", "Associação com Google Drive revogada.");
    } catch (e) {
      console.error("Erro logout Google:", e);
    }
  };

  const showSyncToast = (type: "success" | "error" | "info", message: string) => {
    setSyncStatus({ type, message });
    setTimeout(() => setSyncStatus(null), 6000);
  };

  // Helper: Search and locate or return ID for the 'Guitar Studio' Folder
  const getOrCreateStudioFolder = async (token: string): Promise<string | null> => {
    try {
      const query = encodeURIComponent("name = 'Guitar Studio' and mimeType = 'application/vnd.google-apps.folder' and trashed = false");
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Falha ao buscar pasta no Drive");
      const data = await res.json();
      
      if (data.files && data.files.length > 0) {
        return data.files[0].id;
      }

      // Create folder
      const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "Guitar Studio",
          mimeType: "application/vnd.google-apps.folder",
          description: "Pasta reservada para salvar cifras impressas e backups de progresso do Guitar Studio."
        })
      });
      
      if (!createRes.ok) throw new Error("Falha ao criar pasta no Drive");
      const folder = await createRes.json();
      return folder.id;
    } catch (e) {
      console.error("Erro ao gerenciar pasta 'Guitar Studio':", e);
      return null;
    }
  };

  // Helper: List active files within folder
  const listFolderFiles = async (token: string, folderId: string) => {
    setIsLoadingFiles(true);
    try {
      const query = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
      const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,mimeType,createdTime,size)`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Falha ao obter lista de arquivos");
      const data = await res.json();
      setFilesList(data.files || []);
    } catch (e) {
      console.error("Erro ao listar arquivos do Google Drive:", e);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Core Feature: Run local SQLite backup to Drive JSON file
  const handleCreateBackup = async () => {
    if (!accessToken || !driveFolderId) return;
    setIsBackingUp(true);
    setSyncStatus(null);

    try {
      // 1. Fetch current consolidated student progress backup
      const progressRes = await fetch(`/api/user/backup?email=${encodeURIComponent(currentUser.email)}`);
      if (!progressRes.ok) throw new Error("Erro de resposta do servidor local");
      const progressData = await progressRes.json();
      
      if (!progressData.success) throw new Error(progressData.error || "Dados de backup corrompidos");

      const today = new Date();
      const filename = `GuitarStudio_Backup_${currentUser.username.replace(/\s+/g, "")}_${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}.json`;
      
      // 2. Register file metadata in Google Drive inside 'Guitar Studio' folder
      const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: filename,
          parents: [driveFolderId]
        })
      });
      if (!createRes.ok) throw new Error("Erro ao registrar cabeçalho do arquivo no Drive");
      const fileMeta = await createRes.json();

      // 3. Upload content payload
      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileMeta.id}?uploadType=media`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(progressData.backup)
      });
      
      if (!uploadRes.ok) throw new Error("Erro ao carregar blocos de dados no Drive");

      showSyncToast("success", `Backup de progresso "${filename}" criado com sucesso no seu Google Drive!`);
      await listFolderFiles(accessToken, driveFolderId);
    } catch (err: any) {
      console.error("Erro durante o backup na nuvem:", err);
      showSyncToast("error", `Falha ao realizar backup: ${err.message || err}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  // Core Feature: Restore local SQLite database progress from Google Drive JSON backup file
  const handleRestoreBackup = async (fileId: string, filename: string) => {
    if (!accessToken) return;
    
    // REQUIRE USER CONFIRMATION ON RESTORE (Destructive / Overwrite operation)
    const confirmed = window.confirm(
      `ATENÇÃO: Você deseja carregar e restaurar o backup "${filename}"?\n\nIsso sobrescreverá todo o seu progresso local (lições feitas, anotações de estudo, sessões de treino e resultados de provas) na conta "${currentUser.email}". Esta ação não pode ser desfeita.`
    );
    if (!confirmed) return;

    setIsRestoring(true);
    setSyncStatus(null);

    try {
      // 1. Download json content payload from Google Drive fileId
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error("Impossível descarregar o arquivo de backup selecionado");
      const backupJSON = await res.json();

      // 2. Submit restore call to local server API backend
      const restoreRes = await fetch("/api/user/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: currentUser.email,
          backup: backupJSON
        })
      });
      
      if (!restoreRes.ok) {
        const errData = await restoreRes.json();
        throw new Error(errData.error || "Erro de resposta da base de dados local");
      }

      showSyncToast("success", `Fantástico! Dados e progresso restaurados com sucesso a partir do backup "${filename}"! Recarregue a página se os dados não aparecerem de imediato.`);
      
      // Trigger temporary window refresh to let all contexts refresh with new SQLite data
      setTimeout(() => {
        window.location.reload();
      }, 3500);

    } catch (err: any) {
      console.error("Erro carregando backup:", err);
      showSyncToast("error", `Falha ao carregar backup: ${err.message || err}`);
    } finally {
      setIsRestoring(false);
    }
  };

  // Core Feature: Delete file from Google Drive (Destructive operational restriction)
  const handleDeleteFile = async (fileId: string, filename: string) => {
    if (!accessToken || !driveFolderId) return;

    // REQUIRE USER CONFIRMATION ON DESTRUCTIVE ACTIONS
    const confirmed = window.confirm(`Tem certeza que deseja apagar o arquivo "${filename}" permanentemente do seu Google Drive?`);
    if (!confirmed) return;

    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error("Erro ao deletar o arquivo no Drive");
      
      showSyncToast("success", `Arquivo "${filename}" removido com sucesso.`);
      await listFolderFiles(accessToken, driveFolderId);
    } catch (e: any) {
      console.error("Erro ao deletar arquivo no Drive:", e);
      showSyncToast("error", `Erro ao apagar arquivo: ${e.message || e}`);
    }
  };

  // Local file upload handling (Drag and Drop / File Choice picker)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const uploadLocalFile = async (file: File) => {
    if (!accessToken || !driveFolderId) return;
    setIsUploading(true);
    setSyncStatus(null);

    try {
      // 1. Create file header metadata in Drive
      const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: file.name,
          parents: [driveFolderId]
        })
      });
      if (!createRes.ok) throw new Error("Tabela de metadados inválida");
      const fileData = await createRes.json();

      // Convert File to ArrayBuffer
      const fileContent = await file.arrayBuffer();

      // 2. Upload actual binary/text bundle
      const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileData.id}?uploadType=media`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": file.type || "application/octet-stream"
        },
        body: fileContent
      });

      if (!uploadRes.ok) throw new Error("Erro de blocagem física do upload");

      showSyncToast("success", `Arquivo "${file.name}" importado e salvo com sucesso na pasta 'Guitar Studio' do Google Drive!`);
      await listFolderFiles(accessToken, driveFolderId);
    } catch (e: any) {
      console.error("Erro no upload do arquivo:", e);
      showSyncToast("error", `Erro ao subir arquivo: ${e.message || e}`);
    } finally {
      setIsUploading(false);
      setDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadLocalFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadLocalFile(e.target.files[0]);
    }
  };

  const formatBytes = (bytes?: string, decimals = 2) => {
    if (!bytes || parseInt(bytes) === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(parseInt(bytes)) / Math.log(k));
    return parseFloat((parseInt(bytes) / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  if (!authChecked) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-10 h-10 text-amber-600 animate-spin mb-4" />
        <p className="text-xs text-slate-500 font-mono tracking-widest">VERIFICANDO SERVIÇO Google Cloud...</p>
      </div>
    );
  }

  return (
    <div id="google-drive-tab" className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
      
      {/* 1. Sync & Auth Panel */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Google Drive Status Board */}
        <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-850 p-6 rounded-3xl shadow-sm relative overflow-hidden">
          {/* Decorative glowing cloud icon floating in background */}
          <Cloud className="absolute right-[-10px] top-[-10px] w-28 h-28 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" />
          
          <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-stone-50 flex items-center gap-2.5 mb-2">
            <Cloud className="w-5 h-5 text-amber-600 dark:text-amber-500 animate-pulse" />
            Nuvem Google Drive
          </h3>
          <p className="text-xs text-slate-500 dark:text-stone-400 leading-relaxed mb-6">
            Conecte o seu Google Drive para salvar automaticamente suas cifras em PDF, gerenciar backups sincronizados de estudos e proteger seu progresso.
          </p>

          {!googleUser ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-2xl text-[11px] font-medium leading-relaxed">
                <span className="font-bold flex items-center gap-1.5 mb-1 text-xs">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                  Garantia de Privacidade
                </span>
                Seus dados de progresso e anotações são pessoais. O Guitar Studio criará uma pasta segura e legível chamada <strong>"Guitar Studio"</strong> de forma exclusiva nas suas mídias.
              </div>

              {/* Official Standard 'Sign in with Google' Material Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 hover:border-slate-400 font-bold py-3.5 px-4 rounded-2xl shadow-sm active:scale-98 transition cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path fill="#EA4335" d="M12.24 10.285V14.4H19.79C19.33 16.73 17.51 18.25 15.02 19.25l6.19 4.8C25.1 20.3 27 15.3 27 10.285c0-1.125-.135-2.205-.38-3.21H12.24z"></path>
                    <path fill="#4285F4" d="M12.24 10.285h14.38c.245 1.005.38 2.085.38 3.21 0 5.015-1.9 10.015-5.79 13.765l-6.19-4.8c2.49-1 4.31-2.52 4.77-4.85H12.24v-7.325z"></path>
                    <path fill="#FBBC05" d="M3.92 14.785l-6.19-4.8c1.64-3.14 4.88-5.3 8.51-5.3 3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C18.4 1.385 15.3 0 12.24 0c-4.88 0-9.12 2.76-11.23 6.785l6.19 4.8c1.32-3.8 4.96-6.785 9.12-6.785c4.16 0 7.8 2.985 9.12 6.785H3.92z"></path>
                    <path fill="#34A853" d="M12.24 24c4.88 0 9.12-2.76 11.23-6.785l-6.19-4.8c-1.32 3.8-4.96 6.785-9.12 6.785-4.16 0-7.8-2.985-9.12-6.785l-6.19 4.8C2.08 21.24 6.32 24 12.24 24z"></path>
                  </svg>
                )}
                <span className="text-sm tracking-tight text-slate-800">
                  {isLoggingIn ? "Conectando..." : "Entrar com o Google"}
                </span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected User Identity Header */}
              <div className="p-4 bg-slate-50 dark:bg-stone-950 border border-slate-100 dark:border-stone-850 rounded-2xl flex items-center gap-3">
                {googleUser.photoURL ? (
                  <img src={googleUser.photoURL} alt="Foto de perfil" className="w-10 h-10 rounded-full border border-amber-500/20 shadow-inner" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-600 to-amber-800 text-stone-100 font-bold flex items-center justify-center font-mono">
                    {googleUser.displayName?.charAt(0).toUpperCase() || "G"}
                  </div>
                )}
                <div className="text-left overflow-hidden">
                  <span className="text-xs font-black text-slate-900 dark:text-stone-100 block truncate leading-tight">
                    {googleUser.displayName}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-stone-500 block truncate leading-none mt-1 font-mono">
                    {googleUser.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-500 tracking-wider mt-1.5 leading-none bg-emerald-100/50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/10">
                    ● Drive Conectado
                  </span>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleCreateBackup}
                  disabled={isBackingUp || !driveFolderId || isRestoring}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 dark:bg-amber-600 text-white dark:text-slate-950 font-bold py-3 px-4 rounded-xl shadow-sm text-xs hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                >
                  {isBackingUp ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white dark:text-slate-950" />
                  ) : (
                    <UploadCloud className="w-4 h-4 shrink-0" />
                  )}
                  {isBackingUp ? "Salvando na Nuvem..." : "Fazer Backup Progresso"}
                </button>

                <button
                  onClick={handleGoogleLogout}
                  className="w-full flex items-center justify-center gap-2 bg-transparent text-slate-500 hover:text-red-500 hover:bg-red-500/5 font-semibold py-2.5 px-4 rounded-xl text-xs border border-transparent hover:border-red-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Desconectar Conta Google
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Informative tips widget */}
        <div className="bg-slate-50 dark:bg-stone-900/40 border border-slate-150 dark:border-stone-900 p-5 rounded-2xl space-y-3">
          <h4 className="text-[10px] font-bold text-amber-700 dark:text-amber-500 tracking-wider uppercase flex items-center gap-1">
            <History className="w-3.5 h-3.5" />
            Vantagens do Alinhamento
          </h4>
          <ul className="text-xs text-slate-600 dark:text-stone-400 space-y-2 pl-1 leading-relaxed list-none">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 shrink-0 mt-0.5">✔</span>
              <span><strong>Totalmente Multi-dispositivo:</strong> Salve sua rota de lições pelo PC, carregue do Drive pelo celular de forma instantânea.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 shrink-0 mt-0.5">✔</span>
              <span><strong>Guarda de Repertório:</strong> Suas notas específicas sobre as cifras mais populares ficam salvas como arquivos JSON.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 shrink-0 mt-0.5">✔</span>
              <span><strong>Pasta Dedicada:</strong> Salve arquivos de texto customizados (.txt) de letras na mesma seção para consultá-las.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 2. Google Drive File Explorer Component (Lists, Downloads, Backups, and Uploads) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Drive Explorer Head */}
        <div className="bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-850 p-6 rounded-3xl shadow-sm space-y-5">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-stone-850 pb-4 gap-4">
            <div className="text-left">
              <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-stone-50 flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                Explorador de Arquivos "Guitar Studio"
              </h3>
              <p className="text-xs text-slate-500 dark:text-stone-400 font-medium">
                Arquivos armazenados no seu repositório pessoal seguro na nuvem
              </p>
            </div>

            {googleUser && accessToken && (
              <button
                onClick={() => listFolderFiles(accessToken, driveFolderId || "")}
                disabled={isLoadingFiles}
                className="px-3.5 py-1.5 bg-slate-50 dark:bg-stone-950 border border-slate-200 dark:border-stone-850 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-stone-800 text-slate-500 dark:text-stone-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? "animate-spin text-amber-500" : ""}`} />
                Atualizar Lista
              </button>
            )}
          </div>

          <AnimatePresence>
            {syncStatus && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-medium border ${
                  syncStatus.type === "success"
                    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-400"
                    : syncStatus.type === "error"
                    ? "bg-red-500/10 border-red-500/20 text-red-800 dark:text-red-400"
                    : "bg-blue-500/10 border-blue-500/20 text-blue-800 dark:text-blue-400"
                }`}
              >
                {syncStatus.type === "success" ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-500 mt-0.5" />
                )}
                <span>{syncStatus.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core drive contents view */}
          {!googleUser ? (
            <div className="py-16 text-center text-slate-400 dark:text-stone-500 flex flex-col items-center justify-center">
              <Cloud className="w-12 h-12 text-slate-200 dark:text-stone-800 animate-bounce mb-3" />
              <p className="text-sm font-bold">Conexão Necessária</p>
              <p className="text-xs text-slate-400 dark:text-stone-500 max-w-sm mt-1">
                Conecte a sua conta do Gmail/Google à esquerda para listar seus backups de estudo, cifras geradas de violão e carregar arquivos.
              </p>
            </div>
          ) : isSearchingFolder || isLoadingFiles ? (
            <div className="py-16 text-center flex flex-col items-center justify-center">
              <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
              <p className="text-xs text-slate-500 font-mono">Carregando mídias do Google Drive...</p>
            </div>
          ) : filesList.length === 0 ? (
            <div className="py-12 border-2 border-dashed border-slate-200 dark:border-stone-850 rounded-2xl text-center text-slate-400 dark:text-stone-500 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-stone-950/20">
              <Folder className="w-10 h-10 text-slate-200 dark:text-stone-850 mb-2.5 animate-pulse" />
              <p className="text-xs font-extrabold text-slate-600 dark:text-stone-400 leading-none">Pasta "Guitar Studio" Vazia</p>
              <p className="text-[10px] text-slate-400 max-w-xs mt-1 leading-normal">
                Você ainda não salvou backups ou cifras nessa pasta de nuvem. Use o botão <strong>Fazer Backup</strong> à esquerda ou arraste um arquivo para começar!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest font-mono text-slate-400 block pb-1">
                Arquivos Encontrados ({filesList.length})
              </span>
              
              <div className="divide-y divide-slate-100 dark:divide-stone-850 border border-slate-150 dark:border-stone-850 rounded-2xl overflow-hidden bg-slate-50/35 dark:bg-stone-950/25">
                {filesList.map((file) => {
                  const isBackup = file.name.endsWith(".json") && file.name.includes("Backup");
                  const isPDF = file.name.endsWith(".pdf");
                  const isTXT = file.name.endsWith(".txt");
                  
                  return (
                    <div
                      key={file.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-100/50 dark:hover:bg-stone-850/30 transition-all text-sm gap-4 group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden text-left">
                        <div className={`p-2.5 rounded-xl shrink-0 ${
                          isBackup 
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400" 
                            : isPDF 
                            ? "bg-red-105 text-red-700 dark:bg-red-950/40 dark:text-red-400"
                            : "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"
                        }`}>
                          {isBackup ? (
                            <Database className="w-4 h-4" />
                          ) : isPDF ? (
                            <FileText className="w-4 h-4" />
                          ) : (
                            <Music2 className="w-4 h-4" />
                          )}
                        </div>
                        <div className="overflow-hidden">
                          <span className="font-extrabold text-[13px] text-slate-800 dark:text-stone-100 block truncate leading-tight group-hover:text-amber-700 dark:group-hover:text-amber-500 transition">
                            {file.name}
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-stone-500 block leading-none font-mono mt-1 flex items-center gap-1">
                            {file.mimeType.split(".").pop()} • {file.createdTime ? new Date(file.createdTime).toLocaleString("pt-BR") : ""} • Size: {formatBytes(file.size)}
                          </span>
                        </div>
                      </div>

                      {/* File Controls */}
                      <div className="flex items-center gap-2">
                        {isBackup && (
                          <button
                            onClick={() => handleRestoreBackup(file.id, file.name)}
                            disabled={isRestoring}
                            id={`restore-btn-${file.id}`}
                            className="h-8 px-2.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900 border border-purple-200/50 dark:border-purple-800 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold leading-none flex items-center gap-1 active:scale-95 duration-100 cursor-pointer disabled:opacity-50"
                            title="Restaurar progresso do aluno a partir deste backup"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Restaurar</span>
                          </button>
                        )}
                        
                        {/* Delete File Trigger */}
                        <button
                          onClick={() => handleDeleteFile(file.id, file.name)}
                          id={`delete-btn-${file.id}`}
                          className="w-8 h-8 rounded-lg bg-red-400/5 hover:bg-red-500/15 text-slate-400 hover:text-red-500 font-bold border border-transparent hover:border-red-400/10 flex items-center justify-center transition active:scale-90 cursor-pointer"
                          title="Apagar do Google Drive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active drag-and-drop file uploader zone */}
          {googleUser && driveFolderId && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-3xl text-center relative overflow-hidden transition-all duration-200 flex flex-col items-center justify-center ${
                dragOver
                  ? "border-amber-500 bg-amber-500/5"
                  : "border-slate-200 dark:border-stone-850 bg-slate-50/20 dark:bg-stone-950/10"
              }`}
            >
              <input
                type="file"
                id="drive-local-file-picker"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <UploadCloud className={`w-8 h-8 text-amber-600 mb-2 ${isUploading ? "animate-bounce" : ""}`} />
              <p className="text-xs font-black text-slate-800 dark:text-stone-300">
                {isUploading ? "Processando e Enviando..." : "Arrastar ou Escolher Cifra Local"}
              </p>
              <p className="text-[10px] text-slate-400 max-w-sm mt-1 leading-normal">
                Suporta letras customizadas, PDFs ou backups extras. Solte qualquer arquivo aqui para enviar instantaneamente ao seu Drive.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
