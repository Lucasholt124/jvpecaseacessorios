import { defineField, defineType } from "sanity"

export default defineType({
  name: "product",
  title: "Produtos",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nome do Produto",
      type: "string",
      validation: (Rule) => Rule.required().min(3).max(100),
    }),
    defineField({
      name: "slug",
      title: "URL do Produto",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descrição",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "price",
      title: "Preço",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: "compareAtPrice",
      title: "Preço Original (para desconto)",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "category",
      title: "Categoria",
      type: "reference",
      to: [{ type: "category" }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "images",
      title: "Imagens do Produto",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "Texto Alternativo",
            },
          ],
        },
      ],
      validation: (Rule) => Rule.required().min(1).max(10),
    }),
    defineField({
      name: "video",
      title: "Vídeo do Produto",
      type: "file",
      options: {
        accept: "video/*",
      },
    }),
    defineField({
      name: "stock",
      title: "Estoque",
      type: "number",
      validation: (Rule) => Rule.required().min(0),
      initialValue: 0,
    }),
    defineField({
      name: "sku",
      title: "Código SKU",
      type: "string",
    }),
    defineField({
      name: "weight",
      title: "Peso (kg)",
      type: "number",
      validation: (Rule) => Rule.min(0),
    }),
    defineField({
      name: "dimensions",
      title: "Dimensões",
      type: "object",
      fields: [
        {
          name: "length",
          title: "Comprimento (cm)",
          type: "number",
        },
        {
          name: "width",
          title: "Largura (cm)",
          type: "number",
        },
        {
          name: "height",
          title: "Altura (cm)",
          type: "number",
        },
      ],
    }),
    defineField({
      name: "specifications",
      title: "Especificações",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "name",
              title: "Nome",
              type: "string",
            },
            {
              name: "value",
              title: "Valor",
              type: "string",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "isFeatured",
      title: "Produto em Destaque",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "isActive",
      title: "Produto Ativo",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      fields: [
        {
          name: "title",
          title: "Título SEO",
          type: "string",
          validation: (Rule) => Rule.max(60),
        },
        {
          name: "description",
          title: "Descrição SEO",
          type: "text",
          rows: 3,
          validation: (Rule) => Rule.max(160),
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "images.0",
      price: "price",
      stock: "stock",
    },
    prepare(selection) {
      const { title, media, price, stock } = selection
      return {
        title,
        subtitle: `R$ ${price?.toFixed(2)} - Estoque: ${stock}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: "Nome A-Z",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
    {
      title: "Preço Crescente",
      name: "priceAsc",
      by: [{ field: "price", direction: "asc" }],
    },
    {
      title: "Mais Recentes",
      name: "dateDesc",
      by: [{ field: "_createdAt", direction: "desc" }],
    },
  ],
})
