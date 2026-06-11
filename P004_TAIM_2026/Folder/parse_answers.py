import json

# Parse the extracted answer keys into structured data

def parse_answers(raw_str, start_q=1):
    answers = {}
    q_num = start_q
    for ch in raw_str:
        if ch.upper() in 'ABCDE':
            answers[q_num] = ch.upper()
            q_num += 1
    return answers

# I BOLME (Huquqi savadliliq) - All 4 sub-topics combined
bolme1 = {
    "section": "I BOLME - Huquqi Savadliliq (1.1.1-1.1.4)",
    "note": "Topics 1.1.1, 1.1.2, 1.1.3, 1.1.4 combined",
    "answers": {
        "1":"A","2":"B","3":"A","4":"B","5":"A","6":"D","7":"C","8":"E","9":"A","10":"E",
        "11":"B","12":"E","13":"C","14":"E","15":"A","16":"E","17":"A","18":"C","19":"A","20":"C",
        "21":"B","22":"E","23":"B","24":"E","25":"C","26":"B","27":"A","28":"D","29":"E","30":"A"
    }
}

# 2.1.1 Inteqrasiya - by subject
integration_211 = {
    "section": "2.1.1. Inteqrasiya (by subject - 4 questions each)",
    "Biologiya": {"1":"A","2":"D","3":"A","4":"B"},
    "Fizika": {"1":"D","2":"B","3":"B","4":"C"},
    "Informatika": {"1":"B","2":"E","3":"E","4":"D"},
    "Riyaziyyat": {"1":"C","2":"D","3":"D","4":"C"},
    "Tarix": {"1":"B","2":"C","3":"A","4":"C"},
    "Kimya": {"1":"A","2":"D","3":"D","4":"E"},
    "Cografiya": {"1":"B","2":"D","3":"A","4":"B"},
    "Azerbaycan_dili": {"1":"C","2":"E","3":"C","4":"E"},
    "Tesviri_incesenat": {"1":"A","2":"D","3":"B"},
    "Musiqi": {"1":"B","2":"A","3":"B"},
    "Texnologiya": {"1":"B","2":"A","3":"A","4":"D"},
    "Fiziki_terbiye": {"1":"A","2":"A","3":"D"}
}

# 2.1.2 XXI esrin kompetensiyalari
kompetensiya_212 = {
    "section": "2.1.2. XXI esrin kompetensiyalari ve talimde formalasdirilmasi",
    "answers": {
        "1":"A","2":"C","3":"E","4":"C","5":"A","6":"A","7":"E","8":"E","9":"A","10":"E",
        "11":"E","12":"B","13":"E","14":"E","15":"B","16":"E","17":"B","18":"A","19":"E","20":"A",
        "21":"C","22":"E","23":"C","24":"A","25":"A","26":"B","27":"E","28":"B","29":"E","30":"A","31":"D"
    }
}

# 2.1.3 Tefekkirun novleri - 60 questions
tefekku_213 = {
    "section": "2.1.3. Tefekkirun novleri",
    "answers": {
        "1":"A","2":"B","3":"E","4":"E","5":"B","6":"A","7":"E","8":"B","9":"A","10":"E",
        "11":"A","12":"A","13":"A","14":"E","15":"A","16":"A","17":"E","18":"B","19":"A","20":"A",
        "21":"A","22":"E","23":"C","24":"E","25":"E","26":"A","27":"B","28":"B","29":"C","30":"C",
        "31":"A","32":"C","33":"E","34":"E","35":"E","36":"A","37":"E","38":"A","39":"C","40":"A",
        "41":"C","42":"C","43":"B","44":"C","45":"B","46":"E","47":"E","48":"E","49":"E","50":"C",
        "51":"C","52":"C","53":"C","54":"A","55":"B","56":"E","57":"C","58":"A","59":"E","60":"E"
    }
}

# 2.1.4 Metakognitiv
metakognitiv_214 = {
    "section": "2.1.4. Metakognitiv bacariqlarin formalasdirilmasi metodikasi",
    "answers": {
        "1":"C","2":"C","3":"E","4":"E","5":"D","6":"D","7":"D","8":"E","9":"E","10":"A",
        "11":"C","12":"E","13":"D","14":"C","15":"E","16":"D","17":"E","18":"E","19":"E","20":"E",
        "21":"A","22":"E","23":"E","24":"E","25":"D","26":"E","27":"D","28":"D","29":"D","30":"D"
    }
}

# 2.1.5 Bilik ve fealiyyet
bilik_215 = {
    "section": "2.1.5. Bilik ve fealiyyet novleri, tapsiriqlarda tatbiqi",
    "answers": {
        "1":"C","2":"E","3":"A","4":"E","5":"C","6":"B","7":"B","8":"E","9":"C","10":"C",
        "11":"A","12":"C","13":"C","14":"B","15":"E","16":"D","17":"D","18":"D","19":"D","20":"D",
        "21":"B","22":"D","23":"D","24":"A","25":"C","26":"A","27":"E","28":"B","29":"E","30":"E",
        "31":"D","32":"C","33":"B","34":"A","35":"A","36":"A","37":"E","38":"E","39":"A","40":"C"
    }
}

