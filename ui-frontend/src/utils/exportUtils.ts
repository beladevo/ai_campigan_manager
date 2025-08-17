import { Campaign } from '@/types/campaign';
import { format } from 'date-fns';

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'html' | 'txt';
  includeImages: boolean;
  includeMetadata: boolean;
  template?: 'minimal' | 'detailed' | 'branded';
}

// HTML template for exports
const getHTMLTemplate = (campaign: Campaign, options: ExportOptions) => {
  const isDetailed = options.template === 'detailed';
  const isBranded = options.template === 'branded';
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campaign Export - ${campaign.id.slice(-8)}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            ${isBranded ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);' : 'background: #f8f9fa;'}
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            ${isBranded ? 'border-bottom: 3px solid #667eea;' : 'border-bottom: 2px solid #eee;'}
            padding-bottom: 20px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
        }
        .campaign-id {
            color: #666;
            font-size: 14px;
            font-weight: 500;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin: 10px 0;
        }
        .status-completed { background: #d4edda; color: #155724; }
        .status-processing { background: #d1ecf1; color: #0c5460; }
        .status-failed { background: #f8d7da; color: #721c24; }
        .status-pending { background: #fff3cd; color: #856404; }
        .section {
            margin: 25px 0;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            ${isBranded ? 'color: #667eea;' : ''}
        }
        .content-box {
            background: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        .metadata {
            background: #e9ecef;
            padding: 15px;
            border-radius: 8px;
            font-size: 14px;
        }
        .metadata-item {
            margin: 8px 0;
        }
        .metadata-label {
            font-weight: bold;
            display: inline-block;
            width: 120px;
        }
        .image-container {
            text-align: center;
            margin: 20px 0;
        }
        .campaign-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 12px;
        }
        @media print {
            body { background: white !important; }
            .container { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ${isBranded ? '<div class="logo">Solara AI</div>' : ''}
            <h1>Campaign Export</h1>
            <div class="campaign-id">Campaign ID: ${campaign.id}</div>
            <div class="status-badge status-${campaign.status.toLowerCase()}">
                ${campaign.status}
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">Original Prompt</h2>
            <div class="content-box">${campaign.prompt}</div>
        </div>

        ${campaign.generatedText ? `
        <div class="section">
            <h2 class="section-title">Generated Content</h2>
            <div class="content-box">${campaign.generatedText}</div>
        </div>
        ` : ''}

        ${options.includeImages && campaign.imagePath ? `
        <div class="section">
            <h2 class="section-title">Generated Image</h2>
            <div class="image-container">
                <img src="http://localhost:3000/output/${campaign.imagePath.replace(/.*\//, '')}" 
                     alt="Campaign Image" class="campaign-image" />
            </div>
        </div>
        ` : ''}

        ${options.includeMetadata ? `
        <div class="section">
            <h2 class="section-title">Campaign Metadata</h2>
            <div class="metadata">
                <div class="metadata-item">
                    <span class="metadata-label">User ID:</span>
                    ${campaign.userId}
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">Created:</span>
                    ${format(new Date(campaign.createdAt), 'PPpp')}
                </div>
                <div class="metadata-item">
                    <span class="metadata-label">Updated:</span>
                    ${format(new Date(campaign.updatedAt), 'PPpp')}
                </div>
                ${campaign.completedAt ? `
                <div class="metadata-item">
                    <span class="metadata-label">Completed:</span>
                    ${format(new Date(campaign.completedAt), 'PPpp')}
                </div>
                ` : ''}
                ${campaign.errorMessage ? `
                <div class="metadata-item">
                    <span class="metadata-label">Error:</span>
                    ${campaign.errorMessage}
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}

        <div class="footer">
            <p>Exported on ${format(new Date(), 'PPpp')}</p>
            ${isBranded ? '<p>Generated with Solara AI - Professional Marketing Content Creation</p>' : ''}
        </div>
    </div>
</body>
</html>
  `.trim();
};

// Plain text export
const getTextContent = (campaign: Campaign, options: ExportOptions) => {
  const lines = [];
  
  lines.push('CAMPAIGN EXPORT');
  lines.push('===============');
  lines.push('');
  lines.push(`Campaign ID: ${campaign.id}`);
  lines.push(`Status: ${campaign.status}`);
  lines.push('');
  
  lines.push('ORIGINAL PROMPT');
  lines.push('---------------');
  lines.push(campaign.prompt);
  lines.push('');
  
  if (campaign.generatedText) {
    lines.push('GENERATED CONTENT');
    lines.push('-----------------');
    lines.push(campaign.generatedText);
    lines.push('');
  }
  
  if (options.includeMetadata) {
    lines.push('METADATA');
    lines.push('--------');
    lines.push(`User ID: ${campaign.userId}`);
    lines.push(`Created: ${format(new Date(campaign.createdAt), 'PPpp')}`);
    lines.push(`Updated: ${format(new Date(campaign.updatedAt), 'PPpp')}`);
    if (campaign.completedAt) {
      lines.push(`Completed: ${format(new Date(campaign.completedAt), 'PPpp')}`);
    }
    if (campaign.errorMessage) {
      lines.push(`Error: ${campaign.errorMessage}`);
    }
    lines.push('');
  }
  
  lines.push(`Exported on: ${format(new Date(), 'PPpp')}`);
  
  return lines.join('\n');
};

// Generate filename
const generateFilename = (campaign: Campaign, format: string) => {
  const campaignId = campaign.id.slice(-8);
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
  return `campaign_${campaignId}_${timestamp}.${format}`;
};

// Export to HTML
export const exportToHTML = async (campaign: Campaign, options: ExportOptions) => {
  const html = getHTMLTemplate(campaign, options);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = generateFilename(campaign, 'html');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Export to Text
export const exportToText = async (campaign: Campaign, options: ExportOptions) => {
  const text = getTextContent(campaign, options);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = generateFilename(campaign, 'txt');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Export to PDF (using browser print)
export const exportToPDF = async (campaign: Campaign, options: ExportOptions) => {
  const html = getHTMLTemplate(campaign, options);
  
  // Create a new window with the HTML content
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Popup blocked. Please allow popups for this site.');
  }
  
  printWindow.document.write(html);
  printWindow.document.close();
  
  // Wait for content to load, then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };
};

// Main export function
export const exportCampaign = async (campaign: Campaign, options: ExportOptions) => {
  try {
    switch (options.format) {
      case 'html':
        await exportToHTML(campaign, options);
        break;
      case 'txt':
        await exportToText(campaign, options);
        break;
      case 'pdf':
        await exportToPDF(campaign, options);
        break;
      case 'docx':
        // For Word documents, we'll export as HTML with a .docx extension
        // Most modern word processors can open HTML files
        const htmlOptions = { ...options, format: 'html' as const };
        const html = getHTMLTemplate(campaign, htmlOptions);
        const blob = new Blob([html], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = generateFilename(campaign, 'docx');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        break;
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
};

// Bulk export multiple campaigns
export const exportMultipleCampaigns = async (campaigns: Campaign[], options: ExportOptions) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm');
  
  if (options.format === 'html') {
    // Create a combined HTML file for multiple campaigns
    const combinedHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campaign Export Bundle - ${campaigns.length} Campaigns</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 40px; }
        .campaign { background: white; margin: 20px 0; padding: 30px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .campaign-header { border-bottom: 2px solid #eee; padding-bottom: 15px; margin-bottom: 20px; }
        .page-break { page-break-before: always; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Campaign Export Bundle</h1>
            <p>${campaigns.length} campaigns exported on ${format(new Date(), 'PPpp')}</p>
        </div>
        ${campaigns.map((campaign, index) => `
        <div class="campaign ${index > 0 ? 'page-break' : ''}">
            ${getHTMLTemplate(campaign, options).replace(/<!DOCTYPE html>.*?<body[^>]*>/gs, '').replace(/<\/body>.*?<\/html>/gs, '')}
        </div>
        `).join('')}
    </div>
</body>
</html>
    `.trim();
    
    const blob = new Blob([combinedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaigns_bundle_${timestamp}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } else {
    // For other formats, create individual files and zip them
    for (let i = 0; i < campaigns.length; i++) {
      const campaign = campaigns[i];
      // Add a small delay between downloads to avoid browser blocking
      setTimeout(() => {
        exportCampaign(campaign, options);
      }, i * 200);
    }
  }
};