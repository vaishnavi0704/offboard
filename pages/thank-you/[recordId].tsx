import Head from 'next/head';

export default function ThankYouPage() {
  return (
    <>
      <Head>
        <title>Thank You</title>
      </Head>
      <style jsx global>{`
        body { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; }
      `}</style>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div style={{ fontSize: '100px', marginBottom: '30px' }}>✅</div>
        <h1 style={{ fontSize: '48px', fontWeight: '800', marginBottom: '20px' }}>Thank You!</h1>
        <p style={{ fontSize: '22px' }}>Your exit interview has been completed.</p>
      </div>
    </>
  );
}