# 2.1.6 Blumun taksonomiyasi
blum_216 = {
    "section": "2.1.6. B.Blumun Idrak taksonomiyasi ve talimde tatbiqi",
    "answers": {
        "1":"E","2":"A","3":"C","4":"A","5":"C","6":"D","7":"E","8":"C","9":"E","10":"E",
        "11":"D","12":"C","13":"C","14":"A","15":"C","16":"A","17":"D","18":"D","19":"D","20":"D",
        "21":"C","22":"E","23":"E","24":"E","25":"E","26":"D","27":"E","28":"A","29":"E","30":"A",
        "31":"C","32":"E","33":"A","34":"E","35":"E","36":"B","37":"A","38":"C","39":"C","40":"C"
    }
}

# 2.1.7 Seriste esasli (Webb) - by specialization
webb_217 = {
    "section": "2.1.7. Seriste esasli tapsiriqlar (Dr. Norman Webb) - by specialization",
    "Umumi": {"1":"A","2":"C","3":"B","4":"A","5":"D","6":"D","7":"C","8":"E","9":"D","10":"A"},
    "Filologiya": {"1":"D","2":"E","3":"C","4":"D","5":"C","6":"D","7":"C","8":"E","9":"C","10":"B"},
    "Riyaziyyat": {"1":"D","2":"B","3":"D","4":"A","5":"E"},
    "Tarix": {"1":"A","2":"A","3":"C","4":"B","5":"D"},
    "Biologiya": {"1":"B","2":"D","3":"D","4":"A","5":"E"},
    "Fizika": {"1":"A","2":"A","3":"A","4":"B","5":"B"},
    "Musiqi": {"1":"E","2":"A","3":"A"},
    "Cografiya": {"1":"A","2":"A","3":"A"},
    "Texnologiya": {"1":"D","2":"B","3":"C","4":"D"},
    "Ibtidai_sinif": {"1":"A","2":"A","3":"D","4":"D","5":"E"},
    "Fiziki_terbiye": {"1":"D","2":"B","3":"C","4":"D"},
    "Tesviri_incesenat": {"1":"B","2":"C","3":"B","4":"D"},
    "Informatika": {"1":"A","2":"B","3":"A","4":"B","5":"A"}
}

# 2.1.8 Talimin forma ve modelleri - 55 questions
forma_218 = {
    "section": "2.1.8. Talimin forma ve modelleri (PBL, oyun esasli, problem esasli...)",
    "answers": {
        "1":"C","2":"D","3":"D","4":"A","5":"C","6":"C","7":"B","8":"C","9":"C","10":"A",
        "11":"E","12":"E","13":"E","14":"D","15":"E","16":"E","17":"B","18":"C","19":"C","20":"A",
        "21":"B","22":"D","23":"A","24":"C","25":"A","26":"E","27":"B","28":"E","29":"A","30":"A",
        "31":"B","32":"E","33":"C","34":"E","35":"A","36":"C","37":"E","38":"E","39":"D","40":"E",
        "41":"A","42":"E","43":"C","44":"C","45":"E","46":"A","47":"C","48":"E","49":"D","50":"D",
        "51":"C","52":"C","53":"C","54":"C","55":"C"
    }
}

# 2.1.9 Strategiyalar - 65 questions
strategiya_219 = {
    "section": "2.1.9. Talimin strategiya ve texnikalari",
    "answers": {
        "1":"A","2":"A","3":"B","4":"A","5":"A","6":"E","7":"C","8":"B","9":"C","10":"D",
        "11":"A","12":"D","13":"A","14":"E","15":"A","16":"E","17":"C","18":"D","19":"D","20":"A",
        "21":"E","22":"C","23":"A","24":"E","25":"A","26":"E","27":"C","28":"A","29":"A","30":"A",
        "31":"E","32":"A","33":"E","34":"E","35":"E","36":"C","37":"E","38":"A","39":"E","40":"A",
        "41":"B","42":"A","43":"E","44":"C","45":"E","46":"A","47":"C","48":"C","49":"C","50":"A",
        "51":"C","52":"E","53":"A","54":"A","55":"A","56":"C","57":"E","58":"E","59":"D","60":"C",
        "61":"C","62":"C","63":"D","64":"E","65":"D"
    }
}

# 2.1.10 Planlasdirma - 40 questions
plan_2110 = {
    "section": "2.1.10. Illik ve gundelik planlasdirma",
    "answers": {
        "1":"E","2":"A","3":"E","4":"E","5":"A","6":"A","7":"D","8":"B","9":"A","10":"C",
        "11":"C","12":"E","13":"E","14":"D","15":"C","16":"A","17":"E","18":"E","19":"E","20":"E",
        "21":"E","22":"C","23":"C","24":"D","25":"D","26":"C","27":"E","28":"C","29":"C","30":"C",
        "31":"E","32":"C","33":"C","34":"C","35":"E","36":"D","37":"C","38":"A","39":"D","40":"A"
    }
}

