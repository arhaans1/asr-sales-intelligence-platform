import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { exportToPDF } from '@/lib/exportPDF';
import { metricsApi, prospectsApi, funnelsApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

interface ExportButtonProps {
  prospectId: string;
  funnelId: string;
}

export default function ExportButton({ prospectId, funnelId }: ExportButtonProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [prospect, funnel, metricsData] = await Promise.all([
        prospectsApi.getById(prospectId),
        funnelsApi.getById(funnelId),
        metricsApi.getByFunnelId(funnelId),
      ]);

      const metrics = Array.isArray(metricsData) && metricsData.length > 0 
        ? metricsData[0] 
        : null;

      if (!metrics) {
        toast({
          title: 'No Data',
          description: 'Please input metrics before exporting',
          variant: 'destructive',
        });
        return;
      }

      // Export to PDF
      exportToPDF({
        prospectName: prospect.business_name,
        funnelName: funnel.funnel_name,
        metrics,
      });

      toast({
        title: 'Success',
        description: 'Report generated successfully',
      });
    } catch (error) {
      console.error('Failed to export:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate report',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={loading}
    >
      <FileDown className="mr-2 h-4 w-4" />
      {loading ? 'Generating...' : 'Export PDF'}
    </Button>
  );
}
