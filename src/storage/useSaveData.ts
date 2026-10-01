import { useSyncExternalStore } from 'react';
import { getSaveData, subscribe, type SaveData } from './index';

const listen = (onChange: () => void) => subscribe(() => onChange());

/**
 * Tekent een scherm opnieuw als de voortgang verandert, bijvoorbeeld als die
 * bij het account is opgehaald.
 */
export function useSaveData(): SaveData {
  return useSyncExternalStore(listen, getSaveData);
}