# 2.1.11 Interaktiv talim - 40 questions
interaktiv_2111 = {
    "section": "2.1.11. Sagirdyonumlu (interaktiv) talimin taskili",
    "answers": {
        "1":"C","2":"C","3":"E","4":"A","5":"E","6":"E","7":"D","8":"D","9":"D","10":"D",
        "11":"D","12":"C","13":"A","14":"E","15":"C","16":"A","17":"E","18":"E","19":"B","20":"E",
        "21":"B","22":"D","23":"D","24":"B","25":"E","26":"E","27":"D","28":"B","29":"B","30":"D",
        "31":"C","32":"C","33":"B","34":"D","35":"D","36":"D","37":"E","38":"D","39":"D","40":"E"
    }
}

# 2.1.12 Fasilitasiya - 20 questions
fasilitasiya_2112 = {
    "section": "2.1.12. Muellimin fasilitasiya bacarigi",
    "answers": {
        "1":"E","2":"E","3":"D","4":"E","5":"B","6":"B","7":"D","8":"D","9":"E","10":"A",
        "11":"D","12":"E","13":"B","14":"D","15":"D","16":"C","17":"D","18":"E","19":"E","20":"D"
    }
}

# 2.1.13 Ferdilasdirilmis talim - 50 questions
ferdil_2113 = {
    "section": "2.1.13. Ferdilasdirilmis talim (Inkluziv ve diferensial yanasma)",
    "answers": {
        "1":"B","2":"E","3":"E","4":"B","5":"E","6":"B","7":"C","8":"A","9":"C","10":"E",
        "11":"C","12":"E","13":"C","14":"A","15":"E","16":"C","17":"E","18":"E","19":"E","20":"E",
        "21":"E","22":"B","23":"C","24":"E","25":"C","26":"E","27":"C","28":"A","29":"E","30":"C",
        "31":"C","32":"E","33":"E","34":"A","35":"A","36":"C","37":"C","38":"E","39":"E","40":"E",
        "41":"C","42":"D","43":"B","44":"A","45":"D","46":"D","47":"C","48":"A","49":"C","50":"B"
    }
}

# 2.1.14 Oyrenme terzleri - 20 questions
oyrenme_2114 = {
    "section": "2.1.14. Oyrenme terzleri",
    "answers": {
        "1":"B","2":"D","3":"B","4":"E","5":"B","6":"C","7":"A","8":"C","9":"C","10":"A",
        "11":"A","12":"B","13":"E","14":"D","15":"C","16":"B","17":"E","18":"A","19":"C","20":"E"
    }
}

# 2.1.15 Raqemsal vasiteler - 20 questions
raqemsal_2115 = {
    "section": "2.1.15. Talimde raqemsal vasitaler ve suni intellekt",
    "answers": {
        "1":"E","2":"E","3":"C","4":"E","5":"E","6":"E","7":"E","8":"D","9":"C","10":"C",
        "11":"E","12":"A","13":"C","14":"C","15":"A","16":"A","17":"D","18":"D","19":"D","20":"C"
    }
}

# 2.1.16 Design thinking - 25 questions
design_2116 = {
    "section": "2.1.16. Tedrisde dizayn dusuncesi (Design thinking)",
    "answers": {
        "1":"E","2":"E","3":"E","4":"E","5":"E","6":"D","7":"E","8":"E","9":"E","10":"E",
        "11":"E","12":"E","13":"E","14":"E","15":"E","16":"D","17":"E","18":"E","19":"E","20":"E",
        "21":"B","22":"C","23":"C","24":"C","25":"C"
    }
}

# Fasil sinagi 1 - 20 questions
fasil_sinagi_1 = {
    "section": "Fasil sinagi 1",
    "answers": {
        "1":"E","2":"E","3":"E","4":"E","5":"E","6":"E","7":"A","8":"E","9":"A","10":"C",
        "11":"A","12":"D","13":"C","14":"D","15":"D","16":"C","17":"C","18":"D","19":"C","20":"D"
    }
}

# Fasil sinagi 2 - 20 questions
fasil_sinagi_2 = {
    "section": "Fasil sinagi 2",
    "answers": {
        "1":"C","2":"E","3":"E","4":"A","5":"C","6":"D","7":"A","8":"C","9":"C","10":"A",
        "11":"B","12":"E","13":"C","14":"D","15":"A","16":"E","17":"C","18":"C","19":"E","20":"D"
    }
}

