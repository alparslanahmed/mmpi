// Generated from MMPI_v2.0.2.xls, which cites Işık Savaşır's 1981 MMPI handbook.
// Scale keys are answer-key item references; norm stats are mean/SD values used by that workbook.

export type KeyedAnswer = "D" | "Y";
export type NormMode = "general" | "male" | "female";
export type ScaleCategory = "validity" | "clinical";

export const SCALE_KEYS = {
  "L": {
    "D": [],
    "Y": [
      15,
      30,
      45,
      60,
      75,
      90,
      105,
      120,
      135,
      150,
      165,
      195,
      225,
      255,
      285
    ]
  },
  "F": {
    "D": [
      14,
      23,
      27,
      31,
      34,
      35,
      40,
      42,
      48,
      49,
      50,
      53,
      56,
      66,
      85,
      121,
      123,
      139,
      146,
      151,
      156,
      168,
      184,
      197,
      200,
      202,
      205,
      206,
      209,
      210,
      211,
      215,
      218,
      227,
      245,
      246,
      247,
      252,
      256,
      269,
      275,
      286,
      291,
      293
    ],
    "Y": [
      17,
      20,
      54,
      65,
      75,
      83,
      112,
      113,
      115,
      164,
      169,
      177,
      185,
      196,
      199,
      220,
      257,
      258,
      272,
      276
    ]
  },
  "K": {
    "D": [
      96
    ],
    "Y": [
      30,
      39,
      71,
      89,
      124,
      129,
      134,
      138,
      142,
      148,
      160,
      170,
      171,
      180,
      183,
      217,
      234,
      267,
      272,
      296,
      316,
      322,
      374,
      383,
      397,
      398,
      406,
      461,
      502
    ]
  },
  "HS": {
    "D": [
      23,
      29,
      43,
      62,
      72,
      108,
      114,
      125,
      161,
      189,
      273
    ],
    "Y": [
      2,
      3,
      7,
      9,
      18,
      51,
      55,
      63,
      68,
      103,
      130,
      153,
      155,
      163,
      175,
      188,
      190,
      192,
      230,
      243,
      274,
      281
    ]
  },
  "D": {
    "D": [
      5,
      13,
      23,
      32,
      41,
      43,
      52,
      67,
      86,
      104,
      130,
      138,
      142,
      158,
      159,
      182,
      189,
      193,
      236,
      259
    ],
    "Y": [
      2,
      8,
      9,
      18,
      30,
      36,
      39,
      46,
      51,
      57,
      58,
      64,
      80,
      88,
      89,
      95,
      98,
      107,
      122,
      131,
      145,
      152,
      153,
      154,
      155,
      160,
      178,
      191,
      207,
      208,
      233,
      241,
      242,
      248,
      263,
      270,
      271,
      272,
      285,
      296
    ]
  },
  "HY": {
    "D": [
      10,
      23,
      32,
      43,
      44,
      47,
      76,
      114,
      179,
      186,
      189,
      238,
      253
    ],
    "Y": [
      2,
      3,
      6,
      7,
      8,
      9,
      12,
      26,
      30,
      51,
      55,
      71,
      89,
      93,
      103,
      107,
      109,
      124,
      128,
      129,
      136,
      137,
      141,
      147,
      153,
      160,
      162,
      163,
      170,
      172,
      174,
      175,
      180,
      188,
      190,
      192,
      201,
      213,
      230,
      234,
      243,
      265,
      267,
      274,
      279,
      289,
      292
    ]
  },
  "PD": {
    "D": [
      16,
      21,
      24,
      32,
      33,
      35,
      38,
      42,
      61,
      67,
      84,
      94,
      102,
      106,
      110,
      118,
      127,
      215,
      216,
      224,
      239,
      244,
      245,
      284
    ],
    "Y": [
      8,
      20,
      37,
      82,
      91,
      96,
      107,
      134,
      137,
      141,
      155,
      170,
      171,
      173,
      180,
      183,
      201,
      231,
      235,
      237,
      248,
      267,
      287,
      289,
      294,
      296
    ]
  },
  "MF_MALE": {
    "D": [
      4,
      25,
      69,
      70,
      74,
      77,
      78,
      87,
      92,
      126,
      132,
      134,
      140,
      149,
      179,
      187,
      203,
      204,
      217,
      226,
      231,
      239,
      261,
      278,
      282,
      295,
      297,
      299
    ],
    "Y": [
      1,
      19,
      26,
      28,
      79,
      80,
      81,
      89,
      99,
      112,
      115,
      116,
      117,
      120,
      133,
      144,
      176,
      198,
      213,
      214,
      219,
      221,
      223,
      229,
      249,
      254,
      260,
      262,
      264,
      280,
      283,
      300
    ]
  },
  "MF_FEMALE": {
    "D": [
      4,
      25,
      70,
      74,
      77,
      78,
      87,
      92,
      126,
      132,
      134,
      140,
      149,
      187,
      203,
      204,
      217,
      226,
      239,
      261,
      278,
      282,
      295,
      299,
      133
    ],
    "Y": [
      1,
      19,
      26,
      28,
      79,
      80,
      81,
      89,
      99,
      112,
      115,
      116,
      117,
      120,
      144,
      176,
      198,
      213,
      214,
      219,
      221,
      223,
      229,
      249,
      254,
      260,
      262,
      264,
      280,
      283,
      300,
      69,
      179,
      231,
      297
    ]
  },
  "PA": {
    "D": [
      15,
      16,
      22,
      24,
      27,
      35,
      110,
      121,
      123,
      127,
      151,
      157,
      158,
      202,
      275,
      284,
      291,
      293,
      299,
      305,
      317,
      338,
      341,
      364,
      365
    ],
    "Y": [
      93,
      107,
      109,
      111,
      117,
      124,
      268,
      281,
      294,
      313,
      316,
      319,
      327,
      347,
      348
    ]
  },
  "PT": {
    "D": [
      10,
      15,
      22,
      32,
      41,
      67,
      76,
      86,
      94,
      102,
      106,
      142,
      159,
      182,
      189,
      217,
      238,
      266,
      301,
      304,
      305,
      317,
      321,
      336,
      337,
      340,
      342,
      343,
      344,
      346,
      349,
      351,
      352,
      356,
      357,
      358,
      359,
      360,
      361
    ],
    "Y": [
      3,
      8,
      36,
      122,
      152,
      164,
      178,
      329,
      353
    ]
  },
  "SC": {
    "D": [
      15,
      16,
      21,
      22,
      24,
      33,
      35,
      38,
      40,
      41,
      47,
      52,
      76,
      97,
      104,
      121,
      156,
      157,
      159,
      168,
      179,
      182,
      194,
      202,
      210,
      238,
      241,
      251,
      259,
      266,
      273,
      282,
      291,
      297,
      301,
      303,
      305,
      307,
      312,
      320,
      324,
      325,
      332,
      334,
      335,
      339,
      341,
      345,
      349,
      350,
      352,
      354,
      355,
      356,
      360,
      363,
      364,
      32,
      212
    ],
    "Y": [
      8,
      17,
      20,
      37,
      65,
      103,
      119,
      177,
      178,
      187,
      192,
      196,
      220,
      276,
      281,
      306,
      309,
      322,
      330
    ]
  },
  "MA": {
    "D": [
      11,
      13,
      21,
      22,
      59,
      64,
      73,
      97,
      100,
      109,
      127,
      134,
      143,
      156,
      157,
      167,
      181,
      194,
      212,
      222,
      226,
      228,
      232,
      233,
      238,
      240,
      250,
      251,
      263,
      266,
      268,
      271,
      277,
      279,
      298
    ],
    "Y": [
      101,
      105,
      111,
      119,
      120,
      148,
      166,
      171,
      180,
      267,
      289
    ]
  },
  "SI": {
    "D": [
      32,
      67,
      82,
      111,
      117,
      124,
      138,
      147,
      171,
      172,
      180,
      201,
      236,
      267,
      278,
      292,
      304,
      316,
      321,
      332,
      336,
      342,
      357,
      377,
      383,
      398,
      411,
      427,
      436,
      455,
      473,
      487,
      549,
      564
    ],
    "Y": [
      25,
      33,
      57,
      91,
      99,
      119,
      126,
      143,
      193,
      208,
      229,
      231,
      254,
      262,
      281,
      296,
      309,
      353,
      359,
      371,
      391,
      400,
      415,
      440,
      446,
      449,
      450,
      451,
      462,
      469,
      479,
      481,
      482,
      505,
      521,
      547
    ]
  }
} as const;

