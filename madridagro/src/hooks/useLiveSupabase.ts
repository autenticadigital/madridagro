import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useLiveSupabase<T extends { id: string }>(table: string, orderColumn = 'created_at', ascending = false) {
  const [data, setData] = useState<T[] | undefined>(undefined);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      const { data: fetchedData, error } = await supabase
        .from(table)
        .select('*')
        .order(orderColumn, { ascending });
        
      if (error) {
        console.error(`Erro ao buscar dados de ${table}:`, error);
      } else if (isMounted) {
        setData(fetchedData as T[]);
      }
    };

    fetchData();

    const channel = supabase.channel(`public:${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: table }, (payload) => {
        setData(current => {
          if (!current) return current;

          if (payload.eventType === 'INSERT') {
            // Verifica duplicidade
            if (current.find(item => item.id === payload.new.id)) return current;
            const newItem = payload.new as T;
            return ascending ? [...current, newItem] : [newItem, ...current];
          }

          if (payload.eventType === 'UPDATE') {
            return current.map(item => item.id === payload.new.id ? (payload.new as T) : item);
          }

          if (payload.eventType === 'DELETE') {
            return current.filter(item => item.id !== payload.old.id);
          }

          return current;
        });
      })
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [table, orderColumn, ascending]);

  return data;
}
