# Check-in Legends

Aplicativo web instalável para organização e conferência de atletas e serviços em campeonatos Nordeste Legends. Os dados e campeonatos salvos ficam armazenados localmente no navegador.

## Publicação no GitHub Pages

1. Envie todo o conteúdo desta pasta para a raiz do repositório no GitHub.
2. No repositório, abra **Settings → Pages**.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch principal, a pasta **/(root)** e salve.
5. Abra o endereço HTTPS fornecido pelo GitHub Pages.

O aplicativo funciona quando publicado na raiz do domínio ou em uma subpasta de projeto do GitHub Pages.

## Instalação

- No Chrome ou Edge, abra o site e use a opção **Instalar Check-in Legends** na barra de endereço ou no menu do navegador.
- No Android, use **Instalar app** ou **Adicionar à tela inicial**.
- No iPhone ou iPad, abra no Safari, toque em **Compartilhar** e depois em **Adicionar à Tela de Início**.

Depois do primeiro carregamento completo via HTTPS, a interface principal fica disponível offline. Os dados permanecem somente no navegador e não são sincronizados entre aparelhos.

## Atualizações

Ao publicar uma nova versão dos arquivos do aplicativo, altere o valor de `CACHE_NAME` em `service-worker.js` para que instalações existentes recebam o novo pacote offline.

Desenvolvido por LT ARTS.
