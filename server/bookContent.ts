export interface BookPage {
  pageNumber: number;
  section: string;
  title: string;
  subtitle?: string;
  theme?: 'dark' | 'light' | 'cover';
  content: {
    paragraphs?: string[];
    bullets?: string[];
    subsections?: { title: string; body: string }[];
    table?: { headers: string[]; rows: string[][] };
    callout?: { title: string; text: string; type?: 'info' | 'warning' | 'tip' };
    quote?: string;
    flowSteps?: string[];
    faqItems?: { question: string; answer: string }[];
  };
}

export interface BookGuide {
  id: string;
  title: string;
  subtitle: string;
  series: string;
  totalPages: number;
  coverImage?: string;
  pages: BookPage[];
}

export const EGG_HEALTH_GUIDE: BookGuide = {
  id: 'EGG-001',
  title: 'The Complete Egg Health Guide',
  subtitle: 'What Happens Inside Your Body When You Eat Eggs',
  series: 'NUTRITION • VISUAL HEALTH GUIDE',
  totalPages: 33,
  pages: [
    {
      pageNumber: 1,
      section: 'COVER',
      title: 'THE COMPLETE EGG HEALTH GUIDE',
      subtitle: 'What Happens Inside Your Body When You Eat Eggs',
      theme: 'cover',
      content: {
        paragraphs: [
          'NUTRITION • VISUAL HEALTH GUIDE',
          'NUTRITION • DIGESTION • CHOLESTEROL • SAFETY'
        ]
      }
    },
    {
      pageNumber: 2,
      section: 'FRONT MATTER',
      title: 'Welcome',
      theme: 'light',
      content: {
        paragraphs: [
          'Eggs are one of the most familiar foods in the world — on breakfast plates, inside sandwiches, mixed into recipes and served in countless different ways.',
          'But what actually happens after you eat one? What happens to the protein? Where do the vitamins and minerals go? Does cooking change the nutritional picture? And what does the research really say about eating eggs regularly?',
          'This guide follows the egg from your plate through digestion and nutrient absorption, then looks at what those nutrients do in the body — along with cholesterol, preparation methods, food safety, and the most common questions people ask.',
          'The goal isn’t to convince you that eggs are "good" or "bad." Food rarely works that simply. Instead, you’ll learn how to understand eggs in the context of nutrition, preparation, overall diet and individual circumstances.'
        ],
        callout: {
          title: 'INSIDE THIS GUIDE',
          text: 'Nutrition • Digestion • Daily Egg Consumption • Cholesterol • Cooking • Safety • Myths'
        }
      }
    },
    {
      pageNumber: 3,
      section: 'FRONT MATTER',
      title: 'A Note Before You Begin',
      theme: 'light',
      content: {
        paragraphs: [
          'This guide is intended for general educational and informational purposes. It is not medical advice and is not intended to diagnose, treat, cure or prevent any disease or medical condition.',
          'Nutrition needs vary from person to person. Factors such as age, health status, medications, allergies, dietary patterns and individual circumstances can affect what is appropriate for you.',
          'The information in this guide summarizes nutrition and food-safety research from reputable sources, but scientific evidence can change as new research becomes available.'
        ],
        callout: {
          title: 'PLEASE READ',
          text: 'If you have a medical condition, food allergy, specific dietary requirement, or concern about cholesterol or cardiovascular health, speak with a qualified healthcare professional for advice tailored to your situation.\n\nEducational information only.',
          type: 'warning'
        }
      }
    },
    {
      pageNumber: 4,
      section: 'PART I — UNDERSTANDING EGGS',
      title: "What's Inside an Egg?",
      theme: 'light',
      content: {
        paragraphs: [
          'An egg may look simple from the outside, but it contains a variety of nutrients. The two major parts are the egg white and the egg yolk.',
          'The white is particularly rich in protein, while the yolk contains much of the egg’s fat and dietary cholesterol, as well as many of its vitamins and minerals.',
          'A large egg provides approximately 72 calories, 6.3 g protein, 4.8 g fat and 0.4 g carbohydrate, along with nutrients such as choline, selenium, phosphorus, vitamin B12 and vitamin D.',
          'Values are approximate and can vary according to egg size and source.'
        ],
        callout: {
          title: 'The important point',
          text: 'An egg isn’t simply "a protein food." It’s a combination of several nutrients that can contribute to an overall dietary pattern.',
          type: 'tip'
        }
      }
    },
    {
      pageNumber: 5,
      section: 'PART I',
      title: 'Egg Nutrition at a Glance',
      theme: 'light',
      content: {
        paragraphs: [
          'Approximate values for one large whole egg (approx. 50g).'
        ],
        table: {
          headers: ['Nutrient', 'Approx. amount'],
          rows: [
            ['Calories', '72 kcal'],
            ['Protein', '6.3 g'],
            ['Fat', '4.8 g'],
            ['Carbohydrate', '0.4 g'],
            ['Cholesterol', '186 mg'],
            ['Choline', '≈147 mg'],
            ['Selenium', '≈15.4 µg'],
            ['Phosphorus', '≈99 mg'],
            ['Iron', '≈0.9 mg'],
            ['Zinc', '≈0.7 mg'],
            ['Calcium', '≈28 mg'],
            ['Sodium', '≈71 mg'],
            ['Potassium', '≈69 mg']
          ]
        }
      }
    },
    {
      pageNumber: 6,
      section: 'PART I',
      title: 'Egg White vs. Egg Yolk',
      theme: 'light',
      content: {
        subsections: [
          {
            title: 'THE WHITE',
            body: 'Contains much of the egg’s protein. It is mostly water and protein, with very little fat.'
          },
          {
            title: 'THE YOLK',
            body: 'Contains most of the egg’s fat, cholesterol and dietary micronutrients — including choline and fat-soluble vitamins.'
          }
        ],
        paragraphs: [
          'This creates an important nutritional trade-off. Egg whites alone provide protein while leaving behind most of the yolk’s micronutrients; the whole egg provides both.'
        ],
        callout: {
          title: 'PRACTICAL TAKEAWAY',
          text: 'There isn’t one universal answer for which is "better." It depends on your overall dietary needs and goals.',
          type: 'tip'
        }
      }
    },
    {
      pageNumber: 7,
      section: 'PART II — THE JOURNEY INSIDE YOUR BODY',
      title: 'What Happens After You Eat an Egg?',
      theme: 'dark',
      content: {
        flowSteps: ['MOUTH', 'ESOPHAGUS', 'STOMACH', 'SMALL INTESTINE'],
        paragraphs: [
          'Your digestive system breaks food down into components your body can absorb and use.',
          'Different nutrients take different routes: proteins become amino acids, fats are broken into smaller components, and vitamins and minerals are released and absorbed through the digestive tract.'
        ]
      }
    },
    {
      pageNumber: 8,
      section: 'PART II',
      title: 'Inside the Stomach',
      theme: 'light',
      content: {
        paragraphs: [
          'After swallowing, the egg travels down the esophagus and reaches the stomach, where it mixes with stomach secretions and is mechanically churned.',
          'Protein digestion begins here. Think of a protein as a long chain — digestion starts cutting that chain into smaller peptide fragments.'
        ],
        callout: {
          title: 'Key idea',
          text: 'Protein is being broken down into smaller components. The stomach doesn’t finish the job — it prepares food for the next stage: the small intestine.',
          type: 'info'
        }
      }
    },
    {
      pageNumber: 9,
      section: 'PART II',
      title: 'Into the Small Intestine',
      theme: 'light',
      content: {
        paragraphs: [
          'Most nutrient digestion and absorption happens in the small intestine. Digestive enzymes continue breaking protein fragments and fats down further.',
          'The intestinal wall contains villi — small finger-like structures that greatly increase the surface area available for absorption, allowing nutrients to move from the digestive tract into the bloodstream.'
        ],
        flowSteps: ['Digestive tract', 'Villi', 'Bloodstream'],
        callout: {
          title: 'Absorption',
          text: 'At this point, the components of your egg are no longer simply "egg" — they have become bioavailable nutrients your body can use.'
        }
      }
    },
    {
      pageNumber: 10,
      section: 'PART II',
      title: 'From Egg Protein to Amino Acids',
      theme: 'light',
      content: {
        paragraphs: [
          'Protein is one of the major nutrients found in eggs. A large egg provides approximately 6.3 grams of protein.',
          'When you eat protein, your digestive system breaks it down into smaller components, including amino acids. These amino acids are absorbed and can be used by your body to make and maintain its own proteins — contributing to muscle tissue, enzymes, structural components, transport proteins and other cellular processes.',
          'Egg protein contains all nine essential amino acids — amino acids the body cannot make in sufficient amounts and therefore needs to obtain from food.'
        ],
        flowSteps: ['01 EGG PROTEIN', '02 DIGESTION', '03 AMINO ACIDS', '04 ABSORPTION', '05 BODY USE'],
        callout: {
          title: 'A NOTE ON THIS GUIDE',
          text: 'Your body doesn’t eat an egg and immediately turn it into muscle. The amino acids join the body’s broader nutrient pool, used according to physiological needs.'
        }
      }
    },
    {
      pageNumber: 11,
      section: 'PART II',
      title: 'Where Do the Nutrients Go?',
      theme: 'light',
      content: {
        paragraphs: [
          'Once nutrients are digested and absorbed, your body doesn’t send everything to one destination.'
        ],
        subsections: [
          {
            title: 'Amino acids',
            body: 'Can be used to build and maintain proteins throughout the body — in muscle, cells, and elsewhere.'
          },
          {
            title: 'Fatty acids and fat-derived molecules',
            body: 'Can be used for energy or incorporated into cell structures.'
          },
          {
            title: 'Vitamins, minerals & choline',
            body: 'Support numerous biological processes depending on the specific nutrient.'
          }
        ],
        callout: {
          title: 'A NOTE ON THIS GUIDE',
          text: 'It’s useful to think of nutrient use conceptually rather than assuming a straight line from "egg" to any one organ. Your body draws on a broad, shared pool of nutrients according to its needs.'
        }
      }
    },
    {
      pageNumber: 12,
      section: 'PART III — THE NUTRIENTS',
      title: 'Protein',
      theme: 'light',
      content: {
        paragraphs: [
          'Protein is one of the main nutrients people associate with eggs — for good reason. A large egg provides approximately 6.3 grams of protein.',
          'But protein isn’t just about muscles. Your body continually breaks down and rebuilds proteins, and dietary protein supplies amino acids used to make and maintain proteins involved in structures, enzymes, transport, signaling and many other functions.'
        ],
        subsections: [
          {
            title: 'Why protein quality matters',
            body: 'Not all proteins contain the same combination of amino acids. Egg protein provides all of the essential amino acids your body needs to obtain from food — but one food doesn’t determine your entire protein intake. Your overall dietary pattern matters.'
          }
        ],
        flowSteps: ['Egg', 'Digestion', 'Amino acids', 'Absorption', 'Body uses amino acids'],
        callout: {
          title: 'PRACTICAL TAKEAWAY',
          text: 'Eggs can be one convenient source of protein within a varied diet that includes other protein-rich foods.'
        }
      }
    },
    {
      pageNumber: 13,
      section: 'PART III',
      title: 'Choline: An Important Nutrient in the Yolk',
      theme: 'light',
      content: {
        paragraphs: [
          'Egg yolks are a useful dietary source of choline, an essential nutrient involved in several biological processes:',
          'A large egg contains approximately 147 mg of choline, although the exact amount can vary.'
        ],
        bullets: [
          'Cell membrane structure',
          'Normal cellular function',
          'Production of the neurotransmitter acetylcholine',
          'Lipid transport and metabolism'
        ],
        subsections: [
          {
            title: 'Why the yolk matters',
            body: 'Many of the egg’s micronutrients are concentrated in the yolk. Removing the yolk doesn’t simply remove "the unhealthy part" — it also removes many of the nutrients found there.'
          }
        ]
      }
    },
    {
      pageNumber: 14,
      section: 'PART III',
      title: 'Vitamins in Eggs',
      theme: 'light',
      content: {
        paragraphs: [
          'Eggs provide several vitamins, although exact amounts depend on factors such as egg size and composition.'
        ],
        subsections: [
          {
            title: 'Vitamin B12',
            body: 'Important for normal red blood cell formation, nervous-system function and DNA synthesis.'
          },
          {
            title: 'Riboflavin (B2)',
            body: 'Helps the body process nutrients and supports normal cellular energy metabolism.'
          },
          {
            title: 'Vitamin A',
            body: 'Contributes to normal vision, immune function and other physiological processes.'
          },
          {
            title: 'Vitamin D',
            body: 'Eggs can provide vitamin D, although they shouldn’t be considered the sole source of this nutrient.'
          }
        ],
        callout: {
          title: 'A NOTE ON THIS GUIDE',
          text: 'Eggs contribute useful micronutrients, but they aren’t a complete source of every vitamin your body needs. That’s why dietary variety matters — a healthy eating pattern is built around getting different nutrients from a variety of foods, not one "perfect" food.'
        }
      }
    },
    {
      pageNumber: 15,
      section: 'PART III',
      title: 'Minerals in Eggs',
      theme: 'light',
      content: {
        subsections: [
          {
            title: 'Selenium',
            body: 'An essential trace mineral involved in antioxidant defense and thyroid hormone metabolism.'
          },
          {
            title: 'Phosphorus',
            body: 'Plays important roles in bones, teeth, energy metabolism and cellular processes.'
          },
          {
            title: 'Iron & Zinc',
            body: 'Eggs provide modest amounts of both — iron supports oxygen transport, while zinc is involved in numerous enzymatic and cellular functions.'
          }
        ],
        callout: {
          title: 'A NOTE ON THIS GUIDE',
          text: 'The amount of a nutrient in a food doesn’t automatically tell us exactly how much the body will use — absorption is influenced by the food itself, the rest of the meal, and individual factors. Food composition + digestion + absorption + overall diet all matter.'
        }
      }
    },
    {
      pageNumber: 16,
      section: 'PART IV — EGGS & DAILY HEALTH',
      title: 'What Happens If You Eat Eggs Every Day?',
      theme: 'dark',
      content: {
        flowSteps: ['ONE FOOD', 'REPEATED EXPOSURE', 'OVERALL DIETARY PATTERN'],
        paragraphs: [
          'There isn’t a simple "good" or "bad" answer. Eating eggs regularly means repeatedly adding their nutrients — protein, fat, choline, vitamins and minerals — to your diet. But what happens over time depends on the whole dietary pattern, not just the presence of one food.'
        ]
      }
    },
    {
      pageNumber: 17,
      section: 'PART IV',
      title: 'How Many Eggs Should You Eat?',
      subtitle: '"How many eggs should I eat?"',
      theme: 'light',
      content: {
        paragraphs: [
          'There isn’t one universal number.',
          'Nutrition needs differ by age, sex, body size, activity level, overall diet, health conditions and individual needs. The more useful question is usually: how should eggs fit into my overall diet?'
        ],
        subsections: [
          {
            title: 'CONTEXT A',
            body: 'Egg + vegetables + whole grains — a nutrient-dense breakfast where the egg is one part of a varied plate.'
          },
          {
            title: 'CONTEXT B',
            body: 'Egg + refined carbohydrates + processed meat — a very different overall dietary pattern despite the same egg.'
          },
          {
            title: 'OFFICIAL GUIDANCE',
            body: 'USDA MyPlate places eggs in the Protein Foods Group; one large egg counts as about one ounce-equivalent.'
          }
        ],
        callout: {
          title: 'PRACTICAL TAKEAWAY',
          text: 'If you have a medical condition or have been advised to limit particular nutrients, discuss your individual intake with a qualified healthcare professional.'
        }
      }
    },
    {
      pageNumber: 18,
      section: 'PART IV',
      title: 'Eggs & Cholesterol',
      theme: 'dark',
      content: {
        flowSteps: ['DIETARY CHOLESTEROL', 'DIGESTION', 'BLOODSTREAM', 'INDIVIDUAL FACTORS'],
        paragraphs: [
          'A large egg contains approximately 186 mg of cholesterol. But dietary cholesterol and blood cholesterol are not the same thing — blood cholesterol is influenced by multiple factors, including overall dietary pattern and individual biology.'
        ]
      }
    },
    {
      pageNumber: 19,
      section: 'PART IV',
      title: 'What Does the Research Actually Say?',
      theme: 'light',
      content: {
        paragraphs: [
          'Nutrition headlines often turn complicated research into simple answers. The scientific literature doesn’t always agree.'
        ],
        subsections: [
          {
            title: 'STUDY 1 (BMJ 2020)',
            body: 'A 2020 BMJ systematic review and meta-analysis found that consuming up to approximately one egg per day was not associated with incident cardiovascular disease overall.'
          },
          {
            title: 'STUDY 2 (2022)',
            body: 'A 2022 systematic review and meta-analysis reported a small association between each additional 50 g of egg consumed per day and cardiovascular disease in cohort studies.'
          },
          {
            title: 'UMBRELLA REVIEW (2025)',
            body: 'A 2025 umbrella review of existing meta-analyses found substantial variability between analyses and judged the overall certainty of evidence to be very low.'
          }
        ],
        callout: {
          title: 'A NOTE ON THIS GUIDE',
          text: 'These findings don’t prove eggs cause or prevent cardiovascular disease. Observational studies can identify associations, but can’t by themselves establish causation — people who eat more eggs may also differ in other dietary and lifestyle factors.'
        },
        quote: 'OUR TAKEAWAY: Eggs can be part of a healthy dietary pattern, but the appropriate amount and context can differ between individuals. Don’t turn complicated nutrition research into a simple headline.'
      }
    },
    {
      pageNumber: 20,
      section: 'PART V — HOW YOU PREPARE EGGS',
      title: 'Boiled Eggs',
      theme: 'light',
      content: {
        paragraphs: [
          'Boiling is one of the simplest ways to prepare eggs — cooked in water, with no added cooking oil required.',
          'Cooking time determines the texture of the white and yolk. For safety, especially for people at higher risk from foodborne illness, eggs should be cooked appropriately, and if prepared ahead of time, refrigerated and stored properly.'
        ],
        bullets: [
          'Simple preparation',
          'Portable snack',
          'No cooking oil required',
          'Easy to include in meals'
        ]
      }
    },
    {
      pageNumber: 21,
      section: 'PART V',
      title: 'Fried Eggs',
      theme: 'light',
      content: {
        paragraphs: [
          'Frying introduces another variable: the cooking fat. The egg itself contains fat, but frying can add more depending on the cooking method and the amount of oil or butter used.',
          'That means the nutritional profile of the finished meal can differ significantly from the egg alone. The egg hasn’t changed — the overall meal has.'
        ],
        callout: {
          title: 'PRACTICAL TAKEAWAY',
          text: 'When evaluating a preparation method, look at the egg + cooking fat + other ingredients + portion size.',
          type: 'tip'
        }
      }
    },
    {
      pageNumber: 22,
      section: 'PART V',
      title: 'Scrambled Eggs',
      theme: 'light',
      content: {
        paragraphs: [
          'Scrambled eggs are mixed before or during cooking, often with milk, butter, cheese, vegetables or seasonings — so the final nutritional profile depends heavily on what’s added.',
          'Eggs + vegetables + modest cooking fat creates a very different meal than eggs + large amounts of butter, cheese and processed meat.',
          'Ingredients matter. Portions matter. The overall meal matters.'
        ]
      }
    },
    {
      pageNumber: 23,
      section: 'PART V',
      title: 'Which Preparation Is Best?',
      theme: 'light',
      content: {
        paragraphs: [
          'There isn’t one preparation method that wins for everyone. Instead, compare what changes.'
        ],
        table: {
          headers: ['Preparation', 'Main consideration'],
          rows: [
            ['Boiled', 'Usually requires no added cooking fat'],
            ['Fried', 'Added oil or butter can increase calories and fat'],
            ['Scrambled', 'Added butter, cheese or milk can change the final meal'],
            ['Poached', 'Uses water rather than added cooking fat']
          ]
        },
        quote: 'What does the entire meal look like?',
        callout: {
          title: 'PRACTICAL TAKEAWAY',
          text: 'If you’re trying to make a meal more nutritious, don’t focus only on the egg — look at the whole plate.'
        }
      }
    },
    {
      pageNumber: 24,
      section: 'PART VI — EGG SAFETY',
      title: 'RAW ≠ RISK-FREE',
      theme: 'dark',
      content: {
        paragraphs: [
          'Raw or undercooked eggs can carry Salmonella, a bacterium that can cause foodborne illness.',
          'An egg can look clean and normal while still carrying harmful bacteria — appearance alone isn’t a reliable safety test.'
        ]
      }
    },
    {
      pageNumber: 25,
      section: 'PART VI',
      title: 'How to Handle Eggs Safely',
      theme: 'light',
      content: {
        subsections: [
          {
            title: '01 REFRIGERATE',
            body: 'Keep eggs refrigerated at approximately 40°F / 4.4°C or below.'
          },
          {
            title: '02 CHECK',
            body: 'Avoid using eggs that are cracked or contaminated.'
          },
          {
            title: '03 COOK',
            body: 'Cook eggs until the yolk and white are firm, per standard FDA consumer-safety guidance.'
          },
          {
            title: '04 RAW RECIPES',
            body: 'For recipes with raw or undercooked eggs, consider pasteurized eggs or pasteurized egg products.'
          },
          {
            title: '05 USE WITHIN RECOMMENDED TIME',
            body: 'Refrigerated hard-cooked eggs: within one week. Cooked egg dishes: within 3–4 days.'
          }
        ],
        callout: {
          title: 'A NOTE ON THIS GUIDE',
          text: 'Food safety isn’t about being afraid of eggs — it’s about proper storage and cooking. Foodborne pathogens may be present without obvious changes in appearance, smell or taste, so don’t rely on smell alone.'
        }
      }
    },
    {
      pageNumber: 26,
      section: 'PART VII — EGG MYTHS',
      title: 'Egg Myths, Part 1',
      theme: 'light',
      content: {
        subsections: [
          {
            title: 'MYTH: "Eggs are just protein."',
            body: 'REALITY: Eggs provide protein, but also fats, vitamins, minerals and other nutrients such as choline. The yolk in particular contains many of these micronutrients.'
          },
          {
            title: 'MYTH: "You should never eat the yolk."',
            body: 'REALITY: The yolk contains dietary cholesterol and fat, but also many of the egg’s nutrients. For most people, it isn’t useful to label the yolk simply as "bad."'
          },
          {
            title: 'MYTH: "Eggs are a complete meal."',
            body: 'REALITY: An egg is nutrient-dense, but doesn’t provide everything your body needs. Think: egg + vegetables + whole grains + fruits + other protein sources.'
          }
        ]
      }
    },
    {
      pageNumber: 27,
      section: 'PART VII',
      title: 'Egg Myths, Part 2',
      theme: 'light',
      content: {
        subsections: [
          {
            title: 'MYTH: "More eggs automatically means more health."',
            body: 'REALITY: More isn’t always better. Adding more of one food doesn’t automatically make a diet healthier — the appropriate amount depends on your overall dietary pattern.'
          },
          {
            title: 'MYTH: "Eggs automatically cause high cholesterol."',
            body: 'REALITY: Too simplistic. Egg consumption can modestly affect blood cholesterol in some circumstances, but blood cholesterol is influenced by multiple factors and individual responses differ.'
          },
          {
            title: 'MYTH: "Raw eggs are better because they’re natural."',
            body: 'REALITY: Natural doesn’t mean safer. Raw eggs can carry Salmonella; proper cooking reduces food-safety risk.'
          }
        ],
        quote: 'Be suspicious of words like Always, Never, Guaranteed, Cure, Toxic, Miracle. Real nutrition science is usually more nuanced.'
      }
    },
    {
      pageNumber: 28,
      section: 'PART VIII — PRACTICAL GUIDE',
      title: 'How to Think About Eggs',
      theme: 'light',
      content: {
        subsections: [
          { title: '01 What’s your overall diet?', body: 'A single food doesn’t define your nutrition.' },
          { title: '02 How are the eggs prepared?', body: 'Added oils, butter, cheese and other ingredients change the final meal.' },
          { title: '03 What else is on the plate?', body: 'Vegetables, fruits and whole grains contribute nutrients eggs don’t provide.' },
          { title: '04 How much are you eating?', body: 'Portion and frequency matter.' },
          { title: '05 What does the evidence say?', body: 'Avoid decisions based on one viral headline.' }
        ],
        flowSteps: ['FOOD', 'PORTION', 'PREPARATION', 'OVERALL DIET', 'INDIVIDUAL CONTEXT']
      }
    },
    {
      pageNumber: 29,
      section: 'PART VIII',
      title: 'Frequently Asked Questions',
      theme: 'light',
      content: {
        faqItems: [
          { question: 'Are eggs healthy?', answer: 'Eggs can be a nutritious part of a balanced diet, providing protein, fats, vitamins, minerals and other nutrients.' },
          { question: 'Are egg whites healthier than whole eggs?', answer: 'Whites provide protein with very little fat; yolks provide many nutrients as well as fat and cholesterol. The better choice depends on individual needs.' },
          { question: 'Can I eat eggs every day?', answer: 'Eggs can fit into many dietary patterns, but there isn’t a universal daily amount appropriate for everyone.' },
          { question: 'How much protein is in an egg?', answer: 'A large egg contains approximately 6.3 grams of protein.' },
          { question: 'Are eggs high in cholesterol?', answer: 'The yolk contains dietary cholesterol — approximately 186 mg per large egg.' },
          { question: 'Does cooking destroy egg protein?', answer: 'Cooking changes the structure of proteins but doesn’t eliminate the protein.' },
          { question: 'Are boiled eggs healthier than fried eggs?', answer: 'Boiling generally needs no added fat; fried eggs can contain more calories and fat depending on the cooking fat used.' },
          { question: 'Are raw eggs safe?', answer: 'Raw or undercooked eggs can carry Salmonella. Proper cooking or pasteurized eggs reduce risk.' },
          { question: 'Is egg yolk bad for you?', answer: 'Inaccurate to call it universally "bad" — it contains dietary cholesterol and several important nutrients.' },
          { question: 'Do eggs contain vitamin D?', answer: 'Yes, though amounts vary and eggs shouldn’t be your only source.' },
          { question: 'What is choline?', answer: 'An essential nutrient involved in cell structure, cellular function and neurotransmitter production.' },
          { question: 'How should eggs be stored?', answer: 'Refrigerated at 40°F / 4.4°C or below, following food-safety guidance for cooking and storage.' },
          { question: 'Can eggs replace vegetables?', answer: 'No. Eggs and vegetables provide different nutrients; both matter.' },
          { question: 'Are eggs a good source of protein?', answer: 'Yes — a substantial amount of high-quality protein for their size.' },
          { question: 'Should everyone eat the same number of eggs?', answer: 'No. Nutritional needs vary between individuals.' }
        ]
      }
    },
    {
      pageNumber: 30,
      section: 'BACK MATTER',
      title: '7 Things to Remember About Eggs',
      theme: 'light',
      content: {
        subsections: [
          { title: '01', body: 'Eggs contain more than protein — they provide fats, vitamins, minerals and other nutrients.' },
          { title: '02', body: 'The yolk is nutritionally important, containing much of the egg’s fat, cholesterol and several micronutrients.' },
          { title: '03', body: 'Your digestive system breaks egg protein into amino acids, which are then absorbed and used throughout the body.' },
          { title: '04', body: 'Eating eggs every day isn’t automatically good or bad — the overall dietary pattern matters.' },
          { title: '05', body: 'Egg and cholesterol research is nuanced; different studies have produced different findings.' },
          { title: '06', body: 'Preparation changes the final meal — added oil, butter and cheese can significantly change its nutritional profile.' },
          { title: '07', body: 'Food safety matters: proper refrigeration, cooking and handling reduce the risk of Salmonella and other foodborne illness.' }
        ]
      }
    },
    {
      pageNumber: 31,
      section: 'BACK MATTER',
      title: 'References & Further Reading',
      theme: 'light',
      content: {
        paragraphs: [
          'Each major claim in this guide is connected to a numbered source below.'
        ],
        bullets: [
          '1. FDA — Egg Safety: refrigeration, cooking and storage guidance.',
          '2. USDA / MyPlate — Eggs within the Protein Foods Group.',
          '3. USDA FoodData Central — USDA-derived nutrition composition data for a large egg.',
          '4. 2020 BMJ systematic review & meta-analysis — egg consumption and incident cardiovascular disease.',
          '5. 2022 systematic review & meta-analysis — egg consumption (cohort studies) and cardiovascular disease.',
          '6. 2025 umbrella review — meta-analyses of egg consumption and health outcomes; evidence certainty assessment.',
          '7. 2017 systematic review & meta-analysis of RCTs — egg consumption and blood lipids (total/LDL cholesterol).'
        ],
        callout: {
          title: 'A NOTE ON THIS GUIDE',
          text: 'Evidence hierarchy used for this guide: government/official guidance → systematic reviews/meta-analyses → randomized controlled trials → individual observational studies → expert commentary. Social-media posts and blogs are not used as evidence sources.'
        }
      }
    },
    {
      pageNumber: 32,
      section: 'BACK MATTER',
      title: 'Keep Exploring',
      theme: 'light',
      content: {
        paragraphs: [
          'If eggs were only the beginning, there’s a much bigger question: what happens inside your body when you eat other everyday foods?',
          'Coming soon: Bananas • Oatmeal • Vegetables • Protein • Soda • Breakfast Foods',
          'More food. More science. More answers.'
        ],
        subsections: [
          { title: 'THE COMPLETE EGG HEALTH GUIDE', body: 'Current Guide' },
          { title: 'SUGAR & YOUR BODY', body: 'Available in Bundle' },
          { title: 'THE COMPLETE FIBER GUIDE', body: 'Available in Bundle' }
        ]
      }
    },
    {
      pageNumber: 33,
      section: 'BACK MATTER',
      title: 'We Make Nutrition Easier to Understand',
      theme: 'dark',
      content: {
        paragraphs: [
          'Food and nutrition information can be confusing. One headline says something is healthy. Another says it’s harmful. A viral video makes a dramatic claim. A research paper sounds impossible to understand.',
          'Our goal is to bridge that gap. We take the questions people are already asking about food and the human body and turn them into simple, visual, evidence-informed educational content.',
          'Curiosity first. Evidence second. Clarity always.',
          'We don’t believe nutrition should be reduced to fear, hype or miracle claims. We believe people deserve information they can understand.',
          'Keep learning. Keep questioning. Keep exploring what happens inside your body.'
        ]
      }
    }
  ]
};

