import { put } from '@vercel/blob';
import type { NextApiRequest, NextApiResponse } from 'next';

const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = 'appnmmjs033rxHQNC';
const TABLE_ID = 'tblaEGXgtp9nX1bgH';

// Correct Field IDs from your Airtable
const FIELD_IDS = {
  githubLinks: 'fldMTTiJus29t4G7d',
  driveLinks: 'fldyvzN8hmbR8ydgQ',
  otherLinks: 'fldlvG092SgFdtL0j',
  githubProjectDesc: 'flddtRbkYyTsA8keT',
  driveProjectDesc: 'fldrDAZ8asDV5jJT0',
  otherProjectDesc: 'fldZsYCOx02BKyEUH',
  offboardingStatus: 'fldXXXXXXXXXXXXXX', // Replace with actual field ID
  blobStorageURL: 'fldXXXXXXXXXXXXXX', // Replace with actual field ID
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      recordId, 
      githubLinks, 
      driveLinks, 
      otherLinks,
      githubDescriptions,
      driveDescriptions,
      otherDescriptions,
      candidateName 
    } = req.body;

    console.log('📥 Received submission:', { recordId, candidateName });

    if (!recordId) {
      return res.status(400).json({ error: 'Record ID is required' });
    }

    // Create JSON data for blob storage
    const submissionData = {
      recordId,
      candidateName,
      githubLinks,
      driveLinks,
      otherLinks,
      githubDescriptions,
      driveDescriptions,
      otherDescriptions,
      submittedAt: new Date().toISOString(),
    };

    // Upload to Vercel Blob Storage
    const blobFileName = `offboarding/${recordId}_${Date.now()}.json`;
    console.log('📤 Uploading to Vercel Blob...');
    
    const blob = await put(blobFileName, JSON.stringify(submissionData, null, 2), {
      access: 'public',
      contentType: 'application/json',
    });

    console.log('✅ Data stored in Vercel Blob:', blob.url);

    // Now update Airtable with correct field IDs
    const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`;
    
    console.log('📤 Updating Airtable...');
    console.log('URL:', airtableUrl);

    const airtablePayload = {
      fields: {
        [FIELD_IDS.githubLinks]: githubLinks || '',
        [FIELD_IDS.driveLinks]: driveLinks || '',
        [FIELD_IDS.otherLinks]: otherLinks || '',
        [FIELD_IDS.githubProjectDesc]: githubDescriptions || '',
        [FIELD_IDS.driveProjectDesc]: driveDescriptions || '',
        [FIELD_IDS.otherProjectDesc]: otherDescriptions || '',
      },
    };

    console.log('Payload:', JSON.stringify(airtablePayload, null, 2));

    const airtableResponse = await fetch(airtableUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(airtablePayload),
    });

    const responseText = await airtableResponse.text();
    console.log('Airtable Response Status:', airtableResponse.status);
    console.log('Airtable Response:', responseText);

    if (!airtableResponse.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText };
      }

      console.error('❌ Airtable Error:', errorData);

      // Data is still in blob storage
      return res.status(200).json({
        success: true,
        warning: 'Data saved to Blob Storage but Airtable update failed',
        blobUrl: blob.url,
        airtableError: errorData,
      });
    }

    const airtableData = JSON.parse(responseText);
    console.log('✅ Airtable updated successfully');

    return res.status(200).json({
      success: true,
      message: 'Data submitted successfully',
      blobUrl: blob.url,
      airtableData,
    });

  } catch (error: any) {
    console.error('❌ Submission error:', error);
    return res.status(500).json({
      error: 'Failed to submit',
      details: error.message,
      stack: error.stack,
    });
  }
}