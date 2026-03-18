import Conf from 'conf';

interface Config {
  baseUrl: string;
  token?: string;
  tokenType?: 'api_key' | 'jwt' | 'admin_key';
  activeTenant?: string;
}

const config = new Conf<Config>({
  projectName: 'objectify',
  defaults: { baseUrl: 'https://api.objectify.cloud' },
});

export function getBaseUrl(): string {
  return config.get('baseUrl');
}

export function setBaseUrl(url: string): void {
  config.set('baseUrl', url);
}

export function getToken(): string | undefined {
  return config.get('token');
}

export function setToken(token: string, type: Config['tokenType']): void {
  config.set('token', token);
  config.set('tokenType', type);
}

export function clearToken(): void {
  config.delete('token');
  config.delete('tokenType');
}

export function getActiveTenant(): string | undefined {
  return config.get('activeTenant');
}

export function setActiveTenant(id: string): void {
  config.set('activeTenant', id);
}

export function getAuthInfo(): { baseUrl: string; token?: string; tokenType?: string; activeTenant?: string } {
  return {
    baseUrl: config.get('baseUrl'),
    token: config.get('token'),
    tokenType: config.get('tokenType'),
    activeTenant: config.get('activeTenant'),
  };
}
