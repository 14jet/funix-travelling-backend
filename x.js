db.entities.aggregate([
  {
    $search: {
      compound: {
        should: [
          {
            autocomplete: {
              query: search,
              path: "name",
            },
          },
          {
            autocomplete: {
              query: search,
              path: "journey",
            },
          },
          {
            autocomplete: {
              query: search,
              path: "countries",
            },
          },
          {
            embeddedDocument: {
              path: "translation",
              operator: {
                compound: {
                  should: [
                    {
                      autocomplete: {
                        path: "translation.name",
                        query: search,
                      },
                    },
                    {
                      autocomplete: {
                        path: "translation.countries",
                        query: search,
                      },
                    },
                    {
                      autocomplete: {
                        path: "translation.journey",
                        query: search,
                      },
                    },
                  ],
                },
              },
            },
          },
        ],
      },
    },
  },
]);