# 2.2.1-2.2.3 Qiymetlendirme - 160 questions
qiymet_22 = {
    "section": "2.2.1-2.2.3. Qiymetlendirme (mektebdaxili, milli, beynelxalq)",
    "answers": {
        "1":"E","2":"C","3":"C","4":"A","5":"D","6":"A","7":"A","8":"D","9":"D","10":"E",
        "11":"C","12":"D","13":"D","14":"E","15":"B","16":"A","17":"D","18":"D","19":"D","20":"C",
        "21":"E","22":"C","23":"E","24":"C","25":"A","26":"E","27":"A","28":"E","29":"E","30":"A",
        "31":"E","32":"A","33":"E","34":"A","35":"D","36":"A","37":"E","38":"A","39":"A","40":"A",
        "41":"E","42":"E","43":"C","44":"A","45":"A","46":"E","47":"E","48":"E","49":"D","50":"D",
        "51":"E","52":"C","53":"A","54":"A","55":"C","56":"E","57":"E","58":"C","59":"E","60":"E",
        "61":"E","62":"A","63":"D","64":"D","65":"E","66":"D","67":"D","68":"E","69":"D","70":"E",
        "71":"D","72":"E","73":"D","74":"E","75":"D","76":"E","77":"E","78":"E","79":"D","80":"E",
        "81":"C","82":"C","83":"D","84":"A","85":"A","86":"C","87":"A","88":"A","89":"D","90":"B",
        "91":"D","92":"C","93":"E","94":"B","95":"B","96":"A","97":"A","98":"C","99":"A","100":"B",
        "101":"A","102":"D","103":"B","104":"A","105":"D","106":"A","107":"B","108":"D","109":"E","110":"E",
        "111":"E","112":"A","113":"C","114":"D","115":"A","116":"B","117":"A","118":"D","119":"E","120":"E",
        "121":"A","122":"B","123":"D","124":"A","125":"D","126":"C","127":"B","128":"C","129":"D","130":"B",
        "131":"D","132":"A","133":"B","134":"D","135":"D","136":"A","137":"C","138":"A","139":"A","140":"D",
        "141":"B","142":"D","143":"C","144":"A","145":"D","146":"A","147":"E","148":"C","149":"C","150":"C",
        "151":"E","152":"A","153":"A","154":"A","155":"D","156":"E","157":"B","158":"B","159":"E","160":"E"
    }
}

# 3.1.1 Muasir pedaqoji yanasmalar - 40 questions
ped_311 = {
    "section": "3.1.1. Tahsilde muasir pedaqoji yanasmalar",
    "answers": {
        "1":"A","2":"A","3":"A","4":"C","5":"B","6":"C","7":"D","8":"D","9":"E","10":"D",
        "11":"A","12":"C","13":"B","14":"D","15":"A","16":"D","17":"B","18":"D","19":"A","20":"C",
        "21":"E","22":"C","23":"D","24":"B","25":"E","26":"C","27":"C","28":"E","29":"D","30":"E",
        "31":"C","32":"E","33":"C","34":"E","35":"E","36":"E","37":"A","38":"C","39":"A","40":"E"
    }
}

# 3.1.2 Sexsiyyetin formalasdirilmasi - 20 questions
sex_312 = {
    "section": "3.1.2. Sexsiyyetin formalasdirilmasinda ve inkisafinda mektebin ve muellimlerin rolu",
    "answers": {
        "1":"D","2":"E","3":"C","4":"E","5":"A","6":"A","7":"A","8":"D","9":"C","10":"C",
        "11":"D","12":"C","13":"C","14":"E","15":"C","16":"E","17":"E","18":"E","19":"E","20":"E"
    }
}

# 3.1.3 Qardner - 55 questions
qardner_313 = {
    "section": "3.1.3. H.Qardner. Coxnovlu zeka nezeriyyesi",
    "answers": {
        "1":"D","2":"D","3":"C","4":"E","5":"E","6":"C","7":"D","8":"E","9":"E","10":"E",
        "11":"B","12":"E","13":"C","14":"C","15":"B","16":"E","17":"E","18":"E","19":"E","20":"E",
        "21":"E","22":"D","23":"C","24":"E","25":"A","26":"E","27":"C","28":"A","29":"C","30":"A",
        "31":"A","32":"C","33":"C","34":"D","35":"D","36":"C","37":"E","38":"A","39":"E","40":"E",
        "41":"A","42":"B","43":"C","44":"A","45":"E","46":"A","47":"D","48":"D","49":"E","50":"B",
        "51":"D","52":"A","53":"D","54":"E","55":"E"
    }
}

# 3.1.4 Piaje - 45 questions
piaje_314 = {
    "section": "3.1.4. J.Piaje. Zehni inkisafin merheleleri nezeriyyesi",
    "answers": {
        "1":"E","2":"E","3":"C","4":"D","5":"D","6":"A","7":"C","8":"D","9":"C","10":"D",
        "11":"D","12":"E","13":"C","14":"A","15":"D","16":"D","17":"B","18":"E","19":"C","20":"A",
        "21":"A","22":"A","23":"C","24":"A","25":"C","26":"E","27":"A","28":"C","29":"C","30":"C",
        "31":"C","32":"B","33":"A","34":"C","35":"A","36":"E","37":"C","38":"C","39":"C","40":"C",
        "41":"C","42":"D","43":"E","44":"E","45":"A"
    }
}

# 3.1.5 Viqotski - 35 questions
viqotski_315 = {
    "section": "3.1.5. L.Viqotski. Sosial inkisaf / Yaxin inkisaf zonasi",
    "answers": {
        "1":"A","2":"E","3":"E","4":"D","5":"E","6":"E","7":"C","8":"B","9":"E","10":"E",
        "11":"C","12":"C","13":"A","14":"B","15":"E","16":"C","17":"A","18":"A","19":"D","20":"E",
        "21":"C","22":"C","23":"C","24":"E","25":"C","26":"A","27":"C","28":"A","29":"C","30":"D",
        "31":"C","32":"A","33":"C","34":"A","35":"C"
    }
}

