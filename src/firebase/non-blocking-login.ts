
import { signInAnonymously, User } from 'firebase/auth';
import { auth } from './firebase'; // <-- MUDANÇA CRÍTICA: Importa a instância de auth já inicializada

/**
 * Inicia o processo de login anônimo de forma não bloqueante.
 * Retorna o usuário se o login for bem-sucedido ou se já estiver logado, caso contrário, retorna nulo.
 */
export const initiateAnonymousSignIn = async (): Promise<User | null> => {
  if (auth.currentUser) {
    return auth.currentUser;
  }

  try {
    const userCredential = await signInAnonymously(auth);
    return userCredential.user;
  } catch (error) {
    console.error('Falha no login anônimo:', error);
    return null;
  }
};
