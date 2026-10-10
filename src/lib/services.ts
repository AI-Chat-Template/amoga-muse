import Constants from 'expo-constants';
import { Platform } from 'react-native';

export function getApiUrl(path: string) {
    const apiPath = `/api${path.startsWith('/') ? path : `/${path}`}`;
    if (Platform.OS === 'web') return apiPath;
    const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
    if (configuredUrl) return `${configuredUrl.replace(/\/+$/, '')}${apiPath}`;
    const hostUrl = Constants.expoConfig?.hostUri;
    if (!hostUrl) throw new Error('Set EXPO_PUBLIC_API_URL to your hosted backend URL for an installed app.');
    return `http://${hostUrl}${apiPath}`;

}
