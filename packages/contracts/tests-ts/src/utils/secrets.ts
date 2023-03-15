export interface FetchError {
	code: number;
	message: string;
	error_chain?: FetchError[];
}

export interface FetchResult<ResponseType = unknown> {
	success: boolean;
	result: ResponseType;
	errors: FetchError[];
	messages: string[];
	result_info?: unknown;
}

export interface SecretInterface {
  name: string,
  text: string,
  type: string,
}

export const deploySecrets = async (
  apiToken = '',
  scriptName = 'prod-relayer',
  accountIdentifier = '',
  secrets: SecretInterface[],
) => {
  const url = `/accounts/${accountIdentifier}/workers/services/${scriptName}/environments/production/secrets`;

  return await Promise.all(secrets.map(async (secret) => {
    const response = await performApiFetch(
      apiToken,
      url,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(secret),
      },
    );

    console.log('deploy secret response: ', secret);
    console.log(response);
    console.log('');

    return await response.text();
  }));
}

export async function performApiFetch(
  apiToken: string,
	resource: string,
	init: RequestInit = {},
) {
	const method = init.method ?? "GET";

	const headers = cloneHeaders(init.headers);
	addAuthorizationHeaderIfUnspecified(headers, apiToken);
	addUserAgent(headers);

	return await fetch(`https://api.cloudflare.com/client/v4${resource}`, {
		method,
		headers,
		body: init.body,
	});
}

function addAuthorizationHeaderIfUnspecified(
	headers: Record<string, string>,
	auth: string
): void {
  headers["Authorization"] = `Bearer ${auth}`;
}

function addUserAgent(headers: Record<string, string>): void {
	headers["User-Agent"] = `wrangler/2.0.7`;
}

function cloneHeaders(
	headers: HeadersInit | undefined
): Record<string, string> {
	return headers instanceof Headers
		? Object.fromEntries(headers.entries())
		: Array.isArray(headers)
		? Object.fromEntries(headers)
		: { ...headers };
}
