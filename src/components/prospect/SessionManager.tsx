import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Save, FolderOpen, Clock, Trash2 } from 'lucide-react';
import { sessionsApi } from '@/services/api';
import type { FunnelSession } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface SessionManagerProps {
  prospectId: string;
  funnelId?: string;
  onSessionLoad?: (session: FunnelSession) => void;
}

export default function SessionManager({ prospectId, funnelId, onSessionLoad }: SessionManagerProps) {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<FunnelSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [prospectId]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await sessionsApi.getByProspectId(prospectId);
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: 'Error',
        description: 'Session name cannot be empty',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      // Collect current state data
      const sessionData = {
        timestamp: new Date().toISOString(),
        funnelId: funnelId || null,
      };

      await sessionsApi.create({
        prospect_id: prospectId,
        funnel_id: funnelId || null,
        session_name: sessionName,
        session_data: sessionData,
      });

      toast({
        title: 'Success',
        description: 'Session saved successfully',
      });

      setSessionName('');
      setSaveDialogOpen(false);
      loadSessions();
    } catch (error) {
      console.error('Failed to save session:', error);
      toast({
        title: 'Error',
        description: 'Failed to save session',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLoadSession = (session: FunnelSession) => {
    if (onSessionLoad) {
      onSessionLoad(session);
    }

    toast({
      title: 'Session Loaded',
      description: `Loaded session: ${session.session_name}`,
    });

    setLoadDialogOpen(false);
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await sessionsApi.delete(sessionId);
      toast({
        title: 'Success',
        description: 'Session deleted successfully',
      });
      loadSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete session',
        variant: 'destructive',
      });
    }
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
    <div className="flex gap-2">
      {/* Save Session Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Save Session
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Current Session</DialogTitle>
            <DialogDescription>
              Save your current work progress with a descriptive name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Session Name</label>
              <Input
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="e.g., Initial Analysis - Jan 2025"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSession} disabled={saving}>
              {saving ? 'Saving...' : 'Save Session'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load Session Dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="mr-2 h-4 w-4" />
            Load Session
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Load Saved Session</DialogTitle>
            <DialogDescription>
              Select a previously saved session to restore
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading sessions...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No saved sessions yet. Save your first session to track progress.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{session.session_name}</h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(session.created_at)}
                        </div>
                        {session.funnel_id && (
                          <Badge variant="outline" className="mt-2">
                            Funnel Session
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleLoadSession(session)}
                        >
                          Load
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSession(session.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