# 3.1.6 Dvek - 35 questions
dvek_316 = {
    "section": "3.1.6. K.Dvek. Dusunce terzi nezeriyyesi",
    "answers": {
        "1":"D","2":"A","3":"C","4":"D","5":"E","6":"A","7":"E","8":"E","9":"E","10":"D",
        "11":"B","12":"C","13":"C","14":"C","15":"E","16":"A","17":"A","18":"A","19":"C","20":"E",
        "21":"B","22":"C","23":"A","24":"B","25":"C","26":"B","27":"B","28":"E","29":"B","30":"D",
        "31":"C","32":"D","33":"D","34":"B","35":"A"
    }
}

# 3.1.7 Kolberq - 40 questions
kolberq_317 = {
    "section": "3.1.7. L.Kolberq. Menevi inkisaf nezeriyyesi",
    "answers": {
        "1":"C","2":"A","3":"C","4":"E","5":"E","6":"A","7":"C","8":"E","9":"D","10":"C",
        "11":"E","12":"E","13":"A","14":"C","15":"A","16":"D","17":"E","18":"E","19":"A","20":"A",
        "21":"E","22":"E","23":"E","24":"A","25":"C","26":"A","27":"A","28":"B","29":"A","30":"C",
        "31":"E","32":"B","33":"E","34":"D","35":"A","36":"B","37":"E","38":"C","39":"A","40":"C"
    }
}

# 3.1.8 Qanye - 30 questions
qanye_318 = {
    "section": "3.1.8. R.Qanye. Oyrenmenin sertleri",
    "answers": {
        "1":"A","2":"D","3":"D","4":"E","5":"D","6":"E","7":"E","8":"E","9":"E","10":"E",
        "11":"A","12":"C","13":"C","14":"A","15":"C","16":"B","17":"A","18":"B","19":"D","20":"C",
        "21":"B","22":"D","23":"B","24":"C","25":"C","26":"E","27":"A","28":"D","29":"B","30":"E"
    }
}

# 3.1.9 Emosional zeka (Qoulman) - 40 questions
qoulman_319 = {
    "section": "3.1.9. D.Qoulman. Emosional zeka nezeriyyesi",
    "answers": {
        "1":"D","2":"E","3":"D","4":"A","5":"C","6":"E","7":"E","8":"E","9":"D","10":"A",
        "11":"A","12":"D","13":"C","14":"A","15":"A","16":"E","17":"E","18":"E","19":"D","20":"E",
        "21":"C","22":"A","23":"B","24":"B","25":"E","26":"A","27":"B","28":"D","29":"C","30":"D",
        "31":"B","32":"C","33":"D","34":"B","35":"B","36":"E","37":"B","38":"E","39":"E","40":"C"
    }
}

# 3.1.10 Yung - 30 questions
yung_3110 = {
    "section": "3.1.10. K.Yung. Psixoloji tiplar nezeriyyesi",
    "answers": {
        "1":"C","2":"C","3":"D","4":"A","5":"E","6":"D","7":"C","8":"E","9":"C","10":"D",
        "11":"B","12":"C","13":"C","14":"C","15":"E","16":"D","17":"B","18":"C","19":"C","20":"C",
        "21":"E","22":"E","23":"E","24":"D","25":"E","26":"E","27":"E","28":"E","29":"E","30":"E"
    }
}

# 3.1.11 Bandura - 20 questions
bandura_3111 = {
    "section": "3.1.11. A.Bandura. Sosial oyrenme nezeriyyesi",
    "answers": {
        "1":"D","2":"D","3":"D","4":"D","5":"B","6":"A","7":"B","8":"D","9":"A","10":"E",
        "11":"C","12":"E","13":"C","14":"C","15":"E","16":"E","17":"E","18":"E","19":"C","20":"E"
    }
}

# 3.1.12 Bruner - 30 questions
bruner_3112 = {
    "section": "3.1.12. J.Bruner. Kognitiv oyrenme nezeriyyesi",
    "answers": {
        "1":"E","2":"A","3":"C","4":"D","5":"E","6":"E","7":"E","8":"C","9":"B","10":"B",
        "11":"E","12":"C","13":"A","14":"A","15":"C","16":"E","17":"E","18":"C","19":"C","20":"C",
        "21":"E","22":"C","23":"E","24":"C","25":"C","26":"E","27":"C","28":"E","29":"B","30":"C"
    }
}

# 3.1.13 Rocers - 35 questions
rocers_3113 = {
    "section": "3.1.13. K.Rocers. Sexsiyyetyonumlu yanasma",
    "answers": {
        "1":"C","2":"D","3":"C","4":"E","5":"C","6":"C","7":"C","8":"C","9":"C","10":"E",
        "11":"C","12":"B","13":"C","14":"C","15":"A","16":"C","17":"C","18":"B","19":"C","20":"B",
        "21":"C","22":"B","23":"C","24":"C","25":"B","26":"A","27":"B","28":"C","29":"C","30":"C",
        "31":"C","32":"C","33":"C","34":"C","35":"C"
    }
}

