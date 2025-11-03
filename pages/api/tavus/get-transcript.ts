import type { NextApiRequest, NextApiResponse } from 'next';

const TAVUS_API_KEY = process.env.TAVUS_API_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { conversationId } = req.query;

  if (!conversationId || typeof conversationId !== 'string') {
    return res.status(400).json({ error: 'Missing conversationId' });
  }

  try {
    console.log('📥 Fetching transcript from Tavus for:', conversationId);

    // Try multiple possible Tavus API endpoints
    const endpoints = [
      `https://tavusapi.com/v2/conversations/${conversationId}/transcript`,
      `https://tavusapi.com/v2/conversations/${conversationId}/messages`,
      `https://tavusapi.com/v2/conversations/${conversationId}`,
    ];

    for (const endpoint of endpoints) {
      console.log('🔍 Trying endpoint:', endpoint);

      const response = await fetch(endpoint, {
        headers: {
          'x-api-key': TAVUS_API_KEY!,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Response received:', JSON.stringify(data).substring(0, 200));

        // Transform to our format
        let transcript = [];

        // Try different possible data structures
        if (data.transcript) {
          transcript = data.transcript;
        } else if (data.messages) {
          transcript = data.messages;
        } else if (data.conversation && data.conversation.transcript) {
          transcript = data.conversation.transcript;
        } else if (data.conversation && data.conversation.messages) {
          transcript = data.conversation.messages;
        } else if (Array.isArray(data)) {
          transcript = data;
        }

        // Normalize the format
        const normalizedTranscript = transcript.map((msg: any) => ({
          timestamp: msg.timestamp || msg.created_at || new Date().toISOString(),
          speaker: (msg.speaker === 'agent' || msg.role === 'agent' || msg.type === 'agent') ? 'assistant' : 'user',
          content: msg.text || msg.content || msg.message || '',
        }));

        console.log('✅ Normalized transcript:', normalizedTranscript.length, 'messages');

        return res.status(200).json({
          success: true,
          transcript: normalizedTranscript,
          raw: data, // Include raw for debugging
        });
      }
    }

    // If none worked, return empty
    console.log('⚠️ No transcript endpoint worked');
    return res.status(404).json({
      error: 'Transcript not found',
      message: 'Tavus may not have transcript API or conversation has no messages',
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: 'Failed to fetch transcript',
      details: error.message,
    });
  }
}