// Nustatymai ir pažanga naršyklės atmintyje. Jei atmintis neprieinama, svetainė vis tiek veikia.

const PREFIX = 'galvosukiai:';

export function load(key, fallback) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignoruojame: atmintis gali būti išjungta
  }
}
