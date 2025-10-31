'use client';

import { useEffect, useState } from 'react';

interface ConversationProps {
  conversationId: string;
  onMessage?: (message: any) => void;
  onClose?: () => void;
  className?: string;
  config?: any;
}

export function Conversation({
  conversationId,
  className = '',
}: ConversationProps) {
  const [conversationUrl, setConversationUrl] = useState<string>('');

  useEffect(() => {
    if (conversationId) {
      const url = `https://tavus.io/c/${conversationId}`;
      setConversationUrl(url);
      console.log('Conversation URL:', url);
    }
  }, [conversationId]);

  if (!conversationId) {
    return (
      <div className={className} style={styles.errorContainer}>
        <div style={styles.errorContent}>
          <div style={styles.errorIcon}>⚠️</div>
          <h3 style={styles.errorTitle}>No Conversation Available</h3>
          <p style={styles.errorText}>Please refresh the page</p>
        </div>
      </div>
    );
  }

  // Option 1: Open in new tab
  const handleOpenInterview = () => {
    window.open(conversationUrl, '_blank', 'width=1200,height=800');
  };

  return (
    <div className={className} style={styles.container}>
      <div style={styles.linkContainer}>
        <div style={styles.iconLarge}>🎥</div>
        <h2 style={styles.linkTitle}>Your AI Interview is Ready</h2>
        <p style={styles.linkDescription}>
          Click the button below to start your exit interview in a new window
        </p>
        
        <button onClick={handleOpenInterview} style={styles.openButton}>
          <svg style={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open Interview
        </button>

        <div style={styles.orDivider}>
          <span>OR</span>
        </div>

        <a 
          href={conversationUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          style={styles.directLink}
        >
          Open in Browser →
        </a>

        <div style={styles.helpText}>
          <p>💡 <strong>Tips:</strong></p>
          <ul style={styles.helpList}>
            <li>Allow camera and microphone access when prompted</li>
            <li>Ensure you're in a quiet environment</li>
            <li>Speak clearly and naturally</li>
          </ul>
        </div>
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
  linkContainer: {
    textAlign: 'center' as const,
    maxWidth: '600px',
  },
  iconLarge: {
    fontSize: '80px',
    marginBottom: '20px',
  },
  linkTitle: {
    fontSize: '32px',
    fontWeight: '800' as const,
    color: 'white',
    marginBottom: '16px',
  },
  linkDescription: {
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: '40px',
    lineHeight: '1.6',
  },
  openButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '18px 50px',
    borderRadius: '50px',
    fontSize: '18px',
    fontWeight: '700' as const,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
    transition: 'all 0.3s ease',
  },
  buttonIcon: {
    width: '24px',
    height: '24px',
  },
  orDivider: {
    margin: '30px 0',
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '14px',
    fontWeight: '600' as const,
  },
  directLink: {
    color: '#667eea',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    display: 'inline-block',
    marginBottom: '40px',
  },
  helpText: {
    background: 'rgba(102, 126, 234, 0.1)',
    border: '1px solid rgba(102, 126, 234, 0.3)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'left' as const,
  },
  helpList: {
    listStyle: 'none',
    padding: 0,
    marginTop: '12px',
    fontSize: '14px',
    lineHeight: '2',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1e293b',
    borderRadius: '20px',
  },
  errorContent: {
    textAlign: 'center' as const,
    padding: '40px',
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
  },
};