export const FIBER_GUIDE: BookGuide = {
  id: 'FIB-001',
  title: 'The Complete Fiber Guide',
  subtitle: 'What Fiber Does Inside Your Body — A Visual Guide to Digestion, Gut Health, Blood Sugar, Cholesterol & High-Fiber Foods',
  series: 'FOOD & BODY SERIES',
  totalPages: 32,
  pages: [
    {
      pageNumber: 1,
      section: 'COVER',
      title: 'THE COMPLETE FIBER GUIDE',
      subtitle: 'What Fiber Does Inside Your Body',
      theme: 'cover',
      content: {
        paragraphs: [
          'FOOD & BODY SERIES',
          'A Visual Guide to Digestion, Gut Health, Blood Sugar, Cholesterol & High-Fiber Foods'
        ]
      }
    },
    {
      pageNumber: 2,
      section: 'WELCOME',
      title: 'You eat fiber. But what actually happens to it after you swallow it?',
      theme: 'dark',
      content: {
        paragraphs: [
          'Most people know fiber is "good for digestion." But that description barely scratches the surface.',
          'Fiber interacts with the digestive system in several different ways. Some types help add bulk to stool. Some dissolve or form gels. Some can be fermented by gut microorganisms. And fiber-rich foods can contribute important nutrients to the overall diet.',
          'This guide follows fiber through the body so you can understand what it actually does — not just what nutrition labels tell you.'
        ],
        callout: {
          title: 'THE JOURNEY',
          text: 'You’ll walk fiber’s entire journey: mouth → stomach → small intestine → colon → gut bacteria — and see exactly where each of its effects comes from.'
        }
      }
    },
    {
      pageNumber: 3,
      section: 'BEFORE YOU BEGIN',
      title: 'Health Disclaimer',
      theme: 'dark',
      content: {
        paragraphs: [
          'This guide is for general educational purposes and is not medical advice.',
          'Individual dietary needs vary. If you have a medical condition, significant digestive symptoms, or have been advised to follow a specific diet, consult an appropriate healthcare professional.'
        ],
        callout: {
          title: 'NOTICE',
          text: 'Nothing in this guide is intended to diagnose, treat, cure, or prevent any disease.',
          type: 'warning'
        }
      }
    },
    {
      pageNumber: 4,
      section: 'PART I',
      title: 'Understanding Fiber',
      theme: 'dark',
      content: {
        paragraphs: ['Part I: Core Biochemical Principles of Dietary Fiber']
      }
    },
    {
      pageNumber: 5,
      section: 'PART I · CHAPTER 1',
      title: 'What Is Dietary Fiber?',
      theme: 'dark',
      content: {
        paragraphs: [
          'Dietary fiber refers broadly to carbohydrates and related components that are not completely digested and absorbed in the human small intestine.',
          'Instead of being treated as simply another source of rapidly absorbed glucose, different fibers can move through the digestive system and interact with water, digestion and the gut microbiome.'
        ],
        callout: {
          title: 'Key idea',
          text: 'Fiber isn’t one single substance. Different fibers behave differently.'
        }
      }
    },
    {
      pageNumber: 6,
      section: 'PART I · CHAPTER 2',
      title: 'Soluble vs. Insoluble Fiber',
      theme: 'dark',
      content: {
        subsections: [
          {
            title: 'SOLUBLE FIBER',
            body: 'Some soluble fibers dissolve or swell in water and may form viscous or gel-like material as they move through the digestive tract.'
          },
          {
            title: 'INSOLUBLE FIBER',
            body: 'Some fibers largely retain their structure, contributing bulk and helping influence movement through the digestive tract.'
          }
        ],
        callout: {
          title: 'AVOID OVERSIMPLIFYING',
          text: '"Soluble fiber does X and insoluble fiber does Y — always" is too simple. Fiber classification and physiological effects are more complicated than a strict two-category split, and most whole foods contain a mix of both types.'
        }
      }
    },
    {
      pageNumber: 7,
      section: 'PART I · CHAPTER 3',
      title: 'Where Fiber Comes From',
      theme: 'dark',
      content: {
        paragraphs: ['Fiber occurs naturally across a wide range of plant foods:'],
        bullets: [
          'Whole grains',
          'Beans & Lentils',
          'Oats',
          'Avocado',
          'Vegetables (Broccoli, Carrots, Peas)',
          'Fruits (Berries, Pears, Apples)',
          'Nuts & Seeds (Chia, Flax, Almonds)'
        ],
        quote: 'The easiest way to increase fiber is usually to increase the variety of plant foods in your diet.'
      }
    },
    {
      pageNumber: 8,
      section: 'PART II',
      title: 'The Journey Through Your Body',
      theme: 'dark',
      content: {
        paragraphs: ['Tracing the transit, breakdown, and fermentation pathways of fiber.']
      }
    },
    {
      pageNumber: 9,
      section: 'PART II · THE JOURNEY',
      title: 'Fiber Enters the Digestive System',
      theme: 'dark',
      content: {
        flowSteps: ['Food', 'Mouth', 'Esophagus', 'Stomach'],
        paragraphs: [
          'Chewing begins the process of breaking food down, mixing it with saliva and preparing it for the stomach.',
          'Fiber travels along with the rest of the meal through the digestive tract, largely unchanged by these early stages.'
        ]
      }
    },
    {
      pageNumber: 10,
      section: 'PART II · THE JOURNEY',
      title: 'Inside the Small Intestine',
      theme: 'dark',
      content: {
        paragraphs: [
          'Many dietary fibers aren’t completely broken down and absorbed in the small intestine the way digestible carbohydrates are. Instead, different fibers can continue onward toward the large intestine, largely intact.'
        ],
        flowSteps: ['Digestible nutrients → absorbed here', 'Fiber → continues onward']
      }
    },
    {
      pageNumber: 11,
      section: 'PART II · THE JOURNEY',
      title: 'Fiber Reaches the Colon',
      theme: 'dark',
      content: {
        paragraphs: [
          'Once fiber arrives at the large intestine, its journey takes a new turn. Some fibers interact with water and contribute to stool bulk.',
          'Other fibers become food for the trillions of microorganisms living in the colon — which leads to one of the most fascinating parts of this story.'
        ]
      }
    },
    {
      pageNumber: 12,
      section: 'PART II · THE JOURNEY',
      title: 'The Gut Microbiome',
      theme: 'dark',
      content: {
        paragraphs: [
          'Inside your large intestine lives a huge community of microorganisms. Some dietary fibers can be used as substrates by these gut microorganisms.',
          'The exact effects depend on the type of fiber, the food source, the makeup of the microbial community, and the individual’s own physiology.'
        ]
      }
    },
    {
      pageNumber: 13,
      section: 'PART II · THE JOURNEY',
      title: 'Fiber & Short-Chain Fatty Acids',
      theme: 'dark',
      content: {
        paragraphs: [
          'During fermentation, gut microorganisms produce compounds including acetate, propionate, and butyrate — collectively known as short-chain fatty acids.',
          'These are products of microbial fermentation of certain fibers and other substrates in the colon.'
        ],
        flowSteps: ['Fiber', 'Gut microbes', 'Fermentation', 'Short-chain fatty acids']
      }
    },
    {
      pageNumber: 14,
      section: 'PART II · THE JOURNEY',
      title: 'Fiber & Stool',
      theme: 'dark',
      content: {
        paragraphs: [
          'One of the most practical effects readers care about. Fiber can influence stool bulk, stool consistency, and intestinal transit — but different fibers can have different effects, and adequate fluid intake matters too.'
        ],
        callout: {
          title: 'DON’T OVERPROMISE',
          text: 'Avoid: "Fiber will cure constipation." Instead: fiber can support normal bowel function, but responses vary from person to person.'
        }
      }
    },
    {
      pageNumber: 15,
      section: 'PART III',
      title: 'Fiber & the Body',
      theme: 'dark',
      content: {
        paragraphs: ['Physiological downstream effects: digestion, glucose, cholesterol, and fullness.']
      }
    },
    {
      pageNumber: 16,
      section: 'PART III · FIBER & THE BODY',
      title: 'Fiber & Digestion',
      theme: 'dark',
      content: {
        paragraphs: [
          'Fiber can influence the physical properties of food and digestive contents. Depending on the type, it can add bulk, hold water, slow certain digestive processes, and interact with gut microorganisms.',
          'This is why simply saying "fiber cleans your intestines" is not an adequate scientific explanation — the reality is more nuanced and more interesting.'
        ]
      }
    },
    {
      pageNumber: 17,
      section: 'PART III · FIBER & THE BODY',
      title: 'Fiber & Blood Glucose',
      theme: 'dark',
      content: {
        paragraphs: [
          'Certain viscous, soluble fibers can slow digestion and absorption of carbohydrates, and may reduce the rise in blood glucose after a meal.',
          'But the effect varies by fiber type, amount, meal composition, and individual physiology.'
        ],
        flowSteps: ['Standard meal: Food → digestion → glucose → blood', 'Fiber-rich meal: Food + fibers → altered digestion → different glucose response']
      }
    },
    {
      pageNumber: 18,
      section: 'PART III · FIBER & THE BODY',
      title: 'Fiber & Cholesterol',
      theme: 'dark',
      content: {
        paragraphs: [
          'Some soluble fibers can help lower LDL cholesterol. This is particularly well-studied for certain fibers such as beta-glucan and psyllium.',
          'But not all fiber-containing foods produce the same cholesterol effect.'
        ],
        callout: {
          title: 'Key message',
          text: 'Fiber type matters. Beta-glucan from oats and barley binds bile acids in the small intestine, promoting hepatic cholesterol conversion.'
        }
      }
    },
    {
      pageNumber: 19,
      section: 'PART III · FIBER & THE BODY',
      title: 'Fiber & Fullness',
      theme: 'dark',
      content: {
        paragraphs: [
          'Fiber-rich foods can contribute to fullness. But appetite is influenced by many things, including protein, energy density, food volume, meal composition, sleep, habits, and individual physiology.',
          'Therefore, "fiber makes you lose weight" is too simplistic.'
        ],
        callout: {
          title: 'Better framing',
          text: 'Fiber-rich foods can support dietary patterns that promote fullness and healthy eating.'
        }
      }
    },
    {
      pageNumber: 20,
      section: 'PART IV',
      title: 'How Much Fiber?',
      theme: 'dark',
      content: {
        paragraphs: ['Daily guidelines, assessing intake, and realistic goals.']
      }
    },
    {
      pageNumber: 21,
      section: 'PART IV · HOW MUCH FIBER?',
      title: 'How Much Fiber Do You Need?',
      theme: 'dark',
      content: {
        paragraphs: [
          'Fiber recommendations aren’t one universal number — they vary by age and sex, based on established dietary reference values from bodies such as the U.S. National Academies.',
          'Rather than fixating on a single figure, think of your target as a general daily range (25g to 38g) to build toward gradually through food.'
        ]
      }
    },
    {
      pageNumber: 22,
      section: 'PART IV · HOW MUCH FIBER?',
      title: 'Are You Getting Enough?',
      theme: 'dark',
      content: {
        paragraphs: [
          'Do you regularly eat fruits, vegetables, beans, lentils, whole grains, nuts & seeds?',
          'If several of these are answered "rarely," your fiber intake may deserve some attention.'
        ],
        callout: {
          title: 'NOT A DIAGNOSIS',
          text: 'This checklist is a reflection prompt, not a diagnostic tool. It can’t determine whether you are "fiber-deficient."'
        }
      }
    },
    {
      pageNumber: 23,
      section: 'PART V',
      title: 'High-Fiber Foods',
      theme: 'dark',
      content: {
        paragraphs: ['Real foods, breakfast, lunch, and dinner templates.']
      }
    },
    {
      pageNumber: 24,
      section: 'PART V · HIGH-FIBER FOODS',
      title: 'High-Fiber Foods by Category',
      theme: 'dark',
      content: {
        subsections: [
          { title: 'Legumes', body: 'Beans, lentils, chickpeas' },
          { title: 'Fruits', body: 'Raspberries, pears, apples, avocado' },
          { title: 'Vegetables', body: 'Broccoli, carrots, green peas' },
          { title: 'Grains', body: 'Oats, barley, whole grains' },
          { title: 'Nuts & Seeds', body: 'Chia seeds, flaxseeds, almonds' }
        ]
      }
    },
    {
      pageNumber: 25,
      section: 'PART V · HIGH-FIBER FOODS',
      title: 'A Fiber-Rich Breakfast',
      theme: 'dark',
      content: {
        paragraphs: [
          'Oatmeal + berries + chia seeds + nuts',
          'Several plant foods can contribute fiber simultaneously within a single meal. Combining grains, fruit, seeds, and nuts is a simple way to layer different fiber types together.'
        ]
      }
    },
    {
      pageNumber: 26,
      section: 'PART V · HIGH-FIBER FOODS',
      title: 'A Fiber-Rich Lunch',
      theme: 'dark',
      content: {
        paragraphs: [
          'Beans + vegetables + whole grain + avocado',
          'This isn’t a magical health formula — the purpose is to demonstrate how fiber-rich foods can be combined into an ordinary, satisfying plate.'
        ]
      }
    },
    {
      pageNumber: 27,
      section: 'PART V · HIGH-FIBER FOODS',
      title: 'A Fiber-Rich Dinner',
      theme: 'dark',
      content: {
        paragraphs: [
          'Lentils or beans + vegetables + whole grain',
          'Practical alternatives exist for different eating preferences — the underlying pattern (legume + vegetable + whole grain) can be adapted to most cuisines and diets.'
        ]
      }
    },
    {
      pageNumber: 28,
      section: 'PART VI',
      title: 'Increasing Fiber',
      theme: 'dark',
      content: {
        paragraphs: ['How to step up intake comfortably without digestive distress.']
      }
    },
    {
      pageNumber: 29,
      section: 'PART VI · INCREASING FIBER',
      title: 'How to Increase Fiber',
      theme: 'dark',
      content: {
        subsections: [
          { title: '1 Increase gradually', body: 'Sudden, large jumps in fiber intake are the most common cause of digestive discomfort.' },
          { title: '2 Eat a wider variety of plant foods', body: 'Different plants supply different fiber types alongside other nutrients.' },
          { title: '3 Choose whole grains more often', body: 'Swap refined grains for whole-grain versions where practical.' },
          { title: '4 Add beans and lentils', body: 'Legumes are among the most concentrated everyday sources of fiber.' },
          { title: '5 Include fruits and vegetables regularly', body: 'Aim for variety and consistency rather than any single "superfood."' },
          { title: '6 Drink enough fluids', body: 'Adequate hydration supports how certain fibers move through the digestive tract.' }
        ]
      }
    },
    {
      pageNumber: 30,
      section: 'PART VI · INCREASING FIBER',
      title: 'Why Too Much, Too Quickly, Can Feel Bad',
      theme: 'dark',
      content: {
        paragraphs: [
          'Someone suddenly jumping from a low-fiber diet to a very high-fiber diet may experience digestive discomfort such as gas, bloating, or abdominal discomfort.'
        ],
        callout: {
          title: 'Guideline',
          text: 'Increase gradually rather than going from very little fiber to a huge amount overnight.'
        }
      }
    },
    {
      pageNumber: 31,
      section: 'PART VII · FIBER MYTHS',
      title: 'Fiber Myths',
      theme: 'dark',
      content: {
        subsections: [
          { title: 'MYTH: "All fiber works the same way."', body: 'Reality: False. Different fibers have different physical and physiological properties.' },
          { title: 'MYTH: "Fiber completely passes through your body unchanged."', body: 'Reality: Not always. Some fibers can be fermented by gut microorganisms.' },
          { title: 'MYTH: "Fiber only helps with constipation."', body: 'Reality: Too narrow. Fiber has multiple physiological roles, from blood glucose to cholesterol to fullness.' },
          { title: 'MYTH: "More fiber is always better."', body: 'Reality: Not necessarily. The amount and rate of increase matter, and needs vary between individuals.' },
          { title: 'MYTH: "Fiber supplements are always better than food."', body: 'Reality: Not necessarily. Whole foods can provide fiber alongside other nutrients that supplements don’t supply.' }
        ]
      }
    },
    {
      pageNumber: 32,
      section: 'SUMMARY',
      title: '7 Things to Remember About Fiber',
      theme: 'dark',
      content: {
        subsections: [
          { title: '1', body: 'Fiber is not one single substance.' },
          { title: '2', body: 'Different fibers behave differently in the digestive system.' },
          { title: '3', body: 'Much dietary fiber isn’t completely digested in the small intestine.' },
          { title: '4', body: 'Some fibers reach the colon and can be fermented by gut microorganisms.' },
          { title: '5', body: 'Fiber can support bowel function and may influence glucose and cholesterol, depending on type and context.' },
          { title: '6', body: 'Plant foods are important sources of dietary fiber.' },
          { title: '7', body: 'Increasing fiber gradually and eating a variety of fiber-rich foods is usually more practical than chasing one "superfood."' }
        ]
      }
    }
  ]
};

