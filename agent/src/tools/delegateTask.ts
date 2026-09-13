export interface DelegateTaskResult {
  output: string;
  model?: string;
  costCents?: number;
}

export async function delegateTask(prompt: string, opts: { hint?: string } = {}): Promise<DelegateTaskResult> {
  const baseUrl = process.env.GUDDION_BACKEND_URL;
  const token = process.env.GUDDION_BACKEND_TOKEN;
  if (!baseUrl || !token) {
    throw new Error('GUDDION_BACKEND_URL and GUDDION_BACKEND_TOKEN must be configured to use delegate_task');
  }

  const res = await fetch(`${baseUrl}/api/delegate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ prompt, hint: opts.hint }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`delegate_task failed: ${res.status} ${body}`);
  }

  return (await res.json()) as DelegateTaskResult;
}
