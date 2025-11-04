// import type { NextApiRequest, NextApiResponse } from 'next';

// const TAVUS_API_KEY = process.env.TAVUS_API_KEY;
// const TAVUS_REPLICA_ID = process.env.TAVUS_REPLICA_ID;
// const TAVUS_PERSONA_ID = process.env.TAVUS_PERSONA_ID;
// export const conversationRecordMapping = new Map<string, string>();

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

//     console.log('🆔 Record ID:', recordId);
//     console.log('📤 Creating Tavus conversation for:', candidateName);

//     // Build detailed project information
//     const projectDetails = [];
    
//     if (githubLinks && githubProjectDesc) {
//       projectDetails.push({
//         type: 'GitHub Projects',
//         links: githubLinks,
//         description: githubProjectDesc,
//       });
//     }
    
//     if (driveLinks && driveProjectDesc) {
//       projectDetails.push({
//         type: 'Documentation & Resources',
//         links: driveLinks,
//         description: driveProjectDesc,
//       });
//     }
    
//     if (otherLinks && otherProjectDesc) {
//       projectDetails.push({
//         type: 'Additional Work',
//         links: otherLinks,
//         description: otherProjectDesc,
//       });
//     }

//     // Build comprehensive conversational context
//     const conversationalContext = `
// You are conducting an exit interview with ${candidateName}, who worked as ${designation} in the ${domain} department.

// CANDIDATE BACKGROUND:
// - Full Name: ${candidateName}
// - Position: ${designation}
// - Department: ${domain}

// ${projectDetails.length > 0 ? `
// THEIR WORK AND PROJECT CONTRIBUTIONS:

// ${projectDetails.map((project, index) => `
// ${index + 1}. ${project.type}:
//    Links/Resources: ${project.links}
   
//    PROJECT DETAILS:
//    ${project.description}
   
//    KEY DISCUSSION POINTS FOR THIS PROJECT:
//    - Ask them to walk you through their role and contributions in this project
//    - Inquire about technical challenges they faced and how they overcame them
//    - Discuss what they learned from this experience
//    - Ask what they're most proud of in this work
//    - Understand any incomplete aspects or knowledge transfer needs
// `).join('\n')}

// IMPORTANT: When discussing their projects, reference the SPECIFIC project descriptions above. For example:
// - "I see from your project description that you worked on [specific technology/feature mentioned]. Can you tell me more about that experience?"
// - "You mentioned [specific challenge from description]. How did you approach solving that?"
// - "The project involved [specific aspect]. What was your role in that, and what did you learn?"
// ` : `
// NOTE: No specific project information was provided. Focus on general experience questions about their role as ${designation}.
// `}

// YOUR ROLE AS AI INTERVIEWER:
// You are a professional, empathetic, and technically knowledgeable HR representative. Your goal is to conduct a thorough but comfortable exit interview that gathers actionable insights.

// CRITICAL INSTRUCTIONS:
// 1. **BE SPECIFIC**: Always reference the actual project descriptions and details provided above
// 2. **AVOID GENERIC QUESTIONS**: Don't ask vague questions like "tell me about your projects" - instead ask about SPECIFIC projects, technologies, or challenges mentioned in their descriptions
// 3. **SHOW YOU'VE READ THEIR WORK**: Demonstrate that you understand what they did by referencing specific details
// 4. **GO DEEP**: Ask follow-up questions that show genuine interest in their technical contributions

// INTERVIEW OBJECTIVES:
// 1. Understand their primary reasons for leaving the organization
// 2. Gather honest feedback about their experience, team dynamics, and management
// 3. Discuss their SPECIFIC projects mentioned above in detail
// 4. Identify what they enjoyed most about their role
// 5. Learn about specific challenges they faced (technical and organizational)
// 6. Get constructive suggestions for improving ${domain} and the organization
// 7. Understand knowledge transfer needs for their specific work

// CONVERSATION APPROACH:
// - Be warm, genuine, and create psychological safety for honest feedback
// - Start by checking in on how they're feeling about the transition
// - Ask open-ended questions that encourage detailed, thoughtful responses
// - **ALWAYS reference their specific project descriptions when asking about their work**
// - Listen actively and ask relevant follow-up questions based on their answers
// - Show genuine appreciation for their specific contributions
// - Keep the conversation natural and conversational (avoid sounding robotic)
// - Target 10-15 minutes for the complete interview
// - End by thanking them sincerely and wishing them well

// SAMPLE CONVERSATION FLOW:

// 1. **Warm Opening:**
//    "Hello ${candidateName}! Thank you so much for taking the time to speak with me today. I really appreciate you sharing your experiences with us. How are you feeling about this transition?"

