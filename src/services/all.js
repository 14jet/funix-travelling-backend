module.exports.getItemWithLang = (data, lang) => {
  const { translation, ...other } = data._doc;
  const translationItem = translation.find((item) => item.language === lang);
  if (!translationItem) {
    return { ...other, is_lang: false };
  }

  return { ...other, ...translationItem._doc, is_lang: true };
};

module.exports.getItemsWithLang = (data, lang) => {
  return data.map((item) => this.getItemWithLang(item, lang));
};