# Fasil sinagi 3 - 20 questions
fasil_sinagi_3 = {
    "section": "Fasil sinagi 3",
    "answers": {
        "1":"D","2":"D","3":"C","4":"B","5":"C","6":"E","7":"B","8":"D","9":"A","10":"D",
        "11":"D","12":"C","13":"C","14":"D","15":"A","16":"D","17":"C","18":"C","19":"D","20":"B"
    }
}

# Fasil sinagi 4 - 20 questions
fasil_sinagi_4 = {
    "section": "Fasil sinagi 4",
    "answers": {
        "1":"E","2":"E","3":"E","4":"E","5":"E","6":"E","7":"E","8":"E","9":"E","10":"E",
        "11":"E","12":"E","13":"E","14":"E","15":"E","16":"E","17":"E","18":"E","19":"E","20":"C"
    }
}

# 3.2.1 CASEL - 20 questions
casel_321 = {
    "section": "3.2.1. Sosial-emosional oyrenme (CASEL modeli)",
    "answers": {
        "1":"B","2":"C","3":"C","4":"E","5":"A","6":"E","7":"D","8":"C","9":"C","10":"C",
        "11":"E","12":"E","13":"C","14":"E","15":"A","16":"E","17":"B","18":"B","19":"D","20":"D"
    }
}

# 3.2.2 Semereli oyrenme muhiti - 20 questions
muhit_322 = {
    "section": "3.2.2. Talim prosesinde semereli oyrenme muhitinin qurulmasinin telableri",
    "answers": {
        "1":"D","2":"D","3":"E","4":"A","5":"E","6":"D","7":"E","8":"C","9":"E","10":"E",
        "11":"C","12":"C","13":"D","14":"D","15":"E","16":"A","17":"E","18":"E","19":"E","20":"A"
    }
}

# 3.2.3 Pozitiv intizam - 20 questions
intizam_323 = {
    "section": "3.2.3. Pozitiv intizam ve berpaedici yanasma",
    "answers": {
        "1":"E","2":"A","3":"C","4":"D","5":"D","6":"C","7":"C","8":"C","9":"E","10":"A",
        "11":"C","12":"E","13":"E","14":"E","15":"B","16":"E","17":"C","18":"D","19":"C","20":"D"
    }
}

# 3.2.4 Sinf idareedilmesi - 50 questions
sinf_324 = {
    "section": "3.2.4. Sinfin idareedilmesi mexanizmleri ve strategiyalar (buzqiranlar)",
    "answers": {
        "1":"E","2":"A","3":"C","4":"E","5":"C","6":"C","7":"A","8":"A","9":"B","10":"E",
        "11":"E","12":"E","13":"E","14":"C","15":"A","16":"C","17":"C","18":"A","19":"A","20":"A",
        "21":"E","22":"E","23":"D","24":"C","25":"D","26":"C","27":"C","28":"E","29":"B","30":"B",
        "31":"D","32":"C","33":"E","34":"E","35":"C","36":"E","37":"E","38":"D","39":"D","40":"D",
        "41":"A","42":"C","43":"D","44":"D","45":"E","46":"C","47":"E","48":"C","49":"C","50":"C"
    }
}

# 3.2.5 Muellim-sagird munasibetleri - 25 questions
munasib_325 = {
    "section": "3.2.5. Muellim-sagird ve muellim-valideyn munasibetleri",
    "answers": {
        "1":"C","2":"E","3":"E","4":"C","5":"E","6":"E","7":"A","8":"D","9":"D","10":"E",
        "11":"C","12":"A","13":"C","14":"A","15":"E","16":"E","17":"E","18":"E","19":"D","20":"E",
        "21":"D","22":"D","23":"B","24":"A","25":"B"
    }
}

# 3.2.6 Sagird davranisi - 25 questions
davranis_326 = {
    "section": "3.2.6. Sagird davranisinin idareolunmasi",
    "answers": {
        "1":"D","2":"D","3":"E","4":"B","5":"A","6":"B","7":"A","8":"A","9":"D","10":"C",
        "11":"A","12":"B","13":"A","14":"C","15":"B","16":"C","17":"D","18":"B","19":"B","20":"C",
        "21":"B","22":"E","23":"E","24":"C","25":"C"
    }
}

# 3.2.7 Bullinq - 30 questions
bullinq_327 = {
    "section": "3.2.7. Qisnamanin (bullingin) qarsisinin alinmasi",
    "answers": {
        "1":"E","2":"E","3":"E","4":"A","5":"E","6":"E","7":"E","8":"E","9":"A","10":"D",
        "11":"B","12":"C","13":"E","14":"D","15":"A","16":"C","17":"C","18":"E","19":"C","20":"D",
        "21":"E","22":"C","23":"E","24":"C","25":"B","26":"E","27":"C","28":"E","29":"C","30":"C"
    }
}

# Fasil sinagi 5 - 20 questions
fasil_sinagi_5 = {
    "section": "Fasil sinagi 5",
    "answers": {
        "1":"B","2":"D","3":"E","4":"C","5":"A","6":"C","7":"D","8":"C","9":"A","10":"C",
        "11":"D","12":"A","13":"C","14":"C","15":"B","16":"E","17":"C","18":"B","19":"B","20":"E"
    }
}

