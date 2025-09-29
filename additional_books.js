const additionalBooks = [
  // Japanese Literature
  {
    id: "norwegian_wood",
    title: "Norwegian Wood",
    author: "Haruki Murakami",
    genres: ["Literary Fiction", "Japanese Literature", "Romance"],
    description:
      "Toru Watanabe looks back on his days as a university student in 1960s Tokyo.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780375704024-L.jpg",
    tags: ["love", "memory", "university", "Tokyo", "coming of age"],
  },
  {
    id: "kafka_on_the_shore",
    title: "Kafka on the Shore",
    author: "Haruki Murakami",
    genres: ["Magical Realism", "Japanese Literature", "Surreal"],
    description:
      "Two parallel stories about a teenage boy and an elderly man with unusual abilities.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781400079278-L.jpg",
    tags: ["magical realism", "parallel stories", "cats", "library", "surreal"],
  },
  {
    id: "the_wind_up_bird_chronicle",
    title: "The Wind-Up Bird Chronicle",
    author: "Haruki Murakami",
    genres: ["Surreal Fiction", "Japanese Literature", "Mystery"],
    description:
      "A man searches for his missing cat and wife in this surreal tale.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780679775430-L.jpg",
    tags: ["surreal", "missing wife", "well", "war memories", "mystery"],
  },
  {
    id: "hard_boiled_wonderland",
    title: "Hard-Boiled Wonderland and the End of the World",
    author: "Haruki Murakami",
    genres: ["Science Fiction", "Surreal Fiction", "Japanese Literature"],
    description: "Two parallel narratives about consciousness and identity.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780679743460-L.jpg",
    tags: [
      "consciousness",
      "parallel worlds",
      "identity",
      "unicorns",
      "cyberpunk",
    ],
  },
  {
    id: "1q84",
    title: "1Q84",
    author: "Haruki Murakami",
    genres: ["Dystopian Fiction", "Japanese Literature", "Magical Realism"],
    description:
      "Aomame and Tengo's lives intertwine in an alternate version of 1984 Tokyo.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780307593313-L.jpg",
    tags: ["alternate reality", "cult", "assassin", "writer", "Tokyo"],
  },
  {
    id: "snow_country",
    title: "Snow Country",
    author: "Yasunari Kawabata",
    genres: ["Literary Fiction", "Japanese Literature", "Aesthetic"],
    description:
      "A Tokyo dilettante's affair with a geisha in a remote hot-spring town.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780679761044-L.jpg",
    tags: ["geisha", "hot springs", "aesthetic", "melancholy", "beauty"],
  },
  {
    id: "thousand_cranes",
    title: "Thousand Cranes",
    author: "Yasunari Kawabata",
    genres: ["Literary Fiction", "Japanese Literature", "Tea Ceremony"],
    description:
      "A young man becomes involved with his late father's mistress and her daughter.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780679762652-L.jpg",
    tags: ["tea ceremony", "tradition", "guilt", "beauty", "inheritance"],
  },
  {
    id: "the_sound_of_the_mountain",
    title: "The Sound of the Mountain",
    author: "Yasunari Kawabata",
    genres: ["Literary Fiction", "Japanese Literature", "Family"],
    description: "An elderly man contemplates his relationships and mortality.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780679762638-L.jpg",
    tags: ["aging", "family", "mortality", "beauty", "relationships"],
  },
  {
    id: "the_tale_of_genji",
    title: "The Tale of Genji",
    author: "Murasaki Shikibu",
    genres: ["Classical Literature", "Japanese Literature", "Romance"],
    description:
      "The world's first novel, following Prince Genji's romantic adventures.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780679417385-L.jpg",
    tags: ["classical", "romance", "court life", "first novel", "Heian period"],
  },
  {
    id: "no_longer_human",
    title: "No Longer Human",
    author: "Osamu Dazai",
    genres: ["Literary Fiction", "Japanese Literature", "Psychological"],
    description:
      "Yozo's descent into despair and his feeling of alienation from humanity.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780811204811-L.jpg",
    tags: ["alienation", "despair", "addiction", "psychology", "human nature"],
  },
  {
    id: "the_setting_sun",
    title: "The Setting Sun",
    author: "Osamu Dazai",
    genres: ["Literary Fiction", "Japanese Literature", "Post-war"],
    description: "A aristocratic family's decline after World War II.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780811200325-L.jpg",
    tags: ["aristocracy", "decline", "post-war", "society", "change"],
  },
  {
    id: "rashomon",
    title: "Rashōmon and Seventeen Other Stories",
    author: "Ryūnosuke Akutagawa",
    genres: ["Short Stories", "Japanese Literature", "Classic"],
    description:
      "Classic Japanese short stories including the famous 'Rashōmon' and 'In a Grove'.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780140449709-L.jpg",
    tags: [
      "perspective",
      "truth",
      "morality",
      "classical Japan",
      "short stories",
    ],
  },
  {
    id: "kitchen",
    title: "Kitchen",
    author: "Banana Yoshimoto",
    genres: ["Contemporary Fiction", "Japanese Literature", "Coming-of-age"],
    description:
      "Mikage finds comfort in kitchens while dealing with loss and new relationships.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780671883041-L.jpg",
    tags: ["grief", "kitchens", "comfort", "relationships", "healing"],
  },
  {
    id: "battle_royale",
    title: "Battle Royale",
    author: "Koushun Takami",
    genres: ["Dystopian Fiction", "Japanese Literature", "Thriller"],
    description:
      "High school students are forced to fight to the death on a remote island.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781421565989-L.jpg",
    tags: [
      "dystopia",
      "survival",
      "violence",
      "students",
      "government control",
    ],
  },
  {
    id: "silence",
    title: "Silence",
    author: "Shūsaku Endō",
    genres: ["Historical Fiction", "Religious", "Japanese Literature"],
    description:
      "Portuguese missionaries face persecution in 17th-century Japan.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780800871864-L.jpg",
    tags: ["Christianity", "persecution", "faith", "Japan", "missionaries"],
  },

  // Chinese Literature
  {
    id: "red_sorghum",
    title: "Red Sorghum",
    author: "Mo Yan",
    genres: ["Historical Fiction", "Chinese Literature", "Magic Realism"],
    description:
      "Three generations of a family during the Japanese invasion of China.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780140168525-L.jpg",
    tags: [
      "Chinese history",
      "Japanese invasion",
      "family saga",
      "rural China",
      "resistance",
    ],
  },
  {
    id: "big_breasts_wide_hips",
    title: "Big Breasts and Wide Hips",
    author: "Mo Yan",
    genres: ["Literary Fiction", "Chinese Literature", "Historical"],
    description:
      "The story of China through the 20th century as seen through one family.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781559708746-L.jpg",
    tags: ["20th century China", "family", "women", "history", "survival"],
  },
  {
    id: "the_republic_of_wine",
    title: "The Republic of Wine",
    author: "Mo Yan",
    genres: ["Satirical Fiction", "Chinese Literature", "Dark Comedy"],
    description:
      "A detective investigates cannibalism in a city obsessed with fine cuisine.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9781559704663-L.jpg",
    tags: ["satire", "cannibalism", "corruption", "cuisine", "detective"],
  },
  {
    id: "to_live",
    title: "To Live",
    author: "Yu Hua",
    genres: ["Literary Fiction", "Chinese Literature", "Historical"],
    description:
      "Fugui's life through the tumultuous changes in 20th-century China.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780385419581-L.jpg",
    tags: [
      "survival",
      "Chinese history",
      "Cultural Revolution",
      "endurance",
      "family",
    ],
  },
  {
    id: "brothers",
    title: "Brothers",
    author: "Yu Hua",
    genres: ["Literary Fiction", "Chinese Literature", "Social Commentary"],
    description:
      "Two stepbrothers navigate China's transformation from Cultural Revolution to capitalism.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780307379948-L.jpg",
    tags: [
      "brothers",
      "Cultural Revolution",
      "capitalism",
      "transformation",
      "China",
    ],
  },
  {
    id: "chronicle_of_a_blood_merchant",
    title: "Chronicle of a Blood Merchant",
    author: "Yu Hua",
    genres: ["Literary Fiction", "Chinese Literature", "Social Realism"],
    description:
      "Xu Sanguan sells his blood to support his family through China's upheavals.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780307279408-L.jpg",
    tags: ["blood selling", "family", "poverty", "sacrifice", "survival"],
  },
  {
    id: "soul_mountain",
    title: "Soul Mountain",
    author: "Gao Xingjian",
    genres: ["Literary Fiction", "Chinese Literature", "Philosophical"],
    description:
      "A journey through rural China becomes a exploration of consciousness and identity.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780060936242-L.jpg",
    tags: ["journey", "consciousness", "rural China", "identity", "philosophy"],
  },
  {
    id: "one_man_bible",
    title: "One Man's Bible",
    author: "Gao Xingjian",
    genres: ["Autobiographical Fiction", "Chinese Literature", "Political"],
    description:
      "A writer's memories of the Cultural Revolution and life in exile.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780060936259-L.jpg",
    tags: [
      "Cultural Revolution",
      "exile",
      "memory",
      "writer",
      "political persecution",
    ],
  },
  {
    id: "wild_swans",
    title: "Wild Swans",
    author: "Jung Chang",
    genres: ["Biography", "Chinese Literature", "Historical"],
    description: "Three generations of women in 20th-century China.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780743246989-L.jpg",
    tags: [
      "three generations",
      "women",
      "Chinese history",
      "biography",
      "family",
    ],
  },
  {
    id: "balzac_and_the_little_chinese_seamstress",
    title: "Balzac and the Little Chinese Seamstress",
    author: "Dai Sijie",
    genres: ["Coming-of-age", "Chinese Literature", "Cultural Revolution"],
    description:
      "Two boys discover literature during their re-education in rural China.",
    coverUrl: "https://covers.openlibrary.org/b/isbn/9780385722209-L.jpg",
    tags: [
      "re-education",
      "literature",
      "Cultural Revolution",
      "books",
      "friendship",
    ],
  },
];

// This would add about 30 more books, bringing us to around 308
// We would need to continue with many more categories to reach 1000
