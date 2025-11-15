

import { useRouter } from 'next/router';

import { useEffect, useState } from 'react';

import Head from 'next/head';

import dynamic from 'next/dynamic';



// Dynamically import LiveKit component

const LiveKitInterview = dynamic(

  () => import('@/components/LiveKitInterview').then((mod) => mod.LiveKitInterview),

  { ssr: false }

);



interface CandidateData {

  id: string;

  name: string;

  email: string;

  designation: string;

  domain: string;

  githubLinks?: string;

  driveLinks?: string;

  otherLinks?: string;

  githubProjectDesc?: string;

  driveProjectDesc?: string;

  otherProjectDesc?: string;

}



interface TranscriptMessage {

  timestamp: string;

  speaker: 'assistant' | 'user';

  content: string;

}



export default function InterviewPage() {

  const router = useRouter();

  const { recordId } = router.query;



  const [loading, setLoading] = useState(true);

  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);

  const [conversationId, setConversationId] = useState<string>('');

  const [conversationUrl, setConversationUrl] = useState<string>('');

  const [isInterviewActive, setIsInterviewActive] = useState(false);

  const [error, setError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [interviewStartTime, setInterviewStartTime] = useState<Date | null>(null);

  const [needsCleanup, setNeedsCleanup] = useState(false);



  useEffect(() => {

    if (recordId) {

      fetchCandidateData(recordId as string);

    }

  }, [recordId]);



  const fetchCandidateData = async (id: string) => {

    try {

      setLoading(true);

      const response = await fetch(`/api/airtable/${id}`);

      

      if (!response.ok) throw new Error('Failed to fetch candidate data');



      const data = await response.json();

      setCandidateData(data);

      

      await initializeTavusConversation(data);

      

      setLoading(false);

    } catch (err: any) {

      setError(err.message || 'Failed to load interview');

      setLoading(false);

    }

  };



  const initializeTavusConversation = async (candidate: CandidateData) => {

    try {

      const response = await fetch('/api/tavus/create-conversation', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          recordId: recordId,

          candidateName: candidate.name,

          designation: candidate.designation,

          domain: candidate.domain,

          githubLinks: candidate.githubLinks,

          driveLinks: candidate.driveLinks,

          otherLinks: candidate.otherLinks,

          githubProjectDesc: candidate.githubProjectDesc,

          driveProjectDesc: candidate.driveProjectDesc,

          otherProjectDesc: candidate.otherProjectDesc,

        })

      });



      const data = await response.json();



      if (!response.ok) {

        if (data.needsCleanup) {

          setNeedsCleanup(true);

          throw new Error('Please cleanup old conversations first');

        }

        throw new Error(data.details || data.error || 'Failed to create conversation');

      }



      setConversationId(data.conversationId);

      setConversationUrl(data.conversationUrl);

      console.log('✅ Conversation ready:', data.conversationId);

      console.log('✅ Record ID stored:', data.recordId);



    } catch (err: any) {

      console.error('❌ Error:', err);

      setError(err.message);

    }

  };



  const handleCleanup = async () => {

    try {

      setError('Cleaning up...');

      const response = await fetch('/api/tavus/cleanup');

      const data = await response.json();

      

      if (data.success) {

        setError('');

        setNeedsCleanup(false);

        router.reload();

      }

    } catch (err) {

      setError('Cleanup failed. Please try again.');

    }

  };



  const startInterview = () => {

    setIsInterviewActive(true);

    setInterviewStartTime(new Date());

  };



  const endInterview = async () => {

    try {

      setIsSubmitting(true);

      setError('🛑 Ending conversation and fetching transcript...');



      console.log('🛑 Ending Tavus conversation:', conversationId);

      console.log('🆔 Record ID:', recordId);



      // Call end-conversation API which does everything

      const response = await fetch('/api/tavus/end-conversation', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          conversationId,

          recordId,

        }),

      });



      if (!response.ok) {

        const data = await response.json();

        throw new Error(data.error || 'Failed to end conversation');

      }



      // Show processing message while waiting

      setError('⏳ Processing transcript... This may take 30-60 seconds...');

      

      const data = await response.json();



      console.log('✅ Transcript fetched:', data.messageCount, 'messages');

      console.log('✅ Uploaded to S3:', data.s3Url);

      

      const finalTranscript = data.transcript;



      // Generate PDF with transcript

      const pdfResponse = await fetch('/api/tavus/webhook', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          recordId,

          candidateName: candidateData?.name,

          transcript: finalTranscript,

          interviewDate: interviewStartTime?.toISOString() || new Date().toISOString(),

        })

      });



      const pdfData = await pdfResponse.json();



      if (!pdfResponse.ok) {

        throw new Error(pdfData.details || pdfData.error);

      }



      console.log('✅ PDF generated and uploaded to S3:', pdfData.pdfUrl);

      console.log('✅ Messages processed:', pdfData.messagesProcessed);



      setError('✅ Complete! Redirecting...');



      setTimeout(() => {

        router.push(`/thank-you/${recordId}`);

      }, 2000);



    } catch (err: any) {

      console.error('❌ Error:', err);

      setError(err.message || 'Failed to process interview');

      setIsSubmitting(false);

    }

  };



  if (loading) {

    return (

      <div style={styles.loadingContainer}>

        <div style={styles.spinner}></div>

        <p style={styles.loadingText}>Preparing AI interview...</p>

      </div>

    );

  }



  if (error && !candidateData) {

    return (

      <div style={styles.errorContainer}>

        <div style={styles.errorCard}>

          <svg style={styles.errorIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">

            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />

          </svg>

          <h2 style={styles.errorTitle}>Error</h2>

          <p style={styles.errorText}>{error}</p>

          {needsCleanup && (

            <button onClick={handleCleanup} style={styles.cleanupButton}>

              Run Cleanup

            </button>

          )}

        </div>

      </div>

    );

  }



  return (

    <>

      <Head>

        <title>Exit Interview | {candidateData?.name}</title>

      </Head>



      <style jsx global>{`

        @keyframes spin {

          0% { transform: rotate(0deg); }

          100% { transform: rotate(360deg); }

        }

        @keyframes pulse {

          0%, 100% { opacity: 1; }

          50% { opacity: 0.5; }

        }

        * { margin: 0; padding: 0; box-sizing: border-box; }

        body { 

          font-family: 'Inter', sans-serif;

          background: #f1f5f9; /* Changed: Light gray background */

          color: #1e293b; /* Changed: Default dark text */

        }

      `}</style>



      <div style={styles.container}>

        {!isInterviewActive ? (

          // === PRE-INTERVIEW SCREEN ===

          <div style={styles.preCard}>

            <div style={styles.avatar}>

              <svg style={styles.avatarIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">

                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />

              </svg>

            </div>

            <h1 style={styles.title}>Your AI Interview is Ready!</h1>

            <p style={styles.subtitle}>

              {/* Hi {candidateData?.name}! Your personalized exit interview with our AI HR representative is ready to begin. */}

            </p>

            

             <div style={styles.infoBox}>

              <h4 style={styles.infoBoxTitle}>💡 Before you start:</h4>

              <ul style={styles.infoList}>

                 <li>Hi {candidateData?.name}! Your personalized exit interview with our AI HR representative is ready to begin.</li>

                {/* <li>Ensure you're in a quiet, well-lit environment</li>

                <li>Speak clearly and naturally - it's a conversation, not a test</li>

                <li>The AI knows about your role and projects</li>

                <li>Interview duration: 10-15 minutes</li>  */}

              </ul>

            </div> 



            <button 

              onClick={startInterview} 

              disabled={!conversationId}

              style={{

                ...styles.startButton,

                ...(!conversationId && styles.buttonDisabled)

              }}

            >

              {conversationId ? 'Preparing...' : 'Preparing...'}

              {isSubmitting ? (

                  <>

                    <div style={styles.smallSpinner}></div>

                    <span>Processing...</span>

                  </>

                ) : (

                  'Your Interview'

                )}

              </button>

           

            

            {error && <p style={styles.errorMsg}>{error}</p>}

            

            <a href="#" style={styles.troubleLink}>

              Having trouble? Click here

            </a>

          </div>

        ) : (

          // === ACTIVE INTERVIEW SCREEN ===

          <div style={styles.activeContainer}>

            <div style={styles.videoSection}>

              <LiveKitInterview

                conversationId={conversationId}

                conversationUrl={conversationUrl}

                candidateName={candidateData?.name || 'Candidate'}

              />

            </div>

            <div style={styles.sidebar}>

              <div style={styles.status}>

                <span style={styles.dot}></span>

                <span>Interview Active</span>

              </div>

              

              <div style={styles.infoPanel}>

                <h3 style={{ fontSize: '18px', marginBottom: '16px', color: '#1e293b' }}>

                  📋 Interview Progress

                </h3>

                <p style={{ fontSize: '14px', lineHeight: '1.8', color: '#475569' }}>

                  Your AI exit interview is being conducted in a separate window. The AI interviewer has been briefed about your role and will ask relevant questions.

                </p>

              </div>



              {/* <div style={styles.noteBox}>

                <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#1e293b' }}>

                  💡 Important:

                </h4>

                <ul style={{ fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', color: '#475569' }}>

                  <li>Complete your interview in the opened window</li>

                  <li>Return here when finished</li>

                  <li>Click "End Interview" to save transcript</li>

                  <li>Transcript will be stored in AWS S3 and Airtable</li>

                </ul>

              </div> */}



              {error && (

                <div style={styles.statusBox}>

                  <p style={{ fontSize: '14px', color: '#b45309' }}>{error}</p>

                </div>

              )}

              

              <button 

                onClick={endInterview} 

                disabled={isSubmitting}

                style={{

                  ...styles.endButton,

                  ...(isSubmitting && styles.buttonDisabled)

                }}

              >

                {isSubmitting ? (

                  <>

                    <div style={styles.smallSpinner}></div>

                    <span>Processing...</span>

                  </>

                ) : (

                  'End Interview & Submit'

                )}

              </button>

            </div>

          </div>

        )}

      </div>

    </>

  );

}



// === STYLES ===

const styles: any = {

  // --- Global & Loading/Error ---

  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' },

  loadingContainer: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', color: '#475569' },

  spinner: { width: '60px', height: '60px', border: '4px solid rgba(0,0,0,0.1)', borderTop: '4px solid #2563eb', borderRadius: '50%', animation: 'spin 1s linear infinite' },

  smallSpinner: { width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite', marginRight: '10px' },

  loadingText: { marginTop: '20px', fontSize: '18px', color: '#475569' },

  errorContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9' },

  errorCard: { background: 'white', color: '#1e293b', borderRadius: '20px', padding: '60px', textAlign: 'center', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' },

  errorIconSvg: { width: '50px', height: '50px', color: '#ef4444', marginBottom: '20px' },

  errorTitle: { fontSize: '28px', marginBottom: '16px' },

  errorText: { fontSize: '16px', color: '#64748b', marginBottom: '20px' },

  cleanupButton: { background: '#2563eb', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '16px', cursor: 'pointer', fontWeight: '600' },

  

  // --- Pre-Interview Card ---

  preCard: { background: 'white', borderRadius: '24px', padding: '50px', textAlign: 'center', maxWidth: '600px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' },

  avatar: { marginBottom: '20px' },

  avatarIcon: { width: '80px', height: '80px', color: '#9ca3af' }, // Gray icon

  title: { fontSize: '32px', fontWeight: '800', marginBottom: '12px', color: '#1e293b' },

  subtitle: { fontSize: '16px', color: '#64748b', opacity: 1, marginBottom: '30px', maxWidth: '450px', margin: '0 auto 30px' },

  infoBox: { background: '#f0f9ff', border: '1px solid #dbeafe', color: '#0369a1', borderRadius: '12px', padding: '24px', marginBottom: '30px', textAlign: 'left' },

  infoBoxTitle: { fontWeight: '700', fontSize: '15px', color: '#0284c7', marginBottom: '16px' },

  infoList: { paddingLeft: '20px', fontSize: '14px', lineHeight: '2', color: '#0369a1', listStyleType: '"✓  "' }, // Using ✓ prefix

  startButton: { background: '#2563eb', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '50px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)' },

  buttonDisabled: { opacity: 0.6, cursor: 'not-allowed' },

  errorMsg: { marginTop: '20px', color: '#ef4444' },

  troubleLink: { display: 'block', marginTop: '24px', fontSize: '14px', color: '#64748b', textDecoration: 'none' },



  // --- Active Interview Screen ---

  activeContainer: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', width: '100%', maxWidth: '1600px', height: 'calc(100vh - 80px)' },

  videoSection: { background: '#000', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' },

  sidebar: { display: 'flex', flexDirection: 'column', gap: '20px', background: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' },

  status: { background: '#f8fafc', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600', color: '#475569' },

  dot: { width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' },

  infoPanel: { background: '#f0f9ff', border: '1px solid #dbeafe', padding: '24px', borderRadius: '16px' },

  noteBox: { background: '#f0fdf4', border: '1px solid #dcfce7', padding: '24px', borderRadius: '16px' },

  statusBox: { background: '#fffbeb', border: '1px solid #fef3c7', padding: '20px', borderRadius: '16px' },

  endButton: { background: '#ef4444', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' },

};
