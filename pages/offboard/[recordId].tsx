// import { useRouter } from 'next/router';
// import { useEffect, useState } from 'react';
// import Head from 'next/head';

// interface CandidateData {
//   id: string;
//   name: string;
//   email: string;
//   designation: string;
//   domain: string;
// }

// interface LinkWithDescription {
//   url: string;
//   description: string;
// }

// export default function OffboardingPage() {
//   const router = useRouter();
//   const { recordId } = router.query;

//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [candidateData, setCandidateData] = useState<CandidateData | null>(null);

//   const [githubLinks, setGithubLinks] = useState<LinkWithDescription[]>([{ url: '', description: '' }]);
//   const [driveLinks, setDriveLinks] = useState<LinkWithDescription[]>([{ url: '', description: '' }]);
//   const [otherLinks, setOtherLinks] = useState<LinkWithDescription[]>([{ url: '', description: '' }]);

//   useEffect(() => {
//     if (recordId) {
//       fetchCandidateData(recordId as string);
//     }
//   }, [recordId]);

//   const fetchCandidateData = async (id: string) => {
//     try {
//       setLoading(true);
//       const response = await fetch(`/api/airtable/${id}`);
      
//       if (!response.ok) throw new Error('Failed to fetch');

//       const data = await response.json();
//       setCandidateData(data);
//       setLoading(false);
//     } catch (err) {
//       setError('Failed to load data. Please check your link.');
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const github = githubLinks.filter(link => link.url.trim());
//     const drive = driveLinks.filter(link => link.url.trim());
//     const other = otherLinks.filter(link => link.url.trim());

//     if (github.length === 0 && drive.length === 0 && other.length === 0) {
//       setError('Please add at least one link');
//       return;
//     }

//     setSubmitting(true);
//     setError('');

//     try {
//       const githubUrls = github.map(link => link.url).join('\n');
//       const githubDescs = github.map(link => link.description || '').join('\n');
//       const driveUrls = drive.map(link => link.url).join('\n');
//       const driveDescs = drive.map(link => link.description || '').join('\n');
//       const otherUrls = other.map(link => link.url).join('\n');
//       const otherDescs = other.map(link => link.description || '').join('\n');

//       const response = await fetch('/api/submit-links', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           recordId,
//           candidateName: candidateData?.name,
//           githubLinks: githubUrls,
//           driveLinks: driveUrls,
//           otherLinks: otherUrls,
//           githubDescriptions: githubDescs,
//           driveDescriptions: driveDescs,
//           otherDescriptions: otherDescs,
//         })
//       });

//       const result = await response.json();
//       if (!response.ok) throw new Error(result.details || 'Failed to submit');

//       setSuccess(true);
//       setTimeout(() => router.push(`/interview/${recordId}`), 2500);
//     } catch (err: any) {
//       setError(err.message || 'Failed to submit. Please try again.');
//       setSubmitting(false);
//     }
//   };

//   if (loading) return <LoadingScreen />;
//   if (error && !candidateData) return <ErrorScreen error={error} onRetry={() => router.reload()} />;
//   if (success) return <SuccessScreen />;

//   return (
//     <>
//       <Head>
//         <title>Offboarding Documentation | {candidateData?.name}</title>
//       </Head>

//       <style jsx global>{`
//         * { box-sizing: border-box; margin: 0; padding: 0; }
//         body { 
//           font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
//           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//           min-height: 100vh;
//         }
//       `}</style>

//       <div style={styles.pageContainer}>
//         <div style={styles.mainCard}>
//           {/* Animated Header */}
//           <div style={styles.headerSection}>
//             <div style={styles.iconWrapper}>
//               <div style={styles.iconCircle}>
//                 <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//               </div>
//             </div>
//             <h1 style={styles.mainTitle}>Submit Your Documentation</h1>
//             <p style={styles.mainSubtitle}>Share your project repositories and documentation links</p>
            
//             {/* Progress Steps */}
//             <div style={styles.progressContainer}>
//               <div style={styles.stepActive}>
//                 <div style={styles.stepNumber}>1</div>
//                 <span style={styles.stepLabel}>Documentation</span>
//               </div>
//               <div style={styles.progressLine}></div>
//               <div style={styles.stepInactive}>
//                 <div style={styles.stepNumberInactive}>2</div>
//                 <span style={styles.stepLabelInactive}>Exit Interview</span>
//               </div>
//             </div>
//           </div>