# Fasil sinagi 6 - 20 questions
fasil_sinagi_6 = {
    "section": "Fasil sinagi 6",
    "answers": {
        "1":"A","2":"E","3":"C","4":"E","5":"D","6":"C","7":"C","8":"C","9":"E","10":"E",
        "11":"A","12":"B","13":"C","14":"D","15":"B","16":"B","17":"B","18":"C","19":"C","20":"B"
    }
}

# Umumi sinaq 1 - 20 questions
umumi1 = {
    "section": "Umumi sinaq 1",
    "answers": {
        "1":"E","2":"E","3":"A","4":"E","5":"A","6":"E","7":"C","8":"E","9":"D","10":"C",
        "11":"A","12":"A","13":"C","14":"E","15":"D","16":"D","17":"D","18":"C","19":"E","20":"C"
    }
}

# Umumi sinaq 2 - 20 questions
umumi2 = {
    "section": "Umumi sinaq 2",
    "answers": {
        "1":"A","2":"C","3":"B","4":"A","5":"B","6":"E","7":"B","8":"B","9":"D","10":"D",
        "11":"D","12":"A","13":"D","14":"B","15":"A","16":"C","17":"C","18":"C","19":"C","20":"B"
    }
}

# Umumi sinaq 3 - 20 questions
umumi3 = {
    "section": "Umumi sinaq 3",
    "answers": {
        "1":"C","2":"E","3":"E","4":"B","5":"E","6":"D","7":"C","8":"A","9":"C","10":"C",
        "11":"A","12":"B","13":"B","14":"E","15":"A","16":"B","17":"B","18":"E","19":"A","20":"B"
    }
}

