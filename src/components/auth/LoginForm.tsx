import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { AlertCircle } from 'lucide-react';

interface LoginFormData {
  username: string;
  password: string;
}

const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>();

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate('/admin');
      }
    };
    checkSession();
  }, [navigate]);

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setLoading(true);

    try {
      // Ensure email is lowercase and in the correct format for your local domain
      const email = `${data.username.toLowerCase()}@alta-klinik.local`;
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: data.password
      });

      if (authError) {
        console.error('Authentication error:', authError);
        
        // Verbesserte Fehlerbehandlung
        if (authError.message.includes('Email not confirmed')) {
          // Dies kann passieren, wenn die E-Mail-Bestätigung in Supabase nicht deaktiviert wurde
          setError('Benutzerkonto ist nicht aktiviert. Bitte kontaktieren Sie den Administrator.');
        } else {
          setError('Ungültiger Anmeldename oder Passwort');
        }
        return;
      }

      if (!authData.user) {
        setError('Benutzer konnte nicht gefunden werden');
        return;
      }

      // Check if user has any roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role:roles(id, name)')
        .eq('user_id', authData.user.id);

      if (rolesError) {
        console.error('Error fetching roles:', rolesError);
        setError('Fehler beim Abrufen der Benutzerrechte');
        return;
      }

      if (!userRoles || userRoles.length === 0) {
        // Log out the user as they don't have roles
        await supabase.auth.signOut();
        setError('Keine Zugriffsrechte. Bitte kontaktieren Sie den Administrator.');
        return;
      }

      // Store user roles in localStorage for access control
      localStorage.setItem('userRoles', JSON.stringify(userRoles.map(r => r.role)));

      // Redirect to admin dashboard after successful login
      const redirectTo = location.state?.from?.pathname || '/admin';
      navigate(redirectTo);
    } catch (error: any) {
      console.error('Error signing in:', error);
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          ALTA Klinik
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Bitte melden Sie sich an
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Anmeldename
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  {...register('username', {
                    required: 'Anmeldename ist erforderlich',
                    pattern: {
                      value: /^[a-zA-Z0-9_-]+$/,
                      message: 'Ungültiger Anmeldename'
                    }
                  })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Passwort
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register('password', { required: 'Passwort ist erforderlich' })}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Anmelden...' : 'Anmelden'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;