//           {/* Candidate Info Card */}
//           {candidateData && (
//             <div style={styles.infoCard}>
//               <div style={styles.infoHeader}>
//                 <svg style={styles.infoIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                 </svg>
//                 <h2 style={styles.infoTitle}>Your Information</h2>
//               </div>
//               <div style={styles.infoGrid}>
//                 <InfoCard icon="👤" label="Name" value={candidateData.name} />
//                 <InfoCard icon="📧" label="Email" value={candidateData.email} />
//                 <InfoCard icon="💼" label="Designation" value={candidateData.designation} />
//                 <InfoCard icon="🏢" label="Department" value={candidateData.domain} />
//               </div>
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleSubmit} style={styles.formContainer}>
//             <LinkSection
//               icon="🐙"
//               title="GitHub Repositories"
//               description="Share your GitHub repository links with project descriptions"
//               color="#6e5494"
//               links={githubLinks}
//               setLinks={setGithubLinks}
//               urlPlaceholder="https://github.com/username/repository"
//               descPlaceholder="e.g., Main backend API for customer management"
//             />

//             <LinkSection
//               icon="📁"
//               title="Google Drive Documents"
//               description="Include Google Drive folders containing project documentation"
//               color="#4285f4"
//               links={driveLinks}
//               setLinks={setDriveLinks}
//               urlPlaceholder="https://drive.google.com/drive/folders/..."
//               descPlaceholder="e.g., Project specifications and design files"
//             />

//             <LinkSection
//               icon="🔗"
//               title="Other Platforms"
//               description="GitLab, Bitbucket, Notion, Confluence, or other platforms"
//               color="#ff6b6b"
//               links={otherLinks}
//               setLinks={setOtherLinks}
//               urlPlaceholder="https://..."
//               descPlaceholder="e.g., Team wiki and documentation"
//             />

//             {error && (
//               <div style={styles.errorAlert}>
//                 <svg style={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//                 <span>{error}</span>
//               </div>
//             )}

//             <div style={styles.submitContainer}>
//               <button
//                 type="submit"
//                 disabled={submitting}
//                 style={{
//                   ...styles.submitButton,
//                   ...(submitting && styles.submitButtonDisabled)
//                 }}
//               >
//                 {submitting ? (
//                   <>
//                     <div style={styles.spinner}></div>
//                     <span>Submitting...</span>
//                   </>
//                 ) : (
//                   <>
//                     <span>Submit & Continue</span>
//                     <svg style={styles.arrowIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                     </svg>
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// }

// // Info Card Component
// function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
//   return (
//     <div style={styles.infoItem}>
//       <div style={styles.infoItemIcon}>{icon}</div>
//       <div>
//         <div style={styles.infoItemLabel}>{label}</div>
//         <div style={styles.infoItemValue}>{value}</div>
//       </div>
//     </div>
//   );
// }

// // Link Section Component
// function LinkSection({ 
//   icon, 
//   title, 
//   description, 
//   color,
//   links, 
//   setLinks,
//   urlPlaceholder,
//   descPlaceholder 
// }: any) {
//   const addLink = () => setLinks([...links, { url: '', description: '' }]);
//   const removeLink = (index: number) => {
//     const newLinks = links.filter((_: any, i: number) => i !== index);
//     setLinks(newLinks.length === 0 ? [{ url: '', description: '' }] : newLinks);
//   };
//   const updateLink = (index: number, field: 'url' | 'description', value: string) => {
//     const newLinks = [...links];
//     newLinks[index][field] = value;
//     setLinks(newLinks);
//   };

//   return (
//     <div style={styles.section}>
//       <div style={{...styles.sectionHeader, borderLeftColor: color}}>
//         <span style={styles.sectionIcon}>{icon}</span>
//         <div>
//           <h3 style={styles.sectionTitle}>{title}</h3>
//           <p style={styles.sectionDesc}>{description}</p>
//         </div>
//       </div>

//       <div style={styles.linksWrapper}>
//         {links.map((link: any, index: number) => (
//           <div key={index} style={styles.linkCard}>
//             <div style={styles.linkCardHeader}>
//               <span style={{...styles.linkBadge, backgroundColor: color}}>Link {index + 1}</span>
//               {links.length > 1 && (
//                 <button
//                   type="button"
//                   onClick={() => removeLink(index)}
//                   style={styles.removeBtn}
//                 >
//                   <svg style={styles.removeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                   </svg>
//                   Remove
//                 </button>
//               )}
//             </div>

//             <div style={styles.inputWrapper}>
//               <label style={styles.inputLabel}>
//                 <svg style={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
//                 </svg>
//                 Project URL
//               </label>
//               <input
//                 type="url"
//                 value={link.url}
//                 onChange={(e) => updateLink(index, 'url', e.target.value)}
//                 placeholder={urlPlaceholder}
//                 style={styles.input}
//               />
//             </div>

