import type { NextApiRequest, NextApiResponse } from 'next';

const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = 'appnmmjs033rxHQNC';
const TABLE_ID = 'tblaEGXgtp9nX1bgH';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { recordId } = req.query;

  if (!recordId || typeof recordId !== 'string') {
    return res.status(400).json({ error: 'Record ID required' });
  }

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`;

  if (req.method === 'GET') {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      const fields = data.fields;

      return res.status(200).json({
        id: data.id,
        name: fields.Name || 'N/A',
        email: fields.Email || 'N/A',
        designation: fields.Designation || 'N/A',
        domain: fields.Domain || 'N/A',
      });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch' });
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { githubLinks, driveLinks, otherLinks } = req.body;

      const response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            'GitHub Links': githubLinks || '',
            'Google Drive Links': driveLinks || '',
            'Other Links': otherLinks || '',
            'Offboarding Status': 'Documentation Submitted',
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to update');

      const data = await response.json();
      return res.status(200).json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
