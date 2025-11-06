// import { put } from '@vercel/blob';
// import type { NextApiRequest, NextApiResponse } from 'next';

// const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
// const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
// const TABLE_ID = process.env.NEXT_PUBLIC_AIRTABLE_TABLE_ID;

// // Use env variables for field IDs
// const GITHUB_LINKS_FIELD = process.env.NEXT_PUBLIC_FIELD_GITHUB_LINKS;
// const DRIVE_LINKS_FIELD = process.env.NEXT_PUBLIC_FIELD_DRIVE_LINKS;
// const OTHER_LINKS_FIELD = process.env.NEXT_PUBLIC_FIELD_OTHER_LINKS;
// const GITHUB_DESC_FIELD = process.env.AIRTABLE_GITHUB_DESC_FIELD_ID;
// const DRIVE_DESC_FIELD = process.env.AIRTABLE_DRIVE_DESC_FIELD_ID;
// const OTHER_DESC_FIELD = process.env.AIRTABLE_OTHER_DESC_FIELD_ID;

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     const {
//       recordId,
//       candidateName,
//       githubLinks,
//       driveLinks,
//       otherLinks,
//       githubDescriptions,
//       driveDescriptions,
//       otherDescriptions,
//       feedback,
//     } = req.body;

//     console.log('📥 Received submission:', { recordId, candidateName });

//     // Store in Vercel Blob
//     console.log('📤 Uploading to Vercel Blob...');
//     const blobData = {
//       recordId,
//       candidateName,
//       timestamp: new Date().toISOString(),
//       githubLinks,
//       driveLinks,
//       otherLinks,
//       githubDescriptions,
//       driveDescriptions,
//       otherDescriptions,
//     };

//     const blob = await put(
//       `offboarding/${recordId}_${Date.now()}.json`,
//       JSON.stringify(blobData, null, 2),
//       {
//         access: 'public',
//         contentType: 'application/json',
//       }
//     );

//     console.log('✅ Data stored in Vercel Blob:', blob.url);

//     // Update Airtable using field IDs from env
//     console.log('📤 Updating Airtable...');
//     const airtableUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}/${recordId}`;

//     const updatePayload = {
//       fields: {
//         [GITHUB_LINKS_FIELD!]: githubLinks || '',
//         [DRIVE_LINKS_FIELD!]: driveLinks || '',
//         [OTHER_LINKS_FIELD!]: otherLinks || '',
//         [GITHUB_DESC_FIELD!]: githubDescriptions || '',
//         [DRIVE_DESC_FIELD!]: driveDescriptions || '',
//         [OTHER_DESC_FIELD!]: otherDescriptions || '',
//         'Feedback': feedback,
//       },
//     };

//     console.log('URL:', airtableUrl);
//     console.log('Payload:', JSON.stringify(updatePayload, null, 2));

//     const airtableResponse = await fetch(airtableUrl, {
//       method: 'PATCH',
//       headers: {
//         Authorization: `Bearer ${AIRTABLE_API_KEY}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(updatePayload),
//     });

//     const airtableData = await airtableResponse.json();
//     console.log('Airtable Response Status:', airtableResponse.status);
//     console.log('Airtable Response:', JSON.stringify(airtableData));

//     if (!airtableResponse.ok) {
//       throw new Error(JSON.stringify(airtableData));
//     }

//     console.log('✅ Airtable updated successfully');

//     return res.status(200).json({
//       success: true,
//       blobUrl: blob.url,
//       airtableData,
//     });
//   } catch (error: any) {
//     console.error('❌ Error:', error);
//     return res.status(500).json({
//       error: 'Failed to submit',
//       details: error.message,
//     });
//   }
// }




import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

// AWS S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const S3_BUCKET = process.env.AWS_S3_BUCKET_NAME;

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
      feedback,
    } = req.body;

    console.log('📥 Received submission:', { recordId, candidateName });

    // Store in AWS S3
    console.log('📤 Uploading to AWS S3...');
    const s3Data = {
      recordId,
      candidateName,
      timestamp: new Date().toISOString(),
      githubLinks,
      driveLinks,
      otherLinks,
      githubDescriptions,
      driveDescriptions,
      otherDescriptions,
      feedback,
    };

    const s3Key = `offboarding/${recordId}_${Date.now()}.json`;
    
    const s3Command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: JSON.stringify(s3Data, null, 2),
      ContentType: 'application/json',
      // Make the object publicly accessible (optional - remove if you want private)
      
    });

    await s3Client.send(s3Command);

    const s3Url = `https://${S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${s3Key}`;
    console.log('✅ Data stored in AWS S3:', s3Url);

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
        'Feedback': feedback,
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
      s3Url: s3Url,
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