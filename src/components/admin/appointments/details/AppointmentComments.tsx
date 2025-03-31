import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Send, Check, Info, Phone, Flag } from 'lucide-react';
import { cn } from '../../../../lib/utils';
import { Comment } from '../types';

interface AppointmentCommentsProps {
  appointmentId: string;
}

const AppointmentComments: React.FC<AppointmentCommentsProps> = ({ appointmentId }) => {
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [commentType, setCommentType] = useState<'info' | 'anruf'>('info');
  const [isTodo, setIsTodo] = useState(false);
  const [priority, setPriority] = useState(false);
  const [commentFilter, setCommentFilter] = useState<'all' | 'completed' | 'pending' | 'info' | 'anruf' | 'priority'>('all');
  const queryClient = useQueryClient();

  // Load comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ['appointment-comments', appointmentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('appointment_comments')
        .select(`
          id,
          content,
          created_at,
          updated_at,
          user_id,
          completed,
          comment_type,
          is_todo,
          priority,
          user_profile:user_profile_view!user_id(
            title,
            first_name,
            last_name
          )
        `)
        .eq('appointment_id', appointmentId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const handleMarkCommentAsCompleted = async (commentId: string) => {
    try {
      setError(null);

      const { error } = await supabase
        .from('appointment_comments')
        .update({ completed: true })
        .eq('id', commentId);

      if (error) throw error;

      // Update data
      queryClient.invalidateQueries(['appointment-comments', appointmentId]);
    } catch (err: any) {
      console.error('Error marking comment as completed:', err);
      setError(err.message || 'Fehler beim Markieren des Kommentars als erledigt');
    }
  };

  const handleAddComment = async () => {
    try {
      setError(null);

      if (!newComment.trim()) {
        setError('Bitte geben Sie einen Kommentar ein');
        return;
      }

      const { error: commentError } = await supabase
        .from('appointment_comments')
        .insert({
          appointment_id: appointmentId,
          content: newComment.trim(),
          comment_type: commentType,
          is_todo: isTodo,
          priority: isTodo && priority,
          completed: false
        });

      if (commentError) throw commentError;

      // Reset form
      setNewComment('');
      setCommentType('info');
      setIsTodo(false);
      setPriority(false);
      
      // Update data
      queryClient.invalidateQueries(['appointment-comments', appointmentId]);
    } catch (err: any) {
      console.error('Error adding comment:', err);
      setError(err.message || 'Fehler beim Speichern des Kommentars');
    }
  };

  const filterComments = (commentsToFilter: Comment[]) => {
    switch (commentFilter) {
      case 'completed':
        return commentsToFilter.filter(comment => comment.is_todo && comment.completed);
      case 'pending':
        return commentsToFilter.filter(comment => comment.is_todo && !comment.completed);
      case 'info':
        return commentsToFilter.filter(comment => comment.comment_type === 'info');
      case 'anruf':
        return commentsToFilter.filter(comment => comment.comment_type === 'anruf');
      case 'priority':
        return commentsToFilter.filter(comment => comment.priority);
      default:
        return commentsToFilter;
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Kommentare werden geladen...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Comment Filter */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-medium text-gray-900">Kommentare</h4>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-500 mr-2">Filter:</label>
          <select
            value={commentFilter}
            onChange={(e) => setCommentFilter(e.target.value as any)}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
          >
            <option value="all">Alle</option>
            <option value="completed">Erledigte ToDos</option>
            <option value="pending">Unerledigte ToDos</option>
            <option value="priority">Priorisierte ToDos</option>
            <option value="info">Info-Kommentare</option>
            <option value="anruf">Anruf-Kommentare</option>
          </select>
        </div>
      </div>
      
      {/* Existing Comments */}
      {comments && comments.length > 0 ? (
        <div className="space-y-3 mb-4">
          {filterComments(comments).map((comment: Comment) => (
            <div 
              key={comment.id} 
              className={cn(
                "bg-gray-50 rounded-lg p-3",
                comment.is_todo && comment.completed ? "border border-green-300" : "",
                comment.is_todo && !comment.completed ? "border border-blue-300" : "",
                comment.priority ? "border-l-4 border-l-orange-400" : ""
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    {comment.comment_type === 'info' ? (
                      <Info className="h-4 w-4 text-blue-500 mr-2" />
                    ) : (
                      <Phone className="h-4 w-4 text-green-500 mr-2" />
                    )}
                    <span className="text-xs font-medium text-gray-500 mr-2">
                      {comment.comment_type === 'info' ? 'Info' : 'Anruf'}
                    </span>
                    {comment.is_todo && (
                      <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-2">
                        ToDo
                      </span>
                    )}
                    {comment.priority && (
                      <Flag className="h-4 w-4 text-orange-500" title="Priorität" />
                    )}
                  </div>
                  <p className="text-sm text-gray-900">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {comment.user_profile?.title && (
                      <span>{comment.user_profile.title} </span>
                    )}
                    {comment.user_profile?.first_name || "Unbekannt"} {comment.user_profile?.last_name || ""}
                    {' • '}
                    {format(parseISO(comment.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                  </p>
                </div>
                {comment.is_todo && !comment.completed && (
                  <button
                    onClick={() => handleMarkCommentAsCompleted(comment.id)}
                    className="ml-2 p-1 rounded-full hover:bg-green-100 text-gray-400 hover:text-green-600"
                    title="Als erledigt markieren"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 mb-4">Keine Kommentare vorhanden</div>
      )}

      {/* New Comment Form */}
      <div className="space-y-4">
        {/* Comment Input */}
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Neuer Kommentar..."
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 text-sm"
          rows={2}
        />
        
        {/* Comment Type and ToDo Selection */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                id="info-type"
                type="radio"
                name="comment-type"
                checked={commentType === 'info'}
                onChange={() => setCommentType('info')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="info-type" className="ml-2 text-sm text-gray-700 flex items-center">
                <Info className="h-4 w-4 text-blue-500 mr-1" />
                Info
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                id="anruf-type"
                type="radio"
                name="comment-type"
                checked={commentType === 'anruf'}
                onChange={() => setCommentType('anruf')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="anruf-type" className="ml-2 text-sm text-gray-700 flex items-center">
                <Phone className="h-4 w-4 text-green-500 mr-1" />
                Anruf
              </label>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                id="todo-checkbox"
                type="checkbox"
                checked={isTodo}
                onChange={() => {
                  setIsTodo(!isTodo);
                  if (!isTodo) setPriority(false);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="todo-checkbox" className="ml-2 text-sm text-gray-700">
                ToDo
              </label>
            </div>
            
            {isTodo && (
              <div className="flex items-center">
                <input
                  id="priority-checkbox"
                  type="checkbox"
                  checked={priority}
                  onChange={() => setPriority(!priority)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="priority-checkbox" className="ml-2 text-sm text-gray-700 flex items-center">
                  <Flag className={`h-4 w-4 ${priority ? 'text-orange-500' : 'text-gray-400'} mr-1`} />
                  Priorität
                </label>
              </div>
            )}
          </div>
          
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="ml-auto inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4 mr-2" />
            Speichern
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentComments;