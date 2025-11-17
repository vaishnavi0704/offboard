// import type { NextApiRequest, NextApiResponse } from 'next';
// import { conversationRecordMapping } from './webhook';

// const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
// const TAVUS_REPLICA_ID = process.env.TAVUS_REPLICA_ID;
// const TAVUS_PERSONA_ID = process.env.TAVUS_PERSONA_ID;
// const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

// // AWS Recording Configuration
// const AWS_ASSUME_ROLE_ARN = process.env.AWS_ASSUME_ROLE_ARN;
// const AWS_S3_BUCKET_REGION = process.env.AWS_S3_BUCKET_REGION;
// const AWS_S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
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
//       designation,
//       domain,
//       githubLinks,
//       driveLinks,
//       otherLinks,
//       githubProjectDesc,
//       driveProjectDesc,
//       otherProjectDesc,

//     } = req.body;

//     console.log('📤 Creating conversation for:', candidateName);
//     console.log('🆔 Record ID:', recordId);

//     // Build project details
//     const projectDetails = [];
    
//     if (githubLinks && githubProjectDesc) {
//       projectDetails.push({ type: 'GitHub Projects', links: githubLinks, description: githubProjectDesc });
//     }
//     if (driveLinks && driveProjectDesc) {
//       projectDetails.push({ type: 'Documentation', links: driveLinks, description: driveProjectDesc });
//     }
//     if (otherLinks && otherProjectDesc) {
//       projectDetails.push({ type: 'Other Work', links: otherLinks, description: otherProjectDesc });
//     }

//     console.log('📋 Projects:', projectDetails.length);

//     // System prompt
//     const conversationalContext = `
// You are an empathetic HR representative conducting a 10-15 minute exit interview with ${candidateName}, a ${designation} from ${domain}.

// CANDIDATE: ${candidateName} | ${designation} | ${domain}

// ${projectDetails.length > 0 ? `PROJECTS:\n${projectDetails.map((p, i) => `${i + 1}. ${p.type}: ${p.description}`).join('\n')}\n\nAsk SPECIFIC questions about their actual projects.` : ''}

// GOALS: Understand why leaving, get feedback on team/manager/culture, discuss projects, gather suggestions, ensure knowledge transfer.

// STYLE: Warm, conversational, specific. Reference their actual work. Create safety for honest feedback.

// FLOW:
// 1. "Hi ${candidateName}, how are you feeling about this transition?"
// 2. "What led to your decision to leave?"
// 3. "What did you enjoy most?"
// ${projectDetails.length > 0 ? `4. "I saw you worked on [specific project]. Tell me about that."` : ''}
// 5. "How was your team and manager experience?"
// 6. "Any frustrations?"
// 7. "What would you change?"
// 8. "Advice for improving ${domain}?"
// 9. "Knowledge transfer needs?"
// 10. "Anything else to share?"
// 11. "Thank you. Best of luck!"

// Be natural, specific, empathetic. 10-15 min.
//     `.trim();

//     const customGreeting = `Hello ${candidateName}! Thank you for taking the time. How are you feeling about everything?`;

//     // Create conversation
//     const response = await fetch('https://tavusapi.com/v2/conversations', {
//       method: 'POST',
//       headers: {
//         'x-api-key': TAVUS_API_KEY!,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         replica_id: TAVUS_REPLICA_ID,
//         persona_id: TAVUS_PERSONA_ID,
//         conversation_name: `Exit Interview - ${candidateName} - ${new Date().toISOString().split('T')[0]}`,
//         conversational_context: conversationalContext,
//         custom_greeting: customGreeting,
//         webhook_url: `${APP_URL}/api/tavus/webhook`,
//       }),
//     });

//     const responseText = await response.text();

//     if (!response.ok) {
//       console.error('❌ Tavus error:', responseText);
      
//       if (responseText.includes('concurrent')) {
//         return res.status(429).json({
//           error: 'Too many conversations',
//           needsCleanup: true,
//         });
//       }
      
//       return res.status(response.status).json({
//         error: 'Failed to create conversation',
//         details: responseText,
//       });
//     }

//     const data = JSON.parse(responseText);
    
//     // STORE MAPPING
//     conversationRecordMapping.set(data.conversation_id, recordId);
    
//     console.log('✅ Conversation:', data.conversation_id);
//     console.log('💾 Mapped to record:', recordId);

//     return res.status(200).json({
//       success: true,
//       conversationId: data.conversation_id,
//       conversationUrl: data.conversation_url || `https://tavus.io/c/${data.conversation_id}`,
//     });