//             <div style={styles.inputWrapper}>
//               <label style={styles.inputLabel}>
//                 <svg style={styles.inputIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                 </svg>
//                 Description (Optional)
//               </label>
//               <textarea
//                 value={link.description}
//                 onChange={(e) => updateLink(index, 'description', e.target.value)}
//                 placeholder={descPlaceholder}
//                 style={styles.textarea}
//                 rows={2}
//               />
//             </div>
//           </div>
//         ))}
//       </div>

//       <div style={styles.actionButtons}>
//         <button type="button" onClick={addLink} style={{...styles.addBtn, borderColor: color, color: color}}>
//           <svg style={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//           </svg>
//           Add Another
//         </button>
//         <button type="button" onClick={() => setLinks([{ url: '', description: '' }])} style={styles.clearBtn}>
//           Clear Section
//         </button>
//       </div>
//     </div>
//   );
// }

// // Loading Screen
// function LoadingScreen() {
//   return (
//     <div style={styles.fullScreenCenter}>
//       <div style={styles.loadingSpinner}></div>
//       <p style={styles.loadingText}>Loading your information...</p>
//     </div>
//   );
// }

// // Error Screen
// function ErrorScreen({ error, onRetry }: { error: string; onRetry: () => void }) {
//   return (
//     <div style={styles.fullScreenCenter}>
//       <div style={styles.errorScreen}>
//         <div style={styles.errorIconLarge}>⚠️</div>
//         <h2 style={styles.errorScreenTitle}>Oops! Something went wrong</h2>
//         <p style={styles.errorScreenText}>{error}</p>
//         <button onClick={onRetry} style={styles.retryButton}>Try Again</button>
//       </div>
//     </div>
//   );
// }

// // Success Screen
// function SuccessScreen() {
//   return (
//     <div style={styles.fullScreenCenter}>
//       <div style={styles.successScreen}>
//         <div style={styles.successCheckmark}>
//           <svg style={styles.successIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//           </svg>
//         </div>
//         <h2 style={styles.successTitle}>Success!</h2>
//         <p style={styles.successText}>Documentation submitted successfully</p>
//         <p style={styles.successSubtext}>Redirecting to exit interview...</p>
//       </div>
//     </div>
//   );
// }

