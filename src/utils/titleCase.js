const words = [
    "a",
    "abaft",
    "about",
    "above",
    "afore",
    "after",
    "along",
    "amid",
    "among",
    "an",
    "apud",
    "as",
    "aside",
    "at",
    "atop",
    "below",
    "but",
    "by",
    "circa",
    "down",
    "for",
    "from",
    "given",
    "in",
    "into",
    "lest",
    "like",
    "mid",
    "midst",
    "minus",
    "near",
    "next",
    "of",
    "off",
    "on",
    "onto",
    "out",
    "over",
    "pace",
    "past",
    "per",
    "plus",
    "pro",
    "qua",
    "round",
    "sans",
    "save",
    "since",
    "than",
    "thru",
    "till",
    "times",
    "to",
    "under",
    "until",
    "unto",
    "up",
    "upon",
    "via",
    "vice",
    "with",
    "worth",
    "the",
    "and",
    "nor",
    "or",
    "yet",
    "so",
];

const titleCaseWord = word => {
    let wordLower = word.toLowerCase();
    if (words.includes(wordLower)) {
        return wordLower;
    }
    return word[0].toUpperCase() + word.slice(1).toLowerCase();
};

const titleCase = block => {
    let sentences = [];
    block.split(/\n/).forEach(line => {
        let title = line
            .trim()
            .split(" ")
            .filter(w => w)
            .map(titleCaseWord)
            .join(" ");
        title.replace(/\s+/g, " ");
        sentences.push(title);
    });
    return sentences.join("\n");
};

export default titleCase;
