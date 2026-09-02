// Demo page content for brand-new editions, so layout work can start on a
// populated page instead of a blank one. Pure, deterministic (no Math.random)
// so the same edition always seeds the same way.
import { newId } from "@/lib/ids";
import { ROW_PRESETS, type ImageRef, type NewsBlock, type Row } from "@/lib/types";

/** Grey placeholder card as an inline SVG data URI. No network calls, works offline. */
export function placeholderImage(w: number, h: number, label: string): ImageRef {
  const fontSize = Math.max(14, Math.round(Math.min(w, h) / 14));
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
    `<rect width="100%" height="100%" fill="#d4d4d8"/>` +
    `<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" ` +
    `font-family="sans-serif" font-size="${fontSize}" fill="#52525b">${label}</text></svg>`;
  return {
    url: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    storagePath: "",
    naturalW: w,
    naturalH: h,
    focalX: 0.5,
    focalY: 0.5,
  };
}

// Hindi filler headline/body pairs, cycled across pages. Not real news.
const ARTICLES: { headline: string; body: string }[] = [
  {
    headline: "शहर में नई सड़क योजना को मंजूरी",
    body: "नगर निगम ने शहर के मुख्य मार्गों पर सड़क चौड़ीकरण की योजना को मंजूरी दे दी है। इस परियोजना के तहत अगले छह महीनों में काम पूरा करने का लक्ष्य रखा गया है। अधिकारियों का कहना है कि इससे यातायात जाम की समस्या से काफी हद तक राहत मिलेगी। स्थानीय व्यापारियों ने इस फैसले का स्वागत किया है। परियोजना पर करीब बीस करोड़ रुपये खर्च होने का अनुमान है।",
  },
  {
    headline: "जिला अस्पताल में नई ओपीडी सेवा शुरू",
    body: "जिला अस्पताल प्रशासन ने मरीजों की सुविधा के लिए नई ओपीडी सेवा शुरू की है। अब मरीजों को पंजीकरण के लिए लंबी कतारों में नहीं लगना पड़ेगा। अस्पताल में तीन नए विशेषज्ञ डॉक्टरों की नियुक्ति भी की गई है। स्वास्थ्य विभाग के अधिकारियों ने बताया कि आने वाले दिनों में और सुविधाएं बढ़ाई जाएंगी। मरीजों और उनके परिजनों ने इस पहल की सराहना की।",
  },
  {
    headline: "स्कूली बच्चों ने जीता राज्य स्तरीय विज्ञान मेला",
    body: "स्थानीय विद्यालय के छात्रों ने राज्य स्तरीय विज्ञान प्रदर्शनी में पहला स्थान प्राप्त किया। छात्रों ने जल संरक्षण पर आधारित एक मॉडल प्रस्तुत किया था। विद्यालय के प्रधानाचार्य ने बच्चों की मेहनत की सराहना की। इस उपलब्धि पर अभिभावकों में भी खुशी की लहर है। छात्रों को जल्द ही राष्ट्रीय स्तर की प्रतियोगिता में भेजा जाएगा।",
  },
  {
    headline: "किसानों के लिए नई सिंचाई योजना का शुभारंभ",
    body: "कृषि विभाग ने ग्रामीण क्षेत्रों में नई सिंचाई योजना का शुभारंभ किया है। इस योजना से क्षेत्र के हजारों किसानों को सीधा लाभ मिलेगा। अधिकारियों के अनुसार नहरों की मरम्मत का कार्य भी जल्द शुरू होगा। किसानों ने सरकार के इस कदम का स्वागत किया है। योजना के पहले चरण में बीस गांवों को शामिल किया गया है। दूसरे चरण की शुरुआत अगले वर्ष होगी।",
  },
  {
    headline: "क्रिकेट टूर्नामेंट में स्थानीय टीम ने मारी बाजी",
    body: "जिला क्रिकेट टूर्नामेंट के फाइनल मुकाबले में स्थानीय टीम ने शानदार जीत दर्ज की। कप्तान ने शतक जड़कर टीम को जीत दिलाई। दर्शकों ने मैदान पर जमकर उत्साह दिखाया। टूर्नामेंट का समापन समारोह आज शाम आयोजित किया जाएगा। विजेता टीम को ट्रॉफी के साथ नकद पुरस्कार भी दिया जाएगा।",
  },
  {
    headline: "बाजार में सब्जियों के दाम में उतार-चढ़ाव जारी",
    body: "पिछले एक सप्ताह में सब्जियों की कीमतों में लगातार बदलाव देखा जा रहा है। हरी सब्जियों के दाम में हल्की गिरावट आई है जबकि प्याज और टमाटर महंगे हुए हैं। व्यापारियों का कहना है कि मौसम में बदलाव इसकी मुख्य वजह है। आम उपभोक्ताओं को राहत मिलने में अभी कुछ समय लग सकता है। मंडी समिति ने दामों पर नजर रखने की बात कही है।",
  },
  {
    headline: "सांस्कृतिक कार्यक्रम में झलकी लोक कला की झांकी",
    body: "शहर के मुख्य सभागार में आयोजित सांस्कृतिक कार्यक्रम में स्थानीय कलाकारों ने प्रस्तुति दी। कार्यक्रम में लोक नृत्य और गायन की प्रस्तुतियां मुख्य आकर्षण रहीं। आयोजकों ने बताया कि यह आयोजन हर साल किया जाता है। बड़ी संख्या में शहरवासियों ने कार्यक्रम का आनंद लिया। अगले वर्ष और भव्य आयोजन की योजना बनाई जा रही है।",
  },
  {
    headline: "नगर निगम चुनाव को लेकर सरगर्मी तेज",
    body: "आगामी नगर निगम चुनाव को लेकर राजनीतिक दलों ने तैयारियां तेज कर दी हैं। विभिन्न वार्डों में उम्मीदवारों ने जनसंपर्क शुरू कर दिया है। स्थानीय मुद्दों को लेकर मतदाताओं में भी चर्चा गर्म है। प्रशासन ने शांतिपूर्ण मतदान सुनिश्चित करने के लिए सुरक्षा व्यवस्था बढ़ा दी है। नतीजे अगले महीने घोषित किए जाएंगे।",
  },
  {
    headline: "नई तकनीक से किसानों की आय बढ़ाने की पहल",
    body: "कृषि विशेषज्ञों ने ड्रिप सिंचाई और सौर ऊर्जा आधारित पंपों के इस्तेमाल की सलाह दी है। इससे पानी की बचत के साथ-साथ बिजली का खर्च भी कम होगा। विभाग की ओर से किसानों को प्रशिक्षण शिविर भी आयोजित किए जा रहे हैं। कई किसानों ने पहले ही नई तकनीक अपनाना शुरू कर दिया है। विशेषज्ञों का मानना है कि आने वाले वर्षों में उत्पादन में उल्लेखनीय वृद्धि होगी।",
  },
  {
    headline: "यातायात नियमों के उल्लंघन पर सख्ती, सैकड़ों चालान",
    body: "यातायात पुलिस ने हेलमेट और सीट बेल्ट न पहनने वालों के खिलाफ विशेष अभियान चलाया। एक ही दिन में शहर भर में सैकड़ों वाहन चालकों के चालान काटे गए। पुलिस अधिकारियों ने बताया कि यह अभियान लगातार जारी रहेगा। नागरिकों से नियमों का पालन करने की अपील की गई है। सड़क सुरक्षा सप्ताह के तहत जागरूकता कार्यक्रम भी आयोजित किए जा रहे हैं।",
  },
  {
    headline: "पुस्तक मेले में उमड़ी पाठकों की भीड़",
    body: "शहर में आयोजित वार्षिक पुस्तक मेले में इस बार रिकॉर्ड संख्या में पाठक पहुंचे। मेले में सौ से अधिक प्रकाशकों ने अपने स्टॉल लगाए हैं। बच्चों के लिए विशेष कहानी सत्र भी आयोजित किए गए। लेखकों ने पाठकों के साथ संवाद कर अपने अनुभव साझा किए। मेला अगले तीन दिनों तक जारी रहेगा।",
  },
  {
    headline: "मौसम विभाग ने जताई अगले सप्ताह बारिश की संभावना",
    body: "मौसम विभाग के अनुसार अगले सप्ताह क्षेत्र में हल्की से मध्यम बारिश हो सकती है। इससे गर्मी से जूझ रहे लोगों को राहत मिलने की उम्मीद है। किसानों ने भी बारिश की संभावना पर खुशी जताई है। प्रशासन ने जलभराव वाले इलाकों में पहले से एहतियाती कदम उठाने के निर्देश दिए हैं। मौसम विशेषज्ञों ने आगे और अपडेट देने की बात कही है।",
  },
];