// // Styles
// const styles: { [key: string]: React.CSSProperties } = {
//   pageContainer: {
//     minHeight: '100vh',
//     padding: '40px 20px',
//     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//   },
//   mainCard: {
//     maxWidth: '1100px',
//     margin: '0 auto',
//     background: 'white',
//     borderRadius: '24px',
//     boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
//     overflow: 'hidden',
//   },
//   headerSection: {
//     background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
//     padding: '60px 40px',
//     textAlign: 'center',
//     position: 'relative',
//     overflow: 'hidden',
//   },
//   iconWrapper: {
//     marginBottom: '30px',
//   },
//   iconCircle: {
//     width: '80px',
//     height: '80px',
//     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//     borderRadius: '50%',
//     display: 'inline-flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)',
//   },
//   icon: {
//     width: '40px',
//     height: '40px',
//     color: 'white',
//   },
//   mainTitle: {
//     fontSize: '42px',
//     fontWeight: '800',
//     color: 'white',
//     marginBottom: '12px',
//     letterSpacing: '-0.5px',
//   },
//   mainSubtitle: {
//     fontSize: '18px',
//     color: 'rgba(255,255,255,0.8)',
//     marginBottom: '40px',
//   },
//   progressContainer: {
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: '20px',
//     marginTop: '40px',
//   },
//   stepActive: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '12px',
//   },
//   stepNumber: {
//     width: '40px',
//     height: '40px',
//     background: '#667eea',
//     borderRadius: '50%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: '18px',
//     boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
//   },
//   stepLabel: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: '16px',
//   },
//   progressLine: {
//     width: '60px',
//     height: '3px',
//     background: 'rgba(255,255,255,0.3)',
//   },
//   stepInactive: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '12px',
//     opacity: 0.5,
//   },
//   stepNumberInactive: {
//     width: '40px',
//     height: '40px',
//     background: 'rgba(255,255,255,0.2)',
//     borderRadius: '50%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: '18px',
//   },
//   stepLabelInactive: {
//     color: 'rgba(255,255,255,0.6)',
//     fontWeight: '600',
//     fontSize: '16px',
//   },
//   infoCard: {
//     background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
//     padding: '40px',
//     borderBottom: '3px solid #e2e8f0',
//   },
//   infoHeader: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '15px',
//     marginBottom: '30px',
//   },
//   infoIcon: {
//     width: '32px',
//     height: '32px',
//     color: '#667eea',
//   },
//   infoTitle: {
//     fontSize: '24px',
//     fontWeight: '700',
//     color: '#1e293b',
//   },
//   infoGrid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
//     gap: '20px',
//   },
//   infoItem: {
//     background: 'white',
//     padding: '24px',
//     borderRadius: '16px',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '16px',
//     boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
//     transition: 'all 0.3s ease',
//     cursor: 'default',
//   },
//   infoItemIcon: {
//     fontSize: '32px',
//   },
//   infoItemLabel: {
//     fontSize: '12px',
//     fontWeight: '600',
//     color: '#64748b',
//     textTransform: 'uppercase',
//     letterSpacing: '0.5px',
//     marginBottom: '4px',
//   },
//   infoItemValue: {
//     fontSize: '16px',
//     fontWeight: '600',
//     color: '#0f172a',
//     wordBreak: 'break-word',
//   },
//   formContainer: {
//     padding: '50px 40px',
//   },
//   section: {
//     marginBottom: '50px',
//   },
//   sectionHeader: {
//     display: 'flex',
//     alignItems: 'flex-start',
//     gap: '20px',
//     marginBottom: '30px',
//     paddingLeft: '20px',
//     borderLeft: '4px solid',
//   },
//   sectionIcon: {
//     fontSize: '36px',
//   },
//   sectionTitle: {
//     fontSize: '24px',
//     fontWeight: '700',
//     color: '#1e293b',
//     marginBottom: '6px',
//   },
//   sectionDesc: {
//     fontSize: '15px',
//     color: '#64748b',
//     lineHeight: '1.6',
//   },
//   linksWrapper: {
//     marginBottom: '24px',
//   },
//   linkCard: {
//     background: '#f8fafc',
//     border: '2px solid #e2e8f0',
//     borderRadius: '16px',
//     padding: '24px',
//     marginBottom: '20px',
//     transition: 'all 0.3s ease',
//   },
//   linkCardHeader: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: '20px',
//   },
//   linkBadge: {
//     padding: '6px 14px',
//     borderRadius: '20px',
//     color: 'white',
//     fontSize: '13px',
//     fontWeight: '600',
//     textTransform: 'uppercase',
//     letterSpacing: '0.5px',
//   },
//   removeBtn: {
//     background: 'transparent',
//     border: 'none',
//     color: '#ef4444',
//     cursor: 'pointer',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '6px',
//     fontSize: '14px',
//     fontWeight: '600',
//     padding: '8px 12px',
//     borderRadius: '8px',
//     transition: 'all 0.2s',
//   },
//   removeIcon: {
//     width: '18px',
//     height: '18px',
//   },
//   inputWrapper: {
//     marginBottom: '16px',
//   },
//   inputLabel: {
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     fontSize: '14px',
//     fontWeight: '600',
//     color: '#475569',
//     marginBottom: '8px',
//   },
//   inputIcon: {
//     width: '18px',
//     height: '18px',
//   },
//   input: {
//     width: '100%',
//     padding: '14px 16px',
//     border: '2px solid #e2e8f0',
//     borderRadius: '10px',
//     fontSize: '15px',
//     fontFamily: 'monospace',
//     outline: 'none',
//     transition: 'all 0.2s',
//     background: 'white',
//   },
//   textarea: {
//     width: '100%',
//     padding: '14px 16px',
//     border: '2px solid #e2e8f0',
//     borderRadius: '10px',
//     fontSize: '14px',
//     outline: 'none',
//     resize: 'vertical',
//     fontFamily: 'inherit',
//     transition: 'all 0.2s',
//     background: 'white',
//   },
//   actionButtons: {
//     display: 'flex',
//     gap: '12px',
//     flexWrap: 'wrap',
//   },
//   addBtn: {
//     background: 'transparent',
//     border: '2px solid',
//     padding: '12px 24px',
//     borderRadius: '10px',
//     fontSize: '14px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '8px',
//     transition: 'all 0.2s',
//   },
//   clearBtn: {
//     background: 'transparent',
//     border: '2px dashed #cbd5e0',
//     color: '#64748b',
//     padding: '12px 24px',
//     borderRadius: '10px',
//     fontSize: '14px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//   },
//   btnIcon: {
//     width: '18px',
//     height: '18px',
//   },
//   errorAlert: {
//     background: '#fef2f2',
//     border: '2px solid #fecaca',
//     borderLeft: '4px solid #ef4444',
//     borderRadius: '12px',
//     padding: '16px 20px',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '12px',
//     marginBottom: '30px',
//     color: '#991b1b',
//     fontWeight: '500',
//   },
//   errorIcon: {
//     width: '24px',
//     height: '24px',
//     flexShrink: 0,
//   },
//   submitContainer: {
//     marginTop: '50px',
//     paddingTop: '40px',
//     borderTop: '2px solid #e2e8f0',
//     textAlign: 'center',
//   },
//   submitButton: {
//     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//     color: 'white',
//     border: 'none',
//     padding: '20px 60px',
//     borderRadius: '50px',
//     fontSize: '18px',
//     fontWeight: '700',
//     cursor: 'pointer',
//     display: 'inline-flex',
//     alignItems: 'center',
//     gap: '12px',
//     boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)',
//     transition: 'all 0.3s ease',
//   },
//   submitButtonDisabled: {
//     background: '#cbd5e0',
//     cursor: 'not-allowed',
//     boxShadow: 'none',
//   },
//   arrowIcon: {
//     width: '24px',
//     height: '24px',
//   },
//   spinner: {
//     width: '20px',
//     height: '20px',
//     border: '3px solid rgba(255,255,255,0.3)',
//     borderTop: '3px solid white',
//     borderRadius: '50%',
//     animation: 'spin 1s linear infinite',
//   },
//   fullScreenCenter: {
//     minHeight: '100vh',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//   },
//   loadingSpinner: {
//     width: '60px',
//     height: '60px',
//     border: '4px solid rgba(255,255,255,0.3)',
//     borderTop: '4px solid white',
//     borderRadius: '50%',
//     animation: 'spin 1s linear infinite',
//   },
//   loadingText: {
//     color: 'white',
//     fontSize: '18px',
//     marginTop: '20px',
//     fontWeight: '500',
//   },
//   errorScreen: {
//     background: 'white',
//     borderRadius: '24px',
//     padding: '60px 50px',
//     textAlign: 'center',
//     maxWidth: '500px',
//     margin: '20px',
//   },
//   errorIconLarge: {
//     fontSize: '80px',
//     marginBottom: '20px',
//   },
//   errorScreenTitle: {
//     fontSize: '28px',
//     fontWeight: '700',
//     color: '#1e293b',
//     marginBottom: '12px',
//   },
//   errorScreenText: {
//     fontSize: '16px',
//     color: '#64748b',
//     marginBottom: '30px',
//   },
//   retryButton: {
//     background: '#667eea',
//     color: 'white',
//     border: 'none',
//     padding: '14px 36px',
//     borderRadius: '12px',
//     fontSize: '16px',
//     fontWeight: '600',
//     cursor: 'pointer',
//     transition: 'all 0.2s',
//   },
//   successScreen: {
//     textAlign: 'center',
//     color: 'white',
//   },
//   successCheckmark: {
//     width: '120px',
//     height: '120px',
//     background: '#10b981',
//     borderRadius: '50%',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     margin: '0 auto 30px',
//     boxShadow: '0 20px 60px rgba(16, 185, 129, 0.4)',
//   },
//   successIcon: {
//     width: '60px',
//     height: '60px',
//     color: 'white',
//   },
//   successTitle: {
//     fontSize: '48px',
//     fontWeight: '800',
//     marginBottom: '12px',
//   },
//   successText: {
//     fontSize: '22px',
//     opacity: 0.95,
//     marginBottom: '8px',
//   },
//   successSubtext: {
//     fontSize: '18px',
//     opacity: 0.8,
//   },
// };