result = {
    "total_pages": 312,
    "language": "Azerbaijani",
    "book": "TAIM TEST BANK 2026",
    "authors": "Ferid Hesenov, Aysel Balasova, Sola Mustafayeva",
    "subject": "Metodika, Pedaqogika",
    "note": "PDF is image-based; text extracted via OCR (Tesseract). Some answer characters may have minor OCR errors especially where table cells were unclear.",
    "table_of_contents": [
        {"bolme": 1, "title": "I BOLME. Huquqi Savadliliq", "topics": [
            "1.1.1. Tehsil programi (kurikulum) haqqinda umumi melumat",
            "1.1.2. Fenn kurikulumuna aid esas terminlerin tesviri",
            "1.1.3. Azerbaycan Respublikasinda umumi tehsilin dovlet standartlari",
            "1.1.4. Muellimlerin etik davranis Qaydalari (2024)"
        ]},
        {"bolme": 2, "title": "II BOLME. Metodiki Seristelilik", "topics": [
            "2.1. Talimde Oyratma ve Oyrenme prosesinin taskili",
            "2.1.1. Inteqrasiya (fendaxili, fanlerarasi, fanniistii)",
            "2.1.2. XXI esrin kompetensiyalari",
            "2.1.3. Tefekkirun novleri (mentiqi, tenqidi, yaradici...)",
            "2.1.4. Metakognitiv bacariqlarin metodikasi",
            "2.1.5. Bilik ve fealiyyet novleri",
            "2.1.6. B.Blumun Idrak taksonomiyasi",
            "2.1.7. Webb Derin bilik seviyyeleri (ixtisaslar uzre)",
            "2.1.8. Talimin forma ve modelleri (PBL, oyun, problem, arasidirma...)",
            "2.1.9. Talimin strategiya ve texnikalari",
            "2.1.10. Illik ve gundelik planlasdirma",
            "2.1.11. Sagirdyonumlu (interaktiv) talim",
            "2.1.12. Muellimin fasilitasiya bacarigi",
            "2.1.13. Ferdilasdirilmis talim (Inkluziv ve diferensial)",
            "2.1.14. Oyrenme terzleri",
            "2.1.15. Raqemsal vasiteler ve suni intellekt (Google Classroom, Kahoot, Quizizz, ChatGPT, Canva)",
            "2.1.16. Dizayn dusuncesi (Design thinking)",
            "Fasil sinagi 1",
            "Fasil sinagi 2",
            "2.2. Qiymetlendirme (Olcme ve Deyerlendirme)",
            "2.2.1. Qiymetlendirmenin novleri (mektebdaxili, milli, beynelxalq)",
            "2.2.2. Mektebdaxili qiymetlendirme (diaqnostik, formativ, summativ)",
            "2.2.3. Beynelxalq qiymetlendirme (TIMSS, PIRLS, PISA)"
        ]},
        {"bolme": 3, "title": "III BOLME. Pedaqoji Seristelilik", "topics": [
            "3.1. Pedaqoji ve Psixoloji yanasmalar",
            "3.1.1. Muasir pedaqoji yanasmalar (emekdasliq, konstruktiv, refleksiv, adaptiv)",
            "3.1.2. Sexsiyyetin formalasdirilmasi ve inkisafinda mektebin ve muellimlerin rolu",
            "3.1.3. H.Qardner. Coxnovlu zeka nezeriyyesi",
            "3.1.4. J.Piaje. Zehni inkisafin merheleleri nezeriyyesi",
            "3.1.5. L.Viqotski. Sosial inkisaf / Yaxin inkisaf zonasi",
            "3.1.6. K.Dvek. Dusunce terzi nezeriyyesi",
            "3.1.7. L.Kolberq. Menevi inkisaf nezeriyyesi",
            "3.1.8. R.Qanye. Oyrenmenin sertleri",
            "3.1.9. D.Qoulman. Emosional zeka nezeriyyesi",
            "3.1.10. K.Yung. Psixoloji tiplar nezeriyyesi",
            "3.1.11. A.Bandura. Sosial oyrenme nezeriyyesi",
            "3.1.12. J.Bruner. Kognitiv oyrenme / Tedqiqat esasli oyrenme",
            "3.1.13. K.Rocers. Sexsiyyetyonumlu yanasma",
            "Fasil sinagi 3",
            "Fasil sinagi 4",
            "3.2. Sinifdde tehlikesiz psixo-sosial muhitin qurulmasi",
            "3.2.1. Sosial-emosional oyrenme (CASEL Modeli)",
            "3.2.2. Semereli oyrenme muhitinin qurulmasinin telableri ve ustiinlukleri",
            "3.2.3. Pozitiv intizam ve berpaedici yanasma",
            "3.2.4. Sinfin idareedilmesi mexanizmleri ve strategiyalar (buzqiranlar)",
            "3.2.5. Muellim-sagird ve muellim-valideyn munasibetleri",
            "3.2.6. Sagird davranisinin idareolunmasi",
            "3.2.7. Qisnamanin (bullingin) qarsisinin alinmasi",
            "Fasil sinagi 5",
            "Fasil sinagi 6",
            "Umumi sinaq 1",
            "Umumi sinaq 2",
            "Umumi sinaq 3"
        ]}
    ],
    "answer_keys": {
        "I_BOLME_1.1.1-1.1.4": bolme1,
        "2.1.1_Inteqrasiya": integration_211,
        "2.1.2_Kompetensiyalar": kompetensiya_212,
        "2.1.3_Tefekkur_novleri": tefekku_213,
        "2.1.4_Metakognitiv": metakognitiv_214,
        "2.1.5_Bilik_fealiyyet": bilik_215,
        "2.1.6_Blum_taksonomiya": blum_216,
        "2.1.7_Webb_seriste": webb_217,
        "2.1.8_Forma_modeller": forma_218,
        "2.1.9_Strategiyalar": strategiya_219,
        "2.1.10_Planlasdirma": plan_2110,
        "2.1.11_Interaktiv_talim": interaktiv_2111,
        "2.1.12_Fasilitasiya": fasilitasiya_2112,
        "2.1.13_Ferdilasdirilmis": ferdil_2113,
        "2.1.14_Oyrenme_terzleri": oyrenme_2114,
        "2.1.15_Raqemsal_vasiteler": raqemsal_2115,
        "2.1.16_Design_thinking": design_2116,
        "Fasil_sinagi_1": fasil_sinagi_1,
        "Fasil_sinagi_2": fasil_sinagi_2,
        "2.2.1-2.2.3_Qiymetlendirme": qiymet_22,
        "3.1.1_Pedaqoji_yanasmalar": ped_311,
        "3.1.2_Sexsiyyet_inkisaf": sex_312,
        "3.1.3_Qardner_zeka": qardner_313,
        "3.1.4_Piaje": piaje_314,
        "3.1.5_Viqotski": viqotski_315,
        "3.1.6_Dvek": dvek_316,
        "3.1.7_Kolberq": kolberq_317,
        "3.1.8_Qanye": qanye_318,
        "3.1.9_Qoulman_emosional": qoulman_319,
        "3.1.10_Yung": yung_3110,
        "3.1.11_Bandura": bandura_3111,
        "3.1.12_Bruner": bruner_3112,
        "3.1.13_Rocers": rocers_3113,
        "Fasil_sinagi_3": fasil_sinagi_3,
        "Fasil_sinagi_4": fasil_sinagi_4,
        "3.2.1_CASEL": casel_321,
        "3.2.2_Oyrenme_muhiti": muhit_322,
        "3.2.3_Pozitiv_intizam": intizam_323,
        "3.2.4_Sinf_idareedilmesi": sinf_324,
        "3.2.5_Muellim_sagird": munasib_325,
        "3.2.6_Sagird_davranisi": davranis_326,
        "3.2.7_Bullinq": bullinq_327,
        "Fasil_sinagi_5": fasil_sinagi_5,
        "Fasil_sinagi_6": fasil_sinagi_6,
        "Umumi_sinaq_1": umumi1,
        "Umumi_sinaq_2": umumi2,
        "Umumi_sinaq_3": umumi3
    }
}

out_path = r'C:\Users\Administrator\Desktop\İş\Taim\Taim test bank\Folder\taim_test_bank_2026.json'
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
print("JSON saved OK")
print("Total answer key sections: " + str(len(result['answer_keys'])))
for key, val in result['answer_keys'].items():
    if isinstance(val, dict) and 'answers' in val:
        q_count = len(val['answers'])
    elif isinstance(val, dict):
        q_count = sum(len(v) for k, v in val.items() if isinstance(v, dict))
    else:
        q_count = 0
    print("  " + key + ": " + str(q_count) + " questions")
