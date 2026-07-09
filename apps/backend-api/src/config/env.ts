function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export const env = {
  port: Number(process.env.PORT || process.env.API_PORT || 3001),
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  jwtSecret: requireEnv('JWT_SECRET'),
};
