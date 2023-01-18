class StringHandler {
  static accentsRemover = (s) => {
    var r = s.toLowerCase();
    // r = r.replace(new RegExp("\\s", "g"), "");
    r = r.replace(new RegExp("[àáảãạãäåâấầậẩẫăắặẳẫẩ]", "g"), "a");
    r = r.replace(new RegExp("æ", "g"), "ae");
    r = r.replace(new RegExp("ç", "g"), "c");
    r = r.replace(new RegExp("[èéẻẹẽêëêếềểễệ]", "g"), "e");
    r = r.replace(new RegExp("[ìíîïỉĩị]", "g"), "i");
    r = r.replace(new RegExp("ñ", "g"), "n");
    r = r.replace(new RegExp("[òóôõöơớờởỡợôồốổỗộ]", "g"), "o");
    r = r.replace(new RegExp("œ", "g"), "oe");
    r = r.replace(new RegExp("[ùúụủũûüưứừửữự]", "g"), "u");
    r = r.replace(new RegExp("[ýÿỳỵỷỹ]", "g"), "y");
    // r = r.replace(new RegExp("\\W", "g"), "");
    r = r.replace(new RegExp("đ", "g"), "d");
    return r;
  };

  static spacesReplacer = (s, x) => {
    let t = s;
    while (t.indexOf("  ") !== -1) {
      t = t.replace("  ", " ");
    }

    t = t.replace(/ /g, x);
    return t;
  };

  static duplecatedDashesRemover = (s) => {
    let t = s;
    while (t.indexOf("--") !== -1) {
      t = t.replace("--", "-");
    }

    return t;
  };

  static urlEndpoinConverter = (s) => {
    let t = this.accentsRemover(s);
    t = this.spacesReplacer(t, "-");
    t = this.duplecatedDashesRemover(t);
    return t;
  };
}

module.exports = StringHandler;
