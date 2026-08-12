const crypto = require('crypto');

const issuer = 'my-sprint-tracker';

function base64url(value) {
  return Buffer.from(value).toString('base64url');
}

function sign(value) {
  return crypto.createHmac('sha256', process.env.JWT_SECRET).update(value).digest('base64url');
}

function unauthorized(message = 'Não autorizado.') {
  const error = new Error(message);
  error.statusCode = 401;
  return error;
}

function assertConfiguration() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET deve estar definido e ter ao menos 32 caracteres.');
  }
  if (!process.env.AUTH_USERNAME || !process.env.AUTH_PASSWORD) {
    throw new Error('AUTH_USERNAME e AUTH_PASSWORD devem estar definidos.');
  }
}

exports.assertConfiguration = assertConfiguration;

function credentialsMatch(username, password) {
  const hash = (value) => crypto.createHash('sha256').update(String(value || '')).digest();
  return crypto.timingSafeEqual(hash(process.env.AUTH_USERNAME), hash(username))
    && crypto.timingSafeEqual(hash(process.env.AUTH_PASSWORD), hash(password));
}

exports.login = ({ username, password }) => {
  assertConfiguration();
  if (!credentialsMatch(username, password)) throw unauthorized('Usuário ou senha inválidos.');

  const now = Math.floor(Date.now() / 1000);
  const payload = { sub: process.env.AUTH_USERNAME, iat: now, iss: issuer };
  const encodedHeader = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const encodedPayload = base64url(JSON.stringify(payload));
  const token = `${encodedHeader}.${encodedPayload}`;
  return { accessToken: `${token}.${sign(token)}`, tokenType: 'Bearer' };
};

exports.verify = (token) => {
  assertConfiguration();
  if (typeof token !== 'string') throw unauthorized();
  const parts = token.split('.');
  if (parts.length !== 3) throw unauthorized('Token inválido.');
  const [header, payload, signature] = parts;
  const expectedSignature = sign(`${header}.${payload}`);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    throw unauthorized('Token inválido.');
  }
  try {
    const decodedHeader = JSON.parse(Buffer.from(header, 'base64url').toString('utf8'));
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (decodedHeader.alg !== 'HS256' || decodedHeader.typ !== 'JWT' || claims.iss !== issuer || !claims.sub) {
      throw unauthorized('Token inválido.');
    }
    return claims;
  } catch (error) {
    if (error.statusCode) throw error;
    throw unauthorized('Token inválido.');
  }
};
