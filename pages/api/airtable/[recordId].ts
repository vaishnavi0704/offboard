import type { NextApiRequest, NextApiResponse } from 'next';

const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || 'appnmmjs033rxHQNC';
const TABLE_ID = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_ID || 'tblaEGXgtp9nX1bgH';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { recordId } = req.query;

  if (!recordId || typeof recordId !== 'string') {
    return res.status(400).json({ error: 'Record ID is required' });
  }

  try {
    console.log('📥 Fetching record:', recordId);

    const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Airtable error:', errorText);
      return res.status(response.status).json({
        error: 'Failed to fetch from Airtable',
        details: errorText,
      });
    }

    const data = await response.json();
    console.log('✅ Record fetched successfully');
    console.log('📋 Available fields:', Object.keys(data.fields));

    // Map Airtable fields - CRITICAL: Use EXACT field names from Airtable
    const candidateData = {
      id: data.id,
      name: data.fields['Name'] || '',
      email: data.fields['Email'] || '',
      designation: data.fields['Designation'] || '',
      domain: data.fields['Domain'] || '',
      githubLinks: data.fields['GitHub Links'] || '',
      driveLinks: data.fields['Google Drive Links'] || '',
      otherLinks: data.fields['Other Platform Links'] || '',
      
      // CRITICAL FIX: Use EXACT field names - note "GIthub" not "GitHub"
      githubProjectDesc: data.fields['GIthub Project Description'] || '',  // ← Note: "GIthub" with lowercase 'I'
      driveProjectDesc: data.fields['Google Drive Project Description'] || '',
      otherProjectDesc: data.fields['Other Project Description'] || '',
    };

    console.log('✅ Mapped candidate data:');
    console.log('  - Name:', candidateData.name);
    console.log('  - Designation:', candidateData.designation);
    console.log('  - GitHub Links:', candidateData.githubLinks);
    console.log('  - GitHub Desc:', candidateData.githubProjectDesc);
    console.log('  - Drive Desc:', candidateData.driveProjectDesc);
    console.log('  - Other Desc:', candidateData.otherProjectDesc);

    return res.status(200).json(candidateData);

  } catch (error: any) {
    console.error('❌ Server error:', error);
    return res.status(500).json({
      error: 'Server error',
      details: error.message,
    });
  }
}