export const K_CORRECTIONS = [
  {
    "k": 0,
    "half": 0,
    "point4": 0,
    "point2": 0
  },
  {
    "k": 1,
    "half": 1,
    "point4": 1,
    "point2": 0
  },
  {
    "k": 2,
    "half": 1,
    "point4": 1,
    "point2": 0
  },
  {
    "k": 3,
    "half": 2,
    "point4": 2,
    "point2": 1
  },
  {
    "k": 4,
    "half": 2,
    "point4": 2,
    "point2": 1
  },
  {
    "k": 5,
    "half": 3,
    "point4": 2,
    "point2": 1
  },
  {
    "k": 6,
    "half": 3,
    "point4": 2,
    "point2": 1
  },
  {
    "k": 7,
    "half": 4,
    "point4": 3,
    "point2": 1
  },
  {
    "k": 8,
    "half": 4,
    "point4": 3,
    "point2": 2
  },
  {
    "k": 9,
    "half": 5,
    "point4": 4,
    "point2": 2
  },
  {
    "k": 10,
    "half": 5,
    "point4": 4,
    "point2": 2
  },
  {
    "k": 11,
    "half": 6,
    "point4": 4,
    "point2": 2
  },
  {
    "k": 12,
    "half": 6,
    "point4": 5,
    "point2": 2
  },
  {
    "k": 13,
    "half": 7,
    "point4": 5,
    "point2": 3
  },
  {
    "k": 14,
    "half": 7,
    "point4": 6,
    "point2": 3
  },
  {
    "k": 15,
    "half": 8,
    "point4": 6,
    "point2": 3
  },
  {
    "k": 16,
    "half": 8,
    "point4": 6,
    "point2": 3
  },
  {
    "k": 17,
    "half": 9,
    "point4": 7,
    "point2": 3
  },
  {
    "k": 18,
    "half": 9,
    "point4": 7,
    "point2": 4
  },
  {
    "k": 19,
    "half": 10,
    "point4": 8,
    "point2": 4
  },
  {
    "k": 20,
    "half": 10,
    "point4": 8,
    "point2": 4
  },
  {
    "k": 21,
    "half": 11,
    "point4": 8,
    "point2": 4
  },
  {
    "k": 22,
    "half": 11,
    "point4": 9,
    "point2": 4
  },
  {
    "k": 23,
    "half": 12,
    "point4": 9,
    "point2": 5
  },
  {
    "k": 24,
    "half": 12,
    "point4": 10,
    "point2": 5
  },
  {
    "k": 25,
    "half": 13,
    "point4": 10,
    "point2": 5
  },
  {
    "k": 26,
    "half": 13,
    "point4": 10,
    "point2": 5
  },
  {
    "k": 27,
    "half": 14,
    "point4": 11,
    "point2": 5
  },
  {
    "k": 28,
    "half": 14,
    "point4": 11,
    "point2": 6
  },
  {
    "k": 29,
    "half": 15,
    "point4": 12,
    "point2": 6
  }
] as const;

