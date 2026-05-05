// shared/auth.js — Auth y roles · Plastimon SYS
const Auth = {
  getSession: async () => { const {data:{session}} = await sb.auth.getSession(); return session; },
  me: async () => {
    const session = await Auth.getSession();
    if (!session) return null;
    const {data:profile} = await sb.from('profiles').select('*').eq('id',session.user.id).single();
    return profile ? {...session.user,...profile} : null;
  },
  requireAuth: async () => { const s = await Auth.getSession(); if (!s) { window.location.href='login.html'; return null; } return s; },
  requireAdmin: async () => { const u = await Auth.me(); if (!u) { window.location.href='login.html'; return null; } if (u.rol!=='admin') { window.location.href='index.html'; return null; } return u; },
  login: async (email, password) => {
    const {data,error} = await sb.auth.signInWithPassword({email:email.trim().toLowerCase(),password});
    if (error) return {error};
    const {data:profile,error:ep} = await sb.from('profiles').select('*').eq('id',data.user.id).single();
    if (ep||!profile) { await sb.auth.signOut(); return {error:{message:'Sin perfil. Contactá a Dos Tercios Studio.'}}; }
    return {data:{...data,profile}};
  },
  logout: async () => { await sb.auth.signOut(); window.location.href='login.html'; },
};
window.Auth = Auth;