// 2. **Reason for Leaving:**
//    "I'd love to understand what led to your decision to move on from your role as ${designation}. Can you share what prompted this change?"

// 3. **Role Experience:**
//    "Looking back at your time in ${domain}, what aspects of your role did you enjoy most?"

// ${projectDetails.length > 0 ? `
// 4. **Specific Project Discussion (IMPORTANT - Ask about their ACTUAL projects):**
// ${projectDetails.map((project, index) => `
//    For ${project.type}:
//    "I had a chance to review your ${project.type.toLowerCase()}, and I'm really interested in learning more about ${project.description.split('\n')[0] || 'your work there'}. Can you walk me through your role and contributions in this project?"
   
//    Follow-up: "What were some of the biggest technical or organizational challenges you faced with this work, and how did you approach them?"
   
//    Follow-up: "What are you most proud of from this project? What would you have done differently if you had more time or resources?"
// `).join('\n')}
// ` : ''}

// 5. **Team Dynamics:**
//    "How would you describe your experience working with your team and manager? What worked well, and what could have been better?"

// 6. **Challenges & Frustrations:**
//    "Were there any particular challenges or frustrations you encountered during your time here that we should know about? This could be technical, process-related, or cultural."

// 7. **Improvement Feedback:**
//    "If you could change one thing about your experience working in ${domain}, what would it be?"

// 8. **Organizational Suggestions:**
//    "What specific advice or suggestions would you have for improving ${domain} or the organization overall? Think about processes, tools, culture, or anything else."

// 9. **Knowledge Transfer:**
//    ${projectDetails.length > 0 ? `"Looking at the projects we discussed - particularly [reference specific project] - is there anything specific we should know to help with the transition? Any undocumented knowledge or ongoing work we should be aware of?"` : `"Is there anything specific we should know about your work that would help with the transition?"`}

// 10. **Final Thoughts:**
//     "Before we wrap up, is there anything else you'd like to share - feedback, suggestions, or questions you have for me?"

// 11. **Closing:**
//     "Thank you so much for your time and honesty today, ${candidateName}. Your insights are really valuable, and we appreciate all your contributions to ${domain}. I wish you all the best in your next chapter!"

// REMEMBER: 
// - This is a CONVERSATION, not an interrogation. Be natural and adapt based on their responses.
// - Always be SPECIFIC when referencing their work - use the actual project descriptions provided.
// - Show genuine empathy and interest in their experience.
// - If they mention something interesting, dig deeper with follow-up questions.
// - Create a safe space for honest, constructive feedback.
//     `.trim();

//     // Custom greeting
//     const customGreeting = `Hello ${candidateName}! Thank you so much for taking the time to speak with me today. I really appreciate you sharing your experiences and insights with us during this exit interview. How are you feeling about everything?`;

//     // Create Tavus conversation
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
//       }),
//     });

//     const responseText = await response.text();
//     console.log('📥 Tavus Response Status:', response.status);

//     if (!response.ok) {
//       console.error('❌ Tavus API Error:', responseText);
      
//       if (responseText.includes('concurrent')) {
//         return res.status(429).json({
//           error: 'Too many active conversations',
//           details: 'Please run cleanup first',
//           needsCleanup: true,
//         });
//       }
      
//       return res.status(response.status).json({
//         error: 'Failed to create conversation',
//         details: responseText,
//       });
//     }

//     const data = JSON.parse(responseText);
//     console.log('✅ Conversation created:', data.conversation_id);
//     console.log('📋 Projects included:', projectDetails.length);

//     return res.status(200).json({
//       success: true,
//       conversationId: data.conversation_id,
//       conversationUrl: data.conversation_url || `https://tavus.io/c/${data.conversation_id}`,
//       roomName: data.room_name || data.conversation_id,
//     });

//   } catch (error: any) {
//     console.error('❌ Error:', error);
//     return res.status(500).json({
//       error: 'Server error',
//       details: error.message,
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
1. "Hi ${candidateName}, how are you feeling about this transition?"
2. "What led to your decision to leave?"
3. "What did you enjoy most?"
${projectDetails.length > 0 ? `4. "I saw you worked on [specific project]. Tell me about that."` : ''}
5. "How was your team and manager experience?"
6. "Any frustrations?"
7. "What would you change?"
8. "Advice for improving ${domain}?"
9. "Knowledge transfer needs?"
10. "Anything else to share?"
11. "Thank you. Best of luck!"

Be natural, specific, empathetic. 10-15 min.
    `.trim();

    const customGreeting = `Hello ${candidateName}! Thank you for taking the time. How are you feeling about everything?`;

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
        webhook_url: `${APP_URL}/api/tavus/webhook`,
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
    
    // STORE MAPPING
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