const CAPTIONS = [
  "फ़ोटो: कार्यक्रम का दृश्य",
  "फ़ोटो: मौके पर मौजूद लोग",
  "फ़ोटो: प्रतीकात्मक तस्वीर",
  "फ़ोटो: समारोह में उपस्थित अतिथि",
];

const FLOATS: Array<"left" | "right" | "full"> = ["left", "right", "full"];

// Rows per page: page 0 carries masthead+subheader chrome above it, so it
// gets fewer/shorter rows; the rest target a full sheet.
const ROWS_PER_PAGE = [3, 4, 4, 5, 4, 5, 4, 4];

export function demoRows(pageIndex: number): Row[] {
  const rowCount = ROWS_PER_PAGE[pageIndex % ROWS_PER_PAGE.length];
  const budgetMm = pageIndex === 0 ? 278 : 396;
  const baseHeight = Math.max(60, Math.min(160, Math.round(budgetMm / rowCount) - 4));

  const rows: Row[] = [];
  let blockCounter = 0;

  for (let r = 0; r < rowCount; r++) {
    const preset = ROW_PRESETS[(pageIndex * 3 + r) % ROW_PRESETS.length];
    const cols = preset.map((span) => {
      const article = ARTICLES[(pageIndex * 5 + blockCounter) % ARTICLES.length];
      const heightMm = Math.max(60, Math.min(160, baseHeight + ((blockCounter % 3) - 1) * 15));
      const columns = (blockCounter % 3) + 1;

      // Roughly half the articles across all pages get an image.
      const hasImage = (pageIndex * 7 + blockCounter) % 2 === 0;
      let image: ImageRef | undefined;
      if (hasImage) {
        const float = FLOATS[blockCounter % FLOATS.length];
        // Wide columns/full-width floats need more source pixels to stay >=300dpi.
        const wide = float === "full" || span >= 6;
        image = wide ? placeholderImage(3200, 1800, "फ़ोटो") : placeholderImage(1600, 1067, "फ़ोटो");
        image.float = float;
        if (blockCounter % 3 === 0) image.caption = CAPTIONS[blockCounter % CAPTIONS.length];
      }

      const block: NewsBlock = {
        id: newId(),
        type: "news",
        headline: article.headline,
        body: article.body,
        heightMm,
        columns,
        ...(image ? { image } : {}),
      };
      blockCounter++;
      return { id: newId(), span, blocks: [block] };
    });
    rows.push({ id: newId(), cols });
  }
  return rows;
}
