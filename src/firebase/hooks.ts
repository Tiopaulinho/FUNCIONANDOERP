
'use client';

import { useEffect, useState, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, onSnapshot, DocumentReference, CollectionReference } from 'firebase/firestore';
import { auth, firestore } from './firebase'; // Importa instâncias inicializadas

/**
 * Hook para obter o estado do usuário atual e o status de carregamento.
 */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsUserLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { user, isUserLoading };
}

/**
 * Hook para escutar as atualizações de uma coleção do Firestore em tempo real.
 */
export function useCollection<T>(collectionRef: CollectionReference | null) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!collectionRef) {
      setData([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T));
      setData(docs);
      setIsLoading(false);
    }, (error) => {
      console.error("Erro ao buscar coleção:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [collectionRef]);

  return { data, isLoading };
}

/**
 * Hook para memorizar valores relacionados ao Firebase.
 */
export function useMemoFirebase<T>(factory: () => T, deps: any[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, deps);
}
