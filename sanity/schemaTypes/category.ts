import { defineField, defineType } from "sanity"

export default defineType({
  name: "category",
  title: "Categorias",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nome da Categoria",
      type: "string",
      validation: (Rule) => Rule.required().min(2).max(50),
    }),
    defineField({
      name: "slug",
      title: "URL da Categoria",
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
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Imagem da Categoria",
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
    }),
    defineField({
      name: "color",
      title: "Cor da Categoria",
      type: "color",
    }),
    defineField({
      name: "order",
      title: "Ordem de Exibição",
      type: "number",
      validation: (Rule) => Rule.min(0),
      initialValue: 0,
    }),
    defineField({
      name: "isActive",
      title: "Categoria Ativa",
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
      media: "image",
      order: "order",
    },
    prepare(selection) {
      const { title, media, order } = selection
      return {
        title,
        subtitle: `Ordem: ${order}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: "Ordem",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Nome A-Z",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
})