export const NORM_STATS = {
  "male": {
    "L": {
      "mean": 6.45,
      "sd": 2.74
    },
    "F": {
      "mean": 8.3,
      "sd": 4.62
    },
    "K": {
      "mean": 13.98,
      "sd": 4.65
    },
    "Hs+5K": {
      "mean": 13.19,
      "sd": 4.07
    },
    "D": {
      "mean": 20.63,
      "sd": 4.76
    },
    "Hy": {
      "mean": 19.31,
      "sd": 4.71
    },
    "Pd+4K": {
      "mean": 22.22,
      "sd": 4.45
    },
    "Mf": {
      "mean": 29.21,
      "sd": 3.82
    },
    "Pa": {
      "mean": 11.12,
      "sd": 4.03
    },
    "Pt+1K": {
      "mean": 27.9,
      "sd": 6.3
    },
    "Sc+1K": {
      "mean": 29.82,
      "sd": 9.05
    },
    "Ma+2K": {
      "mean": 19.96,
      "sd": 4.4
    },
    "Si": {
      "mean": 25.86,
      "sd": 7.97
    }
  },
  "female": {
    "L": {
      "mean": 6.0,
      "sd": 2.25
    },
    "F": {
      "mean": 9.38,
      "sd": 5.16
    },
    "K": {
      "mean": 11.82,
      "sd": 3.8
    },
    "Hs+5K": {
      "mean": 15.89,
      "sd": 4.88
    },
    "D": {
      "mean": 23.86,
      "sd": 5.08
    },
    "Hy": {
      "mean": 18.12,
      "sd": 5.31
    },
    "Pd+4K": {
      "mean": 22.84,
      "sd": 4.51
    },
    "Mf": {
      "mean": 32.98,
      "sd": 3.67
    },
    "Pa": {
      "mean": 11.93,
      "sd": 4.17
    },
    "Pt+1K": {
      "mean": 29.2,
      "sd": 6.59
    },
    "Sc+1K": {
      "mean": 31.06,
      "sd": 8.2
    },
    "Ma+2K": {
      "mean": 19.72,
      "sd": 4.36
    },
    "Si": {
      "mean": 29.88,
      "sd": 7.52
    }
  }
} as const;

