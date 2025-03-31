import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../../lib/supabase';
import { AlertCircle } from 'lucide-react';

interface UserFormData {
  username: string;
  password?: string;
  title?: string;
  first_name: string;
  last_name: string;
  roles: string[];
}

const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [roles, setRoles] = useState<Array<{ id: string; name: string }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<UserFormData>();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch roles
        const { data: rolesData, error: rolesError } = await supabase
          .from('roles')
          .select('id, name')
          .order('name');

        if (rolesError) throw rolesError;
        setRoles(rolesData || []);

        // If editing, fetch user data
        if (id) {
          const { data: userData, error: userError } = await supabase
            .from('user_profiles')
            .select(`
              title,
              first_name,
              last_name,
              user:user_id(
                email
              ),
              roles:user_roles(
                role_id
              )
            `)
            .eq('user_id', id)
            .single();

          if (userError) throw userError;

          if (userData) {
            // Extract username from email
            const username = userData.user.email.split('@')[0];
            
            reset({
              username,
              title: userData.title || undefined,
              first_name: userData.first_name,
              last_name: userData.last_name,
              roles: userData.roles.map((r: any) => r.role_id)
            });
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, reset]);

  const onSubmit = async (data: UserFormData) => {
    setError(null);
    setLoading(true);

    try {
      if (id) {
        // Update existing user
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update({
            title: data.title,
            first_name: data.first_name,
            last_name: data.last_name
          })
          .eq('user_id', id);

        if (profileError) throw profileError;

        // Update roles
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', id);

        if (data.roles.length > 0) {
          const roleAssignments = data.roles.map(roleId => ({
            user_id: id,
            role_id: roleId
          }));

          const { error: rolesError } = await supabase
            .from('user_roles')
            .insert(roleAssignments);

          if (rolesError) throw rolesError;
        }

        // Update password if provided - Entferne Admin-Funktion
        if (data.password) {
          // Diese Funktion kann nur von einer Server-seitigen Admin API verwendet werden,
          // daher müssten wir einen eigenen Server-Endpunkt haben oder eine andere Lösung finden
          setError('Passwortänderungen können nur über die Admin-API durchgeführt werden. Bitte wenden Sie sich an den Systemadministrator.');
        }
      } else {
        // Create new user with username@alta-klinik.local email
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: `${data.username}@alta-klinik.local`,
          password: data.password!,
          options: {
            data: {
              title: data.title,
              first_name: data.first_name,
              last_name: data.last_name
            },
            emailRedirectTo: `${window.location.origin}/admin`,
            // Deaktiviere E-Mail-Bestätigung, da interne E-Mails verwendet werden
            emailVerification: false
          }
        });

        if (signUpError) throw signUpError;

        if (!authData.user) {
          throw new Error('Benutzer konnte nicht erstellt werden');
        }

        // Erstelle Benutzer direkt mit administrativer Signatur
        // Hinweis: Verwende im echten Betrieb einen Server-Endpunkt für diese Operation
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: authData.user.id,
            title: data.title,
            first_name: data.first_name,
            last_name: data.last_name
          });

        if (profileError) throw profileError;

        // Weise Rollen zu
        if (data.roles && data.roles.length > 0) {
          const roleAssignments = data.roles.map(roleId => ({
            user_id: authData.user!.id,
            role_id: roleId
          }));

          const { error: rolesError } = await supabase
            .from('user_roles')
            .insert(roleAssignments);

          if (rolesError) throw rolesError;
        } else {
          throw new Error('Mindestens eine Rolle muss ausgewählt werden');
        }
      }

      navigate('/admin/users');
    } catch (error: any) {
      console.error('Error saving user:', error);
      setError(error.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">
        {id ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
      </h1>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Anmeldename *
              </label>
              <input
                type="text"
                {...register('username', {
                  required: 'Anmeldename ist erforderlich',
                  pattern: {
                    value: /^[a-zA-Z0-9_-]+$/,
                    message: 'Ungültiger Anmeldename'
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                disabled={!!id}
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {!id && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Passwort *
                </label>
                <input
                  type="password"
                  {...register('password', {
                    required: !id && 'Passwort ist erforderlich',
                    minLength: {
                      value: 8,
                      message: 'Passwort muss mindestens 8 Zeichen lang sein'
                    }
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Titel
              </label>
              <input
                type="text"
                {...register('title')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vorname *
                </label>
                <input
                  type="text"
                  {...register('first_name', { required: 'Vorname ist erforderlich' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.first_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nachname *
                </label>
                <input
                  type="text"
                  {...register('last_name', { required: 'Nachname ist erforderlich' })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                />
                {errors.last_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rollen *
              </label>
              <div className="mt-2 space-y-2">
                {roles.map((role) => (
                  <label key={role.id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={role.id}
                      {...register('roles', { required: 'Mindestens eine Rolle muss ausgewählt werden' })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{role.name}</span>
                  </label>
                ))}
              </div>
              {errors.roles && (
                <p className="mt-1 text-sm text-red-600">{errors.roles.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Speichern...' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;