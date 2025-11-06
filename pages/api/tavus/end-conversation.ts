import type { NextApiRequest, NextApiResponse } from 'next';

const TAVUS_API_KEY = process.env.TAVUS_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId, recordId } = req.body;

    if (!conversationId || !recordId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🛑 Ending conversation:', conversationId);
    console.log('📋 Record ID:', recordId);

    // Simply end the Tavus conversation
    const endResponse = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: {
        'x-api-key': TAVUS_API_KEY!,
      },
    });

    if (!endResponse.ok) {
      const errorText = await endResponse.text();
      console.error('❌ Failed to end conversation:', errorText);
      throw new Error('Failed to end conversation');
    }

    console.log('✅ Conversation ended successfully');
    console.log('⏳ Webhook will receive transcript and handle S3/Airtable updates');

    // Return immediately - webhook will handle the rest
    return res.status(200).json({
      success: true,
      conversationId,
      recordId,
      message: 'Conversation ended. Transcript will be processed by webhook within 30-60 seconds.',
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to end conversation',
    });
  }
}