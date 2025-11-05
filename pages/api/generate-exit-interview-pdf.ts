import type { NextApiRequest, NextApiResponse } from 'next';
import { put } from '@vercel/blob';
import jsPDF from 'jspdf';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      candidate_information,
      executive_summary,
      critical_findings,
      project_contributions_analysis,
      exit_interview_conversation_summary,
      conversation_transcript,
      recordId
    } = req.body;

    console.log('📄 Generating PDF for:', candidate_information?.name);

    const pdf = new jsPDF();
    let yPos = 20;
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    const lineHeight = 7;

    // Helper function to check if we need a new page
    const checkNewPage = (requiredSpace = 20) => {
      if (yPos + requiredSpace > pageHeight - 20) {
        pdf.addPage();
        yPos = 20;
        return true;
      }
      return false;
    };

    // Helper function to add section title
    const addSectionTitle = (title: string) => {
      checkNewPage(15);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(30, 64, 175); // Blue
      pdf.text(title, margin, yPos);
      yPos += 10;
      
      // Underline
      pdf.setDrawColor(229, 231, 235);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;
    };

    // Helper function to add body text
    const addBodyText = (text: string, indent = 0) => {
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(55, 65, 81);
      
      const lines = pdf.splitTextToSize(text, maxWidth - indent);
      lines.forEach((line: string) => {
        checkNewPage();
        pdf.text(line, margin + indent, yPos);
        yPos += lineHeight;
      });
    };

    // Helper function to add label-value pair
    const addLabelValue = (label: string, value: string) => {
      checkNewPage();
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(75, 85, 99);
      pdf.text(`${label}:`, margin, yPos);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(17, 24, 39);
      const lines = pdf.splitTextToSize(value || 'N/A', maxWidth - 40);
      pdf.text(lines, margin + 40, yPos);
      yPos += lineHeight * lines.length + 3;
    };

    // ====================
    // HEADER
    // ====================
    pdf.setFillColor(37, 99, 235);
    pdf.rect(0, 0, pageWidth, 50, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Exit Interview Report', pageWidth / 2, 25, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Comprehensive Exit Interview Summary', pageWidth / 2, 38, { align: 'center' });
    
    yPos = 65;

    // ====================
    // CANDIDATE INFORMATION
    // ====================
    addSectionTitle('Candidate Information');
    
    if (candidate_information) {
      addLabelValue('Name', candidate_information.name);
      addLabelValue('Email', candidate_information.email);
      addLabelValue('Position', candidate_information.position);
      addLabelValue('Department', candidate_information.department);
    }
    
    yPos += 5;

    // ====================
    // EXECUTIVE SUMMARY
    // ====================
    if (executive_summary?.overview) {
      addSectionTitle('Executive Summary');
      addBodyText(executive_summary.overview);
      yPos += 5;
    }

    // ====================
    // CRITICAL FINDINGS
    // ====================
    if (critical_findings) {
      addSectionTitle('Critical Findings');
      addBodyText(critical_findings);
      yPos += 5;
    }

    // ====================
    // PROJECT CONTRIBUTIONS
    // ====================
    if (project_contributions_analysis) {
      addSectionTitle('Project Contributions');
      
      if (project_contributions_analysis.GitHub_projects) {
        checkNewPage(10);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(59, 130, 246);
        pdf.text('📁 GitHub Projects', margin, yPos);
        yPos += 8;
        
        addLabelValue('Repository', project_contributions_analysis.GitHub_projects);
        
        if (project_contributions_analysis.project_description) {
          addBodyText(project_contributions_analysis.project_description, 5);
        }
      }
      
      yPos += 5;
    }

    // ====================
    // EXIT INTERVIEW SUMMARY
    // ====================
    if (exit_interview_conversation_summary) {
      addSectionTitle('Exit Interview Summary');
      
      const summary = exit_interview_conversation_summary;
      
      if (summary.primary_reasons_for_departure) {
        checkNewPage(10);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(75, 85, 99);
        pdf.text('Reasons for Departure', margin, yPos);
        yPos += 7;
        addBodyText(summary.primary_reasons_for_departure, 5);
        yPos += 3;
      }
      
      if (summary.team_feedback) {
        checkNewPage(10);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Team Feedback', margin, yPos);
        yPos += 7;
        addBodyText(summary.team_feedback, 5);
        yPos += 3;
      }
      
      if (summary.management_feedback) {
        checkNewPage(10);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Management Feedback', margin, yPos);
        yPos += 7;
        addBodyText(summary.management_feedback, 5);
        yPos += 3;
      }
      
      if (summary.organizational_improvements) {
        checkNewPage(10);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Suggested Improvements', margin, yPos);
        yPos += 7;
        addBodyText(summary.organizational_improvements, 5);
        yPos += 3;
      }
      
      if (summary.knowledge_transfer_requirements) {
        checkNewPage(10);
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Knowledge Transfer', margin, yPos);
        yPos += 7;
        addBodyText(summary.knowledge_transfer_requirements, 5);
        yPos += 3;
      }
    }

    // ====================
    // FULL CONVERSATION TRANSCRIPT (Q&A FORMAT)
    // ====================
    if (conversation_transcript && conversation_transcript.length > 0) {
      pdf.addPage();
      yPos = 20;
      
      addSectionTitle('Full Interview Transcript');
      
      pdf.setFontSize(10);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Total exchanges: ${conversation_transcript.length}`, margin, yPos);
      yPos += 10;
      
      conversation_transcript.forEach((message: any, index: number) => {
        const isAssistant = message.role === 'assistant' || message.speaker === 'assistant';
        
        checkNewPage(20);
        
        // Speaker label
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        
        if (isAssistant) {
          pdf.setTextColor(37, 99, 235); // Blue for AI
          pdf.text('AI Interviewer:', margin, yPos);
        } else {
          pdf.setTextColor(16, 185, 129); // Green for user
          pdf.text(`${candidate_information?.name || 'Candidate'}:`, margin, yPos);
        }
        
        yPos += 7;
        
        // Message content
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(55, 65, 81);
        
        const content = message.content || message.text || '';
        const lines = pdf.splitTextToSize(content, maxWidth - 10);
        
        lines.forEach((line: string) => {
          checkNewPage();
          pdf.text(line, margin + 5, yPos);
          yPos += lineHeight;
        });
        
        yPos += 5; // Space between messages
      });
    }

    // ====================
    // FOOTER ON ALL PAGES
    // ====================
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      pdf.text(
        `Generated: ${new Date().toLocaleString()}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    // ====================
    // UPLOAD TO VERCEL BLOB
    // ====================
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    
    const fileName = `exit_interview_${candidate_information?.name?.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    
    const blob = await put(
      `reports/${fileName}`,
      pdfBuffer,
      {
        access: 'public',
        contentType: 'application/pdf',
      }
    );

    console.log('✅ PDF generated:', blob.url);

    return res.status(200).json({
      success: true,
      pdfUrl: blob.url,
      fileName,
    });

  } catch (error: any) {
    console.error('❌ Error generating PDF:', error);
    return res.status(500).json({
      error: 'Failed to generate PDF',
      details: error.message,
    });
  }
}