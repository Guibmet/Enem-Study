# ENEM Study

Plataforma estática de simulados, feita em HTML, CSS e JavaScript puro, preparada para GitHub Pages.

## Banco de questões

O banco contém **233 questões**:
- 50 questões autorais que já faziam parte do projeto;
- 183 versões de questões extraídas dos cadernos oficiais do ENEM 2020 anexados: Linguagens (incluindo versões em inglês e espanhol das questões 1–5), Ciências Humanas, Ciências da Natureza e Matemática.
- As questões anuladas 114 e 141 do segundo dia não entram no banco de simulados.
- Os PDFs originais estão em `assets/originals/`. Nas questões oficiais, use o link **Abrir página original do caderno (PDF)** para conferir figuras, gráficos e formatação.

**Limitações da extração:** os enunciados e alternativas foram extraídos automaticamente dos PDFs. Em questões com alternativas essencialmente visuais, o site indica que é necessário abrir a página original. A resolução comentada detalhada das questões oficiais ainda não foi cadastrada; o site informa isso claramente, em vez de inventar uma explicação. Antes de usar o banco como material final de estudo, revise os textos extraídos e complete as resoluções.

## Como funciona a seleção dos simulados

- O modo padrão gera um simulado aleatório com 50 questões.
- É possível escolher 10, 20, 30, 50, 90, 120, 150, 180 ou todas as questões.
- Cada novo simulado prioriza questões que não apareceram nas tentativas concluídas anteriormente.
- Se restarem menos questões inéditas do que o tamanho escolhido, o sistema completa a sessão com questões já usadas, sem duplicar uma questão dentro do mesmo simulado.
- Também há opções para fazer o banco inteiro, revisar erros, estudar questões ainda não acertadas e filtrar por área.
- O embaralhamento das alternativas preserva o vínculo com a letra correta original.

## Tecnologias e arquivos

- `index.html`: estrutura da página.
- `styles.css`: estilo responsivo e temas.
- `app.js`: navegação, simulado, resultados e revisão.
- `grading.js`: correção, embaralhamento e seleção de questões inéditas.
- `questions.js`: banco editável de questões.
- `assets/originals/`: PDFs originais usados como referência.
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
