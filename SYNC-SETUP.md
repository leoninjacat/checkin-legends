# Sincronização da equipe (Supabase)

Esta funcionalidade é **opcional** e não substitui o salvamento local. Não publique dados reais de atletas no repositório.

1. Crie um projeto Supabase e execute `supabase/schema.sql` no SQL Editor.
2. Em Authentication, crie/convide as contas da equipe. Desative cadastros públicos, se não quiser permitir solicitações de conta.
3. No SQL Editor, insira os IDs de cada conta autorizada em `public.legends_members` (veja exemplo no SQL). **Só pessoas incluídas nessa tabela acessam as listas**.
4. Copie `cloud-config.example.js` para `cloud-config.js` e preencha URL e chave **publishable/anon** do projeto. Nunca use a chave `service_role` no navegador.
5. Publique `cloud-config.js` junto do site. A chave pública pode ser exposta: a proteção efetiva é feita por Auth + RLS.
6. Abra **Listas da equipe** no menu, faça login e use **Salvar na nuvem** ou **Abrir da nuvem**.

O aplicativo mantém os registros locais atuais. Salvar na nuvem é uma ação explícita; listas locais antigas podem ser abertas e enviadas para a nuvem. A verificação de `revision` evita sobrescrever silenciosamente uma versão alterada por outra pessoa, mas **não combina alterações concorrentes**. Para isso, reabra a lista e reconcilie manualmente. É necessário internet para acessar a nuvem. Não armazene senhas nem chaves administrativas no repositório.
