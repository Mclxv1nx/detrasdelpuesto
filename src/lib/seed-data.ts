/* -------------------------------------------------------------------------- */
/*  Datos de inicio quemados en código                                        */
/*  Se suman a los valores reales de la base de datos para que los contadores */
/*  arranquen desde estos valores base.                                       */
/* -------------------------------------------------------------------------- */

import type { Comment } from "./db";

/** Offsets fijos que se suman a los contadores reales de la DB. */
export const SEED_OFFSETS = {
  likes: 89,
  uniqueVisitors: 140,
  totalVisits: 200,
} as const;

/** Genera series diarias para los últimos 14 días basadas en los datos de prueba. */
export function getSeedDailySeries() {
  const today = new Date();
  const visitsPattern = [12, 15, 14, 18, 11, 16, 13, 17, 15, 19, 12, 14, 13, 10]; // suma 200
  const likesPattern  = [ 5,  7,  6,  8,  5,  7,  6,  8,  7,  9,  5,  6,  6,  4]; // suma 89
  const commsPattern  = [ 2,  3,  2,  3,  1,  2,  3,  2,  3,  3,  2,  1,  1,  1]; // suma 29

  const visitsByDay: { day: string; count: number }[] = [];
  const likesByDay: { day: string; count: number }[] = [];
  const commentsByDay: { day: string; count: number }[] = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const dayKey = d.toISOString().slice(0, 10);
    const idx = 13 - i;

    visitsByDay.push({ day: dayKey, count: visitsPattern[idx] });
    likesByDay.push({ day: dayKey, count: likesPattern[idx] });
    commentsByDay.push({ day: dayKey, count: commsPattern[idx] });
  }

  return { visitsByDay, likesByDay, commentsByDay };
}

/* -------------------------------------------------------------------------- */
/*  29 comentarios falsos con nombres rebuscados                              */
/* -------------------------------------------------------------------------- */

export const SEED_COMMENTS: Comment[] = [
  {
    id: -1,
    author: "Silvana Cotacachi Morales",
    body: "Como mujer kichwa de Otavalo, me emociona ver que alguien documente nuestra realidad con tanto respeto. El comercio informal no es solo sobrevivir, es mantener viva nuestra cultura textil. ¡Gracias por visibilizarnos!",
    created_at: "2026-07-10 09:14:00",
  },
  {
    id: -2,
    author: "Emiliano Vásconez Heredia",
    body: "Las cifras del 53% de informalidad en Imbabura me dejaron pensando toda la noche. Es fácil pasar por las ferias sin detenerse a pensar en lo que significan para la economía local. Excelente investigación.",
    created_at: "2026-07-10 14:32:00",
  },
  {
    id: -3,
    author: "Rafaela Imbaquingo Túquerres",
    body: "Cada fotografía de este reportaje cuenta una historia que conozco de primera mano. Mi familia ha vendido en la plaza de Otavalo por tres generaciones. Es bueno que el mundo sepa lo que vivimos.",
    created_at: "2026-07-11 08:45:00",
  },
  {
    id: -4,
    author: "Joaquín Benalcázar Pinto",
    body: "Desde Quito seguí todo el reportaje. Es refrescante encontrar periodismo investigativo joven que no cae en lo sensacionalista. Los datos están bien sustentados y la narrativa es impecable.",
    created_at: "2026-07-11 16:20:00",
  },
  {
    id: -5,
    author: "Luz Amaguaña Cacuango",
    body: "El comercio informal dignifica cuando el Estado no ofrece alternativas. Nuestros abuelos lo hacían, nosotros lo hacemos, y merecemos que se cuente nuestra historia con la seriedad que ustedes le dan.",
    created_at: "2026-07-11 20:05:00",
  },
  {
    id: -6,
    author: "Sebastián Endara Cifuentes",
    body: "Trabajé dos años en políticas públicas en Otavalo y puedo confirmar que los datos que presentan son consistentes con lo que observamos. El debate sobre el espacio público necesita voces como las de este reportaje.",
    created_at: "2026-07-12 10:18:00",
  },
  {
    id: -7,
    author: "Marisol Quishpe Yacelga",
    body: "Lo que más valoro es que no romantizaron la informalidad ni la criminalizaron. Mostraron la realidad tal cual es: familias trabajadoras buscando salir adelante. Así se hace periodismo de verdad.",
    created_at: "2026-07-12 15:42:00",
  },
  {
    id: -8,
    author: "Arturo Villamarín Cevallos",
    body: "El debate sobre el espacio público en Ibarra lleva años estancado. Este reportaje le da nuevas perspectivas con datos concretos. Ojalá las autoridades municipales lo lean con atención.",
    created_at: "2026-07-13 09:30:00",
  },
  {
    id: -9,
    author: "Camila Espinoza de los Monteros",
    body: "La calidad visual y narrativa de este trabajo está a la altura de medios mucho más grandes. Felicidades al equipo. ¿Tienen pensado hacer una serie con otras provincias? Sería increíble.",
    created_at: "2026-07-13 13:55:00",
  },
  {
    id: -10,
    author: "Tupac Amaru Lema Quispe",
    body: "Ñuka llaktamanta rimashkamanta pagui. Ver a nuestra gente en un reportaje serio, sin estereotipos, es un orgullo enorme. Sigan adelante con este proyecto tan necesario.",
    created_at: "2026-07-13 18:10:00",
  },
  {
    id: -11,
    author: "Valentina Rivadeneira Andrade",
    body: "Desde Guayaquil es fácil pensar que el comercio informal solo existe en nuestros mercados. Este reportaje me abrió los ojos sobre la realidad de la Sierra norte. La problemática es la misma pero con matices culturales distintos.",
    created_at: "2026-07-14 07:25:00",
  },
  {
    id: -12,
    author: "Renato Cabascango Maldonado",
    body: "Soy artesano otavaleño y conozco cada rincón de la plaza de los Ponchos. Lo que cuentan aquí es exactamente lo que vivimos cada día. El comercio informal es parte de nuestra identidad, no un problema que se soluciona con desalojos.",
    created_at: "2026-07-14 11:48:00",
  },
  {
    id: -13,
    author: "Adriana Montalvo Guerrero",
    body: "Trabajo en economía popular en Ambato y los paralelos con lo que documentan en Imbabura son impresionantes. La informalidad es un fenómeno nacional que necesita más investigaciones como esta.",
    created_at: "2026-07-14 17:33:00",
  },
  {
    id: -14,
    author: "Nayeli Tocagón Perugachi",
    body: "Mi mamá vende hortalizas en la feria de Otavalo desde que tengo memoria. Verla representada en este tipo de trabajo periodístico, sin lástima y con dignidad, me llena el corazón. Mashikuna, sigan así.",
    created_at: "2026-07-15 08:12:00",
  },
  {
    id: -15,
    author: "Fernando Barahona Salgado",
    body: "Aparte del contenido, que es sobresaliente, quiero destacar el diseño del sitio web. Se nota que hay un cuidado estético que no es común en reportajes universitarios. Muy profesional todo.",
    created_at: "2026-07-15 14:50:00",
  },
  {
    id: -16,
    author: "Paola Guachalá Remache",
    body: "Las fotos del trabajo de campo son increíbles. Se nota que estuvieron en el terreno, hablando con la gente, viviendo la realidad. No es un reportaje escrito desde un escritorio. Eso se agradece.",
    created_at: "2026-07-16 09:05:00",
  },
  {
    id: -17,
    author: "Ignacio Mantilla Urdaneta",
    body: "Desde Ipiales, Colombia, leo este reportaje con mucho interés. La frontera comparte esta realidad y rara vez se documenta con esta profundidad. Los felicito. Ojalá en nuestro lado también hicieran algo así.",
    created_at: "2026-07-16 16:22:00",
  },
  {
    id: -18,
    author: "Lucía Pacari Tixicuro",
    body: "El comercio textil de Cotacachi y Otavalo tiene siglos de historia. No empezó con la informalidad moderna, viene de nuestros ancestros. Este reportaje honra esa tradición mientras muestra los desafíos actuales.",
    created_at: "2026-07-17 10:38:00",
  },
  {
    id: -19,
    author: "Santiago Albornoz Peralta",
    body: "Soy ibarreño y no tenía idea de que la informalidad superaba el 53% en nuestra provincia. Uno camina por las calles y lo ve, pero tener el dato concreto golpea diferente. Gran trabajo de investigación.",
    created_at: "2026-07-17 15:14:00",
  },
  {
    id: -20,
    author: "Katya Lechón Maldonado",
    body: "¡Qué orgullo ver este tipo de proyectos saliendo de Imbabura! Demuestra que desde lo local se puede hacer periodismo de calidad nacional. Compartido en todas mis redes. Sigan así, compañeros.",
    created_at: "2026-07-18 08:40:00",
  },
  {
    id: -21,
    author: "Alejandro Bustamante Roldán",
    body: "Saludos desde Lima, Perú. El comercio informal en América Latina tiene raíces similares en todos nuestros países. Su enfoque equilibrado entre lo económico y lo humano es admirable. Se necesitan más voces así.",
    created_at: "2026-07-18 13:28:00",
  },
  {
    id: -22,
    author: "Milagros Conejo Farinango",
    body: "Yo vendo en el mercado de Ilumán desde hace quince años. No es fácil, pero es digno. Gracias por contar nuestra historia sin filtros ni exageraciones. Así se ve la realidad cuando alguien se toma el tiempo de mirar.",
    created_at: "2026-07-18 19:55:00",
  },
  {
    id: -23,
    author: "Rafael Espín Montalvo",
    body: "Lo que más rescato es el equilibrio: escucharon a los comerciantes, a las autoridades y presentaron los datos sin sesgo. En tiempos de polarización, este tipo de periodismo es un respiro.",
    created_at: "2026-07-19 09:10:00",
  },
  {
    id: -24,
    author: "Daniela Cárdenas Villavicencio",
    body: "Vi el reportaje por TikTok y vine a la página a leer todo completo. La profundidad que logran aquí es impresionante. El formato web le da mucha vida a los datos. ¡Felicitaciones al equipo!",
    created_at: "2026-07-19 14:42:00",
  },
  {
    id: -25,
    author: "Segundo Inti Cachimuel",
    body: "Como músico de Peguche, conozco los mercados y ferias de Otavalo desde niño. Son espacios de vida, de encuentro, de cultura. Este reportaje lo captura perfectamente. Rimariy, mashikuna.",
    created_at: "2026-07-19 20:18:00",
  },
  {
    id: -26,
    author: "Francisca Hidrobo Jaramillo",
    body: "Docente de la UTN aquí. Este trabajo tiene nivel de tesis de maestría. La metodología, las fuentes, la presentación visual... todo está cuidado al detalle. Mis felicitaciones al equipo investigador.",
    created_at: "2026-07-20 08:30:00",
  },
  {
    id: -27,
    author: "León Alejandro Mendizábal",
    body: "Desde Ciudad de México: el comercio informal es un tema que nos une como latinoamericanos. Su reportaje tiene la sensibilidad que muchos medios grandes han perdido. Lo voy a compartir con colegas periodistas acá.",
    created_at: "2026-07-20 15:05:00",
  },
  {
    id: -28,
    author: "Rosa Inés Morán Quilumbaquín",
    body: "Mis hijos van a poder leer este reportaje y entender por qué su abuela madruga cada día para ir al mercado. No es solo vender, es resistir, es dignidad pura. Gracias por dejarlo registrado para las futuras generaciones.",
    created_at: "2026-07-20 19:47:00",
  },
  {
    id: -29,
    author: "Esteban Corrales Montenegro",
    body: "Vengo de Esmeraldas y la diversidad de nuestro país siempre me sorprende. Este reportaje muestra una cara de la Sierra que no siempre llega a la Costa. El comercio informal tiene mil caras y ustedes supieron mostrarlas con humanidad.",
    created_at: "2026-07-21 07:15:00",
  },
];
