import { put } from '@vercel/blob';
import type { NextApiRequest, NextApiResponse } from 'next';
import jsPDF from 'jspdf';

const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = 'appnmmjs033rxHQNC';
const TABLE_ID = 'tblaEGXgtp9nX1bgH';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { recordId, candidateName, transcript, interviewDate } = req.body;

    console.log('📄 Generating PDF transcript for:', candidateName);
    console.log('🆔 Record ID:', recordId);

    // Create PDF
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Exit Interview Transcript', 20, 20);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Candidate: ${candidateName}`, 20, 35);
    pdf.text(`Date: ${new Date(interviewDate).toLocaleDateString()}`, 20, 42);
    pdf.text(`Time: ${new Date(interviewDate).toLocaleTimeString()}`, 20, 49);
    
    pdf.setLineWidth(0.5);
    pdf.line(20, 55, 190, 55);
    
    // Transcript content
    let yPosition = 65;
    const pageHeight = pdf.internal.pageSize.height;
    const lineHeight = 7;
    
    pdf.setFontSize(10);
    
    transcript.forEach((msg: any) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      
      // Speaker
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(msg.speaker === 'assistant' ? 'AI Interviewer:' : 'Candidate:', 20, yPosition);
      
      // Timestamp
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(128, 128, 128);
      pdf.text(new Date(msg.timestamp).toLocaleTimeString(), 190, yPosition, { align: 'right' });
      
      yPosition += lineHeight;
      
      // Message
      pdf.setTextColor(0, 0, 0);
      const lines = pdf.splitTextToSize(msg.content, 170);
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(line, 20, yPosition);
        yPosition += lineHeight;
      });
      
      yPosition += 5;
    });
    
    // Footer
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text(
        `Page ${i} of ${totalPages}`,
        pdf.internal.pageSize.width / 2,
        pdf.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    
    console.log('📤 Uploading to Vercel Blob...');
    
    // Upload to Blob
    const blob = await put(`transcripts/${recordId}_${Date.now()}.pdf`, pdfBuffer, {
      access: 'public',
      contentType: 'application/pdf',
    });
    
    console.log('✅ PDF uploaded:', blob.url);
    
    // Update Airtable - ATTACHMENT FIELD REQUIRES ARRAY OF OBJECTS
    console.log('📝 Updating Airtable record:', recordId);
    console.log('🔑 API Key exists:', !!AIRTABLE_API_KEY);
    console.log('🔑 API Key prefix:', AIRTABLE_API_KEY?.substring(0, 15));
    
    const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`;
    console.log('🌐 Airtable URL:', airtableUrl);
    
    // CRITICAL: Attachment fields need array format with url property
    const updatePayload = {
      fields: {
        'fldyvJBs5YOuOUSMp': [
          {
            url: blob.url,
          }
        ],
        'fld7ocoq2QcCBuvKa': 'Interview Completed',
      },
    };

    console.log('📦 Update payload:', JSON.stringify(updatePayload, null, 2));
    
    const airtableResponse = await fetch(airtableUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });
    
    const responseText = await airtableResponse.text();
    console.log('📥 Airtable response status:', airtableResponse.status);
    console.log('📥 Airtable response:', responseText);
    
    let airtableData;
    try {
      airtableData = JSON.parse(responseText);
    } catch (e) {
      airtableData = responseText;
    }
    
    if (airtableResponse.ok) {
      console.log('✅ Airtable updated successfully');
      console.log('📋 Updated record:', airtableData);
    } else {
      console.error('❌ Airtable update failed');
      console.error('❌ Status:', airtableResponse.status);
      console.error('❌ Error:', airtableData);
      
      // Try alternative update without attachment
      console.log('🔄 Trying to update status only...');
      
      const statusOnlyResponse = await fetch(airtableUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'fld7ocoq2QcCBuvKa': 'Interview Completed',
          },
        }),
      });
      
      if (statusOnlyResponse.ok) {
        console.log('✅ Status updated successfully (without attachment)');
      }
    }
    
    return res.status(200).json({
      success: true,
      pdfUrl: blob.url,
      airtableUpdated: airtableResponse.ok,
      airtableStatus: airtableResponse.status,
      airtableError: airtableResponse.ok ? null : airtableData,
      message: 'Transcript generated and uploaded successfully',
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Failed to generate transcript',
      details: error.message,
      stack: error.stack,
    });
  }
}