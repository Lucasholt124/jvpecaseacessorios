# 🚛 JV Peças e Acessórios - E-commerce B2B/B2C

Sistema de comércio eletrônico completo desenvolvido para o segmento de autopeças pesadas (caminhões). O projeto foi focado em robustez, facilidade de gerenciamento de catálogo complexo e integração de pagamentos.

## 🌐 Live Demo
Confira o projeto em produção: [jvpecaseacessorios.vercel.app](https://jvpecaseacessorios.vercel.app)

## 🛠️ Stack Tecnológica

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/) via **Neon DB** (Serverless)
- **ORM:** [Prisma](https://www.prisma.io/)
- **CMS Headless:** [Sanity.io](https://www.sanity.io/) (Gestão de inventário e banners)
- **Pagamentos:** Integração nativa com **Mercado Pago**
- **Autenticação & Middleware:** Proteção de checkout e rotas de usuário.

## 🚀 Funcionalidades de Negócio

- **Checkout Integrado:** Fluxo completo de carrinho e pagamento automatizado via Mercado Pago API.
- **Gestão de Catálogo:** Interface simplificada para o lojista cadastrar peças, categorias e variações via Sanity.
- **Arquitetura Serverless:** Implementação utilizando Neon DB para alta escalabilidade e baixa latência.
- **Segurança:** Implementação de middlewares para validação de sessões e proteção de dados sensíveis.
- **Design Industrial:** UI focada na clareza e facilidade de busca para o setor automotivo.

## 📂 Estrutura Técnica

- `/prisma`: Schema e migrações para o banco de dados PostgreSQL.
- `/aplicativo`: Lógica de rotas, checkout e Server Actions.
- `/componentes`: Biblioteca de componentes reutilizáveis.
- `/biblioteca`: Integrações de APIs de terceiros (Pagamentos e Consultas).
- `/sanidade`: Configuração da estrutura do CMS Headless.

## ⚙️ Configuração Local

1. Clone o repositório:
   ```bash
   git clone [https://github.com/Lucasholt124/jvpecaseacessorios.git](https://github.com/Lucasholt124/jvpecaseacessorios.git)


   Desenvolvido por Lucas Aragão Soluções de software que impulsionam negócios reais.
