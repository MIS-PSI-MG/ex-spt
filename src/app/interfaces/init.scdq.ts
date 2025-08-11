const initScdq = [
  {
    id: "03",
    departement: "M&E",
    niveau: 51,
    sections: [
      {
        title: "Revue de l’exactitude des données rapportées par la FS",
        maxScore: 6,
        score: Number,
        subsection: {
          title: "Liste de contrôle de l’Exactitude des Données",
          instruction:
            "Sélectionner au hasard des indicateurs à partir du formulaire de la base de données CSB",
          questions: [
            {
              subquestion: {
                q: "Nombre cas de fièvre toutes causes",
                sq: [
                  {
                    mois: "Mois 1",
                    element1: {
                      name: "Nombre dans l'outils de rapportage (RMA) (2)",
                      number: Number,
                    },
                    element2: {
                      name: "Nombre recompté dans les outils de collecte de données (3)",
                      number: Number,
                    },
                    element3: {
                      name: "Taux de rapportage : Rapport ou Base de données (2)/Recompte (3)",
                      number: Number,
                    },
                    eval: {
                      name: "Y a-t-il concordance entre colonne (2) et colonne (3)",
                      score: 1,
                    },
                  },
                  {
                    mois: "Mois 2",
                    element1: {
                      name: "Nombre dans l'outils de rapportage (RMA) (2)",
                      number: Number,
                    },
                    element2: {
                      name: "Nombre recompté dans les outils de collecte de données (3)",
                      number: Number,
                    },
                    element3: {
                      name: "Taux de rapportage : Rapport ou Base de données (2)/Recompte (3)",
                      number: Number,
                    },
                    eval: {
                      name: "Y a-t-il concordance entre colonne (2) et colonne (3)",
                      score: 1,
                    },
                  },
                  {
                    mois: "Mois 3",
                    element1: {
                      name: "Nombre dans l'outils de rapportage (RMA) (2)",
                      number: Number,
                    },
                    element2: {
                      name: "Nombre recompté dans les outils de collecte de données (3)",
                      number: Number,
                    },
                    element3: {
                      name: "Taux de rapportage : Rapport ou Base de données (2)/Recompte (3)",
                      number: Number,
                    },
                    eval: {
                      name: "Y a-t-il concordance entre colonne (2) et colonne (3)",
                      score: 1,
                    },
                  },
                ],
              },
            },
            {
              subquestion: {
                q: "Nombre total de cas de fièvre tésté par RDT",
                sq: [
                  {
                    mois: "Mois 1",
                    element1: {
                      name: "Nombre dans l'outils de rapportage (RMA) (2)",
                      number: Number,
                    },
                    element2: {
                      name: "Nombre recompté dans les outils de collecte de données (3)",
                      number: Number,
                    },
                    element3: {
                      name: "Taux de rapportage : Rapport ou Base de données (2)/Recompte (3)",
                      number: Number,
                    },
                    eval: {
                      name: "Y a-t-il concordance entre colonne (2) et colonne (3)",
                      score: 1,
                    },
                  },
                  {
                    mois: "Mois 2",
                    element1: {
                      name: "Nombre dans l'outils de rapportage (RMA) (2)",
                      number: Number,
                    },
                    element2: {
                      name: "Nombre recompté dans les outils de collecte de données (3)",
                      number: Number,
                    },
                    element3: {
                      name: "Taux de rapportage : Rapport ou Base de données (2)/Recompte (3)",
                      number: Number,
                    },
                    eval: {
                      name: "Y a-t-il concordance entre colonne (2) et colonne (3)",
                      score: 1,
                    },
                  },
                  {
                    mois: "Mois 3",
                    element1: {
                      name: "Nombre dans l'outils de rapportage (RMA) (2)",
                      number: Number,
                    },
                    element2: {
                      name: "Nombre recompté dans les outils de collecte de données (3)",
                      number: Number,
                    },
                    element3: {
                      name: "Taux de rapportage : Rapport ou Base de données (2)/Recompte (3)",
                      number: Number,
                    },
                    eval: {
                      name: "Y a-t-il concordance entre colonne (2) et colonne (3)",
                      score: 1,
                    },
                  },
                ],
              },
            },
            {
              subquestion: {
                q: "Nombre total de RDT+",
                sq: [
                  {
                    mois: "Mois 1",
                    element1: {
                      name: "Nombre dans l'outils de rapportage (RMA) (2)",
                      number: Number,
                    },
                    element2: {
                      name: "Nombre recompté dans les outils de collecte de données (3)",
                      number: Number,
                    },
                    element3: {
                      name: "Taux de rapportage : Rapport ou Base de données (2)/Recompte (3)",
                      number: Number,
                    },
                    eval: {
                      name: "Y a-t-il concordance entre colonne (2) et colonne (3)",
                      score: 1,
                    },
                  },
                  {
                    mois: "Mois 2",
                    element1: {
                      name: "Nombre dans l'outils de rapportage (RMA) (2)",
                      number: Number,
                    },
                    element2: {
                      name: "Nombre recompté dans les outils de collecte de données (3)",
                      number: Number,
                    },
                    element3: {
                      name: "Taux de rapportage : Rapport ou Base de données (2)/Recompte (3)",
                      number: Number,
                    },
                    eval: {
                      name: "Y a-t-il concordance entre colonne (2) et colonne (3)",
                      score: 1,
                    },
                  },
                  {
                    mois: "Mois 3",
                    element1: {
                      name: "Nombre dans l'outils de rapportage (RMA) (2)",
                      number: Number,
                    },
                    element2: {
                      name: "Nombre recompté dans les outils de collecte de données (3)",
                      number: Number,
                    },
                    element3: {
                      name: "Taux de rapportage : Rapport ou Base de données (2)/Recompte (3)",
                      number: Number,
                    },
                    eval: {
                      name: "Y a-t-il concordance entre colonne (2) et colonne (3)",
                      score: 1,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
]
