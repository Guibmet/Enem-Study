# ENEM Study

Simulado interativo com as 50 questões do PDF `simulado_enem_50_questoes.pdf` (questões autorais, não oficiais do Inep). Correção automática, resolução comentada, revisão de erros e histórico salvo no navegador.

## Tecnologias
HTML, CSS e JavaScript puro, sem build e sem dependências. Todos os caminhos são relativos, então funciona em subdiretórios do GitHub Pages (`https://usuario.github.io/repositorio/`).

## Executar localmente
Abra `index.html` no navegador ou rode `npx serve .` (ou `python3 -m http.server`) na pasta do projeto. Não há `npm install` nem compilação. Testes: `npm test` (Node 18+).

## Publicar no GitHub Pages
1. Crie um repositório vazio no GitHub (botão **New**), por exemplo `enem-study`.
2. Na pasta do projeto: `git init && git add . && git commit -m "ENEM Study" && git branch -M main && git remote add origin https://github.com/SEU-USUARIO/enem-study.git && git push -u origin main`
3. No repositório: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. Aba **Actions**: aguarde o workflow "Publicar no GitHub Pages" ficar verde. O endereço aparece nele e em Settings → Pages.

## Uso
- **Começar simulado**: escolha o modo (completo, só erros, ainda não acertadas, por área), embaralhar questões/alternativas e cronômetro.
- Durante a prova nada é corrigido. O painel numerado leva a qualquer questão; ⚑ marca para revisão.
- **Finalizar** mostra a confirmação (respondidas/em branco) e depois o resultado. **Ver respostas corretas** mostra sua resposta, a correta e a resolução.
- **Revisar erros**: filtre erradas/em branco, clique em *Tentar novamente*, responda e *Conferir resposta*. Acertos na revisão são registrados sem alterar a tentativa original.
- Os dados ficam no `localStorage` do navegador e do aparelho; não sincronizam sozinhos. Use **Exportar/Importar** para trocar de dispositivo.

## Editar questões, gabarito e explicações
Tudo está em `questions.js`. Cada questão tem `id`, `area`, `subject`, `statement`, `alternatives` (A–E), `correctAnswer`, `explanation` e `alternativeExplanations` (por letra original). Não cite letras de alternativas nas explicações: com alternativas embaralhadas as letras exibidas mudam. Rode `npm test` depois de editar.

## Conferência do gabarito
Todas as respostas numéricas (questões 9–18, 30, 32, 36, 38, 40) foram recalculadas e as demais conferidas conceitualmente; nenhuma divergência com o gabarito do PDF foi encontrada.
