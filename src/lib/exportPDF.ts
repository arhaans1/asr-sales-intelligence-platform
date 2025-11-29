/**
 * Export utilities for generating PDF reports
 * Uses browser's native print functionality for PDF generation
 */

export interface ExportData {
  prospectName: string;
  funnelName: string;
  metrics?: any;
  gapAnalysis?: any;
  projections?: any;
  recommendations?: any;
}

/**
 * Generate a printable report and trigger browser print dialog
 */
export const exportToPDF = (data: ExportData) => {
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    alert('Please allow popups to export PDF');
    return;
  }

  // Generate HTML content
  const htmlContent = generateReportHTML(data);
  
  // Write content to new window
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load, then trigger print
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
};

/**
 * Generate HTML content for the report
 */
const generateReportHTML = (data: ExportData): string => {
  const { prospectName, funnelName, metrics, gapAnalysis, projections, recommendations } = data;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ASR Media Pro - Sales Intelligence Report</title>
      <style>
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .page-break {
            page-break-after: always;
          }
          .no-print {
            display: none;
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          background: #fff;
        }
        
        .container {
          max-width: 210mm;
          margin: 0 auto;
          padding: 20px;
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 20px;
          border-bottom: 3px solid #3b82f6;
        }
        
        .header h1 {
          color: #3b82f6;
          font-size: 32px;
          margin-bottom: 10px;
        }
        
        .header p {
          color: #666;
          font-size: 14px;
        }
        
        .report-info {
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .report-info h2 {
          color: #1e293b;
          font-size: 24px;
          margin-bottom: 15px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
        }
        
        .info-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        
        .info-value {
          font-size: 16px;
          color: #1e293b;
          font-weight: 600;
        }
        
        .section {
          margin-bottom: 40px;
        }
        
        .section-title {
          font-size: 20px;
          color: #1e293b;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e2e8f0;
        }
        
        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .metric-card {
          background: #f8fafc;
          padding: 15px;
          border-radius: 6px;
          border-left: 4px solid #3b82f6;
        }
        
        .metric-label {
          font-size: 12px;
          color: #64748b;
          margin-bottom: 5px;
        }
        
        .metric-value {
          font-size: 24px;
          font-weight: 700;
          color: #1e293b;
        }
        
        .recommendation-item {
          background: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 15px;
          border-left: 4px solid #10b981;
        }
        
        .recommendation-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 10px;
        }
        
        .recommendation-description {
          font-size: 14px;
          color: #475569;
          line-height: 1.6;
        }
        
        .priority-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        
        .priority-high {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .priority-medium {
          background: #fef3c7;
          color: #92400e;
        }
        
        .priority-low {
          background: #dbeafe;
          color: #1e40af;
        }
        
        .footer {
          margin-top: 60px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
          text-align: center;
          color: #64748b;
          font-size: 12px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        th, td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
        }
        
        th {
          background: #f8fafc;
          font-weight: 600;
          color: #1e293b;
        }
        
        .no-print {
          text-align: center;
          margin: 20px 0;
        }
        
        .print-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          font-weight: 600;
        }
        
        .print-button:hover {
          background: #2563eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="no-print">
          <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
        </div>
        
        <div class="header">
          <h1>ASR Media Pro</h1>
          <p>Sales Intelligence Report</p>
        </div>
        
        <div class="report-info">
          <h2>Report Overview</h2>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Prospect</span>
              <span class="info-value">${prospectName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Funnel</span>
              <span class="info-value">${funnelName}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Report Date</span>
              <span class="info-value">${new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Generated By</span>
              <span class="info-value">ASR Media Pro</span>
            </div>
          </div>
        </div>
        
        ${metrics ? generateMetricsSection(metrics) : ''}
        ${gapAnalysis ? generateGapAnalysisSection(gapAnalysis) : ''}
        ${projections ? generateProjectionsSection(projections) : ''}
        ${recommendations ? generateRecommendationsSection(recommendations) : ''}
        
        <div class="footer">
          <p>© 2025 ASR Media Pro - Sales Intelligence Platform</p>
          <p>This report is confidential and intended solely for the use of ${prospectName}</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateMetricsSection = (metrics: any): string => {
  return `
    <div class="section">
      <h2 class="section-title">Performance Metrics</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Total Revenue</div>
          <div class="metric-value">₹${(metrics.revenue_generated || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">ROAS</div>
          <div class="metric-value">${(metrics.roas || 0).toFixed(2)}x</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Total Closes</div>
          <div class="metric-value">${metrics.closes || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Ad Spend</div>
          <div class="metric-value">₹${(metrics.ad_spend || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">CTR</div>
          <div class="metric-value">${(metrics.ctr || 0).toFixed(2)}%</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Close Rate</div>
          <div class="metric-value">${(metrics.close_rate || 0).toFixed(2)}%</div>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Impressions</td>
            <td>${(metrics.impressions || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Clicks</td>
            <td>${(metrics.clicks || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Landing Page Views</td>
            <td>${(metrics.landing_page_views || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Registrations</td>
            <td>${(metrics.registrations || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Attendees</td>
            <td>${(metrics.attendees || 0).toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td>Show-Up Rate</td>
            <td>${(metrics.show_up_rate || 0).toFixed(2)}%</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
};

const generateGapAnalysisSection = (gapAnalysis: any): string => {
  return `
    <div class="section page-break">
      <h2 class="section-title">Gap Analysis</h2>
      <p style="margin-bottom: 20px; color: #475569;">
        Comparison of current performance against industry benchmarks
      </p>
      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Current</th>
            <th>Benchmark</th>
            <th>Gap</th>
          </tr>
        </thead>
        <tbody>
          ${gapAnalysis.gaps?.map((gap: any) => `
            <tr>
              <td>${gap.metric}</td>
              <td>${gap.current}</td>
              <td>${gap.benchmark}</td>
              <td style="color: ${gap.gap < 0 ? '#dc2626' : '#16a34a'}">
                ${gap.gap > 0 ? '+' : ''}${gap.gap}
              </td>
            </tr>
          `).join('') || ''}
        </tbody>
      </table>
    </div>
  `;
};

const generateProjectionsSection = (projections: any): string => {
  return `
    <div class="section">
      <h2 class="section-title">Revenue Projections</h2>
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Target Revenue</div>
          <div class="metric-value">₹${(projections.targetRevenue || 0).toLocaleString('en-IN')}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Required Closes</div>
          <div class="metric-value">${projections.requiredCloses || 0}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Estimated Timeline</div>
          <div class="metric-value">${projections.timeline || 'N/A'}</div>
        </div>
      </div>
    </div>
  `;
};

const generateRecommendationsSection = (recommendations: any): string => {
  if (!recommendations || !Array.isArray(recommendations)) {
    return '';
  }
  
  return `
    <div class="section page-break">
      <h2 class="section-title">AI-Powered Recommendations</h2>
      ${recommendations.map((rec: any) => `
        <div class="recommendation-item">
          <span class="priority-badge priority-${rec.priority || 'medium'}">
            ${rec.priority || 'medium'} priority
          </span>
          <div class="recommendation-title">${rec.title || 'Recommendation'}</div>
          <div class="recommendation-description">${rec.description || ''}</div>
          ${rec.expectedImpact ? `
            <p style="margin-top: 10px; font-size: 13px; color: #059669;">
              <strong>Expected Impact:</strong> ${rec.expectedImpact}
            </p>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
};
