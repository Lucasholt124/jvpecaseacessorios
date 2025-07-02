import { defineField, defineType } from "sanity"

export default defineType({
  name: "banner",
  title: "Banners",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (Rule) => Rule.required().min(3).max(100),
    }),
    defineField({
      name: "subtitle",
      title: "Subtítulo",
      type: "string",
      validation: (Rule) => Rule.max(150),
    }),
    defineField({
      name: "description",
      title: "Descrição",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "image",
      title: "Imagem do Banner",
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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "buttonText",
      title: "Texto do Botão",
      type: "string",
    }),
    defineField({
      name: "buttonLink",
      title: "Link do Botão",
      type: "string",
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
      title: "Banner Ativo",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "startDate",
      title: "Data de Início",
      type: "datetime",
    }),
    defineField({
      name: "endDate",
      title: "Data de Fim",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "title",
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
  ],
})
