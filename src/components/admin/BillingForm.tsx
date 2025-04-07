import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';

interface BillingFormData {
  code: string;
  description: string;
  price: number;
  category_id: string;
}

const BillingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = id !== 'new';

  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<BillingFormData>({
    defaultValues: {
      code: '',
      description: '',
      price: 0,
      category_id: ''
    }
  });

  // Lade Kategorien
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['billing-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data;
    }
  });

  // Lade bestehende Daten im Bearbeitungsmodus
  useEffect(() => {
    if (isEditing && id) {
      const fetchBillingCode = async () => {
        try {
          const { data, error } = await supabase
            .from('billing_codes')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          
          // Setze Formularwerte
          reset({
            code: data.code,
            description: data.description,
            price: data.price,
            category_id: data.category_id
          });
        } catch (err: any) {
          console.error('Error fetching billing code:', err);
          setError('Fehler beim Laden der Abrechnungsziffer.');
        }
      };

      fetchBillingCode();
    }
  }, [isEditing, id, reset]);

  const onSubmit = async (data: BillingFormData) => {
    try {
      setIsSaving(true);
      setError(null);

      // Code auf maximal 4 Stellen beschränken
      if (data.code.length > 4) {
        setError('Die Ziffer darf maximal 4 Zeichen lang sein.');
        return;
      }
      
      // Validiere numerischen Wert für Ziffer
      if (!/^\d+$/.test(data.code)) {
        setError('Die Ziffer darf nur Zahlen enthalten.');
        return;
      }

      if (isEditing && id) {
        // Update
        const { error } = await supabase
          .from('billing_codes')
          .update({
            code: data.code,
            description: data.description,
            price: data.price,
            category_id: data.category_id
          })
          .eq('id', id);

        if (error) throw error;
      } else {
        // Create
        const { error } = await supabase
          .from('billing_codes')
          .insert({
            code: data.code,
            description: data.description,
            price: data.price,
            category_id: data.category_id
          });

        if (error) throw error;
      }

      // Zurück zur Liste navigieren
      navigate('/admin/billing');
    } catch (err: any) {
      console.error('Error saving billing code:', err);
      setError(err.message || 'Fehler beim Speichern der Abrechnungsziffer.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isEditing && isLoadingCategories) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {isEditing ? 'Abrechnungsziffer bearbeiten' : 'Neue Abrechnungsziffer'}
          </h2>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
        <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Abrechnungsinformationen
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Geben Sie die Details für die Abrechnungsziffer ein.
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    Ziffer *
                  </label>
                  <input
                    type="text"
                    id="code"
                    maxLength={4}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    {...register('code', { 
                      required: 'Ziffer ist erforderlich',
                      maxLength: { value: 4, message: 'Maximal 4 Zeichen erlaubt' },
                      pattern: { value: /^\d+$/, message: 'Nur Zahlen erlaubt' }
                    })}
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-4">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Beschreibung *
                  </label>
                  <input
                    type="text"
                    id="description"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    {...register('description', { required: 'Beschreibung ist erforderlich' })}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-2">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Preis (€) *
                  </label>
                  <div className="relative mt-1 rounded-md shadow-sm">
                    <input
                      type="number"
                      id="price"
                      step="0.01"
                      min="0"
                      className="focus:ring-blue-500 focus:border-blue-500 block w-full pr-8 sm:text-sm border-gray-300 rounded-md"
                      {...register('price', { 
                        required: 'Preis ist erforderlich',
                        valueAsNumber: true,
                        min: { value: 0, message: 'Preis muss positiv sein' }
                      })}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">€</span>
                    </div>
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                    Kategorie *
                  </label>
                  <select
                    id="category_id"
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    {...register('category_id', { required: 'Kategorie ist erforderlich' })}
                  >
                    <option value="">Bitte wählen...</option>
                    {categories?.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.category_id.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/admin/billing')}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? 'Wird gespeichert...' : 'Speichern'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingForm; 