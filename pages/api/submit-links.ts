import { put } from '@vercel/blob';
import type { NextApiRequest, NextApiResponse } from 'next';

const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const TABLE_ID = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_ID;

// Use env variables for field IDs
const GITHUB_LINKS_FIELD = process.env.NEXT_PUBLIC_FIELD_GITHUB_LINKS;
const DRIVE_LINKS_FIELD = process.env.NEXT_PUBLIC_FIELD_DRIVE_LINKS;
const OTHER_LINKS_FIELD = process.env.NEXT_PUBLIC_FIELD_OTHER_LINKS;
const GITHUB_DESC_FIELD = process.env.AIRTABLE_GITHUB_DESC_FIELD_ID;
const DRIVE_DESC_FIELD = process.env.AIRTABLE_DRIVE_DESC_FIELD_ID;
const OTHER_DESC_FIELD = process.env.AIRTABLE_OTHER_DESC_FIELD_ID;

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
      candidateName,
      githubLinks,
      driveLinks,
      otherLinks,
      githubDescriptions,
      driveDescriptions,
      otherDescriptions,
    } = req.body;

    console.log('📥 Received submission:', { recordId, candidateName });

    // Store in Vercel Blob
    console.log('📤 Uploading to Vercel Blob...');
    const blobData = {
      recordId,
      candidateName,
      timestamp: new Date().toISOString(),
      githubLinks,
      driveLinks,
      otherLinks,
      githubDescriptions,
      driveDescriptions,
      otherDescriptions,
    };

    const blob = await put(
      `offboarding/${recordId}_${Date.now()}.json`,
      JSON.stringify(blobData, null, 2),
      {
        access: 'public',
        contentType: 'application/json',
      }
    );

    console.log('✅ Data stored in Vercel Blob:', blob.url);

    // Update Airtable using field IDs from env
    console.log('📤 Updating Airtable...');
    const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`;

    const updatePayload = {
      fields: {
        [GITHUB_LINKS_FIELD!]: githubLinks || '',
        [DRIVE_LINKS_FIELD!]: driveLinks || '',
        [OTHER_LINKS_FIELD!]: otherLinks || '',
        [GITHUB_DESC_FIELD!]: githubDescriptions || '',
        [DRIVE_DESC_FIELD!]: driveDescriptions || '',
        [OTHER_DESC_FIELD!]: otherDescriptions || '',
      },
    };

    console.log('URL:', airtableUrl);
    console.log('Payload:', JSON.stringify(updatePayload, null, 2));

    const airtableResponse = await fetch(airtableUrl, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload),
    });

    const airtableData = await airtableResponse.json();
    console.log('Airtable Response Status:', airtableResponse.status);
    console.log('Airtable Response:', JSON.stringify(airtableData));

    if (!airtableResponse.ok) {
      throw new Error(JSON.stringify(airtableData));
    }

    console.log('✅ Airtable updated successfully');

    return res.status(200).json({
      success: true,
      blobUrl: blob.url,
      airtableData,
    });
  } catch (error: any) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Failed to submit',
      details: error.message,
    });
  }
}