//   } catch (error: any) {
//     console.error('❌ Error:', error);
//     return res.status(500).json({
//       error: error.message,
//     });
//   }
// }




import type { NextApiRequest, NextApiResponse } from 'next';
import { conversationRecordMapping } from './webhook';

const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
const TAVUS_REPLICA_ID = process.env.TAVUS_REPLICA_ID;
const TAVUS_PERSONA_ID = process.env.TAVUS_PERSONA_ID;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

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
      designation,
      domain,
      githubLinks,
      driveLinks,
      otherLinks,
      githubProjectDesc,
      driveProjectDesc,
      otherProjectDesc,
    } = req.body;

    console.log('📤 Creating conversation for:', candidateName);
    console.log('🆔 Record ID:', recordId);

    // Build project details
    const projectDetails = [];
    
    if (githubLinks && githubProjectDesc) {
      projectDetails.push({ type: 'GitHub Projects', links: githubLinks, description: githubProjectDesc });
    }
    if (driveLinks && driveProjectDesc) {
      projectDetails.push({ type: 'Documentation', links: driveLinks, description: driveProjectDesc });
    }
    if (otherLinks && otherProjectDesc) {
      projectDetails.push({ type: 'Other Work', links: otherLinks, description: otherProjectDesc });
    }

    console.log('📋 Projects:', projectDetails.length);

    // System prompt
    const conversationalContext = `
You are an empathetic HR representative conducting a 10-15 minute exit interview with ${candidateName}, a ${designation} from ${domain}.

CANDIDATE: ${candidateName} | ${designation} | ${domain}

${projectDetails.length > 0 ? `PROJECTS:\n${projectDetails.map((p, i) => `${i + 1}. ${p.type}: ${p.description}`).join('\n')}\n\nAsk SPECIFIC questions about their actual projects.` : ''}

GOALS: Understand why leaving, get feedback on team/manager/culture, discuss projects, gather suggestions, ensure knowledge transfer.

STYLE: Warm, conversational, specific. Reference their actual work. Create safety for honest feedback.

FLOW:
1. "Hi ${candidateName}, How are you?"
2. "I could see you had an exemplary work record with us, and on behalf of all our team, i want to thank you for all your support and contribution to our company."
3. "Next, I wish to know, during your tenure with us, what is one thing that you enjoyed the most?"
${projectDetails.length > 0 ? `4. "I saw you worked on [specific project]. Tell me about that."` : ''}
5. "How was your experience with team and working with your reporting manager?"
6. "Any challenges or issues you would want the company to improve in the existing process?"
7. "Knowledge transfer needs?"
8. "Anything else to share?"
9. "Thank you. Best of luck!"

Be natural, specific, empathetic. 10-15 min.
    `.trim();

    const customGreeting = `Hello ${candidateName}! Thank you for taking the time. How are you feeling about everything?`;

    // ✅ SOLUTION: Pass recordId as query parameter in webhook URL
    const webhookUrl = `${APP_URL}/api/tavus/webhook?recordId=${encodeURIComponent(recordId)}`;
    console.log('🔗 Webhook URL:', webhookUrl);
    console.log('🔗 Record ID being passed:', recordId);

    // Create conversation
    const response = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'x-api-key': TAVUS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        replica_id: TAVUS_REPLICA_ID,
        persona_id: TAVUS_PERSONA_ID,
        conversation_name: `Exit Interview - ${candidateName} - ${new Date().toISOString().split('T')[0]}`,
        conversational_context: conversationalContext,
        custom_greeting: customGreeting,
        webhook_url: webhookUrl, // ✅ Now includes recordId
      }),
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('❌ Tavus error:', responseText);
      
      if (responseText.includes('concurrent')) {
        return res.status(429).json({
          error: 'Too many conversations',
          needsCleanup: true,
        });
      }
      
      return res.status(response.status).json({
        error: 'Failed to create conversation',
        details: responseText,
      });
    }

    const data = JSON.parse(responseText);
    
    // Store mapping (as backup, webhook will also get it from URL)
    conversationRecordMapping.set(data.conversation_id, recordId);
    
    console.log('✅ Conversation:', data.conversation_id);
    console.log('💾 Mapped to record:', recordId);

    return res.status(200).json({
      success: true,
      conversationId: data.conversation_id,
      conversationUrl: data.conversation_url || `https://tavus.io/c/${data.conversation_id}`,
    });

  } catch (error: any) {
    console.error('❌ Error:', error);
    return res.status(500).json({
      error: error.message,
    });
  }
}