export const PROFILE_SCALES = [
  {
    "id": "L",
    "code": "L",
    "label": "Yalan",
    "category": "validity",
    "key": "L",
    "normId": "L",
    "description": "Aşırı olumlu görünme ve küçük kusurları reddetme eğilimi."
  },
  {
    "id": "F",
    "code": "F",
    "label": "Sıklık dışı",
    "category": "validity",
    "key": "F",
    "normId": "F",
    "description": "Nadir ya da olağandışı yanıt örüntüleri; dikkatsizlik, abartma veya yoğun zorlanma göstergesi olabilir."
  },
  {
    "id": "K",
    "code": "K",
    "label": "Düzeltme",
    "category": "validity",
    "key": "K",
    "normId": "K",
    "description": "Savunucu yanıt verme ve sorunları küçültme eğilimi."
  },
  {
    "id": "Hs",
    "code": "1",
    "label": "Hipokondriazis",
    "category": "clinical",
    "key": "HS",
    "normId": "Hs+5K",
    "kCorrection": "half",
    "description": "Bedensel belirti ve sağlık kaygısı temaları."
  },
  {
    "id": "D",
    "code": "2",
    "label": "Depresyon",
    "category": "clinical",
    "key": "D",
    "normId": "D",
    "description": "Duygudurum, umutsuzluk, yorgunluk ve genel moral bozukluğu temaları."
  },
  {
    "id": "Hy",
    "code": "3",
    "label": "Histeri",
    "category": "clinical",
    "key": "HY",
    "normId": "Hy",
    "description": "Stres altında bedensel yakınma, inkâr ve duygusal farkındalık temaları."
  },
  {
    "id": "Pd",
    "code": "4",
    "label": "Psikopatik sapma",
    "category": "clinical",
    "key": "PD",
    "normId": "Pd+4K",
    "kCorrection": "point4",
    "description": "Otoriteyle çatışma, dürtüsellik ve sosyal uyum güçlüğü temaları."
  },
  {
    "id": "Mf",
    "code": "5",
    "label": "Maskülenite-Feminenite",
    "category": "clinical",
    "maleKey": "MF_MALE",
    "femaleKey": "MF_FEMALE",
    "normId": "Mf",
    "description": "Geleneksel cinsiyet rolü ilgi ve tutumlarıyla ilişkili örüntüler."
  },
  {
    "id": "Pa",
    "code": "6",
    "label": "Paranoya",
    "category": "clinical",
    "key": "PA",
    "normId": "Pa",
    "description": "Şüphecilik, alınganlık ve kişilerarası güvensizlik temaları."
  },
  {
    "id": "Pt",
    "code": "7",
    "label": "Psikasteni",
    "category": "clinical",
    "key": "PT",
    "normId": "Pt+1K",
    "kCorrection": "full",
    "description": "Kaygı, takıntılı düşünme, gerginlik ve kararsızlık temaları."
  },
  {
    "id": "Sc",
    "code": "8",
    "label": "Şizofreni",
    "category": "clinical",
    "key": "SC",
    "normId": "Sc+1K",
    "kCorrection": "full",
    "description": "Yabancılaşma, sıra dışı deneyimler ve düşünce dağınıklığı temaları."
  },
  {
    "id": "Ma",
    "code": "9",
    "label": "Hipomani",
    "category": "clinical",
    "key": "MA",
    "normId": "Ma+2K",
    "kCorrection": "point2",
    "description": "Enerji artışı, hareketlilik, dürtüsellik ve taşkınlık temaları."
  },
  {
    "id": "Si",
    "code": "0",
    "label": "Sosyal içedönüklük",
    "category": "clinical",
    "key": "SI",
    "normId": "Si",
    "description": "Sosyal geri çekilme, çekingenlik ve kalabalıktan kaçınma temaları."
  }
] as const;

export type ProfileScale = (typeof PROFILE_SCALES)[number];
export type ProfileScaleId = ProfileScale["id"];
export type ScaleKeyId = keyof typeof SCALE_KEYS;
