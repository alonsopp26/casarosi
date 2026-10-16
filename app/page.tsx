'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Importamos el cliente de Supabase diseñado para el navegador
import { createClient } from '@/utils/supabase/client';
// IMPORTACIÓN CLAVE PARA EL BUSCADOR (App Router)
import { useRouter } from 'next/navigation';

/* ------------------------------------------------------------------ */
/*  Estilo compartido (colores de las capturas de referencia)          */
/* ------------------------------------------------------------------ */
// Degradado rosa → naranja de botones y círculos de íconos
const degradadoBoton = 'bg-gradient-to-r from-[#ff3d77] to-[#ff6a00]';
const degradadoCirculo = 'bg-gradient-to-br from-[#ff3d6e] to-[#ff6a00]';
// Borde crema de inputs y etiquetas
const bordeCrema = 'border border-amber-200/80 dark:border-stone-700';

const Icono = ({ d, className = 'h-6 w-6' }: { d: string; className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

const D = {
  buscar: 'M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z',
  correo:
    'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  libro:
    'M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25',
  bolsa:
    'M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  engrane:
    'M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.298-2.247a1.125 1.125 0 011.369-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28zM15 12a3 3 0 11-6 0 3 3 0 016 0z',
};

export default function HomePage() {

  const router = useRouter(); 
  const [busqueda, setBusqueda] = useState('');
  const [tagsBuscador, setTagsBuscador] = useState<string[]>([]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      router.push(`/recetas?q=${encodeURIComponent(busqueda.trim())}`);
    }
  };

  const handleTagClick = (tag: string) => {
    router.push(`/recetas?q=${encodeURIComponent(tag)}`);
  };

  const [ultimasRecetas, setUltimasRecetas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const [slideActivo, setSlideActivo] = useState(0);
  const [pestanaActiva, setPestanaActiva] = useState('ultimas');

  // Datos para el carrusel principal
  const slides = [
    { id: 1, title: 'Paella Valenciana', img: 'https://images.pexels.com/photos/12419160/pexels-photo-12419160.jpeg', tag: 'Española', diff: 'Media' },
    { id: 2, title: 'Tacos al Pastor', img: 'https://images.pexels.com/photos/2092507/pexels-photo-2092507.jpeg', tag: 'Mexicana', diff: 'Fácil' },
    { id: 3, title: 'Sushi Variado', img: 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg', tag: 'Japonesa', diff: 'Difícil' }
  ];

  useEffect(() => {
    async function cargarDatosInicio() {
      const supabase = createClient();
      
      const { data: recetas } = await supabase
        .from('recipes')
        .select('id, title, description, prep_time_minutes, image_url')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(8);

      if (recetas) setUltimasRecetas(recetas);
      
      const { data: etiquetas } = await supabase
        .from('tags')
        .select('name')
        .limit(6);
        
      if (etiquetas) {
        setTagsBuscador(etiquetas.map(t => t.name));
      }
      
      setCargando(false);
    }

    cargarDatosInicio();
  }, []);

  const siguienteSlide = () => setSlideActivo((prev) => (prev + 1) % slides.length);
  const anteriorSlide = () => setSlideActivo((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    // Agregamos bg- y text- para oscurecer el fondo global
    <div className="flex flex-col min-h-screen bg-[#fcfbf9] dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-300">

      {/* --- SECCIÓN HERO --- */}
      <section className="w-full py-12 md:py-24 lg:py-32 relative overflow-hidden bg-[#fcfbf9] dark:bg-stone-950">
        <div className="absolute inset-0 z-0">
          <img alt="Fondo" className="object-cover w-full h-full" src="https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg" />
          {/* El gradiente ya es oscuro, lo dejamos igual */}
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950/85 via-stone-900/75 to-orange-950/70"></div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">

            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl sm:text-6xl xl:text-7xl font-bold tracking-tighter text-white drop-shadow-lg">
                  Bienvenidos<br/>a La Casa de Rosi
                </h1>
                <p className="max-w-[600px] text-stone-100 md:text-xl">
                  Miles de recetas, cursos y productos para convertirte en un chef experto. Explora, aprende y comparte tu pasión por la cocina.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/recetas" className="inline-flex items-center justify-center h-11 rounded-md px-8 bg-gradient-to-r from-[#ff3d77] to-[#ff6a00] hover:opacity-90 text-white font-medium transition-opacity">
                  Explorar Recetas
                </Link>
                <Link href="/planificador" className="inline-flex items-center justify-center h-11 rounded-md px-8 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-medium transition-colors backdrop-blur-sm">
                  Mi Planificador Semanal
                </Link>
              </div>
            </div>

            {/* Carrusel Nuevo */}
            <div className="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10">
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-900 rounded-2xl">
                {slides.map((slide, index) => (
                  <div key={slide.id} className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === slideActivo ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                    <img src={slide.img} alt={slide.title} className="object-cover w-full h-full" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 flex flex-col justify-end">
                      <div className="flex gap-2 mb-3">
                        <span className="inline-flex items-center rounded-full bg-gradient-to-r from-[#ff3d77] to-[#ff6a00] px-3 py-1 text-[11px] font-bold text-white shadow-sm tracking-wide">
                          {slide.tag}
                        </span>
                        <span className="inline-flex items-center rounded-full border border-white/70 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm tracking-wide">
                          {slide.diff}
                        </span>
                      </div>
                      
                      <h3 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md mb-3">
                        {slide.title}
                      </h3>
                      
                      <div className="flex gap-2 items-center">
                        {slides.map((_, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setSlideActivo(idx)} 
                            aria-label={`Ir a diapositiva ${idx + 1}`}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === slideActivo ? 'w-5 bg-orange-500' : 'w-1.5 bg-white/50 hover:bg-white'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={anteriorSlide} 
                  aria-label="Anterior" 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-orange-500 text-white w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 pr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={siguienteSlide} 
                  aria-label="Siguiente" 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-orange-500 text-white w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4 pl-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SECCIÓN BUSCADOR --- */}
      <section className="w-full bg-[#fcfbf9] dark:bg-stone-950 py-16 md:py-20 transition-colors duration-300">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col items-center text-center">
            {/* Texto oscurecido */}
            <h2 className="text-4xl font-extrabold tracking-tighter text-[#2f2f2f] dark:text-stone-100 sm:text-5xl md:text-6xl">
              Encuentra tu receta ideal
            </h2>
            <p className="mt-5 max-w-[760px] text-lg text-stone-500 dark:text-stone-400 md:text-2xl">
              Busca entre miles de recetas filtradas por país, tipo, dificultad y más
            </p>

            <form className="mt-8 flex w-full max-w-3xl flex-col gap-3 sm:flex-row" onSubmit={handleSearch}>
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500 dark:text-stone-400">🔍</span>
                {/* Input oscurecido */}
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar recetas, ingredientes..."
                  className={`h-14 w-full rounded-xl border border-amber-200/80 dark:border-stone-700 bg-[#fcfbf9] dark:bg-stone-900 pl-12 pr-4 text-lg text-stone-800 dark:text-white placeholder:text-stone-500 dark:placeholder:text-stone-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-colors`}
                />
              </div>
              <button
                type="submit"
                className={`h-14 cursor-pointer rounded-xl px-8 text-lg font-semibold text-white transition-opacity hover:opacity-90 bg-gradient-to-r from-[#ff3d77] to-[#ff6a00]`}
              >
                Buscar
              </button>
            </form>

            <div className="flex flex-wrap justify-center gap-3 pt-8">
              {tagsBuscador.length > 0 ? (
                tagsBuscador.map(tag => (
                  // Etiquetas (tags) oscurecidas
                  <span
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`inline-flex cursor-pointer items-center rounded-full border border-amber-200/80 dark:border-stone-700 bg-[#fcfbf9] dark:bg-stone-900 px-5 py-1.5 text-base font-semibold text-stone-800 dark:text-stone-300 transition-colors hover:border-transparent hover:bg-gradient-to-r hover:from-[#ff3d77] hover:to-[#ff6a00] hover:text-white`}
                  >
                    {tag}
                  </span>
                ))
              ) : (
                ['Cargando...'].map((tag) => (
                   <span
                    key={tag}
                    className="inline-flex items-center rounded-full border border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-stone-800/50 px-5 py-1.5 text-base font-semibold text-stone-400 dark:text-stone-500"
                  >
                    {tag}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN RECETAS DESTACADAS (Con Tabs) --- */}
      <section className="w-full py-12 md:py-24 bg-[#fcfbf9] dark:bg-stone-950 transition-colors duration-300">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">

          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <h2 className="text-3xl font-bold tracking-tighter text-stone-900 dark:text-stone-100">Recetas destacadas</h2>
          </div>

          {pestanaActiva === 'ultimas' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {cargando ? (
                <div className="col-span-full py-12 text-center text-stone-500 dark:text-stone-400">Cargando recetas...</div>
              ) : ultimasRecetas && ultimasRecetas.length > 0 ? (
                ultimasRecetas.map((receta) => (
                  // Tarjetas oscurecidas
                  <div key={receta.id} className="rounded-xl border border-amber-100 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm overflow-hidden group flex flex-col hover:shadow-md transition-shadow">
                    <div className="aspect-video relative overflow-hidden bg-stone-100 dark:bg-stone-800">
                      {receta.image_url ? (
                        <img src={receta.image_url} alt={receta.title} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🍳</div>
                      )}
                      <div className="absolute top-2 right-2 bg-gradient-to-r from-[#ff3d77] to-[#ff6a00] text-white px-2.5 py-0.5 text-xs font-bold rounded-full shadow-sm">
                        {receta.prep_time_minutes} min
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col">
                      {/* Títulos y textos de la tarjeta oscurecidos */}
                      <h3 className="font-bold tracking-tight text-lg text-stone-900 dark:text-stone-100 line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors">{receta.title}</h3>
                      <p className="text-sm text-stone-500 dark:text-stone-400 mt-2 line-clamp-2 flex-1">{receta.description}</p>
                    </div>

                    <div className="p-4 pt-0 flex justify-between items-center border-t border-stone-50 dark:border-stone-800 mt-2">
                      <Link href={`/recetas/${receta.id}`} className="text-sm font-bold text-orange-600 dark:text-orange-500 hover:text-orange-700 dark:hover:text-orange-400">
                        Ver receta →
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-stone-500 dark:text-stone-400">Aún no hay recetas publicadas.</div>
              )}
            </div>
          )}

          {pestanaActiva !== 'ultimas' && (
            <div className="py-20 text-center text-stone-500 dark:text-stone-400 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl">
              <p className="text-4xl mb-4">👨‍🍳</p>
              <p>Próximamente agregaremos las recetas {pestanaActiva}.</p>
            </div>
          )}

          <div className="flex justify-center mt-10">
            <Link href="/recetas" className="inline-flex items-center justify-center h-11 px-8 rounded-full bg-gradient-to-r from-[#ff3d77] to-[#ff6a00] hover:opacity-90 text-white font-bold transition-opacity shadow-sm">
              Ver todas las recetas ❯
            </Link>
          </div>
        </div>
      </section>

      {/* --- SECCIÓN CARACTERÍSTICAS --- */}
      <section className="w-full bg-[#fcfbf9] dark:bg-stone-950 py-20 md:py-28 transition-colors duration-300">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="grid gap-12 md:grid-cols-3 md:gap-8 lg:gap-12">

            {[
              {
                icono: D.libro,
                titulo: 'Cursos de Cocina',
                texto: 'Aprende de los mejores chefs con nuestros cursos en video de alta calidad.',
                enlace: 'Explorar cursos',
                href: '/cursos',
              },
              {
                icono: D.bolsa,
                titulo: 'Productos Gourmet',
                texto: 'Descubre utensilios, ingredientes y libros para elevar tu experiencia culinaria.',
                enlace: 'Ver productos',
                href: '/productos',
              },
              {
                icono: D.engrane,
                titulo: 'Programa de Afiliados',
                texto: 'Únete a nuestro programa y gana comisiones compartiendo recetas y productos.',
                enlace: 'Más información',
                href: '/afiliados',
              },
            ].map((item) => (
              <div key={item.titulo} className="flex flex-col items-center px-2 text-center">
                <div className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-md shadow-orange-300/40 dark:shadow-orange-900/20 ${degradadoCirculo}`}>
                  <Icono d={item.icono} className="h-7 w-7" />
                </div>
                {/* Textos oscurecidos */}
                <h3 className="mt-6 text-2xl font-bold tracking-tight text-[#2f2f2f] dark:text-stone-100">{item.titulo}</h3>
                <p className="mt-4 max-w-sm text-lg leading-relaxed text-stone-500 dark:text-stone-400">{item.texto}</p>
                <Link href={item.href} className="mt-8 text-lg font-medium text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  {item.enlace}
                </Link>
              </div>
            ))}

          </div>
        </div>
      </section>

      {/* --- SECCIÓN NEWSLETTER --- */}
      <section className="w-full bg-[#f6eedf] dark:bg-stone-900/50 py-16 md:py-20 transition-colors duration-300 border-t border-transparent dark:border-stone-800">
        <div className="container mx-auto px-4 md:px-6 max-w-7xl">
          <div className="flex flex-col items-center text-center">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full text-white shadow-md shadow-orange-300/40 dark:shadow-orange-900/20 ${degradadoCirculo}`}>
              <Icono d={D.correo} className="h-7 w-7" />
            </div>
            {/* Textos oscurecidos */}
            <h2 className="mt-6 text-3xl font-extrabold tracking-tighter text-[#2f2f2f] dark:text-stone-100 sm:text-4xl md:text-5xl">
              Suscríbete a nuestro newsletter
            </h2>
            <p className="mt-5 max-w-[640px] text-lg text-stone-500 dark:text-stone-400 md:text-2xl">
              Recibe semanalmente nuevas recetas, consejos de cocina y ofertas exclusivas.
            </p>

            <form className="mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1">
                <Icono d={D.correo} className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-500 dark:text-stone-400" />
                {/* Input oscurecido */}
                <input
                  type="email"
                  placeholder="tu@email.com"
                  required
                  className={`h-14 w-full rounded-xl border border-amber-200/80 dark:border-stone-700 bg-[#fcfbf9] dark:bg-stone-900 pl-12 pr-4 text-lg text-stone-800 dark:text-white placeholder:text-stone-500 dark:placeholder:text-stone-500 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-900 transition-colors`}
                />
              </div>
              <button
                type="submit"
                className={`h-14 cursor-pointer whitespace-nowrap rounded-xl px-8 text-lg font-semibold text-white transition-opacity hover:opacity-90 bg-gradient-to-r from-[#ff3d77] to-[#ff6a00]`}
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>
      </section>

    </div>
  );
}