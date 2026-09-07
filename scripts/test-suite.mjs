#!/usr/bin/env node
/*
 * LA SUITE, EN UN SOLO COMANDO — y con su denominador impreso.
 *
 * POR QUÉ EXISTE. Había **43 scripts `test:*` en `package.json` y ningún `test` agregado**: correr
 * «la suite» exigía teclear 43 comandos, así que en la práctica nadie la corría entera y el CI no
 * corría NINGUNO —`deploy.yml` hace `build`+`generate`, `firebase-deploy.yml` hace `build`, y solo
 * un workflow toca las reglas—. Las pruebas de tesorería, caja, cartera, pedidos, saldo,
 * reconciliación y wompi —todo lo que mueve DINERO— existían y no las ejercitaba nadie.
 * Es la familia de [[L-56]] en su forma más cara: *un gate que existe y no corre no es media
 * protección, es ninguna*. Auditoría Nivel-2 del 2026-08-26, hallazgo B-01.
 *
 * CÓMO PARTE, y por qué NO por el nombre del fichero. La primera versión separó por
 * `*.integration.test.mjs` y salió mal en las dos direcciones: `tests/firestore-rules.test.mjs` NO
 * lleva «integration» y necesita el emulador, y siete que sí lo llevan no lo necesitan. Se clasifica
 * por lo que el fichero HACE —si toca Firestore, `firebase-admin` o la librería de reglas—, no por
 * cómo se llama. Así un fichero nuevo cae solo en su cubo y nadie tiene que mantener una lista.
 *
 * Medido el 2026-08-26: **48 ficheros sin emulador → 540 pruebas, 540 pasan, 0 fallan, 0,85 s**.
 * Ese tiempo es el argumento: no hay excusa para que esto no corra en cada push.
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** Señales de que la prueba habla con Firestore y necesita el emulador levantado. */
const NECESITA_EMULADOR = [
  'rules-unit-testing',
  'initializeTestEnvironment',
  'FIRESTORE_EMULATOR',
  '8080',
  'firebase-admin',
  'getFirestore',
  'initializeApp',
];

const CARPETAS = ['functions', 'tests'];
const conEmulador = [];
const sinEmulador = [];

for (const dir of CARPETAS) {
  let entradas = [];
  try {
    entradas = readdirSync(dir);
  } catch {
    continue;
  }
  for (const nombre of entradas.sort()) {
    if (!nombre.endsWith('.test.mjs')) continue;
    const ruta = `${dir}/${nombre}`;
    const texto = readFileSync(join(dir, nombre), 'utf8');
    (NECESITA_EMULADOR.some((s) => texto.includes(s)) ? conEmulador : sinEmulador).push(ruta);
  }
}

/*
 * Modo `--emulador`: corre las OTRAS. Va dentro de un `firebase emulators:exec`, que es quien
 * levanta Firestore y exporta la variable que esas pruebas esperan. Por eso no se mezclan:
 * arrancar el emulador para 540 pruebas que no lo necesitan cuesta segundos por nada.
 */
const soloEmulador = process.argv.includes('--emulador');
const objetivo = soloEmulador ? conEmulador : sinEmulador;

if (soloEmulador && !objetivo.length) {
  console.error('❌ test:emulador — ninguna prueba pide emulador. O la señal cambió, o se movieron.');
  process.exit(1);
}

if (!sinEmulador.length) {
  console.error('❌ test — no encontré NINGÚN fichero `*.test.mjs`. Un runner que no abre nada pasa en verde sobre nada.');
  process.exit(1);
}

console.log(
  soloEmulador
    ? `▶ suite CON emulador: ${conEmulador.length} fichero(s)`
    : `▶ suite sin emulador: ${sinEmulador.length} fichero(s)` +
        ` · aparte quedan ${conEmulador.length} que exigen emulador (npm run test:emulador)`,
);


const r = spawnSync(process.execPath, ['--test', ...objetivo], { stdio: 'inherit' });
process.exit(r.status ?? 1);
