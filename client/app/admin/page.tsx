"use client"

import { useState, useEffect } from "react"
import { Shield, User, Mail, ShieldAlert, Edit2, Check, X, Key } from "lucide-react"

export default function AdminPage() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [rolesDisponibles, setRolesDisponibles] = useState<any[]>([])
  
  // ==========================================
  // NUEVO: Estados para Permisos
  // ==========================================
  const [permisosDisponibles, setPermisosDisponibles] = useState<any[]>([])
  const [rolPermisos, setRolPermisos] = useState<any[]>([]) // Guarda la relación {rol_id, permiso_id}

  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [tempRoleId, setTempRoleId] = useState<string>("")

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        
        const config = {
          headers: { "Authorization": `Bearer ${token}` }
        };

        // 1. Traer Usuarios
        const resUsuarios = await fetch("http://localhost:4000/api/get/usuarios-rol", config);
        if (resUsuarios.ok) setUsuarios(await resUsuarios.json());

        // 2. Traer Roles
        const resRoles = await fetch("http://localhost:4000/api/get/roles", config);
        if (resRoles.ok) setRolesDisponibles(await resRoles.json());

        // ==========================================
        // NUEVO: Traer Permisos y sus Relaciones
        // ==========================================
        const resPermisos = await fetch("http://localhost:4000/api/get/permisos", config);
        if (resPermisos.ok) setPermisosDisponibles(await resPermisos.json());

        const resRolPermiso = await fetch("http://localhost:4000/api/get/rol-permiso", config);
        if (resRolPermiso.ok) setRolPermisos(await resRolPermiso.json());

      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, [])

  // (Tus funciones de handleEditClick, handleCancelClick, handleSaveClick se quedan igual...)
  const handleEditClick = (usuario: any) => {
    setEditingUserId(usuario.id)
    setTempRoleId(usuario.rol_id ? String(usuario.rol_id) : "")
  }
  const handleCancelClick = () => {
    setEditingUserId(null)
    setTempRoleId("")
  }
  
  // Guardar los cambios de Rol en el usuario
  const handleSaveClick = async (usuarioId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // 1. Preparamos los datos a enviar
      const payload = {
        usuario_id: usuarioId,
        rol_id: tempRoleId ? Number(tempRoleId) : null
      };

      // 2. Hacemos la petición PUT al backend
      const response = await fetch("http://localhost:4000/api/update/usuario-rol", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // 3. Si la BD se actualizó bien, actualizamos la tabla visualmente
        setUsuarios(usuarios.map(user => 
          user.id === usuarioId ? { ...user, rol_id: payload.rol_id } : user
        ));
        setEditingUserId(null); // Salimos del modo edición
        console.log(`¡Éxito! Usuario ${usuarioId} actualizado al rol ${payload.rol_id}`);
      } else {
        console.error("Error del servidor al guardar el rol");
      }

    } catch (error) {
      console.error("Error de conexión al guardar:", error);
    }
  }

  const obtenerNombreRol = (rolId: number | null) => {
    if (!rolId) return <span className="text-muted-foreground italic">Sin rol</span>;
    const rol = rolesDisponibles.find(r => r.id === rolId)
    return rol ? rol.nombre : "Desconocido"
  }

  // ==========================================
  // NUEVO: Función para prender/apagar un permiso en el Frontend
  // ==========================================
  // Prender o apagar un permiso en un rol
  const handleTogglePermiso = async (rolId: number, permisoId: number) => {
    // 1. Verificamos el estado actual para saber si vamos a prender (true) o apagar (false)
    const tienePermiso = rolPermisos.some(rp => rp.rol_id === rolId && rp.permiso_id === permisoId);
    const asignar = !tienePermiso; // Invertimos el valor actual

    // 2. Actualizamos la Interfaz visual inmediatamente para que se sienta rápido (Optimistic UI)
    if (tienePermiso) {
      setRolPermisos(rolPermisos.filter(rp => !(rp.rol_id === rolId && rp.permiso_id === permisoId)));
    } else {
      setRolPermisos([...rolPermisos, { rol_id: rolId, permiso_id: permisoId }]);
    }
    
    // 3. Hacemos la petición silenciosa al backend para guardarlo permanentemente
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch("http://localhost:4000/api/update/rol-permiso", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          rol_id: rolId,
          permiso_id: permisoId,
          asignar: asignar // Mandamos true (INSERT) o false (DELETE)
        })
      });

      if (!response.ok) {
        // Opcional: Si el servidor falla, podríamos revertir el checkbox aquí
        console.error("Error al guardar el permiso en la base de datos");
      } else {
        console.log(`Permiso ${permisoId} ${asignar ? 'agregado' : 'removido'} del rol ${rolId}`);
      }

    } catch (error) {
      console.error("Error de conexión al modificar el permiso:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-6xl">
        
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="h-8 w-8 text-primary" />
              Panel de Administración
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona los accesos y roles de los usuarios del hospital.
            </p>
          </div>
        </div>

        {/* TABLA DE USUARIOS (Tu código anterior intacto) */}
        {/* CARD DE USUARIOS */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden mb-12">
          {/* Encabezado de la Card */}
          <div className="p-4 border-b border-border bg-muted/30">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" /> Usuarios del Sistema
            </h2>
          </div>

          {/* Contenido de la Card */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-muted-foreground">
              <thead className="bg-muted/50 text-xs uppercase text-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">Usuario</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Rol Asignado</th>
                  <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {usuarios.map((usuario) => {
                  const isEditing = editingUserId === usuario.id;

                  return (
                    <tr key={usuario.id} className="hover:bg-muted/50 transition-colors">
                      {/* Nombre */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="font-medium text-foreground">{usuario.username}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {usuario.email}
                        </div>
                      </td>

                      {/* Rol */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          {isEditing ? (
                            <select
                              className="h-9 w-40 rounded-md border border-primary bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                              value={tempRoleId}
                              onChange={(e) => setTempRoleId(e.target.value)}
                            >
                              <option value="" disabled>Selecciona un rol</option>
                              {rolesDisponibles.map((rol) => (
                                <option key={rol.id} value={rol.id}>
                                  {rol.nombre}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="font-medium text-foreground">
                              {obtenerNombreRol(usuario.rol_id)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleSaveClick(usuario.id)}
                              className="flex h-8 items-center gap-1 rounded-md bg-green-500/10 px-3 text-xs font-medium text-green-600 hover:bg-green-500/20 transition-colors"
                            >
                              <Check className="h-3.5 w-3.5" /> Guardar
                            </button>
                            <button
                              onClick={handleCancelClick}
                              className="flex h-8 items-center gap-1 rounded-md bg-destructive/10 px-3 text-xs font-medium text-destructive hover:bg-destructive/20 transition-colors"
                            >
                              <X className="h-3.5 w-3.5" /> Cancelar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditClick(usuario)}
                            className="flex h-8 items-center gap-1 rounded-md bg-secondary px-3 text-xs font-medium text-secondary-foreground hover:bg-secondary/80 transition-colors ml-auto"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> Editar
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {usuarios.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                No hay usuarios registrados en el sistema.
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            NUEVO: SECCIÓN DE CARDS DE ROLES Y PERMISOS
            ========================================== */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Key className="h-6 w-6 text-primary" />
            Configuración de Permisos por Rol
          </h2>

          {/* Grid para poner las Cards lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Iteramos sobre los roles para crear una Card por cada uno */}
            {rolesDisponibles.map((rol) => (
              <div key={rol.id} className="rounded-xl border border-border bg-card p-6 shadow-sm">
                
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{rol.nombre}</h3>
                    <p className="text-xs text-muted-foreground">ID Rol: {rol.id}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Permisos habilitados:</p>
                  
                  {/* Iteramos sobre todos los permisos para crear los Checkboxes */}
                  {permisosDisponibles.map((permiso) => {
                    // Verificamos si este rol tiene este permiso en nuestro estado 'rolPermisos'
                    const estaActivado = rolPermisos.some(rp => rp.rol_id === rol.id && rp.permiso_id === permiso.id);

                    return (
                      <label key={permiso.id} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-muted/50 transition-colors">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={estaActivado}
                          onChange={() => handleTogglePermiso(rol.id, permiso.id)}
                        />
                        <span className="text-sm text-foreground">
                          {permiso.nombre.replace('_', ' ').toUpperCase()}
                        </span>
                      </label>
                    )
                  })}
                </div>

              </div>
            ))}
            
          </div>
        </div>

      </div>
    </div>
  )
}


//--------------------
