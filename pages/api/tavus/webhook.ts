import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import type { NextApiRequest, NextApiResponse } from 'next';

const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const TABLE_ID = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_ID;
const TRANSCRIPT_FIELD_ID = process.env.AIRTABLE_TRANSCRIPT_FIELD_ID;
const STATUS_FIELD_ID = process.env.AIRTABLE_STATUS_FIELD_ID;
// AWS S3 Configuration - ADD VALIDATION
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;

// Validate AWS credentials before creating client
if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !S3_BUCKET) {
  console.error('❌ Missing AWS credentials:', {
    hasAccessKey: !!AWS_ACCESS_KEY_ID,
    hasSecretKey: !!AWS_SECRET_ACCESS_KEY,
    hasRegion: !!AWS_REGION,
    hasBucket: !!S3_BUCKET,
  });
}

const s3Client = new S3Client({
  region: AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID || '',
    secretAccessKey: AWS_SECRET_ACCESS_KEY || '',
  },
});


// Keep this for backward compatibility
export const conversationRecordMapping = new Map<string, string>();
export const transcriptStore = new Map<string, any>();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    
    // ✅ GET RECORD ID FROM QUERY PARAMETER
    const recordIdFromUrl = req.query.recordId as string;
    
    console.log('\n========================================');
    console.log('🪝 WEBHOOK EVENT:', payload.event_type);
    console.log('📋 Conversation ID:', payload.conversation_id);
    console.log('🆔 Record ID from URL:', recordIdFromUrl || 'NOT PROVIDED');
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
      
      console.log('✅ Filtered conversation messages:', conversationMessages.length);

      if (conversationMessages.length === 0) {
        console.log('⚠️ No conversation messages to save');
        return res.status(200).json({ success: true, message: 'No messages' });
      }

      const transcriptData = {
        conversationId,
        transcript: conversationMessages,
        timestamp: new Date().toISOString(),
        messageCount: conversationMessages.length,
      };

      // Store in memory
      transcriptStore.set(conversationId, transcriptData);
      console.log('💾 Transcript stored in memory');

      // ✅ Upload ONLY to AWS S3 (NO VERCEL BLOB!)
      console.log('📤 Uploading transcript to AWS S3...');
      const s3Key = `transcripts/${conversationId}_${Date.now()}.json`;
      
      const s3Command = new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: s3Key,
        Body: JSON.stringify(transcriptData, null, 2),
        ContentType: 'application/json',
      });

      await s3Client.send(s3Command);

      const s3Url = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
      console.log('✅ AWS S3 Upload Complete:', s3Url);

      // ✅ Try to get recordId from URL first, then fallback to memory
      let recordId = recordIdFromUrl || conversationRecordMapping.get(conversationId);
      
      if (!recordId) {
        console.log('⚠️ No record ID found from URL or memory');
        console.log('✅ Transcript saved to S3:', s3Url);
        
        return res.status(200).json({ 
          success: true, 
          message: 'Transcript saved to S3. No record ID available.',
          s3Url: s3Url,
          conversationId: conversationId,
        });
      }

      console.log('📝 Updating Airtable record:', recordId);

      // Update Airtable with S3 URL
      const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`;
      
      const airtableResponse = await fetch(airtableUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            [TRANSCRIPT_FIELD_ID!]: [{ 
              url: s3Url,
              filename: `transcript_${conversationId}.json`  // ✅ Add filename
            }],
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
        s3Url: s3Url,
        recordId,
        airtableUpdated: airtableResponse.ok,
      });
    }

    // Log other events but don't process
    console.log('ℹ️ Event ignored:', payload.event_type);
    return res.status(200).json({ success: true });
    
  } catch (error: any) {
    console.error('❌ Webhook error:', error);
    return res.status(500).json({ 
      error: error.message,
    });
  }
}



