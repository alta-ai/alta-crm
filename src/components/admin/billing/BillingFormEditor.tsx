import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, Trash2, GripVertical, AlertCircle, Save, 
  ArrowLeft, ChevronDown, ChevronUp, Pencil, Check, X,
  Type, Hash, List 
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';

// Interfaces für die Formulardaten
interface FormQuestion {
  id?: string;
  question_text: string;
  question_type: 'yes_no' | 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'bullet_points';
  required: boolean;
  options: FormOption[];
  depends_on_question_id?: string | null;
  depends_on_option_id?: string | null;
}

interface FormOption {
  id?: string;
  option_text: string;
  billing_code_id?: string | null;
  option_type?: string | null;
}

interface BillingFormData {
  name: string;
  description: string;
  category_id: string;
  questions: FormQuestion[];
}

// Interfaces für die Daten aus der Datenbank
interface Category {
  id: string;
  name: string;
}

interface BillingCode {
  id: string;
  code: string;
  description: string;
  price: number;
  category_id: string;
}

const BillingFormEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Formularstatus für das Bearbeiten
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);
  const [editingOptionIndex, setEditingOptionIndex] = useState<{questionIndex: number, optionIndex: number} | null>(null);
  
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm<BillingFormData>({
    defaultValues: {
      name: '',
      description: '',
      category_id: '',
      questions: []
    }
  });

  // Verwaltung der Fragen als Array
  const { fields: questions, append: appendQuestion, remove: removeQuestion, move: moveQuestion } = 
    useFieldArray({ control, name: 'questions' });

  // Lade Untersuchungskategorien
  const { data: categories } = useQuery({
    queryKey: ['examination-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('examination_categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      return data as Category[];
    }
  });

  // Lade Abrechnungsziffern
  const { data: billingCodes } = useQuery({
    queryKey: ['billing-codes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('billing_codes')
        .select(`
          id,
          code,
          description,
          price,
          category_id
        `)
        .order('code');

      if (error) throw error;
      return data as BillingCode[];
    }
  });

  // Wenn ein Abrechnungsbogen bearbeitet wird, lade die vorhandenen Daten
  useEffect(() => {
    const loadFormData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Lade den Abrechnungsbogen
        const { data: formData, error: formError } = await supabase
          .from('billing_forms')
          .select('*')
          .eq('id', id)
          .single();

        if (formError) throw formError;

        // Lade die Fragen des Abrechnungsbogens
        const { data: questionsData, error: questionsError } = await supabase
          .from('billing_form_questions')
          .select('*')
          .eq('form_id', id)
          .order('order_index');

        if (questionsError) throw questionsError;

        // Lade die Optionen für jede Frage
        const formattedQuestions: FormQuestion[] = [];
        
        for (const question of questionsData) {
          const { data: optionsData, error: optionsError } = await supabase
            .from('billing_form_options')
            .select('*')
            .eq('question_id', question.id)
            .order('order_index');

          if (optionsError) throw optionsError;
          
          formattedQuestions.push({
            id: question.id,
            question_text: question.question_text,
            question_type: question.question_type,
            required: question.required,
            options: optionsData.map(option => ({
              id: option.id,
              option_text: option.option_text,
              billing_code_id: option.billing_code_id
            }))
          });
        }

        // Setze die Formulardaten
        reset({
          name: formData.name,
          description: formData.description,
          category_id: formData.category_id,
          questions: formattedQuestions
        });
      } catch (err: any) {
        console.error('Error loading form data:', err);
        setError(err.message || 'Fehler beim Laden des Abrechnungsbogens');
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [id, reset]);

  // Hinzufügen einer neuen Frage
  const handleAddQuestion = (type: 'yes_no' | 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'bullet_points') => {
    let newOptions: FormOption[] = [];
    let questionText = '';
    
    switch (type) {
      case 'yes_no':
        questionText = 'Neue Ja/Nein Frage';
        newOptions = [
          { option_text: 'Ja', billing_code_id: null },
          { option_text: 'Nein', billing_code_id: null }
        ];
        break;
      case 'single_choice':
        questionText = 'Neue Auswahlmöglichkeit';
        newOptions = [
          { option_text: 'Option 1', billing_code_id: null }
        ];
        break;
      case 'multiple_choice':
        questionText = 'Neue Mehrfachauswahl';
        newOptions = [
          { option_text: 'Option 1', billing_code_id: null },
          { option_text: 'Option 2', billing_code_id: null }
        ];
        break;
      case 'text':
        questionText = 'Neue Textfeld Frage';
        newOptions = [
          { option_text: 'Textantwort', billing_code_id: null, option_type: 'text' }
        ];
        break;
      case 'number':
        questionText = 'Neue Zahlenfeld Frage';
        newOptions = [
          { option_text: 'Zahlenantwort', billing_code_id: null, option_type: 'number' }
        ];
        break;
      case 'bullet_points':
        questionText = 'Neue Aufzählungspunkte Frage';
        newOptions = [
          { option_text: 'Punkt 1', billing_code_id: null },
          { option_text: 'Punkt 2', billing_code_id: null },
          { option_text: 'Punkt 3', billing_code_id: null }
        ];
        break;
    }
    
    appendQuestion({
      question_text: questionText,
      question_type: type,
      required: true,
      options: newOptions,
      depends_on_question_id: null,
      depends_on_option_id: null
    });
    
    // Nach dem Hinzufügen die neue Frage gleich aufklappen
    setExpandedQuestionId(questions.length);
  };

  // Optionen für Fragen verwalten
  const handleAddOption = (questionIndex: number) => {
    const currentQuestions = [...watch('questions')];
    const currentOptions = currentQuestions[questionIndex].options || [];
    
    // Neue Option hinzufügen
    currentOptions.push({
      option_text: `Option ${currentOptions.length + 1}`,
      billing_code_id: null
    });
    
    setValue(`questions.${questionIndex}.options`, currentOptions);
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    const currentQuestions = [...watch('questions')];
    const currentOptions = [...currentQuestions[questionIndex].options];
    
    // Option entfernen
    currentOptions.splice(optionIndex, 1);
    
    setValue(`questions.${questionIndex}.options`, currentOptions);
  };

  // Drag & Drop Handler für Fragen
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;
    
    moveQuestion(sourceIndex, destinationIndex);
  };

  // Speichern des Abrechnungsbogens
  const onSubmit = async (data: BillingFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Verwende die ursprünglichen Fragen inklusive Abhängigkeiten
      const cleanedQuestions = data.questions;
      console.log("Fragen mit Abhängigkeiten zum Speichern:", cleanedQuestions);
      
      // Starte eine Transaktion zur Sicherheit
      const { error: beginError } = await supabase.rpc('begin_transaction');
      if (beginError) throw beginError;
      
      try {
        let formId = id;
        
        // Wenn es ein neuer Bogen ist, erstelle ihn zuerst
        if (!formId) {
          const { data: newForm, error: formError } = await supabase
            .from('billing_forms')
            .insert({
              name: data.name,
              description: data.description,
              category_id: data.category_id
            })
            .select()
            .single();
            
          if (formError) throw formError;
          formId = newForm.id;
        } else {
          // Aktualisiere den vorhandenen Bogen
          const { error: updateFormError } = await supabase
            .from('billing_forms')
            .update({
              name: data.name,
              description: data.description,
              category_id: data.category_id
            })
            .eq('id', formId);
            
          if (updateFormError) throw updateFormError;
          
          // Lösche alle bestehenden Fragen und deren Optionen
          // Dies vereinfacht die Implementierung, wir müssen keine Änderungen tracken
          const { error: deleteQuestionsError } = await supabase
            .from('billing_form_questions')
            .delete()
            .eq('form_id', formId);
            
          if (deleteQuestionsError) throw deleteQuestionsError;
        }
        
        // formId ist jetzt garantiert ein String
        if (!formId) {
          throw new Error('Fehler beim Erstellen oder Abrufen der Formular-ID');
        }
        
        // Verwende unsere Hilfsfunktion, um alle Fragen und Optionen zu erstellen
        await createQuestionsAndOptions(formId, cleanedQuestions);
        
        // Commit der Transaktion
        const { error: commitError } = await supabase.rpc('commit_transaction');
        if (commitError) throw commitError;
        
        // Daten aktualisieren und zurück zur Liste navigieren
        queryClient.invalidateQueries({ queryKey: ['billing-forms'] });
        navigate('/admin/billing/forms');
      } catch (error) {
        // Rollback bei Fehler
        await supabase.rpc('rollback_transaction');
        throw error;
      }
    } catch (err: any) {
      console.error('Error saving form:', err);
      setError(err.message || 'Fehler beim Speichern des Abrechnungsbogens');
    } finally {
      setLoading(false);
    }
  };
  
  // Hilfsfunktion zum Erstellen der Fragen und Optionen
  const createQuestionsAndOptions = async (formId: string, questions: FormQuestion[]) => {
    // Hier ist der Fehler: die Stored Procedure für die Transaktion scheint nicht wie erwartet zu funktionieren
    // Stattdessen verwenden wir direktere Transaktionsbefehle
    console.log("Beginne mit dem Speichern von Fragen und Optionen...");
    
    try {
      // Speichere zuerst alle Fragen ohne Abhängigkeiten
      const createdQuestions: Record<number, { id: string, options: Record<number, string> }> = {};
      
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        console.log(`Speichere Frage ${i}:`, {
          text: question.question_text,
          type: question.question_type
        });
        
        // Erstelle die Frage (ohne Abhängigkeiten)
        const { data: newQuestion, error: questionError } = await supabase
          .from('billing_form_questions')
          .insert({
            form_id: formId,
            question_text: question.question_text,
            question_type: question.question_type,
            required: question.required,
            order_index: i,
            // WICHTIG: Setze BEIDE Abhängigkeitsfelder auf NULL
            depends_on_question_id: null,
            depends_on_option_id: null
          })
          .select()
          .single();
        
        if (questionError) {
          console.error(`Fehler beim Speichern der Frage ${i}:`, questionError);
          throw questionError;
        }
        
        // Speichere die erstellte Frage für spätere Referenzen
        createdQuestions[i] = { 
          id: newQuestion.id, 
          options: {} 
        };
        
        // Erstelle die Optionen für diese Frage
        for (let j = 0; j < question.options.length; j++) {
          const option = question.options[j];
          
          console.log(`  Speichere Option ${j} für Frage ${i}:`, {
            text: option.option_text
          });
          
          const { data: newOption, error: optionError } = await supabase
            .from('billing_form_options')
            .insert({
              question_id: newQuestion.id,
              option_text: option.option_text,
              billing_code_id: option.billing_code_id || null,
              order_index: j,
              option_type: option.option_type || null
            })
            .select()
            .single();
          
          if (optionError) {
            console.error(`Fehler beim Speichern der Option ${j} für Frage ${i}:`, optionError);
            throw optionError;
          }
          
          // Speichere die erstellte Option für spätere Referenzen
          createdQuestions[i].options[j] = newOption.id;
        }
      }
      
      console.log("Alle Fragen und Optionen gespeichert, aktualisiere nun Abhängigkeiten...");
      console.log("Erstellte Fragen und Optionen:", createdQuestions);
      
      // Jetzt in einem SEPARATEN SCHRITT aktualisiere die Abhängigkeiten
      for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        
        // Wenn keine Abhängigkeiten gesetzt sind, überspringe diese Frage
        if (!question.depends_on_question_id && !question.depends_on_option_id) {
          continue;
        }
        
        console.log(`Verarbeite Abhängigkeiten für Frage ${i}:`, {
          original_depends_on_question_id: question.depends_on_question_id,
          original_depends_on_option_id: question.depends_on_option_id
        });
        
        // Finde die referenzierten IDs aus unseren neu erstellten Fragen und Optionen
        let dependsOnQuestionId = null;
        let dependsOnOptionId = null;
        
        // Wenn es sich um eine ID für eine gerade erstellte Frage handelt (beginnt mit 'new-')
        if (question.depends_on_question_id && question.depends_on_question_id.startsWith('new-')) {
          const index = parseInt(question.depends_on_question_id.replace('new-', ''));
          dependsOnQuestionId = createdQuestions[index]?.id || null;
        } 
        // Oder es ist eine bestehende Frage-ID
        else if (question.depends_on_question_id) {
          dependsOnQuestionId = question.depends_on_question_id;
        }
        
        // Wenn es sich um eine ID für eine gerade erstellte Option handelt (beginnt mit 'new-option-')
        if (question.depends_on_option_id && question.depends_on_option_id.startsWith('new-option-')) {
          const parts = question.depends_on_option_id.replace('new-option-', '').split('-');
          if (parts.length === 2) {
            const qIndex = parseInt(parts[0]);
            const optIndex = parseInt(parts[1]);
            dependsOnOptionId = createdQuestions[qIndex]?.options[optIndex] || null;
          }
        } 
        // Oder es ist eine bestehende Option-ID
        else if (question.depends_on_option_id) {
          dependsOnOptionId = question.depends_on_option_id;
        }
        
        // WICHTIG: WENN eine der beiden Abhängigkeiten fehlt, DANN setze beide auf null!
        if (!dependsOnQuestionId || !dependsOnOptionId) {
          console.warn(`⚠️ Inkonsistente Abhängigkeiten gefunden für Frage ${i} - setze beide auf null:`, {
            resolved_depends_on_question_id: dependsOnQuestionId,
            resolved_depends_on_option_id: dependsOnOptionId
          });
          
          // Setze beide Felder auf null
          dependsOnQuestionId = null;
          dependsOnOptionId = null;
        } else {
          console.log(`✅ Valide Abhängigkeiten für Frage ${i}:`, {
            resolved_depends_on_question_id: dependsOnQuestionId,
            resolved_depends_on_option_id: dependsOnOptionId
          });
        }
        
        // ERST HIER aktualisieren wir die Frage mit den validierten Abhängigkeiten
        console.log(`Aktualisiere Frage ${i} mit Abhängigkeiten:`, {
          question_id: createdQuestions[i].id,
          depends_on_question_id: dependsOnQuestionId,
          depends_on_option_id: dependsOnOptionId
        });
        
        // KRITISCH: Prüfe explizit, ob beide Felder null oder beide nicht-null sind
        if ((dependsOnQuestionId === null && dependsOnOptionId === null) || 
            (dependsOnQuestionId !== null && dependsOnOptionId !== null)) {
          
          // Update durchführen
          const { error: updateError } = await supabase
            .from('billing_form_questions')
            .update({
              depends_on_question_id: dependsOnQuestionId,
              depends_on_option_id: dependsOnOptionId
            })
            .eq('id', createdQuestions[i].id);
          
          if (updateError) {
            console.error(`❌ Fehler beim Aktualisieren der Abhängigkeiten für Frage ${i}:`, updateError);
            throw updateError;
          }
        } else {
          console.error(`❌ KRITISCHER FEHLER: Inkonsistente Abhängigkeiten bei Frage ${i} - Update abgebrochen:`, {
            question_id: createdQuestions[i].id,
            depends_on_question_id: dependsOnQuestionId,
            depends_on_option_id: dependsOnOptionId
          });
          throw new Error('Inkonsistente Abhängigkeiten: Option-ID und Frage-ID müssen entweder beide gesetzt oder beide null sein.');
        }
      }
      
      console.log("✅ Alle Abhängigkeiten erfolgreich aktualisiert");
      
    } catch (error) {
      console.error("❌ Fehler bei createQuestionsAndOptions:", error);
      throw error;
    }
  };

  if (loading && !questions.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Lade Abrechnungsbogen...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin/billing/forms')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Zurück zur Übersicht
        </button>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">
          {id ? 'Abrechnungsbogen bearbeiten' : 'Neuen Abrechnungsbogen erstellen'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Grundlegende Informationen */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Grundlegende Informationen</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name *
              </label>
              <input
                type="text"
                id="name"
                {...register('name', { required: 'Name ist erforderlich' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>
            
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700">
                Untersuchungskategorie *
              </label>
              <select
                id="category_id"
                {...register('category_id', { required: 'Kategorie ist erforderlich' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              >
                <option value="">Bitte wählen</option>
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
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Beschreibung
              </label>
              <textarea
                id="description"
                {...register('description')}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              />
            </div>
          </div>
        </div>
        
        {/* Fragen */}
        <div className="bg-white shadow-sm rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Fragen</h2>
            <div className="flex flex-wrap space-x-2">
              <button
                type="button"
                onClick={() => handleAddQuestion('yes_no')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Ja/Nein Frage
              </button>
              
              <button
                type="button"
                onClick={() => handleAddQuestion('single_choice')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Auswahlmöglichkeit
              </button>

              <button
                type="button"
                onClick={() => handleAddQuestion('multiple_choice')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-2"
              >
                <Plus className="h-4 w-4 mr-1" />
                Mehrfachauswahl
              </button>
              
              <button
                type="button"
                onClick={() => handleAddQuestion('text')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-2"
              >
                <Type className="h-4 w-4 mr-1" />
                Textfeld
              </button>
              
              <button
                type="button"
                onClick={() => handleAddQuestion('number')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-2"
              >
                <Hash className="h-4 w-4 mr-1" />
                Zahlenfeld
              </button>
              
              <button
                type="button"
                onClick={() => handleAddQuestion('bullet_points')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mb-2"
              >
                <List className="h-4 w-4 mr-1" />
                Aufzählungspunkte
              </button>
            </div>
          </div>
          
          {questions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Keine Fragen hinzugefügt. Fügen Sie oben Fragen hinzu.
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="questions">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-4">
                    {questions.map((question, questionIndex) => (
                      <Draggable key={question.id || `new-${questionIndex}`} draggableId={question.id || `new-${questionIndex}`} index={questionIndex}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            {/* Frage Header */}
                            <div className="bg-gray-50 p-4 flex items-center">
                              <div {...provided.dragHandleProps} className="mr-2 cursor-move">
                                <GripVertical className="h-5 w-5 text-gray-400" />
                              </div>
                              
                              <div className="flex-1">
                                <Controller
                                  name={`questions.${questionIndex}.question_text`}
                                  control={control}
                                  render={({ field }) => (
                                    <input
                                      type="text"
                                      {...field}
                                      className="block w-full border-none bg-transparent p-0 text-base font-medium text-gray-900 focus:ring-0"
                                      placeholder="Frage eingeben"
                                    />
                                  )}
                                />
                                
                                <div className="mt-1 flex items-center text-xs text-gray-500">
                                  <span className="mr-2">
                                    {watch(`questions.${questionIndex}.question_type`) === 'yes_no' ? 'Ja/Nein Frage' : watch(`questions.${questionIndex}.question_type`) === 'single_choice' ? 'Auswahlmöglichkeit' : watch(`questions.${questionIndex}.question_type`) === 'multiple_choice' ? 'Mehrfachauswahl' : watch(`questions.${questionIndex}.question_type`) === 'text' ? 'Textfeld' : watch(`questions.${questionIndex}.question_type`) === 'number' ? 'Zahlenfeld' : 'Aufzählungspunkte'}
                                  </span>
                                  <Controller
                                    name={`questions.${questionIndex}.required`}
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                      <label className="inline-flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={value}
                                          onChange={onChange}
                                          className="h-3 w-3 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-1">Pflichtfeld</span>
                                      </label>
                                    )}
                                  />
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => setExpandedQuestionId(expandedQuestionId === questionIndex ? null : questionIndex)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  {expandedQuestionId === questionIndex ? (
                                    <ChevronUp className="h-5 w-5" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5" />
                                  )}
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => removeQuestion(questionIndex)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </div>
                            
                            {/* Frage Optionen */}
                            {expandedQuestionId === questionIndex && (
                              <div className="p-4 border-t border-gray-200">
                                {/* Abhängigkeiten zwischen Fragen */}
                                <div className="mb-4 pb-4 border-b border-gray-200">
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">Abhängigkeiten</h4>
                                  <div className="space-y-2">
                                    {/* Abhängigkeiten wieder aktiv */}
                                    <label className="block text-sm text-gray-600 mb-1">
                                      Diese Frage ist abhängig von:
                                    </label>
                                    <select
                                      value={watch(`questions.${questionIndex}.depends_on_question_id`) || ''}
                                      onChange={(e) => {
                                        setValue(`questions.${questionIndex}.depends_on_question_id`, e.target.value || null);
                                        setValue(`questions.${questionIndex}.depends_on_option_id`, null);
                                      }}
                                      className="w-full block border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                                    >
                                      <option value="">Keine Abhängigkeit</option>
                                      {questions.slice(0, questionIndex).map((q, qIndex) => (
                                        <option key={q.id || `question-${qIndex}`} value={q.id || `new-${qIndex}`}>
                                          {q.question_text}
                                        </option>
                                      ))}
                                    </select>
                                    
                                    {watch(`questions.${questionIndex}.depends_on_question_id`) && (
                                      <div>
                                        <label className="block text-sm text-gray-600 mb-1">
                                          Wenn ausgewählt:
                                        </label>
                                        <select
                                          value={watch(`questions.${questionIndex}.depends_on_option_id`) || ''}
                                          onChange={(e) => {
                                            setValue(`questions.${questionIndex}.depends_on_option_id`, e.target.value || null);
                                          }}
                                          className="w-full block border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                                        >
                                          <option value="">Bitte Option auswählen</option>
                                          {questions.find((q, qIndex) => 
                                            (q.id || `new-${qIndex}`) === watch(`questions.${questionIndex}.depends_on_question_id`)
                                          )?.options.map((opt, optIndex) => (
                                            <option key={opt.id || `option-${optIndex}`} value={opt.id || `new-option-${optIndex}`}>
                                              {opt.option_text}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Antwortoptionen Überschrift anpassen je nach Fragetyp */}
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  {
                                    watch(`questions.${questionIndex}.question_type`) === 'text' ? 'Textfeld Konfiguration' :
                                    watch(`questions.${questionIndex}.question_type`) === 'number' ? 'Zahlenfeld Konfiguration' :
                                    'Antwortoptionen'
                                  }
                                </h4>
                                
                                <div className="space-y-2 mb-4">
                                  {watch(`questions.${questionIndex}.options`)?.map((option, optionIndex) => (
                                    <div key={option.id || `new-option-${optionIndex}`} className="flex items-center space-x-2">
                                      {editingOptionIndex?.questionIndex === questionIndex && editingOptionIndex?.optionIndex === optionIndex ? (
                                        // Bearbeitungsmodus
                                        <>
                                          <input
                                            type="text"
                                            value={option.option_text}
                                            onChange={(e) => {
                                              const newOptions = [...watch(`questions.${questionIndex}.options`)];
                                              newOptions[optionIndex].option_text = e.target.value;
                                              setValue(`questions.${questionIndex}.options`, newOptions);
                                            }}
                                            className="flex-1 block border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                                          />
                                          
                                          <select
                                            value={option.billing_code_id || ''}
                                            onChange={(e) => {
                                              const newOptions = [...watch(`questions.${questionIndex}.options`)];
                                              newOptions[optionIndex].billing_code_id = e.target.value || null;
                                              setValue(`questions.${questionIndex}.options`, newOptions);
                                            }}
                                            className="w-40 block border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
                                          >
                                            <option value="">Keine Ziffer</option>
                                            {billingCodes?.map((code) => (
                                              <option key={code.id} value={code.id}>
                                                {code.code} - {code.description}
                                              </option>
                                            ))}
                                          </select>
                                          
                                          <button
                                            type="button"
                                            onClick={() => setEditingOptionIndex(null)}
                                            className="text-green-500 hover:text-green-700"
                                          >
                                            <Check className="h-5 w-5" />
                                          </button>
                                        </>
                                      ) : (
                                        // Anzeigemodus
                                        <>
                                          <div className="flex-1 flex items-center">
                                            <span className="text-sm text-gray-700">{option.option_text}</span>
                                            {option.billing_code_id && (
                                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                {billingCodes?.find(c => c.id === option.billing_code_id)?.code || 'Ziffer'}
                                              </span>
                                            )}
                                          </div>
                                          
                                          <button
                                            type="button"
                                            onClick={() => setEditingOptionIndex({ questionIndex, optionIndex })}
                                            className="text-blue-500 hover:text-blue-700"
                                          >
                                            <Pencil className="h-4 w-4" />
                                          </button>
                                          
                                          {/* Nur löschen erlauben, wenn es mehr als 1 Option gibt oder keine Ja/Nein Frage ist */}
                                          {(watch(`questions.${questionIndex}.options`).length > 1 && 
                                            watch(`questions.${questionIndex}.question_type`) !== 'yes_no') && (
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveOption(questionIndex, optionIndex)}
                                              className="text-red-500 hover:text-red-700"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  ))}
                                </div>
                                
                                {/* Nur für Auswahlmöglichkeiten neue Optionen erlauben */}
                                {watch(`questions.${questionIndex}.question_type`) === 'single_choice' && (
                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(questionIndex)}
                                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Option hinzufügen
                                  </button>
                                )}
                                
                                {/* Auch für Mehrfachauswahl neue Optionen erlauben */}
                                {watch(`questions.${questionIndex}.question_type`) === 'multiple_choice' && (
                                  <button
                                    type="button"
                                    onClick={() => handleAddOption(questionIndex)}
                                    className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                                  >
                                    <Plus className="h-3 w-3 mr-1" />
                                    Option hinzufügen
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
        
        {/* Aktionen */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/admin/billing/forms')}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Abbrechen
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className={cn(
              "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {loading ? (
              <span>Speichern...</span>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingFormEditor; 