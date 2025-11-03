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
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
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
      console.log('🔗 URL:', data.conversationUrl);

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

  const handleTranscriptMessage = (message: any) => {
    console.log('📝 Transcript:', message);
    setTranscript(prev => [...prev, {
      timestamp: message.timestamp,
      speaker: message.speaker === 'agent' || message.speaker === 'assistant' ? 'assistant' : 'user',
      content: message.content || message.text,
    }]);
  };

  const endInterview = async () => {
    try {
      setIsSubmitting(true);

      console.log('📥 Fetching transcript from Tavus...');
      console.log('🆔 Conversation ID:', conversationId);

      let finalTranscript = [];

      // Try to fetch transcript from Tavus
      try {
        const transcriptResponse = await fetch(
          `/api/tavus/get-transcript?conversationId=${conversationId}`
        );

        if (transcriptResponse.ok) {
          const transcriptData = await transcriptResponse.json();
          
          if (transcriptData.success && transcriptData.transcript && transcriptData.transcript.length > 0) {
            finalTranscript = transcriptData.transcript;
            console.log('✅ Got transcript from Tavus:', finalTranscript.length, 'messages');
            
            // Log first few messages for debugging
            finalTranscript.slice(0, 3).forEach((msg: any, i: number) => {
              console.log(`  Message ${i + 1}: ${msg.speaker} - ${msg.content.substring(0, 50)}...`);
            });
          } else {
            console.log('⚠️ Tavus returned empty transcript');
          }
        } else {
          console.log('⚠️ Failed to fetch Tavus transcript:', transcriptResponse.status);
        }
      } catch (err) {
        console.error('⚠️ Error fetching Tavus transcript:', err);
      }

      // Fallback to local transcript if Tavus didn't work
      if (finalTranscript.length === 0 && transcript.length > 0) {
        finalTranscript = transcript;
        console.log('✅ Using local transcript:', finalTranscript.length, 'messages');
      }

      // Last resort fallback
      if (finalTranscript.length === 0) {
        finalTranscript = [
          {
            timestamp: new Date().toISOString(),
            speaker: 'assistant' as const,
            content: 'Exit interview was conducted via Tavus platform. Full transcript could not be retrieved from Tavus API. Please contact support if you need the full conversation details.',
          },
        ];
        console.log('⚠️ Using fallback message');
      }

      console.log('📄 Generating PDF with', finalTranscript.length, 'messages');

      // Generate PDF
      const pdfResponse = await fetch('/api/generate-transcript', {
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
      console.log('✅ PDF generated:', pdfData.pdfUrl);

      setTimeout(() => {
        router.push(`/thank-you/${recordId}`);
      }, 2000);

    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
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
          <h2 style={styles.errorTitle}>⚠️ Error</h2>
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
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
        }
      `}</style>

      <div style={styles.container}>
        {!isInterviewActive ? (
          <div style={styles.preCard}>
            <div style={styles.avatar}>
              <svg style={styles.avatarIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 style={styles.title}>Welcome, {candidateData?.name}!</h1>
            <p style={styles.subtitle}>AI-Powered Exit Interview</p>
            
            <div style={styles.infoBox}>
              <p><strong>Position:</strong> {candidateData?.designation}</p>
              <p><strong>Department:</strong> {candidateData?.domain}</p>
            </div>

            <button 
              onClick={startInterview} 
              disabled={!conversationId}
              style={{
                ...styles.startButton,
                ...(!conversationId && styles.buttonDisabled)
              }}
            >
              {conversationId ? 'Start AI Interview' : 'Preparing...'}
            </button>
            
            {error && <p style={styles.errorMsg}>{error}</p>}
          </div>
        ) : (
          <div style={styles.activeContainer}>
            <div style={styles.videoSection}>
              <LiveKitInterview
                conversationId={conversationId}
                conversationUrl={conversationUrl}
                candidateName={candidateData?.name || 'Candidate'}
                onTranscript={handleTranscriptMessage}
              />
            </div>
            <div style={styles.sidebar}>
              <div style={styles.status}>
                <span style={styles.dot}></span>
                <span>Interview Active</span>
              </div>
              
              <div style={styles.infoPanel}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px', color: 'white' }}>
                  📋 Interview Progress
                </h3>
                <p style={{ fontSize: '14px', lineHeight: '1.8', color: 'rgba(255,255,255,0.8)' }}>
                  Your AI exit interview is being conducted in a separate window. The AI interviewer has been briefed about your role and will ask relevant questions.
                </p>
              </div>

              <div style={styles.noteBox}>
                <h4 style={{ fontSize: '16px', marginBottom: '12px', color: 'white' }}>
                  💡 Important:
                </h4>
                <ul style={{ fontSize: '14px', lineHeight: '1.8', paddingLeft: '20px', color: 'rgba(255,255,255,0.8)' }}>
                  <li>Complete your interview in the opened window</li>
                  <li>Return here when finished</li>
                  <li>Click "End Interview" to save transcript</li>
                </ul>
              </div>
              
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
                    <div style={styles.spinner}></div>
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

const styles: any = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  loadingContainer: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  spinner: { width: '60px', height: '60px', border: '4px solid rgba(255,255,255,0.3)', borderTop: '4px solid white', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { marginTop: '20px', fontSize: '18px' },
  errorContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  errorCard: { background: 'white', color: '#1e293b', borderRadius: '20px', padding: '60px', textAlign: 'center', maxWidth: '500px' },
  errorTitle: { fontSize: '28px', marginBottom: '16px' },
  errorText: { fontSize: '16px', color: '#64748b', marginBottom: '20px' },
  cleanupButton: { background: '#667eea', color: 'white', border: 'none', padding: '12px 32px', borderRadius: '12px', fontSize: '16px', cursor: 'pointer', fontWeight: '600' },
  preCard: { background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '60px', textAlign: 'center', maxWidth: '600px', width: '100%' },
  avatar: { width: '100px', height: '100px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px' },
  avatarIcon: { width: '50px', height: '50px', color: 'white' },
  title: { fontSize: '32px', fontWeight: '800', marginBottom: '8px' },
  subtitle: { fontSize: '18px', opacity: 0.8, marginBottom: '30px' },
  infoBox: { background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.3)', borderRadius: '12px', padding: '20px', marginBottom: '30px', textAlign: 'left', lineHeight: '1.8' },
  startButton: { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', padding: '18px 50px', borderRadius: '50px', fontSize: '18px', fontWeight: '700', cursor: 'pointer' },
  buttonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  errorMsg: { marginTop: '20px', color: '#fca5a5' },
  activeContainer: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', width: '100%', maxWidth: '1600px', height: '90vh' },
  videoSection: { background: '#000', borderRadius: '20px', overflow: 'hidden' },
  sidebar: { display: 'flex', flexDirection: 'column', gap: '20px' },
  status: { background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' },
  dot: { width: '12px', height: '12px', background: '#10b981', borderRadius: '50%', animation: 'pulse 2s infinite' },
  infoPanel: { background: 'rgba(102, 126, 234, 0.1)', border: '1px solid rgba(102, 126, 234, 0.3)', padding: '24px', borderRadius: '16px' },
  noteBox: { background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '24px', borderRadius: '16px' },
  transcriptBox: { background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '16px', flex: 1, display: 'flex', flexDirection: 'column' },
  messages: { flex: 1, overflowY: 'auto', marginTop: '16px' },
  emptyMsg: { color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', textAlign: 'center', padding: '20px' },
  message: { marginBottom: '12px', fontSize: '14px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', lineHeight: '1.6' },
  aiLabel: { color: '#667eea', display: 'block', marginBottom: '4px' },
  userLabel: { color: '#10b981', display: 'block', marginBottom: '4px' },
  endButton: { background: '#ef4444', color: 'white', border: 'none', padding: '16px', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
};