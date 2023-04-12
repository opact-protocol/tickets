export const useEnv = (name: string) => {
  if (import.meta.env[import.meta.envPrefix + name])
    return import.meta.env[import.meta.envPrefix + name];
  if (import.meta.env[name]) return import.meta.env[name];
  alert(`Environment variable ${name} is not defined.`);
};
