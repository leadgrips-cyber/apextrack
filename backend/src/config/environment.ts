/**
 * Environment Configuration Validation
 * Ensures all required environment variables are set at startup
 * Prevents runtime errors due to missing configuration
 */

function validateEnvironment(): void {
  const requiredVars = [
    'JWT_SECRET',
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !process.env[varName] || process.env[varName]?.trim() === ''
  );

  if (missingVars.length > 0) {
    console.error(
      `\n❌ CRITICAL: Missing required environment variables:\n`,
      missingVars.map((v) => `   - ${v}`).join('\n')
    );
    console.error(
      `\nPlease set these variables in your .env file and try again.\n`
    );
    process.exit(1);
  }

  // Validate JWT_SECRET is not the default placeholder
  if (process.env.JWT_SECRET === 'CHANGE_THIS_SECRET') {
    console.error(
      `\n❌ SECURITY ERROR: JWT_SECRET is set to default placeholder value.\n` +
      `Please set a strong JWT_SECRET in your .env file.\n`
    );
    process.exit(1);
  }

  // Validate NODE_ENV is valid
  const validNodeEnvs = ['development', 'staging', 'production'];
  const nodeEnv = process.env.NODE_ENV || 'development';
  if (!validNodeEnvs.includes(nodeEnv)) {
    console.warn(
      `⚠️  NODE_ENV '${nodeEnv}' is not standard. Valid values: ${validNodeEnvs.join(', ')}`
    );
  }

  // Validate PORT is a valid number
  const port = process.env.PORT || '3000';
  if (isNaN(Number(port))) {
    console.error(`\n❌ PORT must be a valid number. Got: ${port}\n`);
    process.exit(1);
  }

  console.log('✅ Environment validation passed');
}

export default validateEnvironment;