export const SUGAR_GUIDE: BookGuide = {
  id: 'SUG-001',
  title: 'Sugar & Your Body',
  subtitle: 'What Really Happens When You Eat Too Much Sugar?',
  series: 'NUTRITION • VISUAL HEALTH GUIDE',
  totalPages: 35,
  pages: [
    {
      pageNumber: 1,
      section: 'COVER',
      title: 'SUGAR & YOUR BODY',
      subtitle: 'What Really Happens When You Eat Too Much Sugar?',
      theme: 'cover',
      content: {
        paragraphs: [
          'NUTRITION • VISUAL HEALTH GUIDE',
          'DIGESTION • BLOOD GLUCOSE • INSULIN • METABOLIC HEALTH'
        ]
      }
    },
    {
      pageNumber: 2,
      section: 'FRONT MATTER',
      title: 'Welcome',
      theme: 'light',
      content: {
        paragraphs: [
          'Sugar is everywhere — in desserts, soft drinks, sauces, breakfast foods, snacks and countless packaged products.',
          'At the same time, sugar has become one of the most misunderstood parts of nutrition. Is sugar actually harmful? Is fruit sugar different? What happens inside your body after you eat something sweet? Why does blood glucose rise? What does insulin do? And what does "too much sugar" actually mean?',
          'This guide is designed to answer those questions visually and simply. Instead of treating sugar as either a miracle or a poison, we’ll follow what happens inside the body and look at what current nutrition evidence can — and cannot — tell us.'
        ],
        callout: {
          title: 'INSIDE THIS GUIDE',
          text: 'Digestion • Blood Glucose • Insulin • Added Sugar • Sugary Drinks • Dental Health • Myths'
        }
      }
    },
    {
      pageNumber: 3,
      section: 'FRONT MATTER',
      title: 'Important Health Information',
      theme: 'light',
      content: {
        paragraphs: [
          'This guide is intended for general educational and informational purposes only. It is not medical advice and does not diagnose, treat, prevent or cure any disease or medical condition.',
          'Individual responses to foods and dietary patterns can vary because of factors including age, activity, medications, health conditions, genetics and overall diet.',
          'If you have a medical condition, have concerns about blood glucose, or are making significant dietary changes, speak with a qualified healthcare professional.'
        ],
        callout: {
          title: 'EVIDENCE NOTE',
          text: 'Nutrition research can change as new evidence becomes available. Where evidence is mixed or uncertain, this guide identifies that uncertainty rather than presenting speculation as fact.',
          type: 'warning'
        }
      }
    },
    {
      pageNumber: 4,
      section: 'PART I — UNDERSTANDING SUGAR',
      title: 'What Is Sugar?',
      theme: 'light',
      content: {
        paragraphs: [
          'Sugars are a type of carbohydrate.',
          'Common sugars include glucose, fructose, galactose, sucrose and lactose. Some occur naturally in foods such as fruit and milk, while others are added during food processing or preparation.',
          'Glucose is particularly important because it is a major fuel used by the body’s cells. Sucrose — the familiar table sugar — is made from glucose and fructose.'
        ],
        callout: {
          title: 'The important point',
          text: 'The word "sugar" therefore doesn’t tell you everything about a food’s nutritional value. An orange and a soft drink can both contain sugars, but they are very different foods.'
        }
      }
    },
    {
      pageNumber: 5,
      section: 'PART I',
      title: 'Added Sugar vs. Natural Sugar',
      theme: 'light',
      content: {
        subsections: [
          {
            title: 'NATURALLY OCCURRING',
            body: 'Found in whole foods like fruit (fructose) and milk (lactose) — alongside water, fiber and other nutrients.'
          },
          {
            title: 'ADDED DURING PROCESSING',
            body: 'Added to soft drinks, candy and many desserts — often without the fiber or food structure of whole foods.'
          }
        ],
        paragraphs: [
          'The distinction matters because foods are more than individual nutrients. A whole fruit can provide water, fiber and micronutrients alongside its naturally occurring sugars. A sugary drink can deliver a substantial amount of sugar without the same amount of fiber or food structure.'
        ],
        callout: {
          title: 'KEY IDEA',
          text: 'Don’t judge a food only by the word "sugar" on its own. Look at the whole food.'
        }
      }
    },
    {
      pageNumber: 6,
      section: 'PART I',
      title: 'Where Sugar Comes From',
      theme: 'light',
      content: {
        subsections: [
          {
            title: 'Naturally occurring',
            body: 'Fruits, Some vegetables, Milk and dairy foods'
          },
          {
            title: 'Added during preparation or processing',
            body: 'Soft drinks, Sweets, Cakes & cookies, Sweetened cereals, Sweetened beverages, Desserts, Many packaged foods'
          }
        ],
        quote: 'What kind of food is it, how much am I consuming, and what else does it provide?'
      }
    },
    {
      pageNumber: 7,
      section: 'PART II — THE JOURNEY THROUGH YOUR BODY',
      title: 'The First Bite',
      theme: 'dark',
      content: {
        flowSteps: ['MOUTH', 'ESOPHAGUS', 'STOMACH', 'SMALL INTESTINE'],
        paragraphs: [
          'Imagine drinking a sugary beverage. The process begins immediately — it enters your mouth, is swallowed, and travels through the esophagus toward the stomach.',
          'Unlike a solid meal, a sugary drink requires relatively little mechanical processing before moving through the digestive system. The journey continues toward the small intestine, where carbohydrates are broken down and sugars can be absorbed.'
        ]
      }
    },
    {
      pageNumber: 8,
      section: 'PART II',
      title: 'Inside the Stomach',
      theme: 'light',
      content: {
        paragraphs: [
          'The stomach is a temporary holding and mixing chamber. Food and beverages entering the stomach become part of the digestive process before passing onward.',
          'But the stomach isn’t where most nutrient absorption occurs. For sugars and other carbohydrates, the small intestine becomes particularly important.'
        ],
        flowSteps: ['Food inside the digestive tract', 'Nutrients becoming available to the body']
      }
    },
    {
      pageNumber: 9,
      section: 'PART II',
      title: 'The Small Intestine',
      theme: 'dark',
      content: {
        flowSteps: ['CARBOHYDRATE', 'DIGESTION', 'SIMPLE SUGARS', 'ABSORPTION', 'BLOODSTREAM'],
        paragraphs: [
          'The small intestine is a major site of digestion and nutrient absorption. Carbohydrates are broken down into smaller molecules that can be absorbed. Glucose and other simple sugars can then cross from the digestive tract into circulation.'
        ]
      }
    },
    {
      pageNumber: 10,
      section: 'PART II',
      title: 'Glucose Enters the Bloodstream',
      theme: 'light',
      content: {
        paragraphs: [
          'After carbohydrate-containing foods are digested and absorbed, blood glucose can rise. The size and duration of the response can vary depending on the food, amount consumed, other nutrients in the meal, physical activity and individual physiology.',
          'A rise in blood glucose after eating is a normal physiological response — not automatically a sign that something has gone wrong.'
        ],
        callout: {
          title: 'KEY IDEA',
          text: 'Blood glucose regulation is a dynamic process — not a simple "sugar in, damage out" system.'
        }
      }
    },
    {
      pageNumber: 11,
      section: 'PART II',
      title: 'Insulin Enters the Story',
      theme: 'light',
      content: {
        paragraphs: [
          'After blood glucose rises, the body responds through several regulatory mechanisms. Insulin is one of the major hormones involved in glucose regulation.',
          'It helps coordinate the movement and storage of nutrients and plays an important role in maintaining blood glucose within the body’s normal range.'
        ],
        flowSteps: ['Food', 'Glucose', 'Blood', 'Insulin signaling', 'Tissues'],
        callout: {
          title: 'A NOTE ON THIS GUIDE',
          text: 'Think of the system as a coordinated network rather than a single switch.'
        }
      }
    },
    {
      pageNumber: 12,
      section: 'PART II',
      title: 'Where Does the Glucose Go?',
      theme: 'light',
      content: {
        paragraphs: [
          'Glucose can be used by tissues for energy, while some can be stored — particularly as glycogen in the liver and muscles. What happens to incoming nutrients depends on the body’s current energy needs and metabolic state.'
        ],
        callout: {
          title: 'A NOTE ON THIS GUIDE',
          text: 'This is why what happens after eating cannot be reduced to "sugar becomes fat." The body’s metabolism is considerably more complicated than that.'
        }
      }
    },
    {
      pageNumber: 13,
      section: 'PART III — SUGAR, ENERGY & APPETITE',
      title: 'Sugar and Energy',
      theme: 'light',
      content: {
        paragraphs: [
          'Glucose is an important energy substrate. When carbohydrate-containing foods are digested, the resulting glucose can contribute to the body’s energy supply.',
          'But eating sugar does not mean you have discovered a special source of energy that the body uniquely requires. The body can obtain energy from multiple nutrients.'
        ],
        bullets: [
          'Total energy intake',
          'Protein',
          'Carbohydrates',
          'Fats',
          'Micronutrients',
          'Physical activity',
          'Overall dietary pattern'
        ]
      }
    },
    {
      pageNumber: 14,
      section: 'PART III',
      title: 'What Happens After the Rise?',
      theme: 'light',
      content: {
        paragraphs: [
          'Blood glucose does not simply remain at the level reached after a meal. The body continuously works to regulate it, and the response varies between individuals and between meals.'
        ],
        bullets: [
          'Portion size',
          'Carbohydrate composition',
          'Fiber, fat & protein co-ingestion',
          'Physical activity',
          'Individual metabolic characteristics'
        ],
        callout: {
          title: 'A NOTE ON THIS GUIDE',
          text: 'Statements such as "everyone gets a massive sugar crash after eating sugar" are too simplistic.'
        }
      }
    },
    {
      pageNumber: 15,
      section: 'PART III',
      title: 'Why Sugary Drinks Deserve Attention',
      theme: 'light',
      content: {
        paragraphs: [
          'Sugary beverages are easy to consume quickly. They can provide substantial amounts of added sugar without providing the same amount of fiber or chewing-related fullness that accompanies many whole foods.'
        ],
        bullets: [
          'Soda',
          'Sweetened tea & coffee',
          'Energy drinks',
          'Other sugar-sweetened beverages'
        ],
        callout: {
          title: 'KEY IDEA',
          text: 'The issue isn’t that liquid sugar is a magical toxin. The issue is that beverages can make consuming large amounts of added sugar easier for some people.'
        }
      }
    },
    {
      pageNumber: 16,
      section: 'PART III',
      title: 'Sugar and Appetite',
      theme: 'light',
      content: {
        paragraphs: [
          'Appetite is influenced by many factors, including hunger, fullness, food composition, sleep, activity, environment, habits and individual preferences.',
          'Highly palatable foods can be easy to overconsume, particularly when they are energy-dense and readily available. But saying "sugar automatically makes you addicted" is an oversimplification — human eating behavior is much more complicated.'
        ]
      }
    },
    {
      pageNumber: 17,
      section: 'PART IV — TOO MUCH ADDED SUGAR',
      title: 'What Does "Too Much" Mean?',
      subtitle: '50g FDA DAILY VALUE FOR ADDED SUGARS',
      theme: 'light',
      content: {
        paragraphs: [
          '"Too much sugar" is not a single universal number that describes every person’s diet. The more useful concept is to understand: how much, how often, what type, what is replacing what, and what the rest of the diet looks like.'
        ],
        subsections: [
          {
            title: 'WHO GUIDELINE',
            body: 'Recommends free sugars be less than 10% of total daily energy intake, with further reduction below 5% suggested for additional benefits. For a 2,000-calorie diet, that’s approximately 50 g/day.'
          },
          {
            title: 'FDA GUIDANCE',
            body: 'The Daily Value for added sugars is 50 g/day based on a 2,000-calorie diet. U.S. Dietary Guidelines recommend limiting calories from added sugars to less than 10% of total calories.'
          }
        ],
        callout: {
          title: 'A NOTE ON THIS GUIDE',
          text: 'For a 2,000-calorie diet, 50 g is the FDA Daily Value for added sugars and corresponds to 10% of calories. Individual energy needs differ — this is a reference point, not a rule for everyone.'
        }
      }
    },
    {
      pageNumber: 18,
      section: 'PART IV',
      title: 'When Added Sugar Intake Is High',
      theme: 'light',
      content: {
        paragraphs: [
          'Diets high in added sugars can make it more difficult to meet nutrient needs while staying within calorie requirements.',
          'Depending on the overall dietary pattern, high intake can also contribute to excess energy intake and may be associated with poorer health outcomes.'
        ],
        callout: {
          title: 'KEY IDEA',
          text: 'Sugar doesn’t need to be described as poison to explain why excessive intake can be a nutritional problem.'
        }
      }
    },
    {
      pageNumber: 19,
      section: 'PART IV',
      title: 'Sugar and Your Teeth',
      theme: 'dark',
      content: {
        flowSteps: ['FREE SUGAR EXPOSURE', 'ORAL BACTERIA METABOLIZE CARBS', 'ACID PRODUCTION', 'REPEATED ACID CHALLENGE', 'DENTAL CARIES RISK'],
        paragraphs: [
          'Dental health is one area where sugar has a particularly clear relationship with disease risk.',
          'Frequent exposure to free sugars contributes to the development of dental caries. Frequency of exposure matters as much as total amount.'
        ]
      }
    },
    {
      pageNumber: 20,
      section: 'PART IV',
      title: 'Sugar-Sweetened Beverages',
      theme: 'light',
      content: {
        paragraphs: [
          'Sugar-sweetened beverages deserve special attention because they can deliver considerable amounts of free/added sugars. FDA identifies them among the major sources of added sugars in the U.S. diet.'
        ],
        bullets: ['Soda', 'Sweetened fruit drinks', 'Sweetened teas', 'Energy drinks', 'Sweetened coffee drinks'],
        callout: {
          title: 'KEY IDEA',
          text: 'One of the simplest places to look when reducing added/free sugar intake is what you drink. Replacing some sugary beverages with unsweetened alternatives can reduce added sugar consumption without requiring someone to eliminate every sweet food.'
        }
      }
    },
    {
      pageNumber: 21,
      section: 'PART V — SUGAR & METABOLIC HEALTH',
      title: 'Sugar and the Liver',
      theme: 'dark',
      content: {
        flowSteps: ['INTESTINE', 'BLOODSTREAM', 'LIVER', 'GLUCOSE STORAGE'],
        paragraphs: [
          'The liver plays a central role in carbohydrate metabolism. It helps regulate glucose availability and stores glucose in the form of glycogen, while also participating in processing nutrients arriving from the digestive system.'
        ],
        callout: {
          title: 'A NOTE ON THIS GUIDE',
          text: 'This is why discussions about sugar and metabolic health cannot focus on one organ or one molecule alone.'
        }
      }
    },
    {
      pageNumber: 22,
      section: 'PART V',
      title: 'Sugar and Body Weight',
      theme: 'light',
      content: {
        paragraphs: [
          'Body weight is influenced by many factors, including energy intake, physical activity, genetics, sleep, environment, medications and individual biology.',
          'Foods and drinks high in added sugars can contribute to energy intake. When energy intake consistently exceeds energy expenditure, body weight can increase.'
        ],
        callout: {
          title: 'KEY IDEA',
          text: 'It is more accurate to discuss sugar as one part of an overall dietary pattern than to describe sugar as the sole cause of weight gain.'
        }
      }
    },
    {
      pageNumber: 23,
      section: 'PART V',
      title: 'Sugar and Diabetes',
      theme: 'light',
      content: {
        paragraphs: [
          'One of the most common nutrition myths is: "eating sugar directly causes diabetes." The reality is more complicated.',
          'Type 2 diabetes is a complex condition influenced by multiple genetic, metabolic, behavioral and environmental factors. Diet is one part of this picture. High intake of added sugars — particularly within a dietary pattern that contributes to excess energy intake — can be relevant to metabolic health.'
        ],
        callout: {
          title: 'IMPORTANT',
          text: 'Saying that eating sugar alone "causes diabetes" is an oversimplification. If you have diabetes or are concerned about blood glucose, individual dietary advice should come from an appropriate healthcare professional.',
          type: 'warning'
        }
      }
    },
    {
      pageNumber: 24,
      section: 'PART V',
      title: 'Sugar and Heart Health',
      theme: 'light',
      content: {
        paragraphs: [
          'Research has linked higher consumption of sugar-sweetened beverages and higher intake of added/free sugars with some adverse cardiometabolic outcomes. However, the strength of evidence and the size of associations vary depending on the population, exposure and study design.'
        ],
        callout: {
          title: 'KEY IDEA',
          text: 'An association does not automatically demonstrate that sugar itself caused the outcome. The safest conclusion is to consider added sugar within the broader dietary pattern and overall health context.'
        }
      }
    },
    {
      pageNumber: 25,
      section: 'PART VI — COMMON QUESTIONS',
      title: 'What Happens When You Reduce Added Sugar?',
      theme: 'light',
      content: {
        paragraphs: [
          'You don’t need a dramatic "detox" to explain what happens. Reducing added sugar may change the overall composition of someone’s diet.',
          'Someone who stops drinking several sugary beverages every day may substantially reduce their energy and added-sugar intake. Someone who replaces desserts with whole foods may also change their overall nutrient intake. The result depends on what replaces the sugar.'
        ],
        callout: {
          title: 'KEY IDEA',
          text: 'Reduce added sugar — not necessarily every food containing sugar. Reducing added sugar is not the same thing as eliminating every carbohydrate.'
        }
      }
    },
    {
      pageNumber: 26,
      section: 'PART VI',
      title: 'Is Fruit Sugar Bad?',
      theme: 'light',
      content: {
        paragraphs: [
          'Whole fruit contains naturally occurring sugars. But whole fruit also contains other components such as fiber, water, vitamins, minerals and plant compounds.',
          'Therefore, the statement "fruit contains sugar, therefore fruit is bad" does not accurately represent the nutritional evidence.'
        ],
        callout: {
          title: 'KEY IDEA',
          text: 'The presence of sugar alone does not make a food nutritionally equivalent to candy or a sugar-sweetened beverage. A food should be evaluated as a whole — not simply by isolating one nutrient.'
        }
      }
    },
    {
      pageNumber: 27,
      section: 'PART VI',
      title: 'Is Honey Healthier Than Sugar?',
      theme: 'light',
      content: {
        paragraphs: [
          'Honey is a sweetener that contains sugars. FDA’s definition of added sugars includes sugars from honey and syrups when used as sweeteners.',
          'Although honey has a different composition from table sugar and may contain small amounts of other compounds, it should not be treated as a sugar-free or unlimited alternative.'
        ],
        callout: {
          title: 'KEY IDEA',
          text: 'The fact that a sweetener is natural does not automatically make large amounts beneficial. Switching from table sugar to another caloric sweetener does not make the underlying issue disappear.'
        }
      }
    },
    {
      pageNumber: 28,
      section: 'PART VI',
      title: 'What About Brown Sugar?',
      theme: 'light',
      content: {
        paragraphs: [
          'Brown sugar is often marketed as a healthier alternative to white sugar. However, the nutritional difference is relatively small — brown sugar is still primarily sugar.',
          'Although it can differ slightly in composition from refined white sugar, those differences do not make it a fundamentally different health food.'
        ],
        callout: {
          title: 'KEY IDEA',
          text: 'Different appearance does not necessarily mean dramatically different health effects.'
        }
      }
    },
    {
      pageNumber: 29,
      section: 'PART VII — MYTHS',
      title: 'Sugar Myths, Part 1',
      theme: 'light',
      content: {
        subsections: [
          {
            title: 'MYTH: "Sugar causes diabetes."',
            body: 'REALITY: Diabetes has multiple causes and risk factors. Sugar intake is only one part of the broader dietary picture.'
          },
          {
            title: 'MYTH: "Fruit sugar is exactly the same as eating candy."',
            body: 'REALITY: The sugars may overlap chemically, but the foods differ substantially in fiber, water, nutrients, structure and how they are consumed.'
          },
          {
            title: 'MYTH: "Brown sugar is dramatically healthier."',
            body: 'REALITY: Brown sugar remains primarily sugar, and the nutritional difference from white sugar is relatively small.'
          }
        ]
      }
    },
    {
      pageNumber: 30,
      section: 'PART VII',
      title: 'Sugar Myths, Part 2',
      theme: 'light',
      content: {
        subsections: [
          {
            title: 'MYTH: "You must completely eliminate sugar."',
            body: 'REALITY: A healthier dietary pattern does not automatically require eliminating every food containing sugar.'
          },
          {
            title: 'MYTH: "Sugar detoxes remove toxins."',
            body: 'REALITY: There is no need to present "sugar detox" as a medical cleansing process. The body already has organs and systems responsible for processing and eliminating substances.'
          },
          {
            title: 'MYTH: "All carbohydrates are sugar."',
            body: 'REALITY: Carbohydrates include different types and structures. Simple sugars are carbohydrates, but carbohydrates are not all identical to table sugar.'
          }
        ]
      }
    },
    {
      pageNumber: 31,
      section: 'PART VIII — PRACTICAL GUIDE',
      title: 'How to Reduce Added Sugar',
      theme: 'light',
      content: {
        subsections: [
          { title: '01 CHECK BEVERAGES', body: 'Look at soda, sweetened tea, coffee and other drinks — often the easiest place to start.' },
          { title: '02 READ LABELS', body: 'Look for added sugars where nutrition labeling provides that information.' },
          { title: '03 COMPARE PRODUCTS', body: 'Choose lower-added-sugar versions when practical.' },
          { title: '04 KEEP WHOLE FOODS PROMINENT', body: 'Build meals around foods that provide useful nutrients.' },
          { title: '05 REDUCE GRADUALLY', body: 'A small sustainable change can be more practical than an extreme restriction.' }
        ],
        table: {
          headers: ['Nutrition Facts', 'Amount / %DV'],
          rows: [
            ['Total Sugars', '18g'],
            ['Includes Added Sugars', '12g (24% DV)']
          ]
        },
        callout: {
          title: 'How to Read Added Sugar',
          text: 'FDA’s Nutrition Facts label separates Total Sugars from Added Sugars. The %DV is useful for comparison: 5% DV or less is Low, 20% DV or more is High.'
        }
      }
    },
    {
      pageNumber: 32,
      section: 'PART VIII',
      title: 'Sugar FAQ',
      theme: 'light',
      content: {
        faqItems: [
          { question: 'Is sugar completely bad?', answer: 'No. The context, amount and overall dietary pattern matter.' },
          { question: 'Is fruit sugar bad?', answer: 'Whole fruit can be part of a healthy diet.' },
          { question: 'Is honey sugar?', answer: 'Yes. Honey contains sugars.' },
          { question: 'Is brown sugar healthier?', answer: 'It is still primarily sugar.' },
          { question: 'Does sugar automatically cause diabetes?', answer: 'No. Diabetes has multiple contributing factors.' },
          { question: 'Does sugar give everyone a sugar crash?', answer: 'No. Responses vary between individuals and meals.' },
          { question: 'Should I stop eating all carbohydrates?', answer: 'Not simply because you’re concerned about sugar.' },
          { question: 'Are sugary drinks important to watch?', answer: 'Yes — they can be a significant source of added/free sugars.' },
          { question: 'Is sugar addictive?', answer: 'Human eating behavior is more complex than simply labeling sugar as an addictive drug.' },
          { question: 'Can I still eat dessert?', answer: 'A dietary pattern does not need to be perfect to be healthy.' }
        ]
      }
    },
    {
      pageNumber: 33,
      section: 'BACK MATTER',
      title: '7 Things to Remember',
      theme: 'light',
      content: {
        subsections: [
          { title: '01', body: 'Sugar is a type of carbohydrate.' },
          { title: '02', body: 'Not every sugar-containing food has the same nutritional context.' },
          { title: '03', body: 'Digested carbohydrates can provide glucose that enters the bloodstream.' },
          { title: '04', body: 'Insulin plays an important role in blood-glucose regulation.' },
          { title: '05', body: 'High consumption of added sugars — particularly through sugary beverages — can be an important part of an unhealthy dietary pattern.' },
          { title: '06', body: 'Whole fruit should not be treated as nutritionally identical to candy or sugary drinks simply because both contain sugars.' },
          { title: '07', body: 'Nutrition is about patterns, not fear of one ingredient.' }
        ]
      }
    },
    {
      pageNumber: 34,
      section: 'BACK MATTER',
      title: 'References & Further Reading',
      theme: 'light',
      content: {
        bullets: [
          '1. NIH / NIDDK — Blood glucose regulation after carbohydrate digestion and absorption.',
          '2. NIH — Glucose storage as glycogen in liver and muscle tissue.',
          '3. CDC — Sugar-sweetened beverages and associated health outcomes.',
          '4. WHO — Guideline: Sugars intake for adults and children (free sugars < 10%, ideally < 5%, of total energy intake).',
          '5. FDA — Added Sugars on the Nutrition Facts Label; Daily Value guidance.',
          '6. CDC — Added sugars and chronic disease risk (weight, type 2 diabetes, heart disease).',
          '7. American Dental Association / WHO — Free sugars and dental caries risk.'
        ],
        callout: {
          title: 'A NOTE ON THIS GUIDE',
          text: 'Evidence hierarchy used for this guide: government/public-health agencies (WHO, FDA, CDC, NIH) → professional organizations (AHA, ADA) → systematic reviews/meta-analyses → individual studies. Social-media posts and blogs are not used as evidence sources.'
        }
      }
    },
    {
      pageNumber: 35,
      section: 'BACK MATTER',
      title: 'You Asked About Sugar. Now Explore Eggs.',
      theme: 'light',
      content: {
        paragraphs: [
          'The Complete Egg Health Guide — understand egg nutrition, protein, yolk vs. white, digestion, cholesterol, cooking methods and egg safety.',
          'More food. More science. More answers.'
        ],
        subsections: [
          { title: 'SUGAR & YOUR BODY', body: 'Current Guide' },
          { title: 'THE COMPLETE EGG HEALTH GUIDE', body: 'Available Now' },
          { title: 'THE COMPLETE FIBER GUIDE', body: 'Coming Next' }
        ]
      }
    }
  ]
};

export const ALL_GUIDES: Record<string, BookGuide> = {
  'EGG-001': EGG_HEALTH_GUIDE,
  'FIB-001': FIBER_GUIDE,
  'SUG-001': SUGAR_GUIDE
};

export function getGuideById(id: string): BookGuide | undefined {
  if (!id) return undefined;
  const upper = id.toUpperCase();
  if (upper === 'EGG-001' || upper.includes('EGG')) {
    return EGG_HEALTH_GUIDE;
  }
  if (upper === 'FIB-001' || upper.includes('FIB')) {
    return FIBER_GUIDE;
  }
  if (upper === 'SUG-001' || upper.includes('SUG')) {
    return SUGAR_GUIDE;
  }
  if (upper === 'BND-001' || upper.includes('BND') || upper.includes('BUNDLE')) {
    return EGG_HEALTH_GUIDE; // Default starter guide for bundle
  }
  return ALL_GUIDES[id];
}
