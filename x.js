const text = 2;

const agg = [
  {
    $search: {
      compound: {
        should: [
          {
            autocomplete: {
              query: text,
              path: "name",
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
                        query: "search query input",
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
];
