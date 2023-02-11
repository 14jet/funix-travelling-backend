const { v4: uuid } = require("uuid");

class StringHandler {
  static accentsRemover = (s) => {
    var r = s.toLowerCase();
    // r = r.replace(new RegExp("\\s", "g"), "");
    r = r.replace(new RegExp("[àáảãạãäåâấầậẩẫăắằặẳẵ]", "g"), "a");
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

  static slugify = (s) => {
    let t = this.accentsRemover(s).trim();
    // t = t.replace(/[^\w \,]/, "");
    t = t.replace(/[^a-zA-Z0-9 ]/g, "");
    t = this.spacesReplacer(t, "-");
    t = this.duplecatedDashesRemover(t);

    return t;
  };

  static createUniqueName = (s) => {
    const extension = s.slice(s.lastIndexOf("."));
    const fileName = s.slice(0, s.lastIndexOf("."));
    return this.slugify(fileName) + "-" + uuid() + extension;
  };

  static getFileExtension(s) {
    return s.slice(s.lastIndexOf("."));
  }
}

module.exports = StringHandler;
