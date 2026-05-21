// REPLACE YOUR EXISTING callAI FUNCTION IN app.html WITH THIS:

// Read session ID from URL once on load
const SESSION_ID = new URLSearchParams(window.location.search).get('session') || '';

async function callAI(prompt, type = 'resume') {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, type, session: SESSION_ID })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));

    // Paywall hit — no valid session
    if (res.status === 403) {
      window.location.href = 'https://myresumeready.ca/?ref=unpaid';
      throw new Error('Purchase required to generate a resume.');
    }

    throw new Error(err.error || 'API ' + res.status);
  }

  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.content?.[0]?.text || '';
}
