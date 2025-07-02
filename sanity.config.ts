import React from "react"
import { defineConfig } from "sanity"
import { deskTool } from "sanity/desk"
import { visionTool } from "@sanity/vision"
import { colorInput } from "@sanity/color-input"
import { imageHotspotArrayPlugin } from "sanity-plugin-hotspot-array"
import { media, mediaAssetSource } from "sanity-plugin-media"

import { schemaTypes } from "./sanity/schemaTypes"
import { apiVersion, dataset, projectId } from "./sanity/env"

export default defineConfig({
  name: "default",
  title: "JVPECASEACESSORIOS - Admin",

  projectId,
  dataset,
  apiVersion,

  basePath: "/studio",

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title("Conteúdo")
          .items([
            S.listItem().title("Produtos").child(S.documentTypeList("product").title("Produtos")),
            S.listItem().title("Categorias").child(S.documentTypeList("category").title("Categorias")),
            S.listItem().title("Banners").child(S.documentTypeList("banner").title("Banners")),
            S.listItem()
              .title("Configurações")
              .child(
                S.list()
                  .title("Configurações")
                  .items([
                    S.listItem()
                      .title("Configurações Gerais")
                      .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
                  ]),
              ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
    colorInput(),
    imageHotspotArrayPlugin(),
    media(),
  ],

  form: {
    file: {
      assetSources: (previousAssetSources) => {
        return previousAssetSources.filter((assetSource) => assetSource !== mediaAssetSource)
      },
    },
    image: {
      assetSources: (previousAssetSources) => {
        return previousAssetSources.filter((assetSource) => assetSource === mediaAssetSource)
      },
    },
  },

  schema: {
    types: schemaTypes,
  },

  studio: {
    components: {
      logo: function Logo() {
        return React.createElement(
          "div",
          {
            style: {
              padding: "0.5rem",
              fontWeight: "bold",
              color: "#667eea",
              fontSize: "14px",
            },
          },
          "JVPECASEACESSORIOS"
        );
      },
    },
  },
})
