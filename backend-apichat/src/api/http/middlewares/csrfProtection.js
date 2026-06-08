import csrf from 'csurf';

export function createCsrfProtection() {
  return csrf({
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  });
}
