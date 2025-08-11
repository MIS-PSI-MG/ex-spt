const initScstd = [
  {
    id: "01",
    departement: "DPAL",
    niveau: 6,
    sections: [
      {
        titre: "Resssources humaines",
        subsection: {
          titre: "Le Site communautaire dispose-t-elle d’un :",
          maxScore: 6,
          score: Number,
          questions: [
            {
              question:
                "1. Agent communautaire formé aux protocoles de prise en charge du paludisme",
              score: "NA",
            },
            {
              question: "2. AC formé en test de diagnostic rapide du paludisme",
              score: true,
            },
            {
              question:
                "3. AC formé sur la communication dans la lutte contre paludisme",
              score: true,
            },
            {
              subquestion: {
                q: "4. Est-ce que l'AC est en possession des documents cadres ",
                sq: [
                  {question: "Ordinnogramme PEC", score: false},
                  {question: "Job Aids", score: false},
                  {question: "Affiches", score: "NA"},
                ],
              },
            },
            {
              subquestion: {
                q: "5. Est-ce que l'AC est doté de matéliels",
                sq: [
                  {question: "Tablette", score: false},
                  {question: "Connexion internet", score: false},
                  {question: "Crédit de communication", score: "NA"},
                ],
              },
            },
            {
              question:
                "6. Est-ce que l'AC est encadré et supervisé par le Chef CSB et/ou AC relais",
              score: "NA",
            },
            {
              question:
                "7. Est-ce que l'AC participe à la revue mensuelle au niveau CSB",
              score: "NA",
            },
            {
              subquestion: {
                q: "8. Est-ce que l'AC relais fait des supervisions des AC",
                sq: [
                  {question: "Planning de supervision", score: "NA"},
                  {question: "Rapport de supervision", score: "NA"},
                ],
              },
            },
          ],
        },
      },
      {
        titre: "Prévention",
        maxScore: 10,
        score: Number,
        subsection:
          [{
            titre: "Utilisation MII",
            questions: [
              {
                subquestion: {
                  q: "Accès et réception",
                  sq: [
                    {
                      question:
                        "1. Avez-vous reçu des MII lors de la dernière distribution (campagne, routine ou urgence) ? Si oui, combien de MII?",
                      score: "NA",
                    },
                    {
                      question:
                        "2. Les MII que vous avez reçues ont-elles été distribuées gratuitement ? Si non, combien avez-vous payé ?",
                      score: "NA",
                    },
                    {
                      question:
                        "4. Utilisez-vous régulièrement votre MII  pour dormir la nuit? ",
                      score: "NA",
                    },
                  ],
                },
              },
              {
                subquestion: {
                  q: " Qualité et utilisation",
                  sq: [
                    {
                      question:
                        "3. Votre moustiquaire est-elle actuellement en bon état (pas de trou, propre, bien suspendue) ?",
                      score: "NA",
                    },
                  ],
                },
              },
              {
                subquestion: {
                  q: "Sensibilisation et information",
                  sq: [
                    {
                      question:
                        "5. Lors de la distribution, les agents communautaires vous ont-ils expliqué comment entretenir la MII ?",
                      score: "NA",
                    },
                    {
                      question:
                        "6. Avez-vous été informé par un agent communautaire sur la première utilisation des MII (ex. : aération avant usage) ?",
                      score: "NA",
                    },
                    {
                      question:
                        "7. Avez-vous reçu des informations sur l’entretien des MII (lavage, séchage, etc.) ? Si oui, par qui ?",
                      score: "NA",
                    },
                  ],
                },
              },
              {
                subquestion: {
                  q: "Observations communautaires",
                  sq: [
                    {
                      question:
                        "8. Avez-vous observé des problèmes lors de la distribution ou dans l’utilisation des MII dans votre communauté ? Si oui, précisez ",
                      score: "NA",
                    },
                    {
                      question:
                        "9. Les membres de votre communauté utilisent-ils correctement les MII selon vous ?",
                      score: "NA",
                    },
                  ],
                },
              },
            ],
          },
            {
              title: "Application GIV",
              maxScore: 3,
              score: Number,
              questions: [
                {
                  question:
                    "1. L'AC effectue-t-il des activités de sensibilisation au niveau de sa localité sur la nécessité de réalisation périodique du GIV",
                  score: "NA",
                },
                {
                  question:
                    "2. L'AS est-il en mesure d'expliquer à la communauté ce qu'est la GIV et quels sont les activités à réaliser au cours de la GIV",
                  score: "NA",
                },
                {
                  question:
                    "3. L'ASC est-il en mesure de convaincre sa communauté de réaliser la GIV de façon périodique",
                  score: "NA",
                },
              ],
            },
            {
              title: "Pulvérisation intra-domicilaire",
              maxScore: 6,
              score: Number,
              questions: [
                {
                  subquestion: {
                    q: "Agents pulvérisateurs :",
                    sq: [
                      {
                        question:
                          "1. Avez-vous reçu une formation ? Si oui, sur quoi ?",
                        score: "NA",
                      },
                      {
                        question:
                          "2.Combien de maisons pulvérisez-vous par jour en moyenne ?",
                        score: "NA",
                      },
                      {
                        question: "3.Rencontrez-vous des difficultés spécifiques ?",
                        score: "NA",
                      },
                    ],
                  },
                },
                {
                  subquestion: {
                    q: "Ménages",
                    sq: [
                      {
                        question:
                          "1. Avez-vous été informé avant la pulvérisation ?",
                        score: "NA",
                      },
                      {
                        question:
                          "2. Les agents ont-ils expliqué les consignes à suivre ?",
                        score: "NA",
                      },
                      {
                        question:
                          "3.Avez-vous accepté la pulvérisation ? Si non, pourquoi ?",
                        score: "NA",
                      },
                      {
                        question:
                          "4. Y a-t-il eu des effets secondaires après la pulvérisation ?",
                        score: "NA",
                      },
                    ],
                  },
                },
              ],
            },
            {
              title: "TPI pour les femmes enceintes",
              maxScore: 6,
              score: Number,
              questions: [
                {
                  question:
                    "1. Les SP sont disponibles dans le centre et en quantité suffisante au niveau du site",
                  score: "NA",
                },
                {
                  question:
                    "2. L’agent communautaire/relais a été formé à l’administration du TPIg",
                  score: "NA",
                },
                {
                  question:
                    "3. Le TPIg est administré sous observation directe (DOT) même en communauté",
                  score: "NA",
                },
                {
                  question:
                    "4.Un délai d’au moins 1 mois entre deux doses est respecté",
                  score: "NA",
                },
                {
                  question:
                    "5. Les SP sont administrés à partir du 2è trimestre de grossèsse",
                  score: "NA",
                },
                {
                  question:
                    "6.  L'AC/relais conseille la femme enceinte sur les effets secondaires, les bénéfices, et le suivi à faire",
                  score: "NA",
                },
                {
                  question:
                    "7. Les femmes enceintes sont référées au centre de santé pour la 1re consultation CPN ou en cas de signes d’alerte",
                  score: "NA",
                },
                {
                  question:
                    "8. Le site communautaire est doté de supports d’éducation (affiches, flyers, audio, etc.)",
                  score: "NA",
                },
              ],
            },
            {
              title: "Sensibilisation communautaire",
              maxScore: 6,
              score: Number,
              questions: [
                {
                  question:
                    "1.  Des activités de sensibilisation sont planifiées et effectivement réalisées ",
                  score: "NA",
                },
                {
                  question:
                    "2. Les messages diffusés sont conformés aux disrectives nationales (prévention, prise en charge,TPIg, AID, Consulation précoce, etc...)",
                  score: "NA",
                },
                {
                  question:
                    "3. Les messages sont adaptés au niveau des compréhension de la population ciblée",
                  score: "NA",
                },
                {
                  question:
                    "4. Les supports de communication sont disponibles (affiches, dépliants, mégaphones, radios locales, etc…)",
                  score: "NA",
                },
                {
                  question:
                    "5. Des canaux variés sont utilisés (VAD, causeries, radio, groupes des femmes, leaders religieux)",
                  score: "NA",
                },
                {
                  question:
                    "6. Les participants peuvent citer les messages clés après la séance",
                  score: "NA",
                },
                {
                  question:
                    "7. Est-ce qu'il y a un planning de communication et rapport",
                  score: "NA",
                },
                {
                  question:
                    "8. Une fiche de présence ou un outil de suivi est utilisé pour chaque activité",
                  score: "NA",
                },
                {
                  question:
                    "9. Des données sur les activités de sensibilisation sont compilées et remontées au centre de santé de référence",
                  score: "NA",
                },
              ],
            },
          ]
        ,

      },
      {
        titre: "Prise en Charge des Cas",
        maxScore: 7,
        score: Number,
        questions: [
          {
            subquestion: {
              q: "1. Les tests de diagnostic rapide (RDT) sont disponibles",
              sq: [
                {
                  question: "Quantité correspondante aux besoins estimés",
                  score: true,
                },
                {
                  question: "Utilisés pour tester tous cas de fièvres",
                  score: false,
                },
              ],
            },
          },
          {
            subquestion: {
              q: "2. Les ACT sont disponibles au niveau site",
              sq: [
                {
                  question: "à tout âge",
                  score: true,
                },
                {
                  question: "en quantité suffisante",
                  score: false,
                },
              ],
            },
          },
          {
            subquestion: {
              q: "3. Artésunate suppo est disponible en cas de référence",
              sq: [
                {
                  question: "en quantité suffisante",
                  score: true,
                },
              ],
            },
          },
          {
            question:
              "4. Aucun traitement antipaludique n'est administré sans confirmation par TDR",
            score: true,
          },
          {
            question:
              "5. Les résultats des TDR sont bien consignés dans les registres ou fiches de consultation",
            score: true,
          },
          {
            question:
              "6. Les cas graves sont correctement référés sans delai vers CSB",
            score: true,
          },
          {
            question:
              "7. Les posologies sont respectées (dose, durée, voie d’administration)",
            score: true,
          },
        ],
      },
      {
        title: "Surveillance épidemiologique et riposte",
        maxScore: 6,
        score: Number,
        questions: [
          {
            question:
              "1. L'AC/AC relais sont formés à la détection des cas suspects de paludisme",
            score: "NA",
          },
          {
            question:
              "2. Un registre communautaire existe pour enregistrer les cas suspects ou confirmés",
            score: "NA",
          },
          {
            question:
              "3. L'AC /AC relais savent identifier les signes d’alerte ou de flambée (hausse inhabituelle de cas, décès suspects, etc.)",
            score: "NA",
          },
          {
            question: "4. Les cas suspects sont notifiés rapidement au CSB",
            score: "NA",
          },
          {
            question:
              "5.  Des canaux de communication fonctionnels existent entre la communauté et le centre de santé (téléphone, visite, agent de liaison, etc.)",
            score: "NA",
          },
          {
            question:
              "6. En cas d’alerte, une enquête ou investigation communautaire est déclenchée avec le soutien du centre de santé",
            score: "NA",
          },
          {
            question:
              "7. Des actions de sensibilisation ou de prévention renforcées sont mises en place en cas d’alerte",
            score: "NA",
          },
          {
            question:
              "8. La communauté est impliquée activement dans le suivi de l’évolution de la situation (réunions, informations partagées, etc.)",
            score: "NA",
          },
          {
            question:
              "9. Les activités communautaires sont supervisées régulièrement par le centre de santé",
            score: "NA",
          },
          {
            question:
              "10. Des rapports ou fiches d’alerte sont archivés et disponibles",
            score: "NA",
          },
          {
            question:
              "11. Le relais / ASC connaît les mesures de riposte de première ligne (distribution de MII, intensification de la sensibilisation, etc.)",
            score: "NA",
          },
        ],
      },
      {
        title: "Gestion des Approvisionnement et Stock",
        maxScore: 6,
        score: Number,
        questions: [
          {
            subquestion: {
              q: "La FS dispose-t-elle de:",
              sq: [
                {
                  question:
                    "1. Utilisez-vous des outils ou formulaires spécifiques pour passer les commandes ?",
                  score: "NA",
                },
                {
                  question:
                    "2.Disposez-vous d’un registre de stock à jour (papier ou électronique) ?",
                  score: "NA",
                },
                {
                  question: "3.Avez-vous un système de gestion informatisé?",
                  score: "NA",
                },
                {
                  question:
                    "4.Le registre de stock est-il mis à jour après chaque entrée/sortie de produits ?",
                  score: "NA",
                },
                {
                  question:
                    "5.Quelle est la méthode de gestion des stocks utilisée ? (FIFO, FEFO, LIFO…)",
                  score: "NA",
                },
                {
                  question:
                    "6.Faites-vous régulièrement l’inventaire physique des produits ? À quelle fréquence ?",
                },
                {
                  question:
                    "7.Observez-vous des écarts entre le stock physique et le stock théorique ? Si oui, à quelle fréquence ?",
                },
                {
                  question:
                    "8.Avez-vous un système d’alerte pour anticiper les ruptures de stock ?",
                },
                {
                  question:
                    "9.Avez-vous des pertes enregistrées ? Si oui, quelles en sont les causes principales ? (péremption, vol, mauvaise conservation...)",
                },
                {
                  question:
                    "10.Les conditions de stockage sont-elles conformes aux normes ? (aération, température, propreté, rangement…)",
                },
                {
                  question:
                    "11.Disposez-vous d’étagères adaptées et de palettes pour le rangement ?",
                },
                {
                  question:
                    "12.Y a-t-il des produits périmés dans les rayons ou entrepôts ?",
                },
                {
                  question:
                    "13.Avez-vous les documents suivants à jour :Fiches de stock, Bons de réception, Bons de sortie, Rapports d’inventaire",
                },
                {
                  question:
                    "14.Conservez-vous une copie des documents de commande et de livraison ?",
                },
                {
                  question:
                    "15.Avez-vous un système formalisé pour la planification des commandes ?",
                },
                {
                  question:
                    "16.Avez-vous bénéficié d’une formation sur la gestion des stocks recement  ?",
                },
              ],
            },
          },
        ],
      },
    ],
  },
  {
    id: "02",
    departement: "DPAL",
    niveau: 21,
    sections: [
      {
        titre: "Ressources humaines",
        maxScore: 6,
        score: Number,
        subsection: {
          titre:
            "Le Centre Hospitalier de Référence Régional/District a-t-il un :",
          questions: [
            {
              question: "1. Agent de Santé formé en paludisme",
              score: "NA",
            },
            {
              subquestion: {
                q: "2. Technicien de laboratoire",
                sq: [
                  {
                    question: "Formé en RDT",
                    score: true,
                  },
                  {
                    question: "Formé en Microscopie",
                    score: true,
                  },
                ],
              },
            },
            {
              question: "3. Responsable SIG ou équivalent",
              score: "NA",
            },
            {
              question: "4. Envoi RMA / Circuit",
              score: "NA",
            },
          ],
        },
      },
      {
        titre: "Materiel, intrants et Outils de Gestion",
        maxScore: 6,
        score: Number,
        subsection:
          [{
            title: "Est-ce que ces materiels sont disponibles :",
            questions: [
              {
                question: "1. Thermomètre",
                score: "NA",
              },
              {
                question: "2. Pèse personnne",
                score: "NA",
              },
              {
                question: "3.Oxygène",
                score: "NA",
              },
              {
                question: "4. Microscope",
                score: "NA",
              },
              {
                question: "5. Intrant microscope complet",
                score: "NA",
              },
              {
                question: "6. Safety box",
                score: "NA",
              },
            ],
          },
            {
              title: "Est-ce que ces Intrants sont disponibles :",
              questions: [
                {
                  question: "RDT",
                  score: "NA",
                },
                {
                  question: "ACT tout age",
                  score: "NA",
                },
                {
                  question: "Artesunate injectable",
                  score: "NA",
                },
                {
                  question: "Primaquine",
                  score: "NA",
                },
                {
                  question: "Autres antipaludiques",
                  score: "NA",
                },
              ],
            },
            {
              title: "Est -ce que ces OG sont disponibles :",
              questions: [
                {
                  question: "RCI/RCE (Registre de Consulation Interne/Externe)",
                  score: "NA",
                },
                {
                  question: "Fiche patient",
                  score: "NA",
                },
                {
                  question: "RMA",
                  score: "NA",
                },
                {
                  question: "Fiche de stock par produit à jour",
                  score: "NA",
                },
              ],
            },
          ],
      },
    ],
  },
  {
    id: "03",
    departement: "M&E",
    niveau: 51,
    sections: [
      {
        title: "Ressources humaines",
        maxScore: 6,
        score: Number,
        subsection: {
          title:
            "La formation sanitaire dispose-t-elle d’une personne chargée de :",
          questions: [
            {
              question: "1. L’agrégation des données dans un rapport",
              score: "NA",
            },
            {
              question: "2. La collecte des données",
              score: "NA",
            },
            {
              question:
                "3. La révision des données rapportées et du contrôle de la qualité des données",
              score: "NA",
            },
            {
              question: "4. L’analyse des données (graphiques et tableaux)",
              score: "NA",
            },
            {
              question: "5. L’archivage des outils de collecte et des rapports",
              score: "NA",
            },
            {
              question: "6. La transmission des rapports",
              score: "NA",
            },
            {
              question: "7. La vérification des données communautaires",
              score: "NA",
            },
          ],
        },
      },
      {
        title: "Disponibilité des outils de gestion",
        maxScore: 6,
        score: Number,
        subsection: {
          title: "La FS dispose-t-elle au moment de la visite:",
          questions: [
            {
              subquestion: {
                q: "1. Tous les outils de collecte",
                sq: [
                  "Registre CE",
                  "Fiche* de stock standard en intrants de santéRegistre CPN",
                ],
              },
            },
            {
              question:
                "2. Archivage des rapports mensuels d'activité CSB des 3 derniers mois",
              score: "NA",
            },
            {
              question:
                "3. Archivage des rapports mensuels d'activité Communautaire des 3 derniers mois",
              score: "NA",
            },
            {
              question:
                "4. Accusé/cahier de réception des outils de collecte et de rapportage de données",
              score: "NA",
            },
          ],
        },
      },
      {
        title: "Rupture des Outils de Collecte et de Rapportage",
        maxScore: 6,
        score: Number,
        subsection: {
          title:
            "La FS a-t-elle connue une rupture des registres pendant les périodes objets de la mission spotcheck",
          questions: [
            {
              question: "Registre CE",
              score: "NA",
            },
            {
              question: "Registre CPN",
              score: "NA",
            },
            {
              question: "Registre CPoN",
              score: "NA",
            },
            {
              question: "Registre SNE",
              score: "NA",
            },
            {
              question: "Registre de vaccination",
              score: "NA",
            },
            {
              subquestion: {
                q: "Fiche de pointage enfant",
                sq: [
                  {
                    question: "Registre PF",
                    score: "NA",
                  },
                  {
                    question: "RUMER",
                    score: "NA",
                  },
                  {
                    question:
                      "Livre de banque et  livre de caisse FANOME et Fonds d'équité",
                    score: "NA",
                  },
                ],
              },
            },
            {
              question: "Fiche* de stock standard en intrants de santé",
              score: "NA",
            },
            {
              question: "Calendriers de la semaine épidémiologique",
              score: "NA",
            },
          ],
        },
      },

    ]
  }
]
