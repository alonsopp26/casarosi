import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  
  // 1. Obtenemos el usuario de manera segura
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  // 2. Si no hay usuario, fuera
  if (userError || !user) {
    redirect('/');
  }

  // 3. Buscamos su perfil y su rol
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // 4. Si no es admin, fuera
  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/recetas');
  }

  return (
    <>
      {children}
    </>
  );
}