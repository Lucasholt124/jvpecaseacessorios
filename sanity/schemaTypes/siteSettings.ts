import { defineField, defineType } from "sanity"

export default defineType({
  name: "siteSettings",
  title: "Configurações do Site",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Título do Site",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Descrição do Site",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "keywords",
      title: "Palavras-chave SEO",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
    }),
    defineField({
      name: "socialMedia",
      title: "Redes Sociais",
      type: "object",
      fields: [
        {
          name: "facebook",
          title: "Facebook",
          type: "url",
        },
        {
          name: "instagram",
          title: "Instagram",
          type: "url",
        },
        {
          name: "whatsapp",
          title: "WhatsApp",
          type: "string",
        },
        {
          name: "email",
          title: "Email",
          type: "email",
        },
      ],
    }),
    defineField({
      name: "shipping",
      title: "Configurações de Frete",
      type: "object",
      fields: [
        {
          name: "freeShippingMinValue",
          title: "Valor Mínimo para Frete Grátis",
          type: "number",
          validation: (Rule) => Rule.min(0),
        },
        {
          name: "defaultShippingCost",
          title: "Custo Padrão do Frete",
          type: "number",
          validation: (Rule) => Rule.min(0),
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Configurações do Site",
      }
    },
  },
})
