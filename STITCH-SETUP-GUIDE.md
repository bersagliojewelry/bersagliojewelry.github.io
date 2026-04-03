# Guia de configuracion: Stitch MCP + Claude Code

Guia completa para vincular Google Stitch con Claude Code en cualquier repositorio.
Basada en la experiencia de configuracion del proyecto Bersaglio Jewelry (abril 2026).

---

## Que es Stitch?

Stitch es una herramienta de diseno AI de Google Labs que genera interfaces UI desde
descripciones de texto. Se conecta a Claude Code via MCP (Model Context Protocol) para
que Claude pueda disenar pantallas y luego implementarlas en codigo.

**Herramientas disponibles:**
- `generate_screen_from_text` — Crear disenos nuevos desde texto
- `edit_screens` — Modificar disenos existentes
- `generate_variants` — Crear variantes de un diseno
- `list_projects` / `list_screens` — Ver proyectos y pantallas existentes
- `get_project` / `get_screen` — Obtener detalles de un proyecto o pantalla
- `create_project` — Crear un nuevo proyecto
- `create_design_system` — Crear sistema de diseno con tokens
- `apply_design_system` — Aplicar sistema de diseno a pantallas

---

## Requisitos previos

1. **Node.js** instalado (v18+) — https://nodejs.org
2. **Claude Code CLI** instalado:
   ```powershell
   npm install -g @anthropic-ai/claude-code
   ```
3. **Cuenta de Claude** (Pro, Max, Team o Enterprise)
4. **API Key de Stitch** — obtenida en https://stitch.withgoogle.com

---

## Paso 1: Obtener la API Key de Stitch

1. Ve a https://stitch.withgoogle.com
2. Inicia sesion con tu cuenta de Google
3. Busca en la configuracion o perfil la opcion "API Key"
4. Copia la clave (formato: `AQ.xxxxxxxxxxxx`)

---

## Paso 2: Configurar Stitch en Claude Code

### Metodo rapido (recomendado) — Una sola vez, aplica a todos los proyectos

Abre una terminal/PowerShell y ejecuta:

```powershell
claude mcp add stitch --transport http https://stitch.googleapis.com/mcp --header "X-Goog-Api-Key: TU_API_KEY_AQUI" -s user
```

**Nota:** El flag `-s user` guarda la configuracion en `~/.claude.json` (nivel usuario),
lo que significa que Stitch estara disponible en TODOS tus proyectos automaticamente.

### Verificar que se guardo

```powershell
# Windows
cat C:\Users\TU_USUARIO\.claude.json

# Mac/Linux
cat ~/.claude.json
```

Deberia mostrar algo como:
```json
{
  "mcpServers": {
    "stitch": {
      "type": "http",
      "url": "https://stitch.googleapis.com/mcp",
      "headers": {
        "X-Goog-Api-Key": "AQ.xxxxxxxxxxxx"
      }
    }
  }
}
```

---

## Paso 3: Crear CLAUDE.md en tu proyecto (opcional pero recomendado)

Crea un archivo `CLAUDE.md` en la raiz de tu repositorio con instrucciones para que
Claude siempre use Stitch al disenar. Ejemplo:

```markdown
# Mi Proyecto - Instrucciones para Claude

## Diseno con Stitch
Siempre que te pida disenar algo, usa las herramientas de Stitch MCP:
1. Usa `generate_screen_from_text` para crear disenos nuevos.
2. Usa `edit_screens` para modificar disenos existentes.
3. Usa `generate_variants` para crear variantes.
4. Despues de generar el diseno, implementa el resultado en el codigo del proyecto.

## Paleta de colores
- (tus colores aqui)

## Estilo de diseno
- (tu estilo aqui)
```

---

## Paso 4: Usar Stitch

### Desde Claude Code CLI
```powershell
cd tu-proyecto
claude
```

Luego escribe prompts como:
- "Disena una landing page moderna para mi proyecto"
- "Genera una pantalla de login con estilo minimalista"
- "Crea variantes del diseno de mi pagina principal"

### Desde Claude Code Desktop
**IMPORTANTE:** Al momento de esta guia (abril 2026), Claude Code Desktop NO soporta
correctamente servidores MCP con transporte HTTP. Usa el CLI en su lugar.

---

## Donde se guardan las configuraciones

| Archivo | Ubicacion | Proposito |
|---------|-----------|-----------|
| `~/.claude.json` | Home del usuario | Config global (MCP servers, API keys) |
| `.mcp.json` | Raiz del proyecto | Config MCP por proyecto |
| `CLAUDE.md` | Raiz del proyecto | Instrucciones para Claude |
| `.claude/settings.local.json` | Dentro de `.claude/` en el proyecto | Permisos locales |

---

## Errores comunes y soluciones

### "The MCP server 'stitch' is still connecting"
- El servidor HTTP tarda en conectar. Espera unos segundos.
- En Desktop, esto puede significar que no soporta HTTP transport. Usa el CLI.

### "Project ID not found. Set GOOGLE_CLOUD_PROJECT"
- Estas usando el paquete npm `stitch-mcp` en vez de la conexion HTTP directa.
- Solucion: Usa el metodo HTTP directo (Paso 2) en vez del paquete npm.

### "CommandNotFoundException: claude"
- No tienes el CLI de Claude Code instalado.
- Solucion: `npm install -g @anthropic-ai/claude-code`

### Stitch no aparece en las herramientas
- Verifica que `~/.claude.json` tenga la configuracion correcta.
- Reinicia Claude Code (CLI o Desktop).
- En CLI, ejecuta `/mcp` para ver el estado de los servidores MCP.

---

## Notas importantes

- La API Key de Stitch es **permanente** (no expira como los Access Tokens de OAuth).
- La configuracion con `-s user` aplica a **todos** los proyectos. No necesitas
  configurar Stitch de nuevo para cada repositorio nuevo.
- Solo necesitas crear el `CLAUDE.md` en cada proyecto nuevo si quieres que Claude
  use Stitch automaticamente sin que se lo pidas.
- No subas tu API Key a GitHub. Si usas `.mcp.json` con la key, agregalo a `.gitignore`.
- Documentacion oficial: https://stitch.withgoogle.com/docs/mcp/setup

---

## Resumen rapido para nuevos repositorios

Si ya completaste el Paso 2 (configuracion global), para un nuevo proyecto solo necesitas:

1. Crear `CLAUDE.md` con tus instrucciones de diseno
2. Abrir el CLI: `cd mi-nuevo-proyecto && claude`
3. Empezar a disenar: "Disena una pagina de..."

Eso es todo. Stitch ya esta configurado globalmente.
