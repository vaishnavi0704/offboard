// import { put } from '@vercel/blob';
// import type { NextApiRequest, NextApiResponse } from 'next';

// // Global store for transcripts
// export const transcriptStore = new Map<string, any>();

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const payload = req.body;
    
//     console.log('\n🪝 ========================================');
//     console.log('TAVUS WEBHOOK RECEIVED');
//     console.log('========================================');
//     console.log('Event Type:', payload.event_type);
//     console.log('Conversation ID:', payload.conversation_id);
//     console.log('Full Payload:', JSON.stringify(payload, null, 2));
//     console.log('========================================\n');

//     // Handle transcription_ready event
//     if (payload.event_type === 'application.transcription_ready') {
//       const conversationId = payload.conversation_id;
//       const fullTranscript = payload.properties?.transcript || [];
      
//       console.log('📝 TRANSCRIPTION READY!');
//       console.log('📊 Full transcript length:', fullTranscript.length, 'messages');
      
//       // Filter out system messages, keep only user and assistant
//       const conversationMessages = fullTranscript.filter((msg: any) => 
//         msg.role === 'user' || msg.role === 'assistant'
//       );
      
//       console.log('✅ Conversation messages:', conversationMessages.length);
      
//       // Store in memory
//       transcriptStore.set(conversationId, {
//         conversationId,
//         transcript: conversationMessages,
//         timestamp: new Date().toISOString(),
//       });

//       console.log('✅ Transcript stored in memory for:', conversationId);

//       // Also save to Vercel Blob for backup
//       try {
//         const blob = await put(
//           `transcripts/raw/${conversationId}_${Date.now()}.json`,
//           JSON.stringify({
//             conversationId,
//             transcript: conversationMessages,
//             fullTranscript: fullTranscript,
//             timestamp: new Date().toISOString(),
//           }, null, 2),
//           {
//             access: 'public',
//             contentType: 'application/json',
//           }
//         );
//         console.log('✅ Backup saved to blob:', blob.url);
//       } catch (blobError) {
//         console.error('⚠️ Blob backup failed:', blobError);
//       }

//       return res.status(200).json({ 
//         success: true, 
//         message: 'Transcript received and stored',
//         conversationId,
//         messageCount: conversationMessages.length,
//       });
//     }

//     // Log other events
//     console.log('ℹ️ Event:', payload.event_type);
//     return res.status(200).json({ success: true });
    
//   } catch (error: any) {
//     console.error('❌ Webhook error:', error);
//     return res.status(500).json({ 
//       error: 'Webhook processing failed',
//       details: error.message,
//     });
//   }
// }


import { put } from '@vercel/blob';
import type { NextApiRequest, NextApiResponse } from 'next';

const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const TABLE_ID = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_ID;
const TRANSCRIPT_FIELD_ID = process.env.AIRTABLE_TRANSCRIPT_FIELD_ID; // fldyvJBs5YOuOUSMp
const STATUS_FIELD_ID = process.env.AIRTABLE_STATUS_FIELD_ID;

// Store conversation ID to record ID mapping
export const conversationRecordMapping = new Map<string, string>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    
    console.log('\n========================================');
    console.log('🪝 WEBHOOK:', payload.event_type);
    console.log('📋 Conversation:', payload.conversation_id);
    console.log('========================================\n');

    // Only process transcription_ready event
    if (payload.event_type === 'application.transcription_ready') {
      const conversationId = payload.conversation_id;
      const fullTranscript = payload.properties?.transcript || [];
      
      console.log('✅ Transcript received:', fullTranscript.length, 'total messages');
      
      // Filter only user and assistant messages
      const conversationMessages = fullTranscript.filter((msg: any) => 
        msg.role === 'user' || msg.role === 'assistant'
      );
      
      console.log('✅ Conversation messages:', conversationMessages.length);

      if (conversationMessages.length === 0) {
        console.log('⚠️ No conversation messages to save');
        return res.status(200).json({ success: true, message: 'No messages' });
      }

      // Save to Vercel Blob
      console.log('📤 Uploading to Vercel Blob...');
      const blob = await put(
        `transcripts/${conversationId}_${Date.now()}.json`,
        JSON.stringify({
          conversationId,
          transcript: conversationMessages,
          timestamp: new Date().toISOString(),
          messageCount: conversationMessages.length,
        }, null, 2),
        {
          access: 'public',
          contentType: 'application/json',
        }
      );
      
      console.log('✅ Blob URL:', blob.url);

      // Get the Airtable record ID
      const recordId = conversationRecordMapping.get(conversationId);
      
      if (!recordId) {
        console.log('⚠️ No record ID found for conversation:', conversationId);
        return res.status(200).json({ 
          success: true, 
          message: 'Transcript saved but no record ID',
          blobUrl: blob.url,
        });
      }

      console.log('📝 Updating Airtable record:', recordId);

      // Update Airtable with JSON URL
      const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`;
      
      const airtableResponse = await fetch(airtableUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            [TRANSCRIPT_FIELD_ID!]: [{ url: blob.url }],
            [STATUS_FIELD_ID!]: 'Interview Completed',
          },
        }),
      });

      if (airtableResponse.ok) {
        console.log('✅ Airtable updated successfully');
      } else {
        const error = await airtableResponse.text();
        console.error('❌ Airtable update failed:', error);
      }

      return res.status(200).json({ 
        success: true,
        conversationId,
        blobUrl: blob.url,
        recordId,
        airtableUpdated: airtableResponse.ok,
      });
    }

    // Log other events but don't process
    return res.status(200).json({ success: true });
    
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({ 
      error: error.message,
    });
  }
}