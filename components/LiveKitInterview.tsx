'use client';

import { useEffect, useState } from 'react';

interface LiveKitInterviewProps {
  conversationId: string;
  candidateName: string;
  conversationUrl?: string;
  onTranscript?: (message: any) => void;
}

export function LiveKitInterview({
  conversationId,
  candidateName,
  conversationUrl: providedUrl,
}: LiveKitInterviewProps) {
  const [conversationUrl, setConversationUrl] = useState<string>('');
  const [isOpened, setIsOpened] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (conversationId) {
      const url = providedUrl || `https://tavus.io/c/${conversationId}`;
      setConversationUrl(url);
      console.log('🎥 Interview URL:', url);
      console.log('📋 Conversation ID:', conversationId);
    }
  }, [conversationId, providedUrl]);

  const handleOpenInterview = () => {
    if (!conversationUrl) {
      setError('Interview URL not available');
      return;
    }

    console.log('🚀 Opening interview:', conversationUrl);
    
    const newWindow = window.open(
      conversationUrl, 
      'tavus_interview', 
      'width=1200,height=900,resizable=yes,scrollbars=yes,status=yes'
    );

    if (newWindow) {
      setIsOpened(true);
      newWindow.focus();
    } else {
      setError('Please allow pop-ups for this site to start the interview');
    }
  };

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3 style={styles.errorTitle}>Unable to Open Interview</h3>
        <p style={styles.errorText}>{error}</p>
        <a 
          href={conversationUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.manualLink}
        >
          Click here to open manually →
        </a>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <h3 style={styles.errorTitle}>No Conversation Available</h3>
        <p style={styles.errorText}>Please refresh the page</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {!isOpened ? (
          <>
            <div style={styles.iconLarge}>🎥</div>
            <h2 style={styles.title}>Your AI Interview is Ready!</h2>
            <p style={styles.description}>
              Hi <strong>{candidateName}</strong>! Your personalized exit interview with our AI HR representative is ready to begin.
            </p>
            
            <button onClick={handleOpenInterview} style={styles.openButton}>
              <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Launch AI Interview
            </button>

            <div style={styles.tips}>
              <p style={styles.tipsTitle}>💡 Before you start:</p>
              <ul style={styles.tipsList}>
                <li>✓ Click &quot;Allow&quot; when prompted for camera and microphone access</li>
                <li>✓ Ensure you&apos;re in a quiet, well-lit environment</li>
                <li>✓ Speak clearly and naturally - it&apos;s a conversation, not a test</li>
                <li>✓ The AI knows about your role and projects</li>
                <li>✓ Interview duration: 10-15 minutes</li>
              </ul>
            </div>

            <div style={styles.technicalNote}>
              <details style={styles.details}>
                <summary style={styles.summary}>Having trouble? Click here</summary>
                <div style={styles.detailsContent}>
                  <p style={{ marginBottom: '12px' }}>If the interview doesn&apos;t open automatically:</p>
                  <ol style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
                    <li>Check if pop-ups are blocked by your browser</li>
                    <li>Use the direct link below</li>
                    <li>Try a different browser (Chrome or Edge recommended)</li>
                  </ol>
                  <a 
                    href={conversationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.directLink}
                  >
                    Open interview directly →
                  </a>
                  <div style={{ marginTop: '12px', fontSize: '12px', opacity: 0.7 }}>
                    Interview ID: {conversationId}
                  </div>
                </div>
              </details>
            </div>
          </>
        ) : (
          <>
            <div style={styles.iconSuccess}>✅</div>
            <h2 style={styles.title}>Interview Window Opened!</h2>
            <p style={styles.description}>
              Your AI interview is now running in a separate window. Complete the interview there, then return here.
            </p>

            <div style={styles.statusBox}>
              <div style={styles.statusDot}></div>
              <span>Interview in progress...</span>
            </div>

            <div style={styles.instructionsBox}>
              <h4 style={styles.instructionsTitle}>📝 Next Steps:</h4>
              <ol style={styles.instructionsList}>
                <li>Complete your interview with the AI in the opened window</li>
                <li>Answer all questions honestly and thoroughly</li>
                <li>When the AI thanks you and ends the session, return here</li>
                <li>Click &quot;End Interview & Submit&quot; button on the right to save your transcript</li>
              </ol>
            </div>

            <button onClick={handleOpenInterview} style={styles.reopenButton}>
              <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reopen Interview Window
            </button>

            <p style={styles.helpText}>
              💡 Window closed accidentally? Click above to reopen.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    borderRadius: '20px',
    padding: '40px',
  },
  content: {
    textAlign: 'center' as const,
    maxWidth: '700px',
    width: '100%',
  },
  iconLarge: {
    fontSize: '100px',
    marginBottom: '30px',
  },
  iconSuccess: {
    fontSize: '100px',
    marginBottom: '30px',
  },
  title: {
    fontSize: '36px',
    fontWeight: '800' as const,
    color: 'white',
    marginBottom: '20px',
    lineHeight: '1.2',
  },
  description: {
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: '40px',
    lineHeight: '1.6',
  },
  openButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '20px 60px',
    borderRadius: '50px',
    fontSize: '20px',
    fontWeight: '700' as const,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '15px',
    boxShadow: '0 15px 50px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease',
    marginBottom: '40px',
  },
  buttonIcon: {
    width: '28px',
    height: '28px',
  },
  tips: {
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '20px',
    textAlign: 'left' as const,
  },
  tipsTitle: {
    fontSize: '16px',
    fontWeight: '700' as const,
    color: 'white',
    marginBottom: '16px',
  },
  tipsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '15px',
    lineHeight: '2',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  technicalNote: {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'left' as const,
  },
  details: {
    cursor: 'pointer',
  },
  summary: {
    fontSize: '14px',
    fontWeight: '600' as const,
    color: '#60a5fa',
    cursor: 'pointer',
    listStyle: 'none',
  },
  detailsContent: {
    marginTop: '16px',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: '1.6',
  },
  directLink: {
    color: '#60a5fa',
    fontSize: '14px',
    fontWeight: '600' as const,
    textDecoration: 'underline',
    display: 'inline-block',
    marginTop: '8px',
  },
  statusBox: {
    background: 'rgba(16, 185, 129, 0.1)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '30px',
    fontSize: '16px',
    color: 'white',
    fontWeight: '600' as const,
  },
  statusDot: {
    width: '12px',
    height: '12px',
    background: '#10b981',
    borderRadius: '50%',
    animation: 'pulse 2s ease-in-out infinite',
  },
  instructionsBox: {
    background: 'rgba(59, 130, 246, 0.1)',
    border: '1px solid rgba(59, 130, 246, 0.3)',
    borderRadius: '16px',
    padding: '30px',
    marginBottom: '30px',
    textAlign: 'left' as const,
  },
  instructionsTitle: {
    fontSize: '18px',
    fontWeight: '700' as const,
    color: 'white',
    marginBottom: '16px',
  },
  instructionsList: {
    paddingLeft: '24px',
    margin: 0,
    fontSize: '15px',
    lineHeight: '2',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  reopenButton: {
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    padding: '14px 40px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.2s',
    marginBottom: '20px',
  },
  helpText: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic' as const,
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1e293b',
    borderRadius: '20px',
    padding: '40px',
    textAlign: 'center' as const,
  },
  errorIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  errorTitle: {
    fontSize: '24px',
    fontWeight: '700' as const,
    color: 'white',
    marginBottom: '12px',
  },
  errorText: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '24px',
  },
  manualLink: {
    display: 'inline-block',
    background: '#667eea',
    color: 'white',
    padding: '12px 32px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '16px',
  },
};