import React from 'react';

const Login = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 80 }}>
      <h2>FindMySeat Login</h2>
      <button onClick={handleLogin} style={{ padding: '10px 24px', fontSize: 16, marginTop: 20 }}>
        Sign in with Google
      </button>
    </div>
  );
};

export default Login; 