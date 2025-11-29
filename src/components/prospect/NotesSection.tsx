import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Save, Trash2, Clock } from 'lucide-react';
import { notesApi } from '@/services/api';
import type { Note } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface NotesSectionProps {
  prospectId: string;
}

type NoteTag = 'objection' | 'insight' | 'action_item' | 'follow_up';

const NOTE_TAGS: { value: NoteTag; label: string; color: string }[] = [
  { value: 'objection', label: 'Objection', color: 'bg-red-100 text-red-800' },
  { value: 'insight', label: 'Insight', color: 'bg-blue-100 text-blue-800' },
  { value: 'action_item', label: 'Action Item', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'follow_up', label: 'Follow-Up', color: 'bg-green-100 text-green-800' },
];

export default function NotesSection({ prospectId }: NotesSectionProps) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTag, setNewNoteTag] = useState<NoteTag>('insight');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotes();
  }, [prospectId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await notesApi.getByProspectId(prospectId);
      setNotes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load notes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notes',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) {
      toast({
        title: 'Error',
        description: 'Note content cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      await notesApi.create({
        prospect_id: prospectId,
        content: newNoteContent,
        tags: [newNoteTag],
        session_id: null,
        linked_metric: null,
      });

      toast({
        title: 'Success',
        description: 'Note added successfully',
      });

      setNewNoteContent('');
      setNewNoteTag('insight');
      setIsAdding(false);
      loadNotes();
    } catch (error) {
      console.error('Failed to add note:', error);
      toast({
        title: 'Error',
        description: 'Failed to add note',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await notesApi.delete(noteId);
      toast({
        title: 'Success',
        description: 'Note deleted successfully',
      });
      loadNotes();
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      });
    }
  };

  const getTagColor = (tag: string) => {
    const tagConfig = NOTE_TAGS.find(t => t.value === tag);
    return tagConfig?.color || 'bg-muted text-muted-foreground';
  };

  const getTagLabel = (tag: string) => {
    const tagConfig = NOTE_TAGS.find(t => t.value === tag);
    return tagConfig?.label || tag;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Track objections, insights, and action items</CardDescription>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Form */}
        {isAdding && (
          <div className="p-4 border rounded-lg space-y-3 bg-muted/30">
            <div className="space-y-2">
              <label className="text-sm font-medium">Note Type</label>
              <Select value={newNoteTag} onValueChange={(value) => setNewNoteTag(value as NoteTag)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TAGS.map((tag) => (
                    <SelectItem key={tag.value} value={tag.value}>
                      {tag.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                placeholder="Enter your note here..."
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddNote} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Note'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setNewNoteContent('');
                  setNewNoteTag('insight');
                }}
                disabled={saving}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No notes yet. Add your first note to track important information.
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="p-4 border rounded-lg space-y-2 hover:bg-muted/30 transition-colors">
                <div className="flex items-start justify-between">
                  <Badge className={getTagColor(note.tags?.[0] || 'insight')}>
                    {getTagLabel(note.tags?.[0] || 'insight')}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTimestamp(note.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
