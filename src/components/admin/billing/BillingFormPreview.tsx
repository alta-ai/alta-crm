import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { cn } from '../../../lib/utils';

interface FormQuestion {
  id: string;
  question_text: string;
  question_type: 'yes_no' | 'single_choice' | 'multiple_choice' | 'text' | 'number' | 'bullet_points';
  required: boolean;
  depends_on_question_id: string | null;
  depends_on_option_id: string | null;
  options: FormOption[];
}

interface FormOption {
  id: string;
  option_text: string;
  billing_code_id: string | null;
  option_type: string | null;
}

interface BillingFormPreviewProps {
  formId: string;
}

const BillingFormPreview: React.FC<BillingFormPreviewProps> = ({ formId }) => {
  const [formTitle, setFormTitle] = useState('');
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Lade den Abrechnungsbogen
        const { data: formData, error: formError } = await supabase
          .from('billing_forms')
          .select('*')
          .eq('id', formId)
          .single();

        if (formError) throw formError;
        setFormTitle(formData.name);

        // Lade die Fragen des Abrechnungsbogens
        const { data: questionsData, error: questionsError } = await supabase
          .from('billing_form_questions')
          .select('*')
          .eq('form_id', formId)
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
            ...question,
            options: optionsData
          });
        }

        setQuestions(formattedQuestions);
        
        // Initialisiere die Antworten
        const initialAnswers: Record<string, any> = {};
        formattedQuestions.forEach(question => {
          if (question.question_type === 'yes_no' || question.question_type === 'single_choice') {
            initialAnswers[question.id] = null;
          } else if (question.question_type === 'multiple_choice') {
            initialAnswers[question.id] = [];
          } else if (question.question_type === 'text') {
            initialAnswers[question.id] = '';
          } else if (question.question_type === 'number') {
            initialAnswers[question.id] = '';
          } else if (question.question_type === 'bullet_points') {
            initialAnswers[question.id] = question.options.map(() => false);
          }
        });
        setAnswers(initialAnswers);

      } catch (err: any) {
        console.error('Error loading form data:', err);
        setError(err.message || 'Fehler beim Laden des Abrechnungsbogens');
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [formId]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Prüfe, ob eine Frage aufgrund einer Abhängigkeit angezeigt werden sollte
  const shouldShowQuestion = (question: FormQuestion) => {
    if (!question.depends_on_question_id) return true;
    
    // Prüfe, ob die abhängige Frage mit der richtigen Option beantwortet wurde
    const dependentAnswer = answers[question.depends_on_question_id];
    
    if (!dependentAnswer) return false;
    
    if (Array.isArray(dependentAnswer)) {
      // Für multiple_choice: Wenn eine der ausgewählten Optionen die abhängige Option ist
      return dependentAnswer.includes(question.depends_on_option_id);
    } else {
      // Für yes_no und single_choice: Wenn die ausgewählte Option die abhängige Option ist
      return dependentAnswer === question.depends_on_option_id;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Lade Abrechnungsbogen...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">{formTitle}</h1>
      
      <div className="space-y-6">
        {questions.map(question => (
          shouldShowQuestion(question) && (
            <div key={question.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-md font-medium text-gray-800">
                    {question.question_text}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </h3>
                </div>
              </div>
              
              <div className="mt-2">
                {question.question_type === 'yes_no' && (
                  <div className="flex space-x-4">
                    {question.options.map(option => (
                      <label key={option.id} className="inline-flex items-center cursor-pointer">
                        <input
                          type="radio"
                          className="form-radio text-blue-600"
                          checked={answers[question.id] === option.id}
                          onChange={() => handleAnswerChange(question.id, option.id)}
                        />
                        <span className="ml-2 text-gray-700">{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {question.question_type === 'single_choice' && (
                  <div className="space-y-2">
                    {question.options.map(option => (
                      <label key={option.id} className="inline-flex items-center cursor-pointer block">
                        <input
                          type="radio"
                          className="form-radio text-blue-600"
                          checked={answers[question.id] === option.id}
                          onChange={() => handleAnswerChange(question.id, option.id)}
                        />
                        <span className="ml-2 text-gray-700">{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {question.question_type === 'multiple_choice' && (
                  <div className="space-y-2">
                    {question.options.map(option => (
                      <label key={option.id} className="inline-flex items-center cursor-pointer block">
                        <input
                          type="checkbox"
                          className="form-checkbox text-blue-600"
                          checked={(answers[question.id] || []).includes(option.id)}
                          onChange={(e) => {
                            const currentAnswers = [...(answers[question.id] || [])];
                            if (e.target.checked) {
                              // Hinzufügen
                              handleAnswerChange(question.id, [...currentAnswers, option.id]);
                            } else {
                              // Entfernen
                              handleAnswerChange(
                                question.id, 
                                currentAnswers.filter(id => id !== option.id)
                              );
                            }
                          }}
                        />
                        <span className="ml-2 text-gray-700">{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                )}
                
                {question.question_type === 'text' && (
                  <div>
                    <textarea
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      rows={3}
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                  </div>
                )}
                
                {question.question_type === 'number' && (
                  <div>
                    <input
                      type="number"
                      className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    />
                  </div>
                )}
                
                {question.question_type === 'bullet_points' && (
                  <div className="space-y-2">
                    {question.options.map((option, index) => (
                      <label key={option.id} className="inline-flex items-center cursor-pointer block">
                        <input
                          type="checkbox"
                          className="form-checkbox text-blue-600"
                          checked={answers[question.id]?.[index] || false}
                          onChange={(e) => {
                            const newBulletAnswers = [...(answers[question.id] || [])];
                            newBulletAnswers[index] = e.target.checked;
                            handleAnswerChange(question.id, newBulletAnswers);
                          }}
                        />
                        <span className="ml-2 text-gray-700">{option.option_text}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        ))}
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          type="button"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Speichern
        </button>
      </div>
    </div>
  );
};

export default BillingFormPreview; 