import type { NextApiRequest, NextApiResponse } from 'next';

// Store transcripts in memory (you can also store in database)
const transcriptStore = new Map<string, any[]>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { conversationId, event, data } = req.body;

    console.log('📝 Transcript event:', event);
    console.log('💬 Data:', data);

    if (!conversationId) {
      return res.status(400).json({ error: 'Missing conversationId' });
    }

    // Initialize transcript array if not exists
    if (!transcriptStore.has(conversationId)) {
      transcriptStore.set(conversationId, []);
    }

    const transcript = transcriptStore.get(conversationId)!;

    // Handle different event types
    switch (event) {
      case 'transcript':
      case 'speech':
        transcript.push({
          timestamp: new Date().toISOString(),
          speaker: data.speaker || data.role || 'user', // 'agent' or 'user'
          content: data.text || data.content || '',
        });
        break;

      case 'conversation_end':
        console.log('🏁 Conversation ended:', conversationId);
        break;
    }

    return res.status(200).json({ success: true });

  } catch (error: any) {
    console.error('❌ Transcript error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// API to retrieve transcript
export async function getTranscript(conversationId: string) {
  return transcriptStore.get(conversationId) || [];
}

// API to clear transcript
export function clearTranscript(conversationId: string) {
  transcriptStore.delete(conversationId);
}