# Configuração Completa - Migração Stripe para Mercado Pago

## 1. Instalação das Dependências

\`\`\`bash
npm install mercadopago
npm uninstall stripe @stripe/stripe-js
\`\`\`

## 2. Variáveis de Ambiente

Adicione no seu arquivo `.env.local`:

\`\`\`env
# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=seu_access_token_aqui
MERCADOPAGO_PUBLIC_KEY=sua_public_key_aqui

# URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Sanity (mantenha as existentes)
NEXT_PUBLIC_SANITY_PROJECT_ID=seu_project_id
NEXT_PUBLIC_SANITY_DATASET=production

# Neon Database (mantenha as existentes)
DATABASE_URL=sua_database_url
\`\`\`

### Como obter as credenciais do Mercado Pago:

1. Acesse: https://www.mercadopago.com.br/developers
2. Faça login na sua conta
3. Vá em "Suas integrações" > "Criar aplicação"
4. Escolha "Pagamentos online e presenciais"
5. Copie o `Access Token` e `Public Key`

**IMPORTANTE**: Use as credenciais de teste durante desenvolvimento!

## 3. Estrutura de Arquivos para Substituir

### Arquivos para DELETAR:
- `lib/stripe-actions.ts`
- `app/api/stripe/webhooks/route.ts`
- `app/stripe/success/page.tsx`
- Qualquer componente relacionado ao Stripe

### Arquivos para CRIAR/SUBSTITUIR:
- `lib/mercadopago.ts` ✅
- `lib/mercadopago-actions.ts` ✅
- `app/api/mercadopago/webhooks/route.ts` ✅
- `app/api/mercadopago/create-preference/route.ts` ✅
- `app/mercadopago/success/page.tsx` ✅
- `app/mercadopago/failure/page.tsx` ✅
- `app/mercadopago/pending/page.tsx` ✅
- `components/checkout-button.tsx` ✅

## 4. Configuração do Webhook

### No painel do Mercado Pago:
1. Vá em "Suas integrações"
2. Selecione sua aplicação
3. Configure o webhook para: `https://seudominio.com/api/mercadopago/webhooks`
4. Selecione os eventos: `payment`

### Para desenvolvimento local (usando ngrok):
\`\`\`bash
# Instale o ngrok
npm install -g ngrok

# Execute seu projeto Next.js
npm run dev

# Em outro terminal, exponha a porta 3000
ngrok http 3000

# Use a URL do ngrok no webhook: https://abc123.ngrok.io/api/mercadopago/webhooks
\`\`\`

## 5. Integração com Sanity

O código já está preparado para funcionar com Sanity. Certifique-se de que seus produtos no Sanity tenham esta estrutura:

\`\`\`javascript
// Schema do produto no Sanity
export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
    },
    {
      name: 'image',
      title: 'Image',
      type: 'image',
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
  ],
}
\`\`\`

## 6. Integração com Prisma/Neon

Para salvar pedidos no banco, adicione este schema ao seu `schema.prisma`:

\`\`\`prisma
model Order {
  id                String   @id @default(cuid())
  paymentId         String   @unique
  externalReference String
  status            String
  amount            Float
  payerEmail        String
  paymentMethod     String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("orders")
}
\`\`\`

Execute a migração:
\`\`\`bash
npx prisma db push
\`\`\`

## 7. Fluxo de Pagamento

1. **Usuário adiciona produtos ao carrinho** → `cart-actions.ts`
2. **Usuário clica em "Finalizar Compra"** → `checkout-button.tsx`
3. **Sistema cria preferência no Mercado Pago** → `mercadopago-actions.ts`
4. **Usuário é redirecionado para checkout** → Mercado Pago
5. **Após pagamento, usuário retorna** → `success/failure/pending`
6. **Webhook processa o pagamento** → `webhooks/route.ts`
7. **Pedido é salvo no banco** → Prisma

## 8. Testando a Integração

### Dados de teste do Mercado Pago:

**Cartões de Crédito:**
- **Aprovado**: 4509 9535 6623 3704
- **Recusado**: 4234 1234 1234 1234
- **Pendente**: 4389 3540 6624 0016

**Dados do portador:**
- Nome: APRO (aprovado) / OTHE (recusado)
- CPF: 12345678909
- Data de vencimento: 11/25
- CVV: 123

## 9. Comandos para Executar

\`\`\`bash
# 1. Instalar dependências
npm install mercadopago

# 2. Remover Stripe
npm uninstall stripe @stripe/stripe-js

# 3. Executar o projeto
npm run dev

# 4. Para produção, fazer build
npm run build
\`\`\`

## 10. Checklist de Migração

- [ ] Instalar dependências do Mercado Pago
- [ ] Remover dependências do Stripe
- [ ] Configurar variáveis de ambiente
- [ ] Copiar todos os arquivos fornecidos
- [ ] Deletar arquivos antigos do Stripe
- [ ] Configurar webhook no painel do Mercado Pago
- [ ] Testar fluxo completo de pagamento
- [ ] Verificar integração com Sanity
- [ ] Testar webhook com ngrok
- [ ] Configurar schema do banco para pedidos

## 11. Troubleshooting

### Erro: "Access token inválido"
- Verifique se está usando as credenciais corretas
- Certifique-se de usar credenciais de teste em desenvolvimento

### Webhook não funciona
- Verifique se a URL está correta
- Use ngrok para desenvolvimento local
- Verifique os logs do console

### Produtos não aparecem
- Verifique a conexão com Sanity
- Confirme se o schema dos produtos está correto

### Carrinho não funciona
- Verifique se os cookies estão habilitados
- Confirme se as server actions estão funcionando

## 12. Próximos Passos

Após a migração:
1. Implementar autenticação de usuários
2. Adicionar histórico de pedidos
3. Implementar sistema de cupons
4. Adicionar notificações por email
5. Configurar analytics de conversão

## 13. Recursos Úteis

- [Documentação Mercado Pago](https://www.mercadopago.com.br/developers/pt)
- [SDK Node.js](https://github.com/mercadopago/sdk-nodejs)
- [Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing)
- [Webhooks](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks)