import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';

interface CandidateData {
  id: string;
  name: string;
  email: string;
  designation: string;
  domain: string;
}

interface LinkWithDescription {
  url: string;
  description: string;
}

export default function OffboardingPage() {
  const router = useRouter();
  const { recordId } = router.query;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [candidateData, setCandidateData] = useState<CandidateData | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  // Form data for all steps
  const [githubLinks, setGithubLinks] = useState<LinkWithDescription[]>([{ url: '', description: '' }]);
  const [driveLinks, setDriveLinks] = useState<LinkWithDescription[]>([{ url: '', description: '' }]);
  const [otherLinks, setOtherLinks] = useState<LinkWithDescription[]>([{ url: '', description: '' }]);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (recordId) {
      fetchCandidateData(recordId as string);
    }
  }, [recordId]);

  const fetchCandidateData = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/airtable/${id}`);
      
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setCandidateData(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load data. Please check your link.');
      setLoading(false);
    }
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1 && !validateStep(githubLinks)) {
      setError('Please add at least one GitHub link');
      return;
    }
    if (currentStep === 2 && !validateStep(driveLinks)) {
      setError('Please add at least one Google Drive link');
      return;
    }
    if (currentStep === 3 && !validateStep(otherLinks)) {
      setError('Please add at least one link');
      return;
    }

    setError('');
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };

  const handleSkip = () => {
    setError('');
    setCurrentStep(currentStep + 1);
  };

  const validateStep = (links: LinkWithDescription[]) => {
    return links.some(link => link.url.trim() !== '');
  };

  const handleFinalSubmit = async () => {
    try {
      setError('');
      
      const githubUrls = githubLinks.filter(l => l.url.trim()).map(l => l.url).join('\n');
      const githubDescs = githubLinks.filter(l => l.url.trim()).map(l => l.description || '').join('\n');
      const driveUrls = driveLinks.filter(l => l.url.trim()).map(l => l.url).join('\n');
      const driveDescs = driveLinks.filter(l => l.url.trim()).map(l => l.description || '').join('\n');
      const otherUrls = otherLinks.filter(l => l.url.trim()).map(l => l.url).join('\n');
      const otherDescs = otherLinks.filter(l => l.url.trim()).map(l => l.description || '').join('\n');

      const response = await fetch('/api/submit-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId,
          candidateName: candidateData?.name,
          githubLinks: githubUrls,
          driveLinks: driveUrls,
          otherLinks: otherUrls,
          githubDescriptions: githubDescs,
          driveDescriptions: driveDescs,
          otherDescriptions: otherDescs,
          feedback,
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.details || 'Failed to submit');

      // Redirect to interview
      router.push(`/interview/${recordId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    }
  };

  if (loading) return <LoadingScreen />;
  if (error && !candidateData) return <ErrorScreen error={error} onRetry={() => router.reload()} />;

  return (
    <>
      <Head>
        <title>Offboarding - Step {currentStep} | {candidateData?.name}</title>
      </Head>

      <style jsx global>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.pageContainer}>
        <div style={styles.mainCard}>
          {/* Header with Progress */}
          <HeaderWithProgress 
            currentStep={currentStep} 
            candidateData={candidateData}
          />

          {/* Step Content */}
          <div style={styles.contentContainer}>
            {currentStep === 1 && (
              <Step1GitHub 
                links={githubLinks}
                setLinks={setGithubLinks}
                error={error}
              />
            )}

            {currentStep === 2 && (
              <Step2Drive 
                links={driveLinks}
                setLinks={setDriveLinks}
                error={error}
              />
            )}

            {currentStep === 3 && (
              <Step3Other 
                links={otherLinks}
                setLinks={setOtherLinks}
                error={error}
              />
            )}

            {currentStep === 4 && (
              <Step4Feedback 
                feedback={feedback}
                setFeedback={setFeedback}
                error={error}
              />
            )}

            {/* Navigation Buttons */}
            <div style={styles.navigationContainer}>
              {currentStep > 1 && (
                <button onClick={handleBack} style={styles.backButton}>
                  <svg style={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
              )}

              <div style={styles.rightButtons}>
                {currentStep < 4 && (
                  <button onClick={handleSkip} style={styles.skipButton}>
                    Skip
                  </button>
                )}

                {currentStep < 4 ? (
                  <button onClick={handleNext} style={styles.nextButton}>
                    Next Step
                    <svg style={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ) : (
                  <button onClick={handleFinalSubmit} style={styles.submitButton}>
                    Submit & Continue to Interview
                    <svg style={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Header Component
function HeaderWithProgress({ currentStep, candidateData }: any) {
  const steps = [
    { num: 1, title: 'GitHub', icon: '🐙' },
    { num: 2, title: 'Google Drive', icon: '📁' },
    { num: 3, title: 'Other Platforms', icon: '🔗' },
    { num: 4, title: 'Feedback', icon: '💬' },
  ];

  return (
    <div style={styles.header}>
      <h1 style={styles.mainTitle}>Offboarding Documentation</h1>
      <p style={styles.subtitle}>
        {candidateData?.name} • {candidateData?.designation}
      </p>

      {/* Progress Steps */}
      <div style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <div key={step.num} style={styles.stepWrapper}>
            <div style={{
              ...styles.stepCircle,
              ...(step.num === currentStep ? styles.stepActive : {}),
              ...(step.num < currentStep ? styles.stepCompleted : {}),
            }}>
              {step.num < currentStep ? '✓' : step.icon}
            </div>
            <span style={{
              ...styles.stepLabel,
              ...(step.num === currentStep ? styles.stepLabelActive : {}),
            }}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div style={{
                ...styles.stepLine,
                ...(step.num < currentStep ? styles.stepLineCompleted : {}),
              }}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Step 1: GitHub
function Step1GitHub({ links, setLinks, error }: any) {
  return (
    <LinkSection
      icon="🐙"
      title="GitHub Repositories"
      description="Share your GitHub repositories with detailed project descriptions"
      color="#6e5494"
      links={links}
      setLinks={setLinks}
      urlPlaceholder="https://github.com/username/repository"
      descPlaceholder="Describe the project, your role, tech stack, and key achievements"
      error={error}
    />
  );
}

// Step 2: Google Drive
function Step2Drive({ links, setLinks, error }: any) {
  return (
    <LinkSection
      icon="📁"
      title="Google Drive Documents"
      description="Share Google Drive folders containing project documentation, specs, and resources"
      color="#4285f4"
      links={links}
      setLinks={setLinks}
      urlPlaceholder="https://drive.google.com/drive/folders/..."
      descPlaceholder="Describe what's in this folder - specifications, designs, documentation, etc."
      error={error}
    />
  );
}

// Step 3: Other Platforms
function Step3Other({ links, setLinks, error }: any) {
  return (
    <LinkSection
      icon="🔗"
      title="Other Platforms & Resources"
      description="GitLab, Bitbucket, Notion, Confluence, Figma, or any other platform"
      color="#ff6b6b"
      links={links}
      setLinks={setLinks}
      urlPlaceholder="https://..."
      descPlaceholder="Describe what this resource contains and why it's important"
      error={error}
    />
  );
}

// Step 4: Feedback
function Step4Feedback({ feedback, setFeedback, error }: any) {
  return (
    <div style={styles.feedbackSection}>
      <div style={styles.feedbackHeader}>
        <div style={styles.feedbackIcon}>💬</div>
        <div>
          <h2 style={styles.feedbackTitle}>Your Feedback</h2>
          <p style={styles.feedbackDesc}>
            Share any final thoughts, suggestions, or feedback about your experience (optional)
          </p>
        </div>
      </div>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Your feedback helps us improve. Feel free to share:&#10;• What you enjoyed about your role&#10;• Areas for improvement&#10;• Suggestions for the team&#10;• Any other thoughts..."
        style={styles.feedbackTextarea}
        rows={12}
      />

      {error && (
        <div style={styles.errorAlert}>
          <svg style={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div style={styles.feedbackNote}>
        <svg style={styles.noteIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>This feedback is optional but greatly appreciated. It will be kept confidential.</span>
      </div>
    </div>
  );
}

// Link Section Component (Reusable)
function LinkSection({ icon, title, description, color, links, setLinks, urlPlaceholder, descPlaceholder, error }: any) {
  const addLink = () => setLinks([...links, { url: '', description: '' }]);
  
  const removeLink = (index: number) => {
    const newLinks = links.filter((_: any, i: number) => i !== index);
    setLinks(newLinks.length === 0 ? [{ url: '', description: '' }] : newLinks);
  };
  
  const updateLink = (index: number, field: 'url' | 'description', value: string) => {
    const newLinks = [...links];
    newLinks[index][field] = value;
    setLinks(newLinks);
  };

  return (
    <div style={styles.linkSection}>
      <div style={styles.linkSectionHeader}>
        <span style={styles.sectionIcon}>{icon}</span>
        <div>
          <h2 style={styles.sectionTitle}>{title}</h2>
          <p style={styles.sectionDesc}>{description}</p>
        </div>
      </div>

      {links.map((link: any, index: number) => (
        <div key={index} style={styles.linkCard}>
          <div style={styles.linkCardHeader}>
            <span style={{...styles.linkBadge, backgroundColor: color}}>
              Link {index + 1}
            </span>
            {links.length > 1 && (
              <button
                type="button"
                onClick={() => removeLink(index)}
                style={styles.removeBtn}
              >
                Remove
              </button>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>🔗 Project URL</label>
            <input
              type="url"
              value={link.url}
              onChange={(e) => updateLink(index, 'url', e.target.value)}
              placeholder={urlPlaceholder}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.inputLabel}>📝 Description</label>
            <textarea
              value={link.description}
              onChange={(e) => updateLink(index, 'description', e.target.value)}
              placeholder={descPlaceholder}
              style={styles.textarea}
              rows={4}
            />
          </div>
        </div>
      ))}

      <button 
        type="button" 
        onClick={addLink} 
        style={{...styles.addMoreBtn, borderColor: color, color: color}}
      >
        <svg style={styles.btnIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Another {title.split(' ')[0]}
      </button>

      {error && (
        <div style={styles.errorAlert}>
          <svg style={styles.errorIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// Loading & Error Screens
function LoadingScreen() {
  return (
    <div style={styles.fullScreenCenter}>
      <div style={styles.loadingSpinner}></div>
      <p style={styles.loadingText}>Loading...</p>
    </div>
  );
}

function ErrorScreen({ error, onRetry }: any) {
  return (
    <div style={styles.fullScreenCenter}>
      <div style={styles.errorScreen}>
        <div style={styles.errorIconLarge}>⚠️</div>
        <h2 style={styles.errorTitle}>{error}</h2>
        <button onClick={onRetry} style={styles.retryButton}>Try Again</button>
      </div>
    </div>
  );
}

// Styles
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    minHeight: '100vh',
    padding: '40px 20px',
  },
  mainCard: {
    maxWidth: '900px',
    margin: '0 auto',
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
    overflow: 'hidden',
  },
  header: {
    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    padding: '50px 40px',
    textAlign: 'center',
  },
  mainTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: 'white',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: '40px',
  },
  stepsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0',
  },
  stepWrapper: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    position: 'relative' as 'relative',
  },
  stepCircle: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    marginBottom: '8px',
    transition: 'all 0.3s',
  },
  stepActive: {
    background: '#667eea',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.5)',
    transform: 'scale(1.1)',
  },
  stepCompleted: {
    background: '#10b981',
  },
  stepLabel: {
    fontSize: '13px',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: 'white',
  },
  stepLine: {
    width: '60px',
    height: '3px',
    background: 'rgba(255,255,255,0.2)',
    position: 'absolute' as 'absolute',
    top: '25px',
    left: '65px',
  },
  stepLineCompleted: {
    background: '#10b981',
  },
  contentContainer: {
    padding: '50px 40px',
  },
  linkSection: {
    marginBottom: '40px',
  },
  linkSectionHeader: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
  },
  sectionIcon: {
    fontSize: '48px',
  },
  sectionTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
  },
  sectionDesc: {
    fontSize: '16px',
    color: '#64748b',
    lineHeight: '1.6',
  },
  linkCard: {
    background: '#f8fafc',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
  },
  linkCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  linkBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    color: 'white',
    fontSize: '13px',
    fontWeight: '600',
  },
  removeBtn: {
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    padding: '8px 12px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  inputLabel: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '15px',
    fontFamily: 'monospace',
    outline: 'none',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical' as 'vertical',
    fontFamily: 'inherit',
  },
  addMoreBtn: {
    background: 'transparent',
    border: '2px solid',
    padding: '14px 24px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  feedbackSection: {
    marginBottom: '40px',
  },
  feedbackHeader: {
    display: 'flex',
    gap: '20px',
    marginBottom: '30px',
  },
  feedbackIcon: {
    fontSize: '48px',
  },
  feedbackTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
  },
  feedbackDesc: {
    fontSize: '16px',
    color: '#64748b',
    lineHeight: '1.6',
  },
  feedbackTextarea: {
    width: '100%',
    padding: '20px',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    fontSize: '15px',
    outline: 'none',
    resize: 'vertical' as 'vertical',
    fontFamily: 'inherit',
    lineHeight: '1.8',
    minHeight: '300px',
  },
  feedbackNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '16px',
    padding: '16px',
    background: '#f0f9ff',
    borderRadius: '12px',
    fontSize: '14px',
    color: '#0369a1',
  },
  noteIcon: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  errorAlert: {
    background: '#fef2f2',
    border: '2px solid #fecaca',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '20px',
    color: '#991b1b',
  },
  errorIcon: {
    width: '20px',
    height: '20px',
    flexShrink: 0,
  },
  navigationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '50px',
    paddingTop: '30px',
    borderTop: '2px solid #e2e8f0',
  },
  rightButtons: {
    display: 'flex',
    gap: '12px',
    marginLeft: 'auto',
  },
  backButton: {
    background: 'transparent',
    border: '2px solid #cbd5e0',
    color: '#64748b',
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  skipButton: {
    background: 'transparent',
    border: 'none',
    color: '#64748b',
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  nextButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
  },
  submitButton: {
    background: '#10b981',
    color: 'white',
    border: 'none',
    padding: '14px 32px',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
  },
  btnIcon: {
    width: '20px',
    height: '20px',
  },
  fullScreenCenter: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: 'white',
    fontSize: '16px',
    marginTop: '20px',
  },
  errorScreen: {
    background: 'white',
    borderRadius: '20px',
    padding: '50px',
    textAlign: 'center' as 'center',
  },
  errorIconLarge: {
    fontSize: '60px',
    marginBottom: '20px',
  },
  errorTitle: {
    fontSize: '20px',
    color: '#1e293b',
    marginBottom: '20px',
  },
  retryButton: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};