# ENEM Study

Plataforma estática de simulados, feita em HTML, CSS e JavaScript puro, preparada para GitHub Pages.

## Banco de questões

O banco contém **317 entradas**: 50 questões autorais, 137 questões do ENEM 2020 e 130 questões do ENEM 2021 que passaram pelo filtro de elementos visuais. Foram retiradas 46 entradas do ENEM 2020 que mencionavam ou aparentavam depender de imagens, figuras, gráficos, tabelas, quadros, charges, tirinhas, mapas ou diagramas. Há **311 questões de origem distintas**, pois as versões em inglês e espanhol das questões 1–5 de cada ano são tratadas como variantes da mesma questão no sorteio. As questões anuladas 114 e 141 do ENEM 2020 não entram no banco; a questão 178 do segundo dia de 2021 também foi omitida por estar anulada no gabarito oficial.

Os PDFs originais e os gabaritos estão em `assets/originals/`. As questões de 2020 e 2021 foram filtradas para excluir itens com elementos visuais identificados pelo texto do enunciado; esse filtro é heurístico e pode não detectar todos os casos ou excluir algum item que pudesse ser resolvido sem a imagem. As questões de 2021 foram transcritas a partir dos cadernos por OCR. Foram descartadas 54 entradas que mencionavam ou dependiam de imagens, figuras, gráficos, tabelas, quadros, charges, tirinhas, mapas ou que estavam sinalizadas para revisão visual por falhas de OCR. Restaram 130 questões de 2021. Em parte delas, o OCR não permitiu separar as cinco alternativas com confiança, então elas aparecem no enunciado transcrito e os botões indicam a ordem A–E. O site mantém um link para a página original de cada questão, e a correção utiliza o gabarito oficial anexado. As transcrições restantes ainda podem conter erros; confira o PDF original quando algum trecho parecer estranho. As resoluções passo a passo das questões oficiais ainda não estão cadastradas.

O sorteio aleatório evita repetir uma questão já utilizada em tentativas concluídas enquanto houver questões de origem inéditas. Também evita selecionar duas vezes a mesma questão apenas por haver versões em inglês e espanhol.

## Como funciona a seleção dos simulados

- O modo padrão gera um simulado aleatório com 50 questões.
- É possível escolher 10, 20, 30, 50, 90, 120, 150, 180, 200, 240, 300, 350, 400 ou todas as 311 questões de origem distintas.
- Cada novo simulado prioriza questões que não apareceram nas tentativas concluídas anteriormente.
- Se restarem menos questões inéditas do que o tamanho escolhido, o sistema completa a sessão com questões já usadas, sem duplicar uma questão dentro do mesmo simulado.
- Também há opções para fazer o banco inteiro, revisar erros, estudar questões ainda não acertadas e filtrar por área.
- O embaralhamento das alternativas preserva o vínculo com a letra correta original.

## Tecnologias e arquivos

- `index.html`: estrutura da página.
- `styles.css`: estilo responsivo e temas.
- `app.js`: navegação, simulado, resultados e revisão.
- `grading.js`: correção, embaralhamento e seleção de questões inéditas.
- `questions.js`: banco editável de questões, transcrições OCR e referências aos cadernos oficiais.
- `assets/originals/`: PDFs do ENEM 2020 e 2021 usados como fontes das questões e para conferência.
- `test/`: testes automatizados.
- `.github/workflows/deploy.yml`: testes e publicação automática no GitHub Pages.

Não é necessário React, Vite, servidor próprio, banco de dados externo, chave de API ou dependência paga.

## Executar localmente

Requer Node.js 18 ou superior para rodar os testes. Para abrir o site, pode abrir `index.html` no navegador. Para servir os arquivos localmente, na pasta do projeto execute:

```bash
npx serve .
```

Para rodar os testes:

```bash
node --test test/*.test.js
```

## Publicar no GitHub Pages

1. Crie um repositório no GitHub, por exemplo `enem-study`.
2. Envie **todo o conteúdo desta pasta**, incluindo `assets/` e `.github/`, para a branch `main`.
3. No repositório, abra **Settings → Pages**.
4. Em **Build and deployment**, escolha **GitHub Actions** como fonte.
5. A cada envio para `main`, o workflow executa os testes e publica o site. Também é possível iniciá-lo manualmente na aba **Actions**.
6. O endereço público aparece em **Settings → Pages** depois que a publicação terminar.

O workflow copia os arquivos do site e os PDFs originais para a pasta publicada, para que os links das páginas dos cadernos funcionem.

## Editar ou adicionar questões

Edite `questions.js`. Cada objeto pode conter:
- `id`: identificador único;
- `area`, `subject` e `topic`;
- `statement`;
- `alternatives` com as chaves `A`, `B`, `C`, `D` e `E`;
- `correctAnswer`;
- `explanation` e `alternativeExplanations`;
- `source`, `sourcePdf` e `sourcePage` para indicar uma fonte oficial e abrir a página original.

Use IDs únicos e mantenha as alternativas na ordem A–E. Se embaralhar alternativas, as respostas continuam sendo corrigidas pelas letras originais. Após editar, rode os testes.

## Salvamento e privacidade

As respostas, tentativas e revisões são salvas no `localStorage` do navegador e dispositivo atual. Não existe sincronização automática entre aparelhos. Os dados podem ser exportados e importados em JSON pela